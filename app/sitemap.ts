import { MetadataRoute } from "next";
import { getAllPokemonNames } from "@/lib/pokemon-summary";
import { hasCompetitiveData } from "@/lib/competitive-sets";
import { TEMPLATES } from "@/config/templates";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://poketeambuilder.com";
  const sharedUpdatedAt = new Date("2026-07-16T00:00:00.000Z");
  const now = sharedUpdatedAt;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tier-list`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/gen9-ou`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/vgc`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/best-rain-team-gen9-ou`,
      lastModified: new Date("2026-05-03T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/best-pokemon-gen9-ou`,
      lastModified: new Date("2026-03-10T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-build-competitive-team`,
      lastModified: new Date("2026-03-08T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-03-13T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-03-13T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/configurar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pokemon`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/teams`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "yearly",
      priority: 0.35,
    },
  ];

  const allNames = getAllPokemonNames();
  const competitiveNames = allNames.filter((name) => hasCompetitiveData(name));
  const limitedPokemon = competitiveNames.slice(0, 300);

  const pokemonRoutes: MetadataRoute.Sitemap = limitedPokemon.map((name) => ({
    url: `${baseUrl}/pokemon/${slugify(name)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const templateRoutes: MetadataRoute.Sitemap = Object.keys(TEMPLATES).map((id) => ({
    url: `${baseUrl}/teams/${id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...pokemonRoutes, ...templateRoutes];
}
