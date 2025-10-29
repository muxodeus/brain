import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina clases de forma segura
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}