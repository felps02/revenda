import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { formatMileage, formatYearPair } from "@/lib/format";
import { vehicleFullTitle } from "@/lib/slug";
import type { Vehicle } from "@/types";

/** Helpers de SEO: metadata das paginas + dados estruturados (schema.org). */

interface MetadataInput {
  title: string;
  description: string;
  /** Caminho relativo, ex.: "/estoque". */
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  keywords = [],
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "revenda de carros",
      "seminovos",
      "carros usados",
      siteConfig.address.city,
      siteConfig.name,
      ...keywords,
    ],
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "pt_BR",
      url,
      title: fullTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

/** Dados estruturados da loja - alimenta o card do Google e o Maps. */
export function dealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${siteConfig.url}/#revenda`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: `+${siteConfig.contact.phone}`,
    email: siteConfig.contact.email,
    image: DEFAULT_OG_IMAGE,
    priceRange: "R$ 45.000 - R$ 480.000",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${siteConfig.address.street}, ${siteConfig.address.complement}`,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.address.lat,
      longitude: siteConfig.address.lng,
    },
    openingHoursSpecification: siteConfig.hours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [siteConfig.social.instagram, siteConfig.social.facebook, siteConfig.social.youtube],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.9,
      reviewCount: 312,
      bestRating: 5,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/estoque?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Schema do anuncio - habilita rich result de veiculo a venda. */
export function vehicleJsonLd(vehicle: Vehicle) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicleFullTitle(vehicle),
    description: vehicle.description,
    url: absoluteUrl(`/estoque/${vehicle.slug}`),
    image: vehicle.images.map((image) => image.url),
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleConfiguration: vehicle.version,
    modelDate: String(vehicle.year),
    productionDate: String(vehicle.manufactureYear),
    color: vehicle.color,
    numberOfDoors: vehicle.doors,
    bodyType: vehicle.body,
    fuelType: vehicle.fuel,
    vehicleTransmission: vehicle.transmission,
    vehicleEngine: {
      "@type": "EngineSpecification",
      name: vehicle.engine,
      enginePower: { "@type": "QuantitativeValue", value: vehicle.power, unitText: "cv" },
    },
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "KMT",
    },
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "BRL",
      availability:
        vehicle.status === "disponivel"
          ? "https://schema.org/InStock"
          : vehicle.status === "reservado"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
      url: absoluteUrl(`/estoque/${vehicle.slug}`),
      seller: { "@type": "AutoDealer", name: siteConfig.name, "@id": `${siteConfig.url}/#revenda` },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Descricao curta e rica para <meta description> do anuncio. */
export function vehicleMetaDescription(vehicle: Vehicle): string {
  return [
    `${vehicleFullTitle(vehicle)} ${formatYearPair(vehicle.manufactureYear, vehicle.year)}`,
    `${formatMileage(vehicle.mileage)}`,
    vehicle.transmission,
    vehicle.fuel,
    `cor ${vehicle.color.toLowerCase()}`,
    `à venda na ${siteConfig.name}, ${siteConfig.address.city}/${siteConfig.address.state}.`,
    "Laudo cautelar, garantia e financiamento em até 60x.",
  ].join(" · ");
}
