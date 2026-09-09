"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { mainNav, siteConfig } from "@/config/site";
import { useFavorites } from "@/hooks/useFavorites";
import { useEscapeKey, useLockBodyScroll, useMediaQuery, useScrolled } from "@/hooks/useUi";
import { cn } from "@/lib/cn";
import { pluralize } from "@/lib/format";
import { telUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./Header.module.css";

interface HeaderProps {
  /** Força o modo sobreposto ao hero. Sem prop, só a home começa transparente. */
  transparentOnTop?: boolean;
}

const MENU_ID = "menu-principal";

export default function Header({ transparentOnTop }: HeaderProps) {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { count, hydrated } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const overlay = transparentOnTop ?? pathname === "/";
  const solid = !overlay || scrolled || menuOpen;
  const whatsappHref = whatsappUrl(waMessage.generic());

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  useLockBodyScroll(menuOpen);
  useEscapeKey(closeMenu, menuOpen);

  // Trocou de rota: o menu não pode ficar aberto por cima da página nova.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Girou o aparelho / chegou no desktop: o drawer some, então libera o scroll.
  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  // Enquanto aberto, o foco circula dentro do drawer.
  useEffect(() => {
    if (!menuOpen) return;
    closeRef.current?.focus();
    const node = drawerRef.current;
    if (!node) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables = node.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const isActive = (href: string): boolean => pathname === href || pathname.startsWith(`${href}/`);

  const favoritesLabel =
    hydrated && count > 0
      ? `Favoritos: ${count} ${pluralize(count, "veículo salvo", "veículos salvos")}`
      : "Favoritos";

  return (
    <>
      <header className={cn(styles.header, solid ? styles.solid : styles.overlay, "no-print")}>
        <div className={cn("container-wide", styles.inner)}>
          <Link href="/" className={styles.brand} aria-label={`${siteConfig.name}, ir para a página inicial`}>
            <span className={styles.brandFull}>
              <Logo tone="light" />
            </span>
            <span className={styles.brandCompact}>
              <Logo tone="light" compact />
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Navegação principal">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(styles.navLink, isActive(item.href) && styles.navLinkActive)}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <a className={styles.phone} href={telUrl}>
              <Icon name="phone" size={16} />
              <span className="tnum">{siteConfig.contact.phoneDisplay}</span>
            </a>

            <Link href="/favoritos" className={cn(styles.iconAction, styles.favorites)} aria-label={favoritesLabel}>
              <Icon name="heart" size={20} />
              {hydrated && count > 0 ? (
                <span className={cn(styles.badge, "tnum")} aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </Link>

            <span className={styles.cta}>
              <Button variant="whatsapp" size="sm" icon="whatsapp" href={whatsappHref} external>
                Fale conosco
              </Button>
            </span>

            <a
              className={cn(styles.iconAction, styles.waAction)}
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar com um consultor no WhatsApp"
            >
              <Icon name="whatsapp" size={20} />
            </a>

            <button
              ref={toggleRef}
              type="button"
              className={cn(styles.iconAction, styles.menuButton)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Reserva a altura do header fixo nas rotas que não têm hero sob ele. */}
      {overlay ? null : <div className={styles.spacer} aria-hidden="true" />}

      <div
        className={cn(styles.backdrop, menuOpen && styles.backdropOpen)}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div
        id={MENU_ID}
        ref={drawerRef}
        className={cn(styles.drawer, menuOpen && styles.drawerOpen)}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerTop}>
          <Logo tone="light" />
          <button
            ref={closeRef}
            type="button"
            className={styles.iconAction}
            onClick={closeMenu}
            aria-label="Fechar menu"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label="Navegação do menu">
          {mainNav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.drawerLink, isActive(item.href) && styles.drawerLinkActive)}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <span className={cn(styles.drawerIndex, "tnum")} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.drawerLabel}>{item.label}</span>
              <Icon name="arrow-right" size={18} className={styles.drawerArrow} />
            </Link>
          ))}

          <Link href="/favoritos" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
            <span className={cn(styles.drawerIndex, "tnum")} aria-hidden="true">
              {String(mainNav.length + 1).padStart(2, "0")}
            </span>
            <span className={styles.drawerLabel}>
              Favoritos
              {hydrated && count > 0 ? <span className={cn(styles.drawerCount, "tnum")}>{count}</span> : null}
            </span>
            <Icon name="heart" size={18} className={styles.drawerArrow} />
          </Link>
        </nav>

        <div className={styles.drawerContact}>
          <a className={styles.drawerContactItem} href={telUrl}>
            <Icon name="phone" size={18} />
            <span>
              <span className={styles.drawerContactLabel}>Telefone</span>
              <span className="tnum">{siteConfig.contact.phoneDisplay}</span>
            </span>
          </a>

          <a
            className={styles.drawerContactItem}
            href={siteConfig.address.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="map-pin" size={18} />
            <span>
              <span className={styles.drawerContactLabel}>Showroom</span>
              {siteConfig.address.street}, {siteConfig.address.complement} — {siteConfig.address.district},{" "}
              {siteConfig.address.city}/{siteConfig.address.state}
            </span>
          </a>

          <p className={styles.drawerContactItem}>
            <Icon name="clock" size={18} />
            <span>
              <span className={styles.drawerContactLabel}>Horários</span>
              <span className={styles.drawerHours}>
                {siteConfig.hours.map((slot) => (
                  <span key={slot.label}>
                    {slot.label}: {slot.value}
                  </span>
                ))}
              </span>
            </span>
          </p>
        </div>

        <div className={styles.drawerCta}>
          <Button
            variant="whatsapp"
            size="lg"
            icon="whatsapp"
            href={whatsappHref}
            external
            fullWidth
            onClick={() => setMenuOpen(false)}
          >
            Falar no WhatsApp
          </Button>
        </div>
      </div>
    </>
  );
}
