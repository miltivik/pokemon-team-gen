import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pokemon-team-generator.vercel.app";
  const sharedUpdatedAt = new Date("2026-03-24T00:00:00.000Z");

  return [
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
      url: `${baseUrl}/blog/vgc-2026-guide`,
      lastModified: new Date("2026-03-05T00:00:00.000Z"),
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
      url: `${baseUrl}/contact`,
      lastModified: sharedUpdatedAt,
      changeFrequency: "yearly",
      priority: 0.35,
    },
  ];
}
