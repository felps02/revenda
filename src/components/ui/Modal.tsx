"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useEscapeKey, useLockBodyScroll } from "@/hooks/useUi";
import Icon from "./Icon";
import styles from "./Modal.module.css";

/**
 * Janela modal do site: portal no body, scroll travado, Esc e clique fora
 * fechando, foco preso dentro e devolvido a quem abriu. No celular ela sobe
 * como bottom sheet; do tablet para cima fica centralizada.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "md" | "lg" | "full";
  children: ReactNode;
  className?: string;
  /** Rotulo do botao de fechar, lido por leitor de tela. */
  closeLabel?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  className,
  closeLabel = "Fechar janela",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const titleId = `${baseId}-titulo`;
  const descriptionId = `${baseId}-descricao`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLockBodyScroll(open);
  useEscapeKey(onClose, open);

  // Leva o foco para dentro da janela e devolve para quem a abriu ao fechar.
  useEffect(() => {
    if (!open || !mounted) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      opener?.focus();
    };
  }, [open, mounted]);

  const trapFocus = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;

    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (item) => item.offsetWidth > 0 || item.offsetHeight > 0,
    );
    const first = items[0];
    const last = items[items.length - 1];

    if (!first || !last) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  const onBackdropMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div className={styles.backdrop} onMouseDown={onBackdropMouseDown}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Janela de diálogo"}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(styles.panel, styles[size], className)}
        onKeyDown={trapFocus}
      >
        <span className={styles.grabber} aria-hidden="true" />

        <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
          <Icon name="close" size={20} />
        </button>

        {title || description ? (
          <header className={styles.header}>
            {title ? (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </header>
        ) : null}

        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
