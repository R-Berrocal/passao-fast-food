import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the base URL for API calls.
 * - Server-side (SSR/SSG): Uses absolute URL from environment variables
 * - Client-side: Uses relative URL (empty string)
 */
export function getBaseUrl(): string {
  // Client-side: use relative URLs
  if (typeof window !== "undefined") {
    return "";
  }

  // Server-side: use absolute URL
  // Vercel provides VERCEL_URL for deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback for local development
  return "http://localhost:3000";
}
