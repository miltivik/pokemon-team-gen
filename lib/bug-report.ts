import { z } from "zod";

import {
  getGenerationOptionsFixedMembers,
  type TeamGenerationOptions,
} from "@/lib/team-generation-options";
import type { GeneratedTeamMember } from "@/lib/team-guide";

export interface BugReportTeamMember {
  species: string;
  item?: string;
  ability?: string;
  moves: string[];
  teraType?: string;
  evs?: string;
}

export interface BugReportGenerationContext {
  format?: string;
  templateId?: string;
  tipo?: string | null;
  excludeLegendaries?: boolean;
  fixedMembers?: string[];
  team?: BugReportTeamMember[];
}

export interface BugReportClientMeta {
  userAgent: string;
  submittedAt: string;
  currentUrl?: string;
}

export const bugReportSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(4000),
  stepsToReproduce: z.string().trim().min(10).max(4000),
  email: z.union([z.literal(""), z.string().email().max(254)]).optional(),
  page: z.string().trim().min(1).max(200),
  lang: z.enum(["en", "es"]),
  clientMeta: z.object({
    userAgent: z.string().trim().max(1000),
    submittedAt: z.string().trim().min(1).max(100),
    currentUrl: z.string().trim().max(500).optional(),
  }),
  generationContext: z
    .object({
      format: z.string().trim().max(100).optional(),
      templateId: z.string().trim().max(100).optional(),
      tipo: z.string().trim().max(50).nullable().optional(),
      excludeLegendaries: z.boolean().optional(),
      fixedMembers: z.array(z.string().trim().min(1).max(100)).optional(),
      team: z
        .array(
          z.object({
            species: z.string().trim().min(1).max(100),
            item: z.string().trim().max(100).optional(),
            ability: z.string().trim().max(100).optional(),
            moves: z.array(z.string().trim().min(1).max(100)).max(8),
            teraType: z.string().trim().max(50).optional(),
            evs: z.string().trim().max(100).optional(),
          })
        )
        .max(6)
        .optional(),
    })
    .optional(),
  honeypot: z.string().max(0).optional(),
});

export type BugReportPayload = z.infer<typeof bugReportSchema>;

function getMoveNames(member: GeneratedTeamMember) {
  if (!Array.isArray(member.moves)) return [];

  return member.moves
    .map((move) => (typeof move === "string" ? move : move.name ?? ""))
    .filter(Boolean);
}

export function buildBugReportGenerationContext(
  team: GeneratedTeamMember[],
  generationOptions: unknown
): BugReportGenerationContext | undefined {
  const options =
    generationOptions && typeof generationOptions === "object"
      ? (generationOptions as TeamGenerationOptions)
      : undefined;

  const normalizedTeam = team
    .map((pokemon) => {
      return {
        species: pokemon.name,
        item: pokemon.item,
        ability: pokemon.ability,
        moves: getMoveNames(pokemon),
        teraType: pokemon.teraType,
        evs: pokemon.evs,
      };
    })
    .filter((member) => member.species);

  if (!options && normalizedTeam.length === 0) return undefined;

  return {
    format: options?.format,
    templateId: options?.templateId,
    tipo: options?.tipo ?? options?.type ?? null,
    excludeLegendaries: options?.excludeLegendaries,
    fixedMembers: options ? getGenerationOptionsFixedMembers(options) : undefined,
    team: normalizedTeam.length > 0 ? normalizedTeam : undefined,
  };
}

export function formatBugReportEmail(payload: BugReportPayload) {
  const lines = [
    "Pokemon Team Generator bug report",
    "",
    "Submission metadata",
    `Page: ${payload.page}`,
    `Language: ${payload.lang}`,
    `Submitted at: ${payload.clientMeta.submittedAt}`,
    `Current URL: ${payload.clientMeta.currentUrl ?? "n/a"}`,
    `Email: ${payload.email || "not provided"}`,
    `User agent: ${payload.clientMeta.userAgent || "n/a"}`,
    "",
    "Title",
    payload.title,
    "",
    "Description",
    payload.description,
    "",
    "Steps to reproduce",
    payload.stepsToReproduce,
  ];

  if (payload.generationContext) {
    lines.push(
      "",
      "Contexto de generacion",
      JSON.stringify(payload.generationContext, null, 2)
    );
  }

  return lines.join("\n");
}
