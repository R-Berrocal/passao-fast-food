import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchProducts, fetchCategories } from "@/lib/fetch-functions";
import { ProductsPageContent } from "./products-page-content";

export default async function ProductsPage() {
  const queryClient = getQueryClient();

  // Prefetch all products and categories for admin
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(),
      queryFn: () => fetchProducts(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => fetchCategories(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsPageContent />
    </HydrationBoundary>
  );
}
