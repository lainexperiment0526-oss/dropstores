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
    const PI_API_KEY = Deno.env.get('PI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Pi Auth: Starting authentication...');
    console.log('Pi Auth: Environment check:', {
      hasApiKey: !!PI_API_KEY,
      apiKeyPrefix: PI_API_KEY ? PI_API_KEY.substring(0, 4) + '...' : 'none',
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    });

    if (!PI_API_KEY) {
      console.error('Pi Auth: PI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: PI_API_KEY missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Pi Auth: Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Supabase credentials missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { accessToken, piUser } = await req.json();

    if (!accessToken || !piUser) {
      console.error('Pi Auth: Missing access token or user data');
      return new Response(
        JSON.stringify({ error: 'Missing access token or user data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pi Auth: Verifying user:', piUser.username);

    // Verify the access token with Pi Platform API (mainnet)
    // The accessToken is the user's token, not the API key
    const apiUrl = 'https://api.minepi.com/v2/me';
    console.log('Pi Auth: Calling Pi API to verify user token...');
    
    const verifyResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Pi Auth: Pi API response status:', verifyResponse.status);

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('Pi Auth: Pi API verification failed:', verifyResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to verify Pi authentication', 
          details: errorText,
          status: verifyResponse.status 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifiedUser = await verifyResponse.json();
    console.log('Pi Auth: User verified successfully:', verifiedUser.username, 'UID:', verifiedUser.uid);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate consistent credentials for this Pi user
    const piEmail = `${verifiedUser.uid}@pi.network`;
    const piPassword = `pi_secure_${verifiedUser.uid}_${PI_API_KEY.substring(0, 8)}`;

    // Check if this Pi user already exists
    const { data: existingPiUser, error: piUserError } = await supabase
      .from('pi_users')
      .select('*')
      .eq('pi_uid', verifiedUser.uid)
      .single();

    if (piUserError && piUserError.code !== 'PGRST116') {
      console.error('Pi Auth: Error checking existing user:', piUserError);
    }

    let userId = existingPiUser?.user_id;

    if (!existingPiUser) {
      console.log('Pi Auth: Creating new user for:', verifiedUser.username);
      
      // Create a new user in Supabase auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: piEmail,
        password: piPassword,
        email_confirm: true,
        user_metadata: {
          pi_uid: verifiedUser.uid,
          pi_username: verifiedUser.username,
          full_name: verifiedUser.username,
        },
      });

      if (authError) {
        console.error('Pi Auth: Create user error:', authError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account', details: authError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = authData.user.id;
      console.log('Pi Auth: New user created with ID:', userId);

      // Create Pi user record
      const { error: createPiUserError } = await supabase.from('pi_users').insert({
        user_id: userId,
        pi_uid: verifiedUser.uid,
        pi_username: verifiedUser.username,
        wallet_address: verifiedUser.wallet_address || null,
      });

      if (createPiUserError) {
        console.error('Pi Auth: Create pi_users record error:', createPiUserError);
      }
    } else {
      console.log('Pi Auth: Existing user found:', existingPiUser.pi_username);
      
      // Update wallet address if changed
      if (verifiedUser.wallet_address && verifiedUser.wallet_address !== existingPiUser.wallet_address) {
        await supabase
          .from('pi_users')
          .update({ 
            wallet_address: verifiedUser.wallet_address,
            updated_at: new Date().toISOString()
          })
          .eq('pi_uid', verifiedUser.uid);
        console.log('Pi Auth: Updated wallet address');
      }
    }

    // Sign in the user to get a session
    console.log('Pi Auth: Signing in user to get session...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: piEmail,
      password: piPassword,
    });

    if (signInError) {
      console.log('Pi Auth: Initial sign-in failed, updating password...');
      
      // Update the password and retry
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId!, {
        password: piPassword,
      });
      
      if (updateError) {
        console.error('Pi Auth: Password update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Retry sign in
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: piEmail,
        password: piPassword,
      });
      
      if (retryError) {
        console.error('Pi Auth: Retry sign in error:', retryError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session', details: retryError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Pi Auth: Session created successfully after retry for:', verifiedUser.username);
      
      return new Response(
        JSON.stringify({
          success: true,
          userId,
          piUsername: verifiedUser.username,
          session: retryData.session,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pi Auth: Session created successfully for:', verifiedUser.username);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        piUsername: verifiedUser.username,
        session: signInData.session,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Pi Auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});