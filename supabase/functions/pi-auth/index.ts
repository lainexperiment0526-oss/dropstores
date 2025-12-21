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
    const apiUrl = 'https://api.minepi.com/v2/me';
    
    const verifyResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('Pi Auth: Pi API verification failed:', verifyResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to verify Pi authentication', details: errorText }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifiedUser = await verifyResponse.json();
    console.log('Pi Auth: User verified:', verifiedUser.username, 'UID:', verifiedUser.uid);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate consistent credentials for this Pi user
    const piEmail = `${verifiedUser.uid}@pi.network`;
    const piPassword = `pi_secure_${verifiedUser.uid}_${PI_API_KEY.substring(0, 8)}`;

    // Check if this Pi user already exists in pi_users table
    const { data: existingPiUser } = await supabase
      .from('pi_users')
      .select('*')
      .eq('pi_uid', verifiedUser.uid)
      .maybeSingle();

    let userId: string;
    let needsNewUser = true;

    if (existingPiUser?.user_id) {
      // Check if the auth user actually exists
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(existingPiUser.user_id);
      
      if (authUser?.user && !authUserError) {
        console.log('Pi Auth: Found existing auth user:', authUser.user.id);
        userId = authUser.user.id;
        needsNewUser = false;
        
        // Update the password to ensure we can sign in
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          password: piPassword,
        });
        
        if (updateError) {
          console.error('Pi Auth: Password update error:', updateError);
        }
      } else {
        console.log('Pi Auth: Auth user not found, will create new one');
        // Delete the orphaned pi_users record
        await supabase.from('pi_users').delete().eq('pi_uid', verifiedUser.uid);
      }
    }

    if (needsNewUser) {
      console.log('Pi Auth: Creating new user for:', verifiedUser.username);
      
      // Check if user with this email already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingEmailUser = existingUsers?.users?.find(u => u.email === piEmail);
      
      if (existingEmailUser) {
        console.log('Pi Auth: User with email exists, updating password');
        userId = existingEmailUser.id;
        
        await supabase.auth.admin.updateUserById(userId, {
          password: piPassword,
        });
      } else {
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
      }

      // Create or update Pi user record
      const { error: piUserError } = await supabase.from('pi_users').upsert({
        user_id: userId,
        pi_uid: verifiedUser.uid,
        pi_username: verifiedUser.username,
        wallet_address: verifiedUser.wallet_address || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'pi_uid',
      });

      if (piUserError) {
        console.error('Pi Auth: Upsert pi_users error:', piUserError);
      }
    } else {
      // Update wallet address if changed
      if (verifiedUser.wallet_address) {
        await supabase
          .from('pi_users')
          .update({ 
            wallet_address: verifiedUser.wallet_address,
            pi_username: verifiedUser.username,
            updated_at: new Date().toISOString()
          })
          .eq('pi_uid', verifiedUser.uid);
      }
    }

    // Sign in the user to get a session
    console.log('Pi Auth: Signing in user...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: piEmail,
      password: piPassword,
    });

    if (signInError) {
      console.error('Pi Auth: Sign in error:', signInError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: signInError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pi Auth: Session created successfully for:', verifiedUser.username);

    return new Response(
      JSON.stringify({
        success: true,
        userId: userId!,
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