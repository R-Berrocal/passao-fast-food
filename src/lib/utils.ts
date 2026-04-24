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

  if(process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Server-side: use absolute URL
  // NEXT_PUBLIC_BASE_URL should be set in Vercel to the production domain
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Vercel provides VERCEL_URL for deployments (auto-generated URL)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback for local development
  return "http://localhost:3000";
}
