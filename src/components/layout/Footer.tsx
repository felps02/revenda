import Link from "next/link";
import Logo from "./Logo";
import Icon, { type IconName } from "@/components/ui/Icon";
import { footerNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { telUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./Footer.module.css";

interface FooterLink {
  readonly label: string;
  readonly href: string;
}

const navGroups: { title: string; links: readonly FooterLink[] }[] = [
  { title: "Estoque", links: footerNav.estoque },
  { title: "Institucional", links: footerNav.institucional },
  { title: "Serviços", links: footerNav.servicos },
];

const socialLinks: { label: string; href: string; icon: IconName }[] = [
  { label: "Instagram", href: siteConfig.social.instagram, icon: "instagram" },
  { label: "Facebook", href: siteConfig.social.facebook, icon: "facebook" },
  { label: "YouTube", href: siteConfig.social.youtube, icon: "youtube" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const years = Math.max(year - siteConfig.foundedYear, 1);
  const whatsappHref = whatsappUrl(waMessage.generic());

  return (
    <footer className={cn("band-dark", styles.footer)}>
      <div className="container-wide">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brandLink} aria-label={`${siteConfig.name}, ir para a página inicial`}>
              <Logo tone="light" />
            </Link>

            <p className={styles.pitch}>{siteConfig.slogan}</p>

            <ul className={styles.social}>
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a
                    className={styles.socialLink}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.label} da ${siteConfig.name}`}
                  >
                    <Icon name={item.icon} size={18} />
                  </a>
                </li>
              ))}
            </ul>

            <p className={styles.seal}>
              <Icon name="badge-check" size={16} />
              <span>
                <span className="tnum">{years}</span> anos no {siteConfig.address.district}
              </span>
            </p>
          </div>

          {navGroups.map((group) => (
            <nav key={group.title} className={styles.navCol} aria-label={group.title}>
              <h2 className={styles.colTitle}>{group.title}</h2>
              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.contact}>
          <div className={styles.contactCol}>
            <h2 className={styles.colTitle}>Showroom</h2>
            <a
              className={styles.contactLink}
              href={siteConfig.address.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="map-pin" size={18} />
              <span>
                {siteConfig.address.street}, {siteConfig.address.complement}
                <br />
                {siteConfig.address.district} — {siteConfig.address.city}/{siteConfig.address.state}
                <br />
                <span className="tnum">CEP {siteConfig.address.zip}</span>
              </span>
            </a>
          </div>

          <div className={styles.contactCol}>
            <h2 className={styles.colTitle}>Atendimento</h2>
            <a className={styles.contactLink} href={telUrl}>
              <Icon name="phone" size={18} />
              <span className="tnum">{siteConfig.contact.phoneDisplay}</span>
            </a>
            <a className={styles.contactLink} href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={18} />
              <span className="tnum">{siteConfig.contact.whatsappDisplay}</span>
            </a>
            <a className={styles.contactLink} href={`mailto:${siteConfig.contact.email}`}>
              <Icon name="mail" size={18} />
              <span>{siteConfig.contact.email}</span>
            </a>
          </div>

          <div className={styles.contactCol}>
            <h2 className={styles.colTitle}>Horários</h2>
            <ul className={styles.hours}>
              {siteConfig.hours.map((slot) => (
                <li key={slot.label} className={styles.hoursItem}>
                  <span>{slot.label}</span>
                  <span className={cn(styles.hoursValue, "tnum")}>{slot.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>
            <span>
              © <span className="tnum">{year}</span> {siteConfig.name}. Todos os direitos reservados.
            </span>
            <span className={styles.legalDoc}>
              {siteConfig.legalName} · <span className="tnum">CNPJ {siteConfig.cnpj}</span>
            </span>
          </p>
          <p className={styles.disclaimer}>
            Fotos meramente ilustrativas. Preços, condições de financiamento e disponibilidade do estoque podem mudar
            sem aviso prévio.
          </p>
        </div>
      </div>
    </footer>
  );
}
