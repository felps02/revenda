import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import InterestForm from "@/components/forms/InterestForm";
import FinancingSimulator from "@/components/forms/FinancingSimulator";
import RelatedVehicles from "@/components/vehicle/detail/RelatedVehicles";
import VehicleFeatures from "@/components/vehicle/detail/VehicleFeatures";
import VehicleGallery from "@/components/vehicle/detail/VehicleGallery";
import VehiclePriceBox from "@/components/vehicle/detail/VehiclePriceBox";
import VehicleSpecs from "@/components/vehicle/detail/VehicleSpecs";
import { siteConfig } from "@/config/site";
import { formatMileage, formatYearPair } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata, vehicleJsonLd, vehicleMetaDescription } from "@/lib/seo";
import { vehicleFullTitle, vehicleTitle } from "@/lib/slug";
import { vehicleRepository } from "@/services/vehicleRepository";
import styles from "./page.module.css";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const vehicles = await vehicleRepository.all();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await vehicleRepository.getBySlug(slug);

  if (!vehicle) {
    return buildMetadata({
      title: "Veículo não encontrado",
      description: "Este anúncio não está mais disponível no estoque da " + siteConfig.name + ".",
      path: `/estoque/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${vehicleFullTitle(vehicle)} · ${formatMileage(vehicle.mileage)}`,
    description: vehicleMetaDescription(vehicle),
    path: `/estoque/${vehicle.slug}`,
    image: vehicle.images[0]?.url,
    keywords: [vehicle.brand, `${vehicle.brand} ${vehicle.model}`, `${vehicle.model} ${vehicle.year}`],
  });
}

export default async function VeiculoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const vehicle = await vehicleRepository.getBySlug(slug);

  if (!vehicle) notFound();

  const related = await vehicleRepository.related(vehicle, 4);
  const paragraphs = vehicle.description.split("\n\n").filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd(vehicle)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Início", path: "/" },
              { name: "Estoque", path: "/estoque" },
              { name: vehicleTitle(vehicle), path: `/estoque/${vehicle.slug}` },
            ]),
          ),
        }}
      />

      <div className={styles.top}>
        <div className="container">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "Estoque", href: "/estoque" },
              { label: vehicleTitle(vehicle) },
            ]}
          />

          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.title}>
                {vehicleTitle(vehicle)} <span>{vehicle.version}</span>
              </h1>
              <p className={styles.summary}>
                <span className="tnum">{formatYearPair(vehicle.manufactureYear, vehicle.year)}</span>
                <i aria-hidden="true">·</i>
                <span className="tnum">{formatMileage(vehicle.mileage)}</span>
                <i aria-hidden="true">·</i>
                <span>{vehicle.transmission}</span>
                <i aria-hidden="true">·</i>
                <span>{vehicle.fuel}</span>
                <i aria-hidden="true">·</i>
                <span>Código {vehicle.id.toUpperCase()}</span>
              </p>
            </div>

            {vehicle.status !== "disponivel" ? (
              <Badge tone={vehicle.status === "vendido" ? "dark" : "alert"} size="md" icon="info">
                {vehicle.status === "vendido" ? "Veículo vendido" : "Reservado"}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`container ${styles.main}`}>
        <div className={styles.left}>
          <VehicleGallery images={vehicle.images} title={vehicleFullTitle(vehicle)} />
        </div>

        <div className={styles.right}>
          <VehiclePriceBox vehicle={vehicle} />
        </div>
      </div>

      <div className={`container ${styles.body}`}>
        <section className={styles.block} aria-labelledby="ficha">
          <SectionHeading as="h2" id="ficha" eyebrow="Ficha técnica" title="O que este carro tem" />
          <VehicleSpecs vehicle={vehicle} />
        </section>

        <section className={styles.block} aria-labelledby="sobre-veiculo">
          <SectionHeading
            as="h2"
            id="sobre-veiculo"
            eyebrow="Sobre este veículo"
            title="A história deste carro, sem maquiagem"
          />
          <div className={styles.description}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <ul className={styles.highlights}>
            {vehicle.highlights.map((highlight) => (
              <li key={highlight}>
                <Icon name="check-circle" size={20} />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="opcionais">
          <SectionHeading as="h2" id="opcionais" eyebrow="Opcionais" title="Itens de série e acessórios" />
          <VehicleFeatures features={vehicle.features} />
        </section>

        <section className={styles.trust} aria-label="Garantias da loja">
          <div>
            <Icon name="shield" size={24} />
            <h3>Laudo cautelar aprovado</h3>
            <p>Chassi, motor e câmbio conferidos, sem indício de sinistro, leilão ou adulteração.</p>
          </div>
          <div>
            <Icon name="badge-check" size={24} />
            <h3>{siteConfig.warranty.label}</h3>
            <p>Revisão completa na nossa oficina antes da entrega, com garantia por escrito no contrato.</p>
          </div>
          <div>
            <Icon name="key" size={24} />
            <h3>Transferência inclusa</h3>
            <p>Cuidamos do despachante, do emplacamento e da entrega do documento na sua casa.</p>
          </div>
        </section>

        <section className={styles.block} id="simulador" aria-labelledby="simular">
          <SectionHeading
            as="h2"
            id="simular"
            eyebrow="Financiamento"
            title="Simule a parcela deste veículo"
            description="Valores estimativos com a taxa média dos nossos bancos parceiros. A condição final sai na análise de crédito."
          />
          <FinancingSimulator vehicle={vehicle} variant="page" />
        </section>

        <section className={styles.block} id="interesse" aria-labelledby="falar">
          <SectionHeading
            as="h2"
            id="falar"
            eyebrow="Atendimento"
            title="Fale com um consultor sobre este carro"
            description="Respondemos em até 1 hora útil. Se preferir, o WhatsApp é imediato."
          />
          <div className={styles.formCard}>
            <InterestForm vehicle={vehicle} source={`veiculo:${vehicle.id}`} />
          </div>
        </section>
      </div>

      {related.length > 0 ? (
        <section className="section band-alt">
          <div className="container">
            <RelatedVehicles vehicles={related} />
          </div>
        </section>
      ) : null}
    </>
  );
}
