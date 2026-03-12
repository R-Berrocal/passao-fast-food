import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { MenuList } from "@/components/menu/menu-list";
import { Footer } from "@/components/layout/footer";
import { MobileCartBar } from "@/components/cart/mobile-cart-bar";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchAdditions } from "@/lib/fetch-functions/additions";
import { fetchProducts } from "@/lib/fetch-functions/products";
import { fetchCategories } from "@/lib/fetch-functions/categories";
import { fetchBusinessConfig, fetchBusinessHours } from "@/lib/fetch-functions/business";

export default async function Home() {
  const queryClient = getQueryClient();

  // Prefetch menu data in parallel — allSettled prevents one failure from blocking the rest
  const [, , , configResult] = await Promise.allSettled([
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

  const config = configResult.status === "fulfilled"
    ? queryClient.getQueryData<Awaited<ReturnType<typeof fetchBusinessConfig>>>(queryKeys.business.config())
    : null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://passao.com.co";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    name: config?.name ?? "Passao",
    description: config?.slogan ?? "Las mejores arepas, perros, patacones y más",
    url: baseUrl,
    telephone: config?.phone,
    servesCuisine: ["Colombian", "Fast Food", "Arepas", "Perros Calientes", "Patacones"],
    priceRange: "$",
    ...(config?.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: config.address,
        addressLocality: config.city ?? "Montería",
        addressRegion: "Córdoba",
        addressCountry: "CO",
      },
    }),
    ...(config?.logoUrl && {
      image: config.logoUrl,
    }),
    ...(config?.instagramUrl && {
      sameAs: [config.instagramUrl, ...(config.facebookUrl ? [config.facebookUrl] : [])],
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pb-24 md:pb-0">
            <Hero />
            <MenuList />
          </main>
          <Footer />
          <MobileCartBar />
        </div>
      </HydrationBoundary>
    </>
  );
}
