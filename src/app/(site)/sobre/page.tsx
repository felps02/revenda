import Image from "next/image";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AboutStory from "@/components/institucional/AboutStory";
import Differentials from "@/components/institucional/Differentials";
import LocationMap from "@/components/institucional/LocationMap";
import Stats from "@/components/institucional/Stats";
import StorePhotos from "@/components/institucional/StorePhotos";
import Testimonials from "@/components/institucional/Testimonials";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { buildMetadata } from "@/lib/seo";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "A revenda",
  description: `Desde ${siteConfig.foundedYear} no ${siteConfig.address.district}, em ${siteConfig.address.city}: seminovos com laudo cautelar, oficina própria e preço aberto na mesa.`,
  path: "/sobre",
  keywords: ["revenda de carros curitiba", "loja de seminovos batel"],
});

const SELECTION = [
  {
    title: "Procedência antes do preço",
    text: "Consultamos histórico de sinistro, leilão, roubo e gravame. Se aparecer qualquer marca no chassi, o carro não entra.",
  },
  {
    title: "Histórico de manutenção",
    text: "Damos preferência a carros com revisões documentadas. Sem histórico, o preço de compra cai — e você sabe disso no anúncio.",
  },
  {
    title: "Laudo cautelar completo",
    text: "Cabine, motor, câmbio e estrutura avaliados por empresa independente. O laudo vai junto com o carro na venda.",
  },
  {
    title: "Avaliação de 120 itens",
    text: "Nossa oficina revisa suspensão, freios, embreagem, elétrica, ar-condicionado e pneus antes de o carro ir para o pátio.",
  },
  {
    title: "Precificação transparente",
    text: "Partimos da FIPE, ajustamos por quilometragem, estado e demanda regional — e mostramos essa conta para quem pergunta.",
  },
];

export default function SobrePage() {
  return (
    <>
      <header className={styles.hero}>
        <Image
          src={siteMedia.about.delivery.url}
          alt={siteMedia.about.delivery.alt}
          fill
          priority
          quality={85}
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={`container ${styles.heroContent}`}>
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "A revenda" }]} tone="dark" />
          <p className="eyebrow">Desde {siteConfig.foundedYear} no {siteConfig.address.district}</p>
          <h1>Uma revenda que aceita ser conferida</h1>
          <p className={styles.heroLead}>{siteConfig.slogan}</p>
        </div>
      </header>

      <AboutStory />

      <Stats />

      <Differentials />

      <section className="section band-alt" aria-labelledby="selecao">
        <div className="container">
          <SectionHeading
            as="h2"
            id="selecao"
            eyebrow="Nosso processo"
            title="Como escolhemos os carros que entram no pátio"
            description="De cada dez veículos avaliados para compra, quatro são recusados. É por isso que o estoque é pequeno e roda rápido."
          />
          <ol className={styles.selection}>
            {SELECTION.map((item, index) => (
              <li key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <StorePhotos />

      <Testimonials />

      <LocationMap />

      <section className={`band-dark ${styles.cta}`}>
        <div className="container-narrow">
          <h2>Venha conferir pessoalmente</h2>
          <p className="lead">
            Traga seu mecânico, peça o laudo, abra o capô. A gente prefere assim — cliente que confere é cliente que
            volta.
          </p>
          <div className={styles.ctaActions}>
            <Button href="/estoque" variant="light" size="lg" iconRight="arrow-right">
              Ver o estoque
            </Button>
            <Button href={whatsappUrl(waMessage.generic())} external variant="whatsapp" size="lg">
              Agendar uma visita
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
