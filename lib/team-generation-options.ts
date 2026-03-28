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
  if (Array.isArray(options?.fixedMembers) && options.fixedMembers.length > 0) {
    return options.fixedMembers.filter(Boolean);
  }

  if (Array.isArray(options?.fijos) && options.fijos.length > 0) {
    return options.fijos.filter(Boolean);
  }

  if (typeof options?.fijo === "string" && options.fijo.trim()) {
    return [options.fijo.trim()];
  }

  return [];
}
