"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Field, { Checkbox, TextArea, TextInput } from "@/components/ui/Field";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatCurrency, maskPhoneInput } from "@/lib/format";
import { vehicleFullTitle } from "@/lib/slug";
import { validateEmail, validateName, validatePhone, type FieldErrors } from "@/lib/validation";
import { buildProtocol, submitLead } from "@/services/leadService";
import { vehicleUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import type { InterestLead, Vehicle } from "@/types";
import FormStatus, { WhatsAppHint, focusFirstError, type FormState } from "./FormStatus";
import styles from "./InterestForm.module.css";

/**
 * Formulario de interesse: usado na pagina do veiculo (dentro do Modal) e em
 * qualquer bloco de CTA. Com um veiculo em maos ele abre com o resumo do carro
 * e a mensagem ja escrita - o cliente so confirma nome e WhatsApp.
 */

export interface InterestFormProps {
  vehicle?: Vehicle | null;
  source?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

type FieldName = "name" | "phone" | "email" | "message";
const FIELD_ORDER: FieldName[] = ["name", "phone", "email", "message"];

type ContactChannel = "whatsapp" | "telefone" | "email";

interface Values {
  name: string;
  phone: string;
  email: string;
  message: string;
  tradeIn: boolean;
  contact: ContactChannel;
}

const CHANNELS: { value: ContactChannel; label: string; icon: IconName }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { value: "telefone", label: "Telefone", icon: "phone" },
  { value: "email", label: "E-mail", icon: "mail" },
];

export function InterestForm({ vehicle, source, onSuccess, compact = false }: InterestFormProps) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<Values>(() => ({
    name: "",
    phone: "",
    email: "",
    message: vehicle
      ? "Tenho interesse no " + vehicleFullTitle(vehicle) + ". Ele ainda está disponível?"
      : "",
    tradeIn: false,
    contact: "whatsapp",
  }));
  const [errors, setErrors] = useState<FieldErrors<FieldName>>({});
  const [status, setStatus] = useState<FormState>("idle");
  const [protocol, setProtocol] = useState("");
  const [feedback, setFeedback] = useState("");

  // Teclado e leitor de tela vao direto para o retorno do envio.
  useEffect(() => {
    if (status === "success") statusRef.current?.focus();
  }, [status]);

  function setValue<K extends keyof Values>(key: K, value: Values[K]): void {
    setValues((previous) => {
      const next = { ...previous };
      next[key] = value;
      return next;
    });
  }

  function setFieldError(field: FieldName, message: string | undefined): void {
    setErrors((previous) => {
      const next: FieldErrors<FieldName> = { ...previous };
      next[field] = message;
      return next;
    });
  }

  function checkField(field: FieldName, current: Values): string | undefined {
    if (field === "name") return validateName(current.name);
    if (field === "phone") return validatePhone(current.phone);
    if (field === "email") return validateEmail(current.email);
    return undefined;
  }

  function handleBlur(field: FieldName): void {
    setFieldError(field, checkField(field, values));
  }

  const waText = waMessage.interest({
    name: values.name.trim() || "cliente do site",
    phone: values.phone,
    vehicle,
    message: values.message.trim() || undefined,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors: FieldErrors<FieldName> = {};
    for (const field of FIELD_ORDER) nextErrors[field] = checkField(field, values);
    setErrors(nextErrors);

    const invalid = FIELD_ORDER.filter((field) => nextErrors[field]);
    if (invalid.length > 0) {
      focusFirstError(formRef.current, invalid);
      return;
    }

    setFeedback("");
    setStatus("loading");

    const lead: InterestLead = {
      type: "interesse",
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      message: values.message.trim() || undefined,
      source: source ?? (vehicle ? "pagina-do-veiculo" : "site"),
      wantsTradeIn: values.tradeIn,
      preferredContact: values.contact,
      vehicleId: vehicle?.id,
      vehicleTitle: vehicle ? vehicleFullTitle(vehicle) : undefined,
      vehicleUrl: vehicle ? vehicleUrl(vehicle) : undefined,
    };

    const response = await submitLead(lead);

    if (response.ok) {
      setProtocol(response.protocol ?? buildProtocol());
      setStatus("success");
      onSuccess?.();
      return;
    }

    setFeedback(response.message);
    setStatus("error");
  }

  if (status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} className={styles.statusWrap}>
        <FormStatus
          state="success"
          protocol={protocol}
          message={
            vehicle
              ? "Separamos o " +
                vehicleFullTitle(vehicle) +
                " para o seu atendimento. Um consultor confirma disponibilidade e condições com você."
              : "Um consultor vai retornar pelo canal que você escolheu."
          }
        >
          <Button variant="whatsapp" size="lg" fullWidth href={whatsappUrl(waText)} external>
            Continuar no WhatsApp
          </Button>
        </FormStatus>
      </div>
    );
  }

  const cover = vehicle?.images[0];

  return (
    <form
      ref={formRef}
      className={cn(styles.form, compact ? styles.compact : undefined)}
      onSubmit={handleSubmit}
      noValidate
    >
      {vehicle ? (
        <div className={styles.summary}>
          {cover ? (
            <span className={styles.summaryPhoto}>
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                sizes="72px"
                className={styles.summaryImage}
              />
            </span>
          ) : null}
          <span className={styles.summaryText}>
            <span className={styles.summaryLabel}>Veículo escolhido</span>
            <span className={styles.summaryTitle}>{vehicleFullTitle(vehicle)}</span>
            <span className={cn(styles.summaryPrice, "tnum")}>{formatCurrency(vehicle.price)}</span>
          </span>
        </div>
      ) : null}

      <div className={styles.grid}>
        <Field label="Nome completo" htmlFor={uid + "-nome"} required error={errors.name}>
          <TextInput
            name="name"
            value={values.name}
            onChange={(event) => setValue("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            autoComplete="name"
            enterKeyHint="next"
            placeholder="Nome e sobrenome"
          />
        </Field>

        <Field label="WhatsApp" htmlFor={uid + "-whatsapp"} required error={errors.phone}>
          <TextInput
            name="phone"
            value={values.phone}
            onChange={(event) => setValue("phone", maskPhoneInput(event.target.value))}
            onBlur={() => handleBlur("phone")}
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            placeholder="(41) 99999-0000"
          />
        </Field>
      </div>

      <Field
        label="E-mail"
        htmlFor={uid + "-email"}
        hint="Opcional. Enviamos a ficha completa do carro por e-mail."
        error={errors.email}
      >
        <TextInput
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => setValue("email", event.target.value)}
          onBlur={() => handleBlur("email")}
          inputMode="email"
          autoComplete="email"
          placeholder="voce@email.com"
        />
      </Field>

      <Field label="Mensagem" htmlFor={uid + "-mensagem"}>
        <TextArea
          name="message"
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          rows={compact ? 3 : 4}
          placeholder="Conte o que você precisa saber: entrada, troca, test drive..."
        />
      </Field>

      <Checkbox
        name="tradeIn"
        checked={values.tradeIn}
        onChange={(event) => setValue("tradeIn", event.target.checked)}
        label="Tenho um carro na troca"
        hint="Avaliamos seu usado no mesmo atendimento."
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Prefere ser atendido por</legend>
        <div className={styles.channels}>
          {CHANNELS.map((channel) => (
            <label key={channel.value} className={styles.channel}>
              <input
                type="radio"
                name={uid + "-canal"}
                value={channel.value}
                checked={values.contact === channel.value}
                onChange={() => setValue("contact", channel.value)}
                className={styles.channelInput}
              />
              <span className={styles.channelBox}>
                <Icon name={channel.icon} size={16} className={styles.channelIcon} />
                {channel.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {status === "error" ? (
        <FormStatus state="error" message={feedback}>
          <Button variant="whatsapp" fullWidth href={whatsappUrl(waText)} external>
            Continuar no WhatsApp
          </Button>
        </FormStatus>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" size="lg" fullWidth loading={status === "loading"}>
          {vehicle ? "Quero falar sobre este carro" : "Falar com um consultor"}
        </Button>
        <WhatsAppHint message={waText} />
      </div>
    </form>
  );
}

export default InterestForm;
