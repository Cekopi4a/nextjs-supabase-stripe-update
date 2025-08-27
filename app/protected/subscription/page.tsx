import SubscriptionActions from "@/components/subcription-actions";
import PlanActions from "@/components/plan-actions";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/styles";
import { createUpdateClient } from "@/utils/update/server";

export default async function Page() {
  const client = await createUpdateClient();
  const { data, error } = await client.billing.getSubscriptions();
  const { data: productsData, error: productsError } = await client.billing.getProducts();

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Грешка при зареждане</h2>
          <p className="text-muted-foreground">
            Възникна грешка при зареждането на вашите абонаменти. Моля, опитайте отново.
          </p>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = data.subscriptions.some(sub => sub.status === "active");
  const currentPlan = data.subscriptions.find(sub => sub.status === "active");
  const currentProductId = currentPlan?.product.id || null;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Абонаменти</h1>
          <p className="text-muted-foreground mt-2">
            Управлявайте вашите абонаментни планове
          </p>
        </div>
      </div>

      {/* Current Plan Section */}
      {hasActiveSubscription && currentPlan ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className="text-xl font-semibold">Текущ план</h2>
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-2xl font-bold text-primary">{currentPlan.product.name}</h3>
              <p className="text-muted-foreground">{currentPlan.product.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                ${(currentPlan.price.unit_amount / 100).toFixed(2)}
              </div>
              <div className="text-muted-foreground">
                на {currentPlan.price.interval === 'month' ? 'месец' : 'година'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Статус:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                {currentPlan.cancel_at_period_end ? 'Отказва се в края на периода' : 'Активен'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Няма активен абонамент
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300">
            В момента нямате активен абонамент. Изберете план, за да продължите.
          </p>
        </div>
      )}

      {/* All Subscriptions */}
      {data.subscriptions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Всички абонаменти</h2>
          {data.subscriptions.map((subscription, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{subscription.product.name}</h3>
                  <p className="text-muted-foreground text-sm">{subscription.product.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      subscription.status === "active" && !subscription.cancel_at_period_end && "bg-green-500",
                      (subscription.status === "past_due" || subscription.cancel_at_period_end) && "bg-yellow-500",
                      subscription.status === "inactive" && "bg-red-500"
                    )}
                  ></div>
                  <span className="text-sm font-medium">
                    {subscription.status === "active" && !subscription.cancel_at_period_end && "Активен"}
                    {subscription.status === "active" && subscription.cancel_at_period_end && "Отказва се"}
                    {subscription.status === "past_due" && "Просрочен"}
                    {subscription.status === "inactive" && "Неактивен"}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Цена</div>
                  <div className="font-semibold">
                    ${(subscription.price.unit_amount / 100).toFixed(2)} / {subscription.price.interval === 'month' ? 'месец' : 'година'}
                  </div>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <div className="text-sm text-muted-foreground">Следващо плащане</div>
                    <div className="font-semibold">
                      {new Date(subscription.current_period_end * 1000).toLocaleDateString('bg-BG')}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">ID на абонамент</div>
                  <div className="font-mono text-sm">{subscription.id.slice(0, 12)}...</div>
                </div>
              </div>

              <SubscriptionActions subscription={subscription} />
            </Card>
          ))}
        </div>
      )}

      {/* Available Plans Section */}
      {!productsError && productsData?.products && (
        <div className="space-y-6">
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-2">Налични планове</h2>
            <p className="text-muted-foreground mb-6">
              Изберете план, който най-добре отговаря на вашите нужди
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.products.map(product => {
                const monthlyPrice = product.prices?.find(p => p.interval === "month");
                const yearlyPrice = product.prices?.find(p => p.interval === "year");
                const isCurrentPlan = currentProductId === product.id;
                
                return (
                  <Card key={product.id} className={cn(
                    "p-6 space-y-4 relative",
                    isCurrentPlan && "ring-2 ring-primary ring-offset-2"
                  )}>
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          Текущ план
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="text-muted-foreground text-sm">{product.description}</p>
                    </div>

                    {monthlyPrice && (
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">
                            ${(monthlyPrice.unit_amount / 100).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">/месец</span>
                        </div>
                        {yearlyPrice && (
                          <div className="text-sm text-muted-foreground">
                            или ${(yearlyPrice.unit_amount / 100).toFixed(2)}/година
                          </div>
                        )}
                      </div>
                    )}

                    <PlanActions 
                      product={product}
                      isCurrentPlan={isCurrentPlan}
                      hasActiveSubscription={hasActiveSubscription}
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Debug Section - Remove this in production */}
      <details className="mt-8">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          Техническа информация (за разработка)
        </summary>
        <div className="mt-2 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <pre className="text-xs overflow-auto">{JSON.stringify(data.subscriptions, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
}
