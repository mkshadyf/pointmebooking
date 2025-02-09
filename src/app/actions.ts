"use server";

import { getServerSupabaseClient } from "@/lib/supabase/client";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

export type AuthResponse = {
  data?: {
    user: User | null;
    session: Session | null;
  };
  error?: AuthError | string | null;
  success?: string;
  redirectTo?: string;
};

export const signUpAction = async (formData: FormData): Promise<AuthResponse> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();
  if (!email || !password || !role) {
    return { error: "Email, password and role are required" };
  }
  if (!["business", "customer"].includes(role)) {
    return { error: "Invalid role selected" };
  }

  const supabase = getServerSupabaseClient(await cookies());
  const origin = (await headers()).get("origin");

  const { error: signUpError, data } = await (await supabase).auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { role },
    },
  });

  if (signUpError) {
    const lowerMsg = signUpError.message.toLowerCase();
    if (lowerMsg.includes("already registered") || lowerMsg.includes("duplicate")) {
      return { error: "This email is already registered. Please sign in instead." };
    }
    if (lowerMsg.includes("weak")) {
      return { error: "Your password is too weak. Please use a stronger password." };
    }
    console.error("Sign up error:", signUpError);
    return { error: signUpError.message };
  }

  const { error: profileError } = await (await supabase)
    .from("profiles")
    .insert({
      id: data.user?.id,
      email: email,
      role,
      email_verified: false,
      onboarding_completed: false,
    });

  if (profileError) {
    console.error("Profile creation failed:", profileError);
    const { error: deleteError } = await (await supabase).auth.admin.deleteUser(data.user?.id!);
    if (deleteError) {
      console.error("Rollback delete error:", deleteError);
    }
    return { error: "Failed to create profile. Please try again later." };
  }

  return { success: "Check your email for the confirmation link" };
};

type SignInResult = { 
  data: { user: User | null; session: Session | null }; 
  error: AuthError | null;
};

export const signInAction = async (formData: FormData): Promise<AuthResponse> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  
  const supabase = getServerSupabaseClient(await cookies());
  
  try {
    // Create a timeout promise that rejects after 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('The server is taking too long to respond. Please ensure the server is running and check your connection.')), 15000)
    );

    // Race between the signInWithPassword call and the timeout
    const result = await Promise.race<SignInResult>([
      (await supabase).auth.signInWithPassword({ email, password }),
      timeoutPromise
    ]);

    const { error, data } = result;

    if (error) {
      const lowerMsg = error.message.toLowerCase();
      if (lowerMsg.includes("invalid") || lowerMsg.includes("credentials")) {
        return { error: "Invalid email or password. Please try again." };
      }
      if (lowerMsg.includes("not verified")) {
        return { error: "Your email is not verified. Please verify your email first." };
      }
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "No user data returned" };
    }

    // Get user profile
    const { data: profile, error: profileError } = await (await supabase)
      .from("profiles")
      .select("role, onboarding_completed, email_verified")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return { error: "Failed to fetch user profile" };
    }

    // Check email verification
    if (!profile.email_verified) {
      return { redirectTo: "/verify-email" };
    }

    // Check onboarding status for business users
    if (profile.role === "business" && !profile.onboarding_completed) {
      return { redirectTo: "/onboarding/business" };
    }

    // Redirect based on role
    const redirectTo = profile.role === "business" 
      ? "/dashboard/business"
      : "/dashboard/customer";

    return { redirectTo };

  } catch (e) {
    console.error("Sign in error:", e);
    return { error: e instanceof Error ? e.message : "Failed to sign in" };
  }
};

export const signInWithGoogleAction = async (): Promise<AuthResponse> => {
  const supabase = getServerSupabaseClient(await cookies());
  const origin = (await headers()).get("origin");

  const { error, data } = await (await supabase).auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    redirectTo: data.url,
  };
};

export const forgotPasswordAction = async (formData: FormData): Promise<AuthResponse> => {
  const email = formData.get("email")?.toString();
  if (!email) {
    return { error: "Email is required" };
  }
  const supabase = getServerSupabaseClient(await cookies());
  const origin = (await headers()).get("origin");

  const { error } = await (await supabase).auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    if (error.message.toLowerCase().includes("user not found")) {
      return { error: "This email is not registered. Please sign up instead." };
    }
    return { error: error.message };
  }

  return { success: "Check your email for the reset link" };
};

export const resetPasswordAction = async (formData: FormData): Promise<AuthResponse> => {
  const password = formData.get("password")?.toString();
  if (!password) {
    return { error: "Password is required." };
  }
  const supabase = getServerSupabaseClient(await cookies());
  const { error } = await (await supabase).auth.updateUser({ password });
  if (error) {
    return { error: "Failed to update your password. Please try again." };
  }
  return { success: "Password updated successfully", redirectTo: "/login" };
};

export const signOutAction = async (): Promise<AuthResponse> => {
  const supabase = getServerSupabaseClient(await cookies());
  const { error } = await (await supabase).auth.signOut();
  if (error) {
    return { error: "Failed to sign out. Please try again." };
  }
  return { redirectTo: "/" };
};
