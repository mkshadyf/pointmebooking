import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: verifyError } = await supabaseClient.auth.getUser(token)
    
    if (verifyError || !user) {
      throw new Error('Invalid token')
    }

    // Get the request body
    const { code } = await req.json()
    if (!code) {
      throw new Error('Verification code is required')
    }

    // Verify the code against the user's metadata
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('verification_code, email_verified')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Failed to get user profile')
    }

    if (profile.email_verified) {
      throw new Error('Email already verified')
    }

    if (profile.verification_code !== code) {
      throw new Error('Invalid verification code')
    }

    // Update the user's profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        email_verified: true,
        verification_code: null,
      })
      .eq('id', user.id)

    if (updateError) {
      throw new Error('Failed to update profile')
    }

    return new Response(
      JSON.stringify({ message: 'Email verified successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
