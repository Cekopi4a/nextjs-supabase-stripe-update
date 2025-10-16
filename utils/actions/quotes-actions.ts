// utils/actions/quotes-actions.ts
"use server";

import { createSupabaseClient } from "@/utils/supabase/server";

export interface DailyQuote {
  quote_id: string;
  quote_text: string;
  author: string;
}

/**
 * Get the daily motivational quote for the authenticated user.
 * Uses the Supabase function `get_daily_quote` which ensures:
 * - One unique quote per day per user
 * - Quotes aren't repeated within 30 days
 * - Random selection from active quotes
 *
 * @returns Daily quote or null if error
 */
export async function getDailyQuote(): Promise<DailyQuote | null> {
  try {
    const supabase = await createSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting user for daily quote:", authError);
      return null;
    }

    // Call the database function to get or create daily quote
    const { data, error } = await supabase.rpc("get_daily_quote", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error fetching daily quote:", error);
      return null;
    }

    // The function returns an array, get the first result
    if (data && Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error("Unexpected error in getDailyQuote:", error);
    return null;
  }
}

/**
 * Get a random quote (without tracking/daily logic)
 * Useful for previews or testing
 */
export async function getRandomQuote(): Promise<DailyQuote | null> {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("motivational_quotes")
      .select("id, quote_text, author")
      .eq("is_active", true)
      .limit(1)
      .order("id", { ascending: false }); // Random via RANDOM() would need raw SQL

    if (error) {
      console.error("Error fetching random quote:", error);
      return null;
    }

    if (data && data.length > 0) {
      return {
        quote_id: data[0].id,
        quote_text: data[0].quote_text,
        author: data[0].author,
      };
    }

    return null;
  } catch (error) {
    console.error("Unexpected error in getRandomQuote:", error);
    return null;
  }
}
