"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { siteMedia, type MediaItem } from "@/data/media";
import { useEscapeKey, useLockBodyScroll } from "@/hooks/useUi";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "./StorePhotos.module.css";

/**
 * Galeria da loja: mosaico assimetrico no desktop, carrossel com scroll-snap
 * no celular e lightbox proprio (Esc para fechar, setas para navegar).
 */

export interface StorePhotosProps {
  photos?: readonly MediaItem[];
  className?: string;
}

export function StorePhotos({ photos = siteMedia.showroom, className }: StorePhotosProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const total = photos.length;
  const isOpen = openIndex !== null;
  const current = openIndex === null ? undefined : photos[openIndex];

  const close = useCallback(() => {
    setOpenIndex(null);
    openerRef.current?.focus();
  }, []);

  useLockBodyScroll(isOpen);
  useEscapeKey(close, isOpen);

  // Ao abrir, o foco vai para a janela para o teclado assumir a navegacao.
  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const go = useCallback(
    (direction: 1 | -1) => {
      setOpenIndex((previous) => {
        if (previous === null) return previous;
        return (previous + direction + total) % total;
      });
    },
    [total],
  );

  const openAt = (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget;
    setOpenIndex(index);
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
      return;
    }
    if (event.key !== "Tab") return;

    // Prende o foco nos botoes da janela.
    const panel = dialogRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;

    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <section className={cn("section", styles.section, className)} aria-labelledby="fotos-da-loja">
      <div className="container">
        <SectionHeading
          id="fotos-da-loja"
          eyebrow="Por dentro da loja"
          title="O pátio, o showroom e a oficina"
          description="Sem foto de banco de imagem: é assim que a loja está hoje na Av. do Batel. Toque em qualquer foto para ver ampliada."
        />

        <ul className={styles.mosaic}>
          {photos.map((photo, index) => (
            <li key={photo.url} className={cn(styles.tile, index === 0 ? styles.tileFeatured : undefined)}>
              <button
                type="button"
                className={styles.tileButton}
                onClick={openAt(index)}
                aria-label={`Ampliar foto: ${photo.alt}`}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes={
                    index === 0
                      ? "(min-width: 1024px) 52vw, (min-width: 768px) 58vw, 82vw"
                      : "(min-width: 1024px) 26vw, (min-width: 768px) 29vw, 82vw"
                  }
                  className={styles.tileImage}
                />
                <span className={styles.tileCaption}>
                  <span className={styles.tileCaptionText}>{photo.alt}</span>
                  <Icon name="expand" size={18} className={styles.tileCaptionIcon} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isOpen && current ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${(openIndex ?? 0) + 1} de ${total}: ${current.alt}`}
          tabIndex={-1}
          className={styles.lightbox}
          onKeyDown={onDialogKeyDown}
          onMouseDown={onBackdropMouseDown}
        >
          <div className={styles.lightboxBar}>
            <span className={cn(styles.counter, "tnum")}>
              {(openIndex ?? 0) + 1} de {total}
            </span>
            <button type="button" className={styles.lightboxClose} onClick={close} aria-label="Fechar a galeria">
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className={styles.lightboxStage}>
            <button
              type="button"
              className={cn(styles.arrow, styles.arrowPrev)}
              onClick={() => go(-1)}
              aria-label="Foto anterior"
            >
              <Icon name="chevron-left" size={22} />
            </button>

            <figure className={styles.lightboxFigure}>
              <div className={styles.lightboxImageWrap}>
                <Image
                  src={current.url}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 76vw, 94vw"
                  className={styles.lightboxImage}
                />
              </div>
              <figcaption className={styles.lightboxCaption}>{current.alt}</figcaption>
            </figure>

            <button
              type="button"
              className={cn(styles.arrow, styles.arrowNext)}
              onClick={() => go(1)}
              aria-label="Próxima foto"
            >
              <Icon name="chevron-right" size={22} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default StorePhotos;
