import { QueryClient } from "@tanstack/react-query";

let clientQueryClientSingleton: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= makeQueryClient());
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Retry once on failure
        retry: 1,
        // Data is fresh for 30 minutes
        staleTime: 30 * 60 * 1000,
        // Refetch when user returns to window
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry once on mutation failure
        retry: 1,
      },
    },
  });
}
