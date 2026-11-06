// Adapted from Zaidan src/lib/utils.ts; see ../../ZAIDAN-NOTICE.md.
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
