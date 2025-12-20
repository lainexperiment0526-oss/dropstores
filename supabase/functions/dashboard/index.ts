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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id);

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stores' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate stats
    const storeIds = stores?.map(s => s.id) || [];
    
    let totalProducts = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    if (storeIds.length > 0) {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .in('store_id', storeIds);
      
      totalProducts = productsCount || 0;

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .in('store_id', storeIds);
      
      totalOrders = orders?.length || 0;
      totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    }

    console.log('Dashboard data fetched for user:', user.id);
    return new Response(
      JSON.stringify({
        stores,
        stats: {
          totalStores: stores?.length || 0,
          totalProducts,
          totalOrders,
          totalRevenue,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
