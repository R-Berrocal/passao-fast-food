import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchAdditions } from "@/lib/fetch-functions";
import { AdditionsPageContent } from "./additions-page-content";

export default async function AdditionsPage() {
  const queryClient = getQueryClient();

  // Prefetch all additions (including inactive) for admin
  await queryClient.prefetchQuery({
    queryKey: queryKeys.additions.list({ showAll: true }),
    queryFn: () => fetchAdditions(true),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdditionsPageContent />
    </HydrationBoundary>
  );
}
