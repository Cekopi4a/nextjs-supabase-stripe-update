"use server";

import { createSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { encodedRedirect } from "@/utils/redirect";
import { checkRateLimit } from "@/utils/rate-limit";
import { validatePasswordStrength } from "@/utils/password-validation";
import { logAuthEvent } from "@/utils/audit-log";
import { headers } from "next/headers";

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Get request metadata
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // Rate limiting - 5 attempts per minute per email
  const { allowed, resetAt } = await checkRateLimit(email, 5, 60 * 1000);

  if (!allowed) {
    const resetIn = Math.ceil((resetAt - Date.now()) / 1000);
    return encodedRedirect(
      "error",
      "/sign-in",
      `Твърде много опити. Моля, изчакайте ${resetIn} секунди.`
    );
  }

  const client = await createSupabaseClient();

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log failed sign-in attempt
    await logAuthEvent(null, "sign_in_failed", {
      ip_address: ip,
      user_agent: userAgent,
      error_message: error.message,
    });

    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Log successful sign-in
  await logAuthEvent(data.user?.id || null, "sign_in_success", {
    ip_address: ip,
    user_agent: userAgent,
  });

  // Revalidate all pages to update auth state
  revalidatePath("/", "layout");

  return redirect("/protected");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const dateOfBirth = formData.get("date_of_birth") as string;

  // Get request metadata
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // Validate required fields
  if (!email || !password || !fullName || !phone || !city) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Моля попълнете всички задължителни полета."
    );
  }

  // Validate password strength
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return encodedRedirect("error", "/sign-up", passwordError);
  }

  // Rate limiting for sign-up
  const { allowed, resetAt } = await checkRateLimit(email, 3, 60 * 1000);

  if (!allowed) {
    const resetIn = Math.ceil((resetAt - Date.now()) / 1000);
    return encodedRedirect(
      "error",
      "/sign-up",
      `Твърде много опити. Моля, изчакайте ${resetIn} секунди.`
    );
  }

  const client = await createSupabaseClient();

  const url = process.env.VERCEL_URL
    ? `${process.env.VERCEL_URL}/protected`
    : "http://localhost:3000/protected";

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: url,
      data: {
        full_name: fullName,
        phone: phone,
        city: city,
        date_of_birth: dateOfBirth || null,
        country: "Bulgaria",
      },
    },
  });

  if (error) {
    // Log failed sign-up
    await logAuthEvent(null, "sign_up_failed", {
      ip_address: ip,
      user_agent: userAgent,
      error_message: error.message,
    });

    return encodedRedirect("error", "/sign-up", error.message);
  }

  // Update the profile with additional data
  if (data.user) {
    const { error: profileError } = await client
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
        city: city,
        date_of_birth: dateOfBirth || null,
        country: "Bulgaria",
        role: "trainer", // По подразбиране новите регистрации са треньори
      })
      .eq("id", data.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }
  }

  // Log successful sign-up
  await logAuthEvent(data.user?.id || null, "sign_up_success", {
    ip_address: ip,
    user_agent: userAgent,
  });

  // Revalidate all pages to update auth state
  revalidatePath("/", "layout");

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const client = await createSupabaseClient();

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.VERCEL_URL
      ? `${process.env.VERCEL_URL}/reset-password`
      : "http://localhost:3000/reset-password",
  });

  if (error) {
    return encodedRedirect("error", "/forgot-password", error.message);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Линкът за смяна на парола е изпратен на вашия имейл."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/reset-password", "Паролите не съвпадат.");
  }

  // Validate password strength
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    return encodedRedirect("error", "/reset-password", passwordError);
  }

  const client = await createSupabaseClient();

  const { error } = await client.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect("error", "/reset-password", error.message);
  }

  // Revalidate all pages to update auth state
  revalidatePath("/", "layout");

  return redirect("/protected");
};

export const signOutAction = async () => {
  const client = await createSupabaseClient();
  await client.auth.signOut();
  return redirect("/sign-in");
};
