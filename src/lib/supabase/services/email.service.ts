import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be limited.');
}

const resend = new Resend(RESEND_API_KEY);

export class EmailService {
  static async sendVerificationEmail(email: string, code: string) {
    if (!RESEND_API_KEY) {
      throw new Error('Email service is not configured');
    }

    return resend.emails.send({
      from: 'PointMe <noreply@pointme.app>',
      to: [email],
      subject: 'Verify your email address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to PointMe!</h1>
          <p>Thank you for signing up. Please verify your email address by entering this code:</p>
          <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <code style="font-size: 24px; color: #4F46E5; letter-spacing: 4px;">${code}</code>
          </div>
          <p>If you didn't sign up for PointMe, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  static async sendBookingConfirmation(email: string, booking: {
    service: string;
    business: string;
    date: string;
    time: string;
  }) {
    if (!RESEND_API_KEY) {
      throw new Error('Email service is not configured');
    }

    return resend.emails.send({
      from: 'PointMe <noreply@pointme.app>',
      to: [email],
      subject: 'Booking Confirmation',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Booking Confirmed!</h1>
          <p>Your booking has been confirmed with the following details:</p>
          <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Business:</strong> ${booking.business}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
          </div>
          <p>You can view your booking details in your dashboard.</p>
        </div>
      `,
    });
  }

  static async sendBookingReminder(email: string, booking: {
    service: string;
    business: string;
    date: string;
    time: string;
  }) {
    if (!RESEND_API_KEY) {
      throw new Error('Email service is not configured');
    }

    return resend.emails.send({
      from: 'PointMe <noreply@pointme.app>',
      to: [email],
      subject: 'Booking Reminder',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Booking Reminder</h1>
          <p>This is a reminder for your upcoming booking:</p>
          <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Business:</strong> ${booking.business}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
          </div>
          <p>Looking forward to seeing you!</p>
        </div>
      `,
    });
  }

  static async sendPasswordReset(email: string, resetLink: string) {
    if (!RESEND_API_KEY) {
      throw new Error('Email service is not configured');
    }

    return resend.emails.send({
      from: 'PointMe <noreply@pointme.app>',
      to: [email],
      subject: 'Reset your password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Reset Your Password</h1>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }
} 