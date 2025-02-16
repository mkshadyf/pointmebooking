'use server';

import { BaseEmailService } from './BaseEmailService';

export class ServerEmailService extends BaseEmailService {
  static async sendVerificationEmail(email: string, code: string) {
    const content = `
      <p>Thank you for signing up. Please verify your email address by entering this code:</p>
      ${this.renderCode(code)}
      <p>If you didn't sign up for PointMe, you can safely ignore this email.</p>
    `;

    return this.sendEmail(email, 'Verify your email address', {
      title: 'Welcome to PointMe!',
      content,
    });
  }

  static async sendBookingConfirmation(email: string, booking: {
    service: string;
    business: string;
    date: string;
    time: string;
  }) {
    const content = `
      <p>Your booking has been confirmed with the following details:</p>
      ${this.renderBookingDetails(booking)}
      <p>You can view your booking details in your dashboard.</p>
    `;

    return this.sendEmail(email, 'Booking Confirmation', {
      title: 'Booking Confirmed!',
      content,
    });
  }

  static async sendBookingReminder(email: string, booking: {
    service: string;
    business: string;
    date: string;
    time: string;
  }) {
    const content = `
      <p>This is a reminder for your upcoming booking:</p>
      ${this.renderBookingDetails(booking)}
      <p>Looking forward to seeing you!</p>
    `;

    return this.sendEmail(email, 'Booking Reminder', {
      title: 'Booking Reminder',
      content,
    });
  }

  static async sendPasswordReset(email: string, resetLink: string) {
    const content = `
      <p>You requested to reset your password. Click the button below to proceed:</p>
      ${this.renderButton('Reset Password', resetLink)}
      <p>If you didn't request this, you can safely ignore this email.</p>
    `;

    return this.sendEmail(email, 'Reset your password', {
      title: 'Reset Your Password',
      content,
    });
  }

  static async sendBookingStatusUpdate(email: string, booking: {
    service: string;
    business: string;
    date: string;
    time: string;
  }, status: string) {
    const content = `
      <p>Your booking status has been updated to: <strong>${status}</strong></p>
      ${this.renderBookingDetails(booking)}
      <p>You can view your booking details in your dashboard.</p>
    `;

    return this.sendEmail(email, 'Booking Status Update', {
      title: 'Booking Status Update',
      content,
    });
  }
} 