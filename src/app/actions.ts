"use server";

import { createClient } from "@/utils/supabase/server";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { headers } from "next/headers";

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
  const role = formData.get("role")?.toString() as "business" | "customer";
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !role) {
    return {
      error: "Email, password and role are required",
    };
  }

  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role,
      },
    },
  });

  if (signUpError) {
    console.error(signUpError);
    return {
      error: signUpError.message,
    };
  }

  // Create profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: data.user?.id,
      email: email,
      role: role,
      email_verified: false,
      onboarding_completed: false,
    });

  if (profileError) {
    console.error(profileError);
    return {
      error: "Failed to create profile",
    };
  }

  return {
    success: "Check your email for the confirmation link",
  };
};

export const signInAction = async (formData: FormData): Promise<AuthResponse> => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  // Get user profile to determine the correct dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', data.user.id)
    .single();

  if (!profile) {
    return {
      error: "Profile not found",
    };
  }

  // Determine redirect path based on role and onboarding status
  let redirectPath = '/dashboard';
  
  if (!profile.onboarding_completed) {
    redirectPath = '/onboarding';
  } else if (profile.role === 'business') {
    redirectPath = '/dashboard/business';
  } else {
    redirectPath = '/dashboard/customer';
  }

  return {
    redirectTo: redirectPath,
  };
};

export const signInWithGoogleAction = async (): Promise<AuthResponse> => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error, data } = await supabase.auth.signInWithOAuth({
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
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: "Check your email for the reset link",
  };
};

export const resetPasswordAction = async (formData: FormData): Promise<AuthResponse> => {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: "Password updated successfully",
    redirectTo: "/login",
  };
};

export const signOutAction = async (): Promise<AuthResponse> => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    redirectTo: "/",
  };
};
