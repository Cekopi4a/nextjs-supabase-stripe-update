import { z } from "zod";

/**
 * Environment variables validation schema
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required").optional(),

  // Update.dev
  NEXT_PUBLIC_UPDATE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Resend (Email)
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url("Invalid site URL").optional(),

  // Stripe (Optional)
  STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Vercel (Optional - only in production)
  VERCEL_URL: z.string().optional(),
});

/**
 * Validated environment variables
 * Use this instead of process.env to ensure type safety
 */
export const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Environment validation failed");
  }
})();

/**
 * Check if all optional services are configured
 */
export const servicesConfigured = {
  email: Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL),
  stripe: Boolean(env.STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY),
  updateDev: Boolean(env.NEXT_PUBLIC_UPDATE_PUBLISHABLE_KEY),
} as const;

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL;
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
