import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
  private supabase = createClientComponentClient()

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail({ to, templateName, data }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await this.supabase.auth.getSession()

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

  async sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: email,
      templateName: 'verification',
      data: {
        code,
        email,
      },
    })
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
