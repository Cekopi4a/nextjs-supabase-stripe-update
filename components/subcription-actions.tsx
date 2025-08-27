"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createUpdateClient } from "@/utils/update/client";
import { Subscription } from "@updatedev/js";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function SubscriptionActions({
  subscription,
}: {
  subscription: Subscription;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCancelSubscription(id: string) {
    setIsLoading(true);
    const client = createUpdateClient();
    await client.billing.updateSubscription(id, {
      cancel_at_period_end: true,
    });
    setIsLoading(false);
    router.refresh();
  }

  async function handleReactivateSubscription(id: string) {
    setIsLoading(true);
    const client = createUpdateClient();
    await client.billing.updateSubscription(id, {
      cancel_at_period_end: false,
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {!subscription.cancel_at_period_end && (
        <Button
          onClick={() => handleCancelSubscription(subscription.id)}
          disabled={isLoading}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Spinner variant="primary" isLoading={isLoading} />
          {isLoading ? "Отказване..." : "Отказване на абонамент"}
        </Button>
      )}
      {subscription.cancel_at_period_end && (
        <Button
          onClick={() => handleReactivateSubscription(subscription.id)}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Spinner variant="primary" isLoading={isLoading} />
          {isLoading ? "Възстановяване..." : "Възстанови абонамент"}
        </Button>
      )}
    </div>
  );
}
