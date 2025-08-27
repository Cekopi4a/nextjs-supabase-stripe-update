"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createUpdateClient } from "@/utils/update/client";
import { ProductWithPrices } from "@updatedev/js";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlanActionsProps {
  product: ProductWithPrices;
  isCurrentPlan: boolean;
  hasActiveSubscription: boolean;
}

export default function PlanActions({
  product,
  isCurrentPlan,
  hasActiveSubscription,
}: PlanActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSelectPlan(priceId: string) {
    setIsLoading(true);
    const client = createUpdateClient();
    const redirectUrl = `${window.location.origin}/protected/subscription`;
    
    try {
      const { data, error } = await client.billing.createCheckoutSession(priceId, {
        redirect_url: redirectUrl,
      });
      
      if (error) {
        console.error('Грешка при създаване на сесия за плащане:', error);
        setIsLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Неочаквана грешка:', error);
      setIsLoading(false);
    }
  }

  const monthlyPrice = product.prices?.find(p => p.interval === "month");
  const yearlyPrice = product.prices?.find(p => p.interval === "year");

  if (isCurrentPlan) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Текущ план
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {monthlyPrice && (
        <Button
          onClick={() => handleSelectPlan(monthlyPrice.id)}
          disabled={isLoading}
          className="w-full"
          variant={hasActiveSubscription ? "outline" : "default"}
        >
          <Spinner variant="primary" isLoading={isLoading} />
          {isLoading ? "Зареждане..." : hasActiveSubscription ? "Смяна на план" : "Избери месечен"}
        </Button>
      )}
      
      {yearlyPrice && (
        <Button
          onClick={() => handleSelectPlan(yearlyPrice.id)}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <Spinner variant="primary" isLoading={isLoading} />
          {isLoading ? "Зареждане..." : hasActiveSubscription ? "Смяна на годишен" : "Избери годишен"}
        </Button>
      )}
    </div>
  );
}