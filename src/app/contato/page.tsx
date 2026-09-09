import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ContactForm from "@/components/forms/ContactForm";
import LocationMap from "@/components/institucional/LocationMap";
import Icon from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { telUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Contato",
  description: `Fale com a ${siteConfig.name} pelo WhatsApp, telefone ou e-mail. Estamos no ${siteConfig.address.district}, em ${siteConfig.address.city}, de segunda a sábado.`,
  path: "/contato",
  keywords: ["contato revenda", "whatsapp loja de carros"],
});

export default function ContatoPage() {
  const channels = [
    {
      icon: "whatsapp" as const,
      title: "WhatsApp",
      value: siteConfig.contact.whatsappDisplay,
      note: "Resposta em minutos, em horário comercial",
      href: whatsappUrl(waMessage.generic()),
      external: true,
      highlight: true,
    },
    {
      icon: "phone" as const,
      title: "Telefone",
      value: siteConfig.contact.phoneDisplay,
      note: "Segunda a sexta, das 9h às 19h",
      href: telUrl,
      external: false,
      highlight: false,
    },
    {
      icon: "mail" as const,
      title: "E-mail",
      value: siteConfig.contact.email,
      note: "Para propostas, documentos e pós-venda",
      href: `mailto:${siteConfig.contact.email}`,
      external: false,
      highlight: false,
    },
  ];

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Contato" }]} />
          <p className="eyebrow">Atendimento</p>
          <h1>Fale com a gente</h1>
          <p className="lead">
            Escolha o canal que preferir. Se for sobre um carro específico, mande o código do anúncio que já chegamos
            com a ficha completa em mãos.
          </p>
        </div>
      </header>

      <div className="container">
        <ul className={styles.channels}>
          {channels.map((channel) => (
            <li key={channel.title} className={channel.highlight ? styles.channelHighlight : undefined}>
              <a
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
              >
                <Icon name={channel.icon} size={24} />
                <span className={styles.channelTitle}>{channel.title}</span>
                <strong className="tnum">{channel.value}</strong>
                <span className={styles.channelNote}>{channel.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <section className="section" aria-labelledby="formulario-contato">
        <div className={`container ${styles.layout}`}>
          <div className={styles.formCard}>
            <h2 id="formulario-contato">Mande uma mensagem</h2>
            <p className={styles.formIntro}>
              Retornamos em até 1 hora útil. Nada de robô: quem responde é um consultor da loja.
            </p>
            <ContactForm />
          </div>

          <div className={styles.social}>
            <h2>Acompanhe o estoque</h2>
            <p>Publicamos as novidades do pátio antes de irem para o site.</p>
            <ul>
              <li>
                <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer">
                  <Icon name="instagram" size={20} />
                  <span>{siteConfig.social.instagramHandle}</span>
                </a>
              </li>
              <li>
                <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer">
                  <Icon name="facebook" size={20} />
                  <span>/{siteConfig.shortName.toLowerCase()}motors</span>
                </a>
              </li>
              <li>
                <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer">
                  <Icon name="youtube" size={20} />
                  <span>Vídeos dos veículos</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <LocationMap />
    </>
  );
}
