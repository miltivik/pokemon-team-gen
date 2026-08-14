import type { FormatId } from "@/config/formats";
import { FORMATS } from "@/config/formats";

export interface TeamGenerationOptions {
  format?: string;
  type?: string | null;
  tipo?: string | null;
  fijo?: string | null;
  fijos?: string[] | null;
  fixedMembers?: string[] | null;
  excludeLegendaries?: boolean;
  templateId?: string;
  lang?: "en" | "es";
}

export interface FixedMemberInput {
  fixedMembers?: readonly string[] | null;
  fijos?: readonly string[] | null;
  fijo?: string | null;
}

interface SearchParamsWithGetAll {
  getAll(name: string): string[];
}

function cleanFixedMembers(members?: readonly string[] | null): string[] {
  return (members ?? [])
    .map((member) => member.trim())
    .filter(Boolean);
}

export function getFixedMembersFromSearchParams(
  searchParams?: SearchParamsWithGetAll | null
): string[] {
  const seen = new Set<string>();
  const fixedMembers: string[] = [];

  for (const rawMember of searchParams?.getAll("fixedPokemon") ?? []) {
    const member = rawMember.trim();
    const key = member.toLowerCase();
    if (!member || seen.has(key)) continue;
    seen.add(key);
    fixedMembers.push(member);
  }

  return fixedMembers;
}

export function resolveFixedMembers(
  input?: FixedMemberInput | null
): string[] | null {
  const canonicalMembers = cleanFixedMembers(input?.fixedMembers);
  if (canonicalMembers.length > 0) return canonicalMembers;

  const legacyMembers = cleanFixedMembers(input?.fijos);
  if (legacyMembers.length > 0) return legacyMembers;

  const legacyMember = input?.fijo?.trim();
  return legacyMember ? [legacyMember] : null;
}

export function cloneGenerationOptions(
  options?: TeamGenerationOptions | null
): TeamGenerationOptions | null {
  if (!options) return null;

  return {
    ...options,
    fijos: Array.isArray(options.fijos) ? [...options.fijos] : options.fijos ?? null,
    fixedMembers: Array.isArray(options.fixedMembers)
      ? [...options.fixedMembers]
      : options.fixedMembers ?? null,
  };
}

export function getGenerationOptionsFormat(
  options?: TeamGenerationOptions | null
): FormatId | undefined {
  if (!options?.format) return undefined;
  return options.format in FORMATS ? (options.format as FormatId) : undefined;
}

export function getGenerationOptionsType(
  options?: TeamGenerationOptions | null
): string | undefined {
  const type = options?.tipo ?? options?.type;
  return type ? type.toLowerCase() : undefined;
}

export function getGenerationOptionsFixedMembers(
  options?: TeamGenerationOptions | null
): string[] {
  return resolveFixedMembers(options) ?? [];
}
