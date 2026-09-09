"use client";

import Icon from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { useScrolled } from "@/hooks/useUi";
import { cn } from "@/lib/cn";
import { telUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./WhatsAppFloat.module.css";

/**
 * Atalho permanente de atendimento.
 * Desktop: botão redondo que aparece depois de 400px de rolagem.
 * Celular: barra fixa no rodapé com WhatsApp e Ligar.
 */
export default function WhatsAppFloat() {
  const visible = useScrolled(400);
  const whatsappHref = whatsappUrl(waMessage.generic());

  return (
    <>
      <div className={cn(styles.bar, "no-print")}>
        <a className={styles.barWhats} href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size={20} />
          WhatsApp
        </a>
        <a className={styles.barCall} href={telUrl}>
          <Icon name="phone" size={18} />
          Ligar
        </a>
      </div>

      <a
        className={cn(styles.float, visible && styles.floatVisible, "no-print")}
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Fale com um consultor da ${siteConfig.shortName} no WhatsApp`}
      >
        <span className={styles.pulse} aria-hidden="true" />
        <Icon name="whatsapp" size={26} />
        <span className={styles.tooltip} aria-hidden="true">
          Fale com um consultor
        </span>
      </a>
    </>
  );
}
