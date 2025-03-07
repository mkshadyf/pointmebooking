 

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be limited.');
}

const resend = new Resend(RESEND_API_KEY);

interface EmailTemplateProps {
  title: string;
  content: string;
}

export class BaseEmailService {
  protected static async sendEmail(
    to: string,
    subject: string,
    { title, content }: EmailTemplateProps
  ) {
    if (!RESEND_API_KEY) {
      throw new Error('Email service is not configured');
    }

    return resend.emails.send({
      from: 'PointMe <noreply@pointme.app>',
      to: [to],
      subject,
      html: this.renderTemplate({ title, content }),
    });
  }

  protected static renderTemplate({ title, content }: EmailTemplateProps): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">${title}</h1>
        ${content}
      </div>
    `;
  }

  protected static renderBookingDetails(booking: {
    service: string;
    business: string;
    date: string;
    time: string;
  }): string {
    return `
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Business:</strong> ${booking.business}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
      </div>
    `;
  }

  protected static renderButton(text: string, link: string): string {
    return `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          ${text}
        </a>
      </div>
    `;
  }

  protected static renderCode(code: string): string {
    return `
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <code style="font-size: 24px; color: #4F46E5; letter-spacing: 4px;">${code}</code>
      </div>
    `;
  }
} 