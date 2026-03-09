import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phone, password, inviteCode } = await req.json()
    const ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || 'unknown'

    // 1. Validar formato do telefone
    const phoneRegex = /^9\d{8}$/
    if (!phoneRegex.test(phone)) {
      return new Response(JSON.stringify({ error: 'Formato de telefone inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 2. Limite por IP (Máximo 2 registros por dia)
    const { count, error: countError } = await supabaseClient
      .from('ip_audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .eq('action_type', 'registration')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (countError) throw countError
    if (count && count >= 2) {
      return new Response(JSON.stringify({ error: 'Limite de contas atingido para este IP hoje' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      })
    }

    // 3. Verificar se o telefone já existe
    const { data: existingUser, error: checkError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Este número de telefone já está registrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 4. Criar usuário via Admin API
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: `${phone}@user.com`,
      password: password,
      user_metadata: { phone, referred_by: inviteCode },
      email_confirm: true
    })

    if (authError) {
      // Registrar falha
      await supabaseClient.from('ip_audit_logs').insert({
        ip_address: ip,
        action_type: 'registration',
        phone_attempted: phone,
        success: false
      })
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 5. Registrar sucesso
    await supabaseClient.from('ip_audit_logs').insert({
      ip_address: ip,
      action_type: 'registration',
      phone_attempted: phone,
      success: true
    })

    return new Response(JSON.stringify({ message: 'Registro realizado com sucesso', user_id: authUser.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
