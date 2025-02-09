import { createBrowserClient } from '@supabase/ssr';
import { ErrorCode } from '../errors/types';

interface EmailTemplateData {
  [key: string]: string | number | boolean | null | undefined;
}

interface SendEmailParams {
  to: string
  templateName: string
  data: EmailTemplateData
}

export class EmailService {
  private static instance: EmailService

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail({ to, templateName, data }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error('No active session')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to,
            templateName,
            data,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async sendVerificationEmail(email: string): Promise<boolean> {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(ErrorCode.AUTH_UNAUTHORIZED);
      }

      // Check verification attempts
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('verification_attempts, last_verification_attempt')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw new Error(ErrorCode.PROFILE_NOT_FOUND);
      }

      // Check rate limiting
      if (profile.verification_attempts >= 5) {
        const lastAttempt = new Date(profile.last_verification_attempt || 0);
        const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastAttempt < cooldownPeriod) {
          throw new Error(ErrorCode.API_RATE_LIMIT);
        }
      }

      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Update profile with new verification code and increment attempts
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_code: verificationCode,
          verification_attempts: (profile.verification_attempts || 0) + 1,
          last_verification_attempt: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(ErrorCode.PROFILE_UPDATE_FAILED);
      }

      // Send verification email
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userId: user.id,
          code: verificationCode
        }),
      });

      if (!response.ok) {
        throw new Error(ErrorCode.REQUEST_FAILED);
      }

      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: email,
      templateName: 'welcome',
      data: {
        name,
        email,
      },
    })
  }

  async sendBookingConfirmation(
    email: string,
    booking: {
      service: string
      business: string
      date: string
      time: string
    }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: email,
      templateName: 'booking-confirmation',
      data: {
        ...booking,
      },
    })
  }

  async sendBookingReminder(
    email: string,
    booking: {
      service: string
      business: string
      date: string
      time: string
    }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: email,
      templateName: 'booking-reminder',
      data: {
        ...booking,
      },
    })
  }

  async sendPasswordReset(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: email,
      templateName: 'password-reset',
      data: {
        code,
        email,
      },
    })
  }

  async sendBookingStatusUpdate(
    email: string,
    booking: {
      service: string;
      business: string;
      date: string;
      time: string;
      status: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: email,
      templateName: 'booking-status-update',
      data: {
        ...booking,
      },
    });
  }
}
