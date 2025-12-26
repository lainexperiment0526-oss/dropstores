// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // @ts-ignore: Deno global
    const PI_API_KEY = Deno.env.get('PI_API_KEY')?.trim();
    // @ts-ignore: Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore: Deno global
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Pi Auth: Starting authentication...');
    console.log('Pi Auth: PI_API_KEY length:', PI_API_KEY?.length);

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

    // Verify the access token with Pi Platform API 
    // According to https://pi-apps.github.io/community-developer-guide/
    const apiUrl = 'https://api.minepi.com/v2/me';
    
    const verifyResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('Pi API verification failed:', {
        status: verifyResponse.status,
        statusText: verifyResponse.statusText,
        error: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to verify Pi authentication', 
          details: `Pi API returned ${verifyResponse.status}: ${errorText}`,
          status: verifyResponse.status
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifiedUser = await verifyResponse.json();
    console.log('Pi Auth: User verified successfully:', {
      username: verifiedUser.username,
      uid: verifiedUser.uid,
      hasWallet: !!verifiedUser.wallet_address
    });

    // Verify that the user data matches what we received from the frontend
    if (verifiedUser.uid !== piUser.uid || verifiedUser.username !== piUser.username) {
      console.error('Pi Auth: User data mismatch!', {
        verified: { uid: verifiedUser.uid, username: verifiedUser.username },
        frontend: { uid: piUser.uid, username: piUser.username }
      });
      return new Response(
        JSON.stringify({ error: 'User data verification failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate consistent credentials for this Pi user
    const piEmail = `${verifiedUser.uid}@pi.network`;
    const piPassword = `pi_secure_${verifiedUser.uid}_${PI_API_KEY.substring(0, 8)}`;

    // Check if this Pi user already exists in pi_users table
    const { data: existingPiUser } = await supabase
      .from('pi_users')
      .select('user_id, pi_username, wallet_address')
      .eq('pi_uid', verifiedUser.uid)
      .maybeSingle();

    let userId: string = '';
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
      const existingEmailUser = existingUsers?.users?.find((u: any) => u.email === piEmail);
      
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

      // Ensure password is current
      await supabase.auth.admin.updateUserById(userId, {
        password: piPassword,
        user_metadata: {
          pi_uid: verifiedUser.uid,
          pi_username: verifiedUser.username,
          wallet_address: verifiedUser.wallet_address || null,
        },
      });
    }

    // Create a session for the user
    console.log('Pi Auth: Creating session for user:', verifiedUser.username);
    
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: piEmail,
      password: piPassword,
    });

    if (sessionError) {
      console.error('Pi Auth: Session creation failed:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pi Auth: Session created successfully for:', verifiedUser.username);

    return new Response(
      JSON.stringify({
        success: true,
        userId: userId!,
        piUsername: verifiedUser.username,
        piUid: verifiedUser.uid,
        walletAddress: verifiedUser.wallet_address || null,
        session: sessionData.session,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Pi Auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage,
        stack: errorStack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});