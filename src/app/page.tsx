import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { MenuList } from "@/components/menu/menu-list";
import { Footer } from "@/components/layout/footer";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchAdditions } from "@/lib/fetch-functions";

export default async function Home() {
  const queryClient = getQueryClient();

  // Prefetch additions for instant loading
  await queryClient.prefetchQuery({
    queryKey: queryKeys.additions.list({ showAll: false }),
    queryFn: () => fetchAdditions(false),
  });

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
