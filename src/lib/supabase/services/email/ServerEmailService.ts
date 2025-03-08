'use server';

import { BaseEmailService } from './BaseEmailService';

// Create a subclass with a public static wrapper method
class ServerEmailHandler extends BaseEmailService {
  public static async handleSendEmail(
    email: string,
    subject: string,
    options: { title: string; content: string }
  ) {
    return this.sendEmail(email, subject, options);
  }
}

// Helper function to render code

// Helper function to render booking details
function renderBookingDetails(booking: {
  service: string;
  business: string;
  date: string;
  time: string;
}): string {
  return `
    <ul>
      <li>Service: ${booking.service}</li>
      <li>Business: ${booking.business}</li>
      <li>Date: ${booking.date}</li>
      <li>Time: ${booking.time}</li>
    </ul>
  `;
}

// Helper function to render button
function renderButton(text: string, link: string): string {
  return `<a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">${text}</a>`;
}

// Export async functions using the public wrapper

/**
 * Server Email Service for sending emails from server components
 * This is separate from the regular EmailService to avoid client-side imports
 */

/**
 * Send verification email to the user
 * @param email The email address to send to
 * @param code The verification code
 */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  try {
    // Construct the verification link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?code=${code}&email=${encodeURIComponent(email)}`;
    
    // Send the email using server API
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Verify your email address',
        html: `
          <h1>Email Verification</h1>
          <p>Thank you for registering with our service. Please verify your email by clicking the link below:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>Or enter the following code: <strong>${code}</strong></p>
          <p>This link will expire in 24 hours.</p>
        `,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
    
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendBookingConfirmation(
  email: string,
  booking: { service: string; business: string; date: string; time: string }
) {
  const content = `
    <p>Your booking has been confirmed with the following details:</p>
    ${renderBookingDetails(booking)}
    <p>You can view your booking details in your dashboard.</p>
  `;
  return ServerEmailHandler.handleSendEmail(email, 'Booking Confirmation', {
    title: 'Booking Confirmed!',
    content,
  });
}

export async function sendBookingReminder(
  email: string,
  booking: { service: string; business: string; date: string; time: string }
) {
  const content = `
    <p>This is a reminder for your upcoming booking:</p>
    ${renderBookingDetails(booking)}
    <p>Looking forward to seeing you!</p>
  `;
  return ServerEmailHandler.handleSendEmail(email, 'Booking Reminder', {
    title: 'Booking Reminder',
    content,
  });
}

export async function sendPasswordReset(email: string, resetLink: string) {
  const content = `
    <p>You requested to reset your password. Click the button below to proceed:</p>
    ${renderButton('Reset Password', resetLink)}
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;
  return ServerEmailHandler.handleSendEmail(email, 'Reset your password', {
    title: 'Reset Your Password',
    content,
  });
}

export async function sendBookingStatusUpdate(
  email: string,
  booking: { service: string; business: string; date: string; time: string },
  status: string
) {
  const content = `
    <p>Your booking status has been updated to: <strong>${status}</strong></p>
    ${renderBookingDetails(booking)}
    <p>You can view your booking details in your dashboard.</p>
  `;
  return ServerEmailHandler.handleSendEmail(email, 'Booking Status Update', {
    title: 'Booking Status Update',
    content,
  });
} 