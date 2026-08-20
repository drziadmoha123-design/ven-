import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEGP(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString()} ج.م`;
}
