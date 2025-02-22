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
function renderCode(code: string): string {
  return `<p><strong>${code}</strong></p>`;
}

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

export async function sendVerificationEmail(email: string, code: string) {
  const content = `
    <p>Thank you for signing up. Please verify your email address by entering this code:</p>
    ${renderCode(code)}
    <p>If you didn't sign up for PointMe, you can safely ignore this email.</p>
  `;
  return ServerEmailHandler.handleSendEmail(email, 'Verify your email address', {
    title: 'Welcome to PointMe!',
    content,
  });
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