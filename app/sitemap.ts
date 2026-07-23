import { MetadataRoute } from "next";
import { getAllPokemonNames, getPokemonSlug } from "@/lib/pokemon-summary";
import { hasCompetitiveData } from "@/lib/competitive-sets";
import { TEMPLATES } from "@/config/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://poketeambuilder.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/tier-list` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/guides/gen9-ou` },
    { url: `${baseUrl}/guides/vgc` },
    { url: `${baseUrl}/blog` },
    {
      url: `${baseUrl}/blog/best-rain-team-gen9-ou`,
      lastModified: new Date("2026-05-03T00:00:00.000Z"),
    },
    {
      url: `${baseUrl}/blog/best-pokemon-gen9-ou`,
      lastModified: new Date("2026-03-10T00:00:00.000Z"),
    },
    {
      url: `${baseUrl}/blog/how-to-build-competitive-team`,
      lastModified: new Date("2026-03-08T00:00:00.000Z"),
    },
    { url: `${baseUrl}/changelog` },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-07-17T00:00:00.000Z"),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-03-13T00:00:00.000Z"),
    },
    { url: `${baseUrl}/configurar` },
    { url: `${baseUrl}/pokemon` },
    { url: `${baseUrl}/teams` },
    { url: `${baseUrl}/contact` },
  ];

  const allNames = getAllPokemonNames();
  const competitiveNames = allNames.filter((name) => hasCompetitiveData(name));
  const pokemonRoutes: MetadataRoute.Sitemap = competitiveNames.map((name) => ({
    url: `${baseUrl}/pokemon/${getPokemonSlug(name)}`,
  }));

  const templateRoutes: MetadataRoute.Sitemap = Object.keys(TEMPLATES).map((id) => ({
    url: `${baseUrl}/teams/${id}`,
  }));

  return [...staticRoutes, ...pokemonRoutes, ...templateRoutes];
}
