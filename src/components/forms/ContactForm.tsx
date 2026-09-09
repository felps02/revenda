"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Field, { SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { maskPhoneInput } from "@/lib/format";
import {
  validateEmail,
  validateMinLength,
  validateName,
  validatePhone,
  validateRequired,
  type FieldErrors,
} from "@/lib/validation";
import { buildProtocol, submitLead } from "@/services/leadService";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import type { ContactLead } from "@/types";
import FormStatus, { WhatsAppHint, focusFirstError, type FormState } from "./FormStatus";
import styles from "./ContactForm.module.css";

/** Formulario aberto da pagina de contato: qualquer assunto, um canal so. */

export interface ContactFormProps {
  /** Classe extra do formulario, quando a pagina precisa ajustar o ritmo. */
  className?: string;
}

type FieldName = "name" | "phone" | "email" | "subject" | "message";
const FIELD_ORDER: FieldName[] = ["name", "phone", "email", "subject", "message"];

interface Values {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

const SUBJECTS: { value: string; label: string }[] = [
  { value: "comprar", label: "Quero comprar" },
  { value: "vender", label: "Quero vender ou trocar" },
  { value: "financiamento", label: "Financiamento" },
  { value: "pos-venda", label: "Pós-venda" },
  { value: "outro", label: "Outro" },
];

const EMPTY: Values = { name: "", phone: "", email: "", subject: "", message: "" };

function subjectLabel(value: string): string {
  return SUBJECTS.find((subject) => subject.value === value)?.label ?? "Outro";
}

export function ContactForm({ className }: ContactFormProps) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<FieldName>>({});
  const [status, setStatus] = useState<FormState>("idle");
  const [protocol, setProtocol] = useState("");
  const [feedback, setFeedback] = useState("");

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
    if (field === "email") return validateEmail(current.email, true);
    if (field === "subject") return validateRequired(current.subject, "Assunto");
    return validateMinLength(current.message, 10, "Mensagem");
  }

  function handleBlur(field: FieldName): void {
    setFieldError(field, checkField(field, values));
  }

  const waText = waMessage.interest({
    name: values.name.trim() || "cliente do site",
    phone: values.phone,
    message: [
      values.subject ? "Assunto: " + subjectLabel(values.subject) : "",
      values.message.trim(),
    ]
      .filter(Boolean)
      .join("\n"),
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

    const lead: ContactLead = {
      type: "contato",
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      subject: subjectLabel(values.subject),
      source: "pagina-contato",
    };

    const response = await submitLead(lead);

    if (response.ok) {
      setProtocol(response.protocol ?? buildProtocol());
      setStatus("success");
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
          message="Sua mensagem chegou para a equipe. Respondemos por WhatsApp ou e-mail, como preferir."
        >
          <Button variant="whatsapp" size="lg" fullWidth href={whatsappUrl(waText)} external>
            Continuar no WhatsApp
          </Button>
        </FormStatus>
      </div>
    );
  }

  return (
    <form ref={formRef} className={cn(styles.form, className)} onSubmit={handleSubmit} noValidate>
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

        <Field label="E-mail" htmlFor={uid + "-email"} required error={errors.email}>
          <TextInput
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => setValue("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            inputMode="email"
            autoComplete="email"
            enterKeyHint="next"
            placeholder="voce@email.com"
          />
        </Field>

        <Field label="Assunto" htmlFor={uid + "-assunto"} required error={errors.subject}>
          <SelectInput
            name="subject"
            value={values.subject}
            onChange={(event) => setValue("subject", event.target.value)}
            onBlur={() => handleBlur("subject")}
            options={SUBJECTS}
            placeholder="Selecione o assunto"
          />
        </Field>
      </div>

      <Field
        label="Mensagem"
        htmlFor={uid + "-mensagem"}
        required
        error={errors.message}
        hint="Quanto mais detalhes, mais direta é a resposta."
      >
        <TextArea
          name="message"
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          onBlur={() => handleBlur("message")}
          rows={5}
          placeholder="Como podemos ajudar?"
        />
      </Field>

      {status === "error" ? (
        <FormStatus state="error" message={feedback}>
          <Button variant="whatsapp" fullWidth href={whatsappUrl(waText)} external>
            Continuar no WhatsApp
          </Button>
        </FormStatus>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" size="lg" fullWidth loading={status === "loading"}>
          Enviar mensagem
        </Button>
        <WhatsAppHint message={waText} />
      </div>
    </form>
  );
}

export default ContactForm;
