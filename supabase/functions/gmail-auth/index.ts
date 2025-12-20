import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { googleToken } = await req.json();

    if (!googleToken) {
      return new Response(
        JSON.stringify({ error: 'Missing Google token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify Google token
    const googleVerifyUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleToken}`;
    const googleResponse = await fetch(googleVerifyUrl);
    
    if (!googleResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleUser = await googleResponse.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    if (existingUser) {
      // Generate session for existing user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: googleUser.email,
      });

      if (sessionError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Gmail auth: existing user session created');
      return new Response(
        JSON.stringify({
          success: true,
          userId: existingUser.id,
          sessionLink: sessionData.properties?.action_link
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: googleUser.email,
      email_confirm: true,
      user_metadata: {
        full_name: googleUser.name,
        avatar_url: googleUser.picture,
      },
    });

    if (authError) {
      console.error('Gmail auth: create user error:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: googleUser.email,
    });

    if (sessionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Gmail auth: new user created and session generated');
    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        sessionLink: sessionData.properties?.action_link
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Gmail auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
