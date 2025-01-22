import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { EmailTemplate } from '../_shared/email-template.ts'

interface TemplateData {
  [key: string]: string | number | boolean;
}

interface EmailPayload {
  to: string
  templateName: string
  data: TemplateData
}

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
    const {
      data: { user },
      error: verificationError,
    } = await supabaseClient.auth.getUser(token)

    if (verificationError || !user) {
      throw new Error('Invalid token')
    }

    // Parse the request body
    const { to, templateName, data }: EmailPayload = await req.json()

    // Validate required fields
    if (!to || !templateName || !data) {
      throw new Error('Missing required fields')
    }

    // Get the email template
    const template = new EmailTemplate(templateName, data)
    const html = await template.render()

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Missing Resend API key')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PointMe! <noreply@pointme.app>',
        to,
        subject: template.getSubject(),
        html,
      }),
    })

    const result = await response.json()

    // Log email sending attempt
    await supabaseClient
      .from('email_logs')
      .insert({
        user_id: user.id,
        template: templateName,
        recipient: to,
        success: response.ok,
        error: response.ok ? null : JSON.stringify(result),
      })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})
