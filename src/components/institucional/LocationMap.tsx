"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { telUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "./LocationMap.module.css";

/**
 * Onde a loja fica: cartao de contato com os horarios e o estado atual
 * (aberto/fechado calculado no navegador) + mapa incorporado.
 */

interface OpeningHours {
  label: string;
  value: string;
  days: readonly string[];
  opens: string;
  closes: string;
}

interface StoreStatus {
  tone: "open" | "closed" | "appointment";
  text: string;
  dayIndex: number;
}

const HOURS: OpeningHours[] = siteConfig.hours.map((entry) => ({
  label: entry.label,
  value: entry.value,
  days: entry.days,
  opens: entry.opens,
  closes: entry.closes,
}));

const DAY_CODES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_NAMES = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];
const APPOINTMENT = /plant[ãa]o/i;

function toMinutes(time: string): number {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

/** "19:00" vira "19h"; "14:30" vira "14h30". */
function hourLabel(time: string): string {
  const [hour = "0", minute = "0"] = time.split(":");
  const minutes = Number(minute);
  return minutes === 0 ? `${Number(hour)}h` : `${Number(hour)}h${String(minutes).padStart(2, "0")}`;
}

function entryForDay(dayIndex: number): OpeningHours | undefined {
  const code = DAY_CODES[dayIndex];
  return HOURS.find((entry) => entry.days.includes(code));
}

function nextOpening(dayIndex: number): string | null {
  for (let step = 1; step <= 7; step += 1) {
    const index = (dayIndex + step) % 7;
    const entry = entryForDay(index);
    if (!entry || APPOINTMENT.test(entry.value)) continue;
    const when = step === 1 ? "amanhã" : DAY_NAMES[index];
    return `${when} às ${hourLabel(entry.opens)}`;
  }
  return null;
}

function computeStatus(now: Date): StoreStatus {
  const dayIndex = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = entryForDay(dayIndex);

  if (today) {
    const byAppointment = APPOINTMENT.test(today.value);
    const opens = toMinutes(today.opens);
    const closes = toMinutes(today.closes);

    if (minutes >= opens && minutes < closes) {
      return byAppointment
        ? {
            tone: "appointment",
            dayIndex,
            text: `Plantão hoje · atendimento com hora marcada até ${hourLabel(today.closes)}`,
          }
        : { tone: "open", dayIndex, text: `Aberto agora · fecha às ${hourLabel(today.closes)}` };
    }

    if (!byAppointment && minutes < opens) {
      return { tone: "closed", dayIndex, text: `Fechado agora · abre hoje às ${hourLabel(today.opens)}` };
    }
  }

  const next = nextOpening(dayIndex);
  return { tone: "closed", dayIndex, text: next ? `Fechado agora · abre ${next}` : "Fechado agora" };
}

interface ContactRow {
  icon: IconName;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

const { address, contact, name } = siteConfig;

const CONTACT_ROWS: ContactRow[] = [
  {
    icon: "map-pin",
    label: "Endereço",
    value: `${address.street} · ${address.complement} — ${address.district}, ${address.city}/${address.state}`,
    href: address.mapsLink,
    external: true,
  },
  { icon: "phone", label: "Telefone", value: contact.phoneDisplay, href: telUrl },
  {
    icon: "whatsapp",
    label: "WhatsApp",
    value: contact.whatsappDisplay,
    href: whatsappUrl(waMessage.generic()),
    external: true,
  },
  { icon: "mail", label: "E-mail", value: contact.email, href: `mailto:${contact.email}` },
];

export interface LocationMapProps {
  className?: string;
}

export function LocationMap({ className }: LocationMapProps) {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  // O horario depende do relogio de quem acessa, entao so e calculado no cliente.
  useEffect(() => {
    const update = () => setStatus(computeStatus(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const todayCode = status === null ? null : DAY_CODES[status.dayIndex];

  return (
    <section
      id="localizacao"
      className={cn("section", styles.section, className)}
      aria-labelledby="localizacao-titulo"
    >
      <div className="container">
        <SectionHeading
          id="localizacao-titulo"
          eyebrow="Onde estamos"
          title="Pátio, showroom e oficina no mesmo endereço"
          description="Estamos na Av. do Batel desde 2009. Venha ver o carro com calma — de preferência com hora marcada, para ele já estar separado, lavado e com o laudo na mesa."
        />

        <div className={styles.grid}>
          <div className={styles.card}>
            <p
              className={cn(
                styles.status,
                status?.tone === "open" ? styles.statusOpen : undefined,
                status?.tone === "appointment" ? styles.statusAppointment : undefined,
              )}
              aria-live="polite"
            >
              <span className={styles.statusDot} aria-hidden="true" />
              <span className={styles.statusText}>
                {status ? status.text : "Horário de atendimento da loja"}
              </span>
            </p>

            <ul className={styles.rows}>
              {CONTACT_ROWS.map((row) => (
                <li key={row.label}>
                  <a
                    className={styles.row}
                    href={row.href}
                    target={row.external ? "_blank" : undefined}
                    rel={row.external ? "noopener noreferrer" : undefined}
                  >
                    <span className={styles.rowIcon}>
                      <Icon name={row.icon} size={18} />
                    </span>
                    <span className={styles.rowBody}>
                      <span className={styles.rowLabel}>{row.label}</span>
                      <span className={styles.rowValue}>{row.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <table className={styles.hours}>
              <caption className={styles.hoursCaption}>Horário de atendimento</caption>
              <tbody>
                {HOURS.map((entry) => {
                  const isToday = todayCode !== null && entry.days.includes(todayCode);
                  return (
                    <tr key={entry.label} className={isToday ? styles.hoursToday : undefined}>
                      <th scope="row" className={styles.hoursDay}>
                        {entry.label}
                        {isToday ? <span className={styles.hoursTag}>hoje</span> : null}
                      </th>
                      <td className={styles.hoursValue}>{entry.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className={styles.actions}>
              <Button href={address.mapsLink} external icon="map-pin" fullWidth>
                Como chegar
              </Button>
              <Button href={whatsappUrl(waMessage.generic())} external variant="whatsapp" fullWidth>
                Chamar no WhatsApp
              </Button>
            </div>
          </div>

          <div className={styles.mapFrame}>
            <iframe
              className={styles.map}
              src={address.mapsEmbed}
              title={`Mapa com a localização da ${name} na ${address.street}, ${address.district}, ${address.city}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationMap;
