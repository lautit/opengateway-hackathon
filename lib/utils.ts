import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export default function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
