import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { vehicleRepository } from "@/services/vehicleRepository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/estoque"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/financiamento"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/avaliacao"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/sobre"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contato"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const vehicles = await vehicleRepository.all();
  const vehicleRoutes: MetadataRoute.Sitemap = vehicles
    .filter((vehicle) => vehicle.status !== "vendido")
    .map((vehicle) => ({
      url: absoluteUrl(`/estoque/${vehicle.slug}`),
      lastModified: new Date(vehicle.createdAt),
      changeFrequency: "weekly" as const,
      priority: vehicle.featured ? 0.9 : 0.8,
    }));

  return [...staticRoutes, ...vehicleRoutes];
}
