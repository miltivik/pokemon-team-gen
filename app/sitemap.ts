import { MetadataRoute } from "next";
import { getAllPokemonNames, getPokemonSlug } from "@/lib/pokemon-summary";
import { hasCompetitiveData } from "@/lib/competitive-sets";
import { TEMPLATES } from "@/config/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://poketeambuilder.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/es` },
    { url: `${baseUrl}/es/configurar` },
    { url: `${baseUrl}/tier-list` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/guides/gen9-ou` },
    { url: `${baseUrl}/guides/vgc` },
    { url: `${baseUrl}/pokemon-showdown-team-builder` },
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

  // Date of the last content-wide change to pSEO pages (teammates/checks
  // sections, team cores). Bumping this accelerates Google's re-crawl of the
  // new internal link graph. Update ONLY on real content changes, not on
  // every deploy, or lastmod loses credibility.
  const PSEO_CONTENT_UPDATED = new Date("2026-08-16");

  const allNames = getAllPokemonNames();
  const competitiveNames = allNames.filter((name) => hasCompetitiveData(name));
  const pokemonRoutes: MetadataRoute.Sitemap = competitiveNames.map((name) => ({
    url: `${baseUrl}/pokemon/${getPokemonSlug(name)}`,
    lastModified: PSEO_CONTENT_UPDATED,
  }));

  const templateRoutes: MetadataRoute.Sitemap = Object.keys(TEMPLATES).map((id) => ({
    url: `${baseUrl}/teams/${id}`,
    lastModified: PSEO_CONTENT_UPDATED,
  }));

  return [...staticRoutes, ...pokemonRoutes, ...templateRoutes];
}
