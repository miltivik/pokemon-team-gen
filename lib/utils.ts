import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const ID_SANITIZE_RE = /[^a-z0-9]+/g;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toID(text: string | number): string {
  if (typeof text !== 'string' && typeof text !== 'number') return '';
  return ('' + text).toLowerCase().replace(ID_SANITIZE_RE, '');
}
