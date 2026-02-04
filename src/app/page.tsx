import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { MenuList } from "@/components/menu/menu-list";
import { Footer } from "@/components/layout/footer";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchAdditions } from "@/lib/fetch-functions/additions";
import { fetchProducts } from "@/lib/fetch-functions/products";
import { fetchCategories } from "@/lib/fetch-functions/categories";
import { fetchBusinessConfig, fetchBusinessHours } from "@/lib/fetch-functions/business";

export default async function Home() {
  const queryClient = getQueryClient();

  // Prefetch menu data in parallel for instant loading
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.additions.list({ showAll: false }),
      queryFn: () => fetchAdditions(false),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list({ isActive: true, isAvailable: true }),
      queryFn: () => fetchProducts({ isActive: true, isAvailable: true }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.list(),
      queryFn: () => fetchCategories(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.business.config(),
      queryFn: () => fetchBusinessConfig(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.business.hours(),
      queryFn: () => fetchBusinessHours(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <MenuList />
        </main>
        <Footer />
      </div>
    </HydrationBoundary>
  );
}
