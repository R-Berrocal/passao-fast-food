import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchOrderTracking } from "@/lib/fetch-functions/orders";
import { OrderTrackingContent } from "./page-content";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderTrackingPage({ params }: Props) {
  const { orderNumber } = await params;
  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery({
      queryKey: queryKeys.orders.tracking(orderNumber),
      queryFn: () => fetchOrderTracking(orderNumber),
    });
  } catch {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderTrackingContent orderNumber={orderNumber} />
    </HydrationBoundary>
  );
}
