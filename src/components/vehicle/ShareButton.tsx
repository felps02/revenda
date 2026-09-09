"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useEscapeKey, useOnClickOutside } from "@/hooks/useUi";
import styles from "./ShareButton.module.css";

/**
 * Compartilhar o anuncio.
 *
 * No celular usa a folha nativa do sistema (Web Share API). Onde ela nao
 * existe, abre um popover com copiar link, WhatsApp e Facebook - fechavel por
 * clique fora e por Esc.
 */

export interface ShareButtonProps {
  url: string;
  title: string;
  variant?: "icon" | "inline";
  withLabel?: boolean;
  className?: string;
}

const VARIANT_CLASS: Record<"icon" | "inline", string> = {
  icon: styles.iconOnly,
  inline: styles.inline,
};

/** Copia com a API moderna e, sem ela, com o campo auxiliar de sempre. */
async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* segue para o plano B */
  }

  try {
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.top = "-1000px";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(helper);
    return copied;
  } catch {
    return false;
  }
}

export function ShareButton({
  url,
  title,
  variant = "icon",
  withLabel = false,
  className,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);
  const popoverId = useId();

  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(rootRef, close, open);
  useEscapeKey(close, open);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Abriu o popover pelo teclado: o foco vai direto para a primeira acao.
  useEffect(() => {
    if (open) firstActionRef.current?.focus();
  }, [open]);

  const handleTrigger = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        // Cancelar nao e erro; qualquer outra falha cai no popover.
        const aborted = error instanceof DOMException && error.name === "AbortError";
        if (!aborted) setOpen(true);
      }
      return;
    }
    setOpen((value) => !value);
  };

  const handleCopy = async () => {
    const done = await copyToClipboard(url);
    if (!done) return;
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className={cn(styles.root, className)} ref={rootRef}>
      <button
        type="button"
        className={cn(styles.trigger, VARIANT_CLASS[variant], open ? styles.triggerOpen : undefined)}
        onClick={handleTrigger}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={withLabel ? undefined : "Compartilhar este veículo"}
        title="Compartilhar este veículo"
      >
        <Icon name="share" size={18} />
        {withLabel ? <span className={styles.label}>Compartilhar</span> : null}
      </button>

      <div id={popoverId} className={styles.popover} hidden={!open}>
        <button type="button" className={styles.action} onClick={handleCopy} ref={firstActionRef}>
          <Icon name={copied ? "check" : "copy"} size={18} className={copied ? styles.done : undefined} />
          <span>{copied ? "Link copiado!" : "Copiar link"}</span>
        </button>
        <a
          className={styles.action}
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          <Icon name="whatsapp" size={18} className={styles.whats} />
          <span>Enviar no WhatsApp</span>
        </a>
        <a
          className={styles.action}
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          <Icon name="facebook" size={18} />
          <span>Compartilhar no Facebook</span>
        </a>
      </div>

      <span className="sr-only" role="status">
        {copied ? "Link copiado para a área de transferência." : ""}
      </span>
    </div>
  );
}

export default ShareButton;
