import { ServerEmailService } from '@/lib/supabase/services/ServerEmailService';
import { NextResponse } from 'next/server';
import { API_ERRORS } from '../../../../constants/api';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    await ServerEmailService.sendVerificationEmail(email, code);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: API_ERRORS.NOT_FOUND },
    { status: 405 }
  );
} 