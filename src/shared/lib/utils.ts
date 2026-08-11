import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine classnames and resolve conflicting Tailwind utilities
 * (e.g. `cn('px-2', condition && 'px-4')` keeps only `px-4`)
 */
export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes));
};
