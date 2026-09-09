import { Suspense } from "react";
import BrandStrip from "@/components/home/BrandStrip";
import CategoryTiles from "@/components/home/CategoryTiles";
import FeaturedVehicles from "@/components/home/FeaturedVehicles";
import FinancingCta from "@/components/home/FinancingCta";
import Hero from "@/components/home/Hero";
import SellCta from "@/components/home/SellCta";
import Steps from "@/components/home/Steps";
import TrustStrip from "@/components/home/TrustStrip";
import Testimonials from "@/components/institucional/Testimonials";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import QuickSearch from "@/components/vehicle/filters/QuickSearch";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { vehicleRepository } from "@/services/vehicleRepository";
import { telUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  keywords: ["seminovos curitiba", "carros usados batel", "revenda premium"],
});

/** Mediana dos preços do estoque - base da simulação de exemplo da home. */
function medianPrice(prices: number[]): number {
  if (prices.length === 0) return 120000;
  const sorted = [...prices].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle];
}

export default async function HomePage() {
  const [featured, facets, stockCount, all] = await Promise.all([
    vehicleRepository.featured(6),
    vehicleRepository.facets(),
    vehicleRepository.count(),
    vehicleRepository.all(),
  ]);

  const bodyCounts = Object.fromEntries(facets.bodies.map((item) => [item.value, item.count]));
  const available = all.filter((vehicle) => vehicle.status !== "vendido");

  return (
    <>
      <Hero stockCount={stockCount} />

      <div className={styles.searchBand}>
        <div className="container">
          <Suspense fallback={<div className={styles.searchFallback} aria-hidden="true" />}>
            <QuickSearch facets={facets} variant="hero" />
          </Suspense>
        </div>
      </div>

      <TrustStrip />

      <section className="section" aria-labelledby="destaques">
        <div className="container">
          <FeaturedVehicles vehicles={featured} />
        </div>
      </section>

      <section className="section band-alt" aria-labelledby="categorias">
        <div className="container">
          <CategoryTiles counts={bodyCounts} />
        </div>
      </section>

      <BrandStrip brands={facets.brands.map(({ value, count }) => ({ value, count }))} />

      <Steps />

      <SellCta />

      <section className="section" aria-labelledby="financiamento-home">
        <div className="container">
          <FinancingCta samplePrice={medianPrice(available.map((vehicle) => vehicle.price))} />
        </div>
      </section>

      <Testimonials />

      <section className={`band-dark ${styles.finalCta}`}>
        <div className="container">
          <div className={styles.finalCtaInner}>
            <div>
              <p className="eyebrow">Venha tomar um café</p>
              <h2>Escolha pelo site, decida no test drive</h2>
              <p className="lead">
                Estamos no {siteConfig.address.district}, em {siteConfig.address.city}. Agende o horário e deixamos o
                carro lavado, abastecido e com a documentação separada para você conferir com calma.
              </p>
              <div className={styles.finalCtaActions}>
                <Button href={whatsappUrl(waMessage.stock())} external variant="whatsapp" size="lg">
                  Falar pelo WhatsApp
                </Button>
                <Button href="/estoque" variant="light" size="lg" iconRight="arrow-right">
                  Ver estoque completo
                </Button>
              </div>
            </div>

            <ul className={styles.finalCtaInfo}>
              <li>
                <Icon name="map-pin" size={18} />
                <div>
                  <strong>{siteConfig.address.street}</strong>
                  <span>
                    {siteConfig.address.district} · {siteConfig.address.city}/{siteConfig.address.state}
                  </span>
                </div>
              </li>
              <li>
                <Icon name="clock" size={18} />
                <div>
                  <strong>{siteConfig.hours[0].label}</strong>
                  <span>{siteConfig.hours[0].value}</span>
                </div>
              </li>
              <li>
                <Icon name="phone" size={18} />
                <div>
                  <strong>
                    <a href={telUrl}>{siteConfig.contact.phoneDisplay}</a>
                  </strong>
                  <span>WhatsApp {siteConfig.contact.whatsappDisplay}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
