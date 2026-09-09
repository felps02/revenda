import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { whatsappUrl } from "@/services/whatsapp";
import styles from "./FormStatus.module.css";

/**
 * Retorno visual de todo formulario do site: enviando, recebido (com
 * protocolo e prazo de resposta) ou falha - sempre com um caminho de saida
 * pelo WhatsApp, que e o canal que a loja responde mais rapido.
 */

export type FormState = "idle" | "loading" | "success" | "error";

export interface FormStatusProps {
  state: FormState;
  message?: string;
  protocol?: string;
  /** Acoes abaixo do texto, normalmente o atalho verde do WhatsApp. */
  children?: ReactNode;
  className?: string;
}

const SUCCESS_FALLBACK =
  "Um consultor já está com seus dados e retorna no horário comercial.";
const ERROR_FALLBACK =
  "Seus dados continuam preenchidos aqui. Tente enviar de novo ou fale com a gente pelo WhatsApp.";

export function FormStatus({ state, message, protocol, children, className }: FormStatusProps) {
  if (state === "idle") return null;

  if (state === "loading") {
    return (
      <p className={cn(styles.loading, className)} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        Enviando seus dados...
      </p>
    );
  }

  const success = state === "success";

  return (
    <div
      className={cn(styles.card, success ? styles.success : styles.error, className)}
      role="status"
      aria-live="polite"
    >
      <span className={styles.mark} aria-hidden="true">
        <Icon name={success ? "check-circle" : "alert"} size={26} />
      </span>

      <div className={styles.body}>
        <p className={styles.title}>
          {success ? "Recebemos seu contato" : "Não conseguimos enviar agora"}
        </p>
        <p className={styles.text}>{message ?? (success ? SUCCESS_FALLBACK : ERROR_FALLBACK)}</p>

        {success && protocol ? (
          <p className={styles.meta}>
            <span className={styles.metaLabel}>Protocolo</span>
            <span className={cn(styles.protocol, "tnum")}>{protocol}</span>
            <span className={styles.deadline}>Resposta em até 1 hora útil</span>
          </p>
        ) : null}

        {children ? <div className={styles.actions}>{children}</div> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- apoio dos formularios */

export interface WhatsAppHintProps {
  /** Mensagem que ja vai escrita na conversa. */
  message: string;
  className?: string;
}

/** Linha fixa abaixo do botao de envio: o atalho para quem tem pressa. */
export function WhatsAppHint({ message, className }: WhatsAppHintProps) {
  return (
    <p className={cn(styles.hint, className)}>
      Prefere falar agora?{" "}
      <a
        className={styles.hintLink}
        href={whatsappUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="whatsapp" size={15} className={styles.hintIcon} />
        Chame no WhatsApp
      </a>
    </p>
  );
}

/**
 * Leva o foco para o primeiro campo invalido, na ordem em que ele aparece na
 * tela. Recebe os nomes ja filtrados para nao depender do formato dos erros.
 */
export function focusFirstError(form: HTMLFormElement | null, invalidFields: string[]): void {
  const field = invalidFields[0];
  if (!form || !field) return;

  const control = form.elements.namedItem(field);
  if (control instanceof HTMLElement) {
    control.focus();
    return;
  }
  if (control instanceof RadioNodeList) {
    const first = control[0];
    if (first instanceof HTMLElement) first.focus();
  }
}

export default FormStatus;
