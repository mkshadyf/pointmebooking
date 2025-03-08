"use server";

import { createServerSupabaseClient } from "@/lib/supabase/client";
import { authService } from "@/lib/supabase/services/auth/auth.service";
import { supabaseClientService } from "@/lib/supabase/services/core/supabase-client.service";
import { cookies, headers } from "next/headers";

// Define the AuthResponse type that was missing
interface AuthResponse {
  data?: any;
  error?: string | Error | null;
  user?: any;
  success?: string;
  redirectTo?: string;
}

/**
 * Creates a user and a profile
 */
export const signUpAction = async (formData: FormData): Promise<AuthResponse> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();

  if (!email || !password || !role) {
    return { error: "Email, password, and role are required" };
  }
  if (!["business", "customer"].includes(role)) {
    return { error: "Invalid role selected" };
  }

  // Use the authService instance for registration
  const authResult = await authService.register({ email, password, role });
  
  if (authResult.error) {
    const errorMessage = authResult.error.message || "Registration failed";
    return { error: errorMessage };
  }

  return {
    data: {
      user: authResult.data?.user || null,
      session: authResult.data || null,
      profile: authResult.data?.user || null
    },
    success: "Account created successfully! Please check your email to verify your account."
  };
};

/**
 * Sign in action for existing users
 */
export const signInAction = async (formData: FormData): Promise<AuthResponse> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Use the authService instance for login
  const authResult = await authService.login({ email, password });
  
  if (authResult.error) {
    const errorMessage = authResult.error.message || "Authentication failed";
    return { error: errorMessage };
  }

  return {
    data: {
      user: authResult.data?.user || null,
      session: authResult.data || null,
      profile: authResult.data?.user || null
    }
  };
};

/**
 * Google authentication action
 */
export const signInWithGoogleAction = async (): Promise<AuthResponse> => {
  try {
    // Get the cookie store
    const cookieStore = await cookies();
    // Create the server client
    
    // Get the referer header for origin
    const headersList = await headers();
    const referer = headersList.get("referer");
    const origin = referer ? new URL(referer).origin : "http://localhost:3000";

    const { data, error } = await authService.signInWithOAuth("google", {
      redirectTo: `${origin}/auth/callback?next=${referer}`,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      data: { session: null, user: null },
      redirectTo: data.url,
    };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : "Failed to sign in with Google"
    };
  }
};

/**
 * Forgot password action
 */
export const forgotPasswordAction = async (formData: FormData): Promise<AuthResponse> => {
  const email = formData.get("email")?.toString();
  if (!email) {
    return { error: "Email is required" };
  }

  try {
    // Get the cookie store
    const cookieStore = await cookies();
    // Create the server client
    
    // Get the referer header for origin
    const headersList = await headers();
    const referer = headersList.get("referer");
    const origin = referer ? new URL(referer).origin : "http://localhost:3000";

    const { error } = await authService.resetPassword(email, {
      redirectTo: `${origin}/reset-password?next=${referer}`,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: "Password reset link has been sent to your email",
    };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : "Failed to send password reset email"
    };
  }
};

/**
 * Reset password action
 */
export const resetPasswordAction = async (formData: FormData): Promise<AuthResponse> => {
  const password = formData.get("password")?.toString();
  if (!password) {
    return { error: "Password is required" };
  }

  try {
    // Get the cookie store
    const cookieStore = await cookies();
    // Create the server client

    const { error } = await authService.updateUser({
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: "Password has been reset successfully",
      redirectTo: "/login",
    };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : "Failed to reset password"
    };
  }
};

/**
 * Sign out action
 */
export const signOutAction = async (): Promise<AuthResponse> => {
  // Use the authService instance for logout
  const result = await authService.logout();
  
  if (result.error) {
    return { error: result.error.message };
  }

  return {
    success: "Signed out successfully",
    redirectTo: "/login",
  };
};

/**
 * Verify email action
 */
export const verifyEmailAction = async (token: string): Promise<AuthResponse> => {
  if (!token) {
    return { error: "Verification token is required" };
  }
  
  try {
    // Get the cookie store
    const cookieStore = await cookies();
    // Create the server client
    
    // Get the user session
    const { data: session } = await authService.getSession();
    
    if (!session?.user?.email) {
      return { error: "User session not found. Please sign in again." };
    }
    
    // Use the authService instance for email verification
    const result = await authService.verifyEmail(token);
    
    if (result.error) {
      return { error: result.error.message };
    }

    return {
      success: "Email verified successfully",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : "Failed to verify email"
    };
  }
};

/**
 * Create a business profile for a user
 * This allows a user to complete the business onboarding process
 */
export const createBusinessProfileAction = async (formData: FormData): Promise<AuthResponse> => {
  try {
    // Get the cookie store
    
    // Create a Supabase client
    const client = await supabaseClientService.getBrowserClient();
    
    // Get the current session
    const { data: session } = await client.auth.getSession();
    
    if (!session) {
      return { error: "You must be logged in to create a business profile" };
    }
    
    // Get the user's profile
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      return { error: profileError.message };
    }
    
    // Extract form data
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const businessCategoryId = formData.get("business_category")?.toString();
    const businessTypeId = formData.get("business_type")?.toString();
    const address = formData.get("address")?.toString();
    const city = formData.get("city")?.toString();
    const state = formData.get("state")?.toString();
    const zip = formData.get("zip")?.toString();
    const country = formData.get("country")?.toString();
    const phone = formData.get("phone")?.toString();
    const website = formData.get("website")?.toString();
    
    // Validate required fields
    if (!name || !description || !businessCategoryId || !businessTypeId || !address || !city || !state || !zip || !country || !phone) {
      return { error: "All fields are required" };
    }
    
    // Create the business profile
    const { data: business, error: businessError } = await client
      .from('businesses')
      .insert({
        owner_profile_id: profile.id,
        name,
        description,
        business_category: businessCategoryId,
        business_type: businessTypeId,
        address,
        city,
        state,
        postal_code: zip,
        contact_number: phone,
        website: website || null,
      })
      .select()
      .single();
      
    if (businessError) {
      return { error: businessError.message };
    }
    
    // Update the user's profile to mark onboarding as completed
    const { error: updateError } = await client
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', profile.id);
      
    if (updateError) {
      return { error: updateError.message };
    }
    
    return {
      data: { business },
      success: "Business profile created successfully",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

// Add a helper action for fetching business categories
export const getBusinessCategoriesAction = async (): Promise<{ 
  data?: any[]; 
  error?: string; 
}> => {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerSupabaseClient(cookieStore);
    
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return { data };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch business categories"
    };
  }
};

// Add a helper action for fetching service categories by business category
export const getServiceCategoriesAction = async (businessCategoryId: string): Promise<{
  data?: any[];
  error?: string;
}> => {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerSupabaseClient(cookieStore);
    
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('business_category_id', businessCategoryId)
      .order('name');
    
    if (error) throw error;
    
    return { data };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch service categories"
    };
  }
};
