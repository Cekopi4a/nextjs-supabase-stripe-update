// components/fitness/daily-quote-card.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Sparkles, Loader2 } from "lucide-react";
import { getDailyQuote, type DailyQuote } from "@/utils/actions/quotes-actions";

export default function DailyQuoteCard() {
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const dailyQuote = await getDailyQuote();
        setQuote(dailyQuote);
      } catch (error) {
        console.error("Error fetching daily quote:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <p className="text-xs sm:text-sm">Зареждам цитат...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return null; // Don't show anything if no quote available
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Quote Text */}
            <div className="relative">
              <Quote className="absolute -left-1 -top-1 h-4 w-4 sm:h-5 sm:w-5 text-blue-400 dark:text-blue-600 opacity-50" />
              <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed pl-4 sm:pl-5">
                {quote.quote_text}
              </p>
            </div>

            {/* Author */}
            <p className="text-xs sm:text-sm text-blue-600 dark:text-cyan-400 font-medium italic pl-4 sm:pl-5">
              — {quote.author}
            </p>

            {/* Label */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground pl-4 sm:pl-5 pt-1">
              <div className="h-1 w-1 rounded-full bg-blue-400"></div>
              <span>Мотивация за деня</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
