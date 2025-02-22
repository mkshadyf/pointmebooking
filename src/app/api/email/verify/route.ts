import { sendVerificationEmail } from '@/lib/supabase/services/ServerEmailService';
import { NextResponse } from 'next/server';
import { API_ERRORS } from '../../../../constants/api';

export async function POST(request: Request) {
  const { email, code } = await request.json();
  await sendVerificationEmail(email, code);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function GET() {
  return NextResponse.json(
    { error: API_ERRORS.NOT_FOUND },
    { status: 405 }
  );
} 