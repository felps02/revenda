"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import Icon from "@/components/ui/Icon";
import { useEscapeKey, useLockBodyScroll } from "@/hooks/useUi";
import { cn } from "@/lib/cn";
import type { VehicleImage } from "@/types";
import styles from "./VehicleGallery.module.css";

/**
 * Galeria do anuncio: foto grande, miniaturas e lightbox em tela cheia.
 * Navega por clique, seta do teclado e arrasto no celular. Com uma unica
 * foto, setas, contador e miniaturas somem sozinhos.
 */

const DESKTOP_THUMBS = 6;
/** Arrasto minimo, em pixels, para trocar de foto no toque. */
const SWIPE_THRESHOLD = 40;
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface VehicleGalleryProps {
  images: VehicleImage[];
  title: string;
}

export function VehicleGallery({ images, title }: VehicleGalleryProps) {
  const total = images.length;
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const stripRef = useRef<HTMLDivElement>(null);
  const lightboxStripRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const swiped = useRef(false);

  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const hiddenCount = Math.max(0, total - DESKTOP_THUMBS);
  const desktopThumbs = useMemo(() => images.slice(0, DESKTOP_THUMBS), [images]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const step = useCallback(
    (delta: number) => {
      setIndex((current) =>
        total === 0 ? 0 : (Math.min(current, total - 1) + delta + total) % total,
      );
    },
    [total],
  );

  const openLightbox = useCallback((at: number) => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIndex(at);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    const opener = openerRef.current;
    openerRef.current = null;
    window.requestAnimationFrame(() => opener?.focus());
  }, []);

  useLockBodyScroll(lightboxOpen);
  useEscapeKey(closeLightbox, lightboxOpen);

  // Setas, Home e End navegam enquanto o lightbox estiver aberto.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setIndex(Math.max(0, total - 1));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, step, total]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [lightboxOpen]);

  // Mantem a miniatura ativa visivel nas faixas roláveis.
  useEffect(() => {
    for (const strip of [stripRef.current, lightboxStripRef.current]) {
      if (!strip || strip.clientWidth === 0) continue;
      const child = strip.children.item(index);
      if (!(child instanceof HTMLElement)) continue;
      const left = child.offsetLeft - (strip.clientWidth - child.clientWidth) / 2;
      strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [index, lightboxOpen]);

  const onTouchStart = useCallback((event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStartX.current = touch ? touch.clientX : null;
    swiped.current = false;
  }, []);

  const onTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      const start = touchStartX.current;
      const touch = event.changedTouches[0];
      touchStartX.current = null;
      if (start === null || !touch || total < 2) return;
      const delta = touch.clientX - start;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      swiped.current = true;
      step(delta < 0 ? 1 : -1);
    },
    [step, total],
  );

  const onStageClick = useCallback(() => {
    // Arrasto que termina em cima da foto nao deve abrir o lightbox.
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    openLightbox(safeIndex);
  }, [openLightbox, safeIndex]);

  const onBackdropMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (swiped.current) {
        swiped.current = false;
        return;
      }
      // Fora dos controles o alvo do clique e o proprio fundo do lightbox.
      if (event.target === event.currentTarget) closeLightbox();
    },
    [closeLightbox],
  );

  const trapFocus = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (item) => item.offsetWidth > 0 || item.offsetHeight > 0,
    );
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  if (total === 0) return null;

  const current = images[safeIndex];

  const describe = (image: VehicleImage, position: number) =>
    image.alt || `${title} - foto ${position + 1} de ${total}`;

  const renderThumb = (image: VehicleImage, position: number, extraClass?: string) => (
    <button
      key={`${image.url}-${position}`}
      type="button"
      className={cn(
        styles.thumb,
        position === safeIndex ? styles.thumbActive : undefined,
        extraClass,
      )}
      aria-label={`Ver foto ${position + 1}${image.caption ? `: ${image.caption}` : ""}`}
      aria-current={position === safeIndex ? "true" : undefined}
      onClick={() => setIndex(position)}
    >
      <Image src={image.url} alt="" fill sizes="120px" className={styles.thumbPhoto} />
    </button>
  );

  return (
    <div className={styles.root}>
      <div className={styles.frame} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button
          type="button"
          className={styles.stage}
          onClick={onStageClick}
          aria-label={`Ampliar em tela cheia a foto ${safeIndex + 1} de ${total}`}
        >
          <Image
            key={current.url}
            src={current.url}
            alt={describe(current, safeIndex)}
            fill
            priority={safeIndex === 0}
            sizes="(min-width: 1280px) 760px, (min-width: 1024px) 60vw, 100vw"
            className={styles.photo}
          />
        </button>

        <span className={styles.expandHint} aria-hidden="true">
          <Icon name="expand" size={20} />
        </span>

        {total > 1 ? (
          <>
            <button
              type="button"
              className={cn(styles.nav, styles.navPrev)}
              onClick={() => step(-1)}
              aria-label="Foto anterior"
            >
              <Icon name="chevron-left" size={22} />
            </button>
            <button
              type="button"
              className={cn(styles.nav, styles.navNext)}
              onClick={() => step(1)}
              aria-label="Próxima foto"
            >
              <Icon name="chevron-right" size={22} />
            </button>
          </>
        ) : null}

        {current.caption || total > 1 ? (
          <div className={styles.captionBar}>
            <span className={styles.caption}>{current.caption ?? ""}</span>
            {total > 1 ? (
              <span className={cn(styles.counter, "tnum")}>
                {safeIndex + 1} / {total}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {total > 1 ? (
        <>
          <div className={styles.strip} ref={stripRef}>
            {images.map((image, position) => renderThumb(image, position, styles.stripThumb))}
          </div>

          <div className={styles.grid}>
            {desktopThumbs.map((image, position) => {
              const isOverflow = hiddenCount > 0 && position === DESKTOP_THUMBS - 1;
              if (!isOverflow) return renderThumb(image, position);
              return (
                <button
                  key={`${image.url}-mais`}
                  type="button"
                  className={styles.thumb}
                  onClick={() => openLightbox(position)}
                  aria-label={`Ver todas as ${total} fotos em tela cheia`}
                >
                  <Image src={image.url} alt="" fill sizes="120px" className={styles.thumbPhoto} />
                  <span className={styles.more}>
                    <Icon name="camera" size={16} />
                    <span className="tnum">+{hiddenCount} fotos</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {mounted && lightboxOpen
        ? createPortal(
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Fotos do ${title}`}
              tabIndex={-1}
              className={styles.lightbox}
              onKeyDown={trapFocus}
              onMouseDown={onBackdropMouseDown}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className={styles.lightboxTop}>
                <span className={cn(styles.lightboxCounter, "tnum")}>
                  {safeIndex + 1} / {total}
                </span>
                <button
                  type="button"
                  className={styles.lightboxClose}
                  onClick={closeLightbox}
                  aria-label="Fechar galeria"
                >
                  <Icon name="close" size={22} />
                </button>
              </div>

              <div className={styles.lightboxStage}>
                <span className={styles.lightboxPhotoWrap}>
                  <Image
                    key={current.url}
                    src={current.url}
                    alt={describe(current, safeIndex)}
                    fill
                    sizes="100vw"
                    className={styles.lightboxPhoto}
                  />
                </span>

                {total > 1 ? (
                  <>
                    <button
                      type="button"
                      className={cn(styles.lightboxNav, styles.navPrev)}
                      onClick={() => step(-1)}
                      aria-label="Foto anterior"
                    >
                      <Icon name="chevron-left" size={24} />
                    </button>
                    <button
                      type="button"
                      className={cn(styles.lightboxNav, styles.navNext)}
                      onClick={() => step(1)}
                      aria-label="Próxima foto"
                    >
                      <Icon name="chevron-right" size={24} />
                    </button>
                  </>
                ) : null}
              </div>

              <div className={styles.lightboxFoot}>
                {current.caption ? (
                  <p className={styles.lightboxCaption}>{current.caption}</p>
                ) : null}
                {total > 1 ? (
                  <div className={styles.lightboxStrip} ref={lightboxStripRef}>
                    {images.map((image, position) => (
                      <button
                        key={`lightbox-${image.url}-${position}`}
                        type="button"
                        className={cn(
                          styles.lightboxThumb,
                          position === safeIndex ? styles.lightboxThumbActive : undefined,
                        )}
                        aria-label={`Ver foto ${position + 1}`}
                        aria-current={position === safeIndex ? "true" : undefined}
                        onClick={() => setIndex(position)}
                      >
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          sizes="96px"
                          className={styles.thumbPhoto}
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export default VehicleGallery;
