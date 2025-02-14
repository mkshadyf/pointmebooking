 
import { handleApiError } from '@/lib/supabase/utils';
import { ErrorCode } from '@/lib/supabase/utils/errors';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
 

const MAX_VERIFICATION_ATTEMPTS = 5;
const VERIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: ErrorCode.VALIDATION_REQUIRED },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: ErrorCode.AUTH_UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('verification_code, verification_attempts, last_verification_attempt')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: ErrorCode.PROFILE_NOT_FOUND },
        { status: 404 }
      );
    }

    // Check rate limiting
    if (profile.verification_attempts >= MAX_VERIFICATION_ATTEMPTS) {
      const lastAttempt = new Date(profile.last_verification_attempt || 0);
      const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();

      if (timeSinceLastAttempt < VERIFICATION_COOLDOWN) {
        const minutesLeft = Math.ceil((VERIFICATION_COOLDOWN - timeSinceLastAttempt) / 60000);
        return NextResponse.json(
          { 
            error: ErrorCode.API_RATE_LIMIT,
            details: `Please try again in ${minutesLeft} minutes`
          },
          { status: 429 }
        );
      }

      // Reset attempts after cooldown
      await supabase
        .from('profiles')
        .update({
          verification_attempts: 0,
          last_verification_attempt: null
        })
        .eq('user_id', user.id);
    }

    // Verify code
    if (profile.verification_code !== code) {
      // Increment attempts
      await supabase
        .from('profiles')
        .update({
          verification_attempts: (profile.verification_attempts || 0) + 1,
          last_verification_attempt: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: ErrorCode.VALIDATION_ERROR },
        { status: 400 }
      );
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        verification_code: null,
        verification_attempts: 0,
        last_verification_attempt: null
      })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: ErrorCode.PROFILE_UPDATE_FAILED },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  return NextResponse.json(
    { error: ErrorCode.API_BAD_REQUEST },
    { status: 405 }
  );
} 