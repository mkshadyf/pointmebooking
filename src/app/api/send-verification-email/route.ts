import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    await resend.emails.send({
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
