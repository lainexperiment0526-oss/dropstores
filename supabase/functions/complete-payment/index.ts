import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentCompletionData {
  paymentId: string;
  txid: string;
  paymentLinkId: string;
  payerUsername?: string;
  buyerEmail?: string;
  amount: number;
  isCheckoutLink?: boolean;
  isSubscription?: boolean;
  paymentType?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      paymentId, 
      txid, 
      paymentLinkId, 
      payerUsername, 
      buyerEmail, 
      amount,
      isCheckoutLink = false,
      isSubscription = false,
      paymentType = 'payment_link'
    }: PaymentCompletionData = await req.json()

    console.log('🔄 Processing payment completion:', {
      paymentId,
      txid,
      paymentLinkId,
      amount,
      isCheckoutLink,
      isSubscription
    })

    // Get payment link details and merchant info
    const { data: paymentLink, error: linkError } = await supabase
      .from('payment_links')
      .select('*, merchants(id, pi_username, wallet_address)')
      .eq('id', paymentLinkId)
      .single()

    if (linkError) {
      throw new Error(`Failed to fetch payment link: ${linkError.message}`)
    }

    if (!paymentLink) {
      throw new Error('Payment link not found')
    }

    const merchantId = paymentLink.merchant_id
    console.log(`💰 Processing payment for merchant: ${merchantId}`)

    // Calculate platform fee and merchant earnings
    // Platform fee is 2% for paid links, 0% for free links
    let platformFee = 0
    let merchantAmount = amount

    if (paymentLink.pricing_type !== 'free' && amount > 0.01) {
      // For paid links, the amount already includes the platform fee
      // We need to calculate the merchant's portion
      if (paymentLink.pricing_type === 'donation') {
        // For donations, platform fee is added on top, so merchant gets the full donation amount
        platformFee = amount * 0.02
        merchantAmount = amount - platformFee
      } else {
        // For regular payments, platform fee was added to the total, so we subtract it
        merchantAmount = amount / 1.02
        platformFee = amount - merchantAmount
      }
    }

    console.log('💵 Payment breakdown:', {
      totalAmount: amount,
      platformFee,
      merchantAmount,
      pricingType: paymentLink.pricing_type
    })

    // Record the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        payment_link_id: paymentLinkId,
        pi_payment_id: paymentId,
        txid: txid,
        amount: amount,
        status: 'completed',
        payer_username: payerUsername,
        buyer_email: buyerEmail,
        payment_type: paymentType,
        is_subscription: isSubscription
      })
      .select()
      .single()

    if (transactionError) {
      console.error('❌ Failed to create transaction:', transactionError)
      throw new Error(`Failed to create transaction: ${transactionError.message}`)
    }

    console.log('✅ Transaction recorded:', transaction.id)

    // Record merchant earnings (only for paid transactions)
    if (merchantAmount > 0 && paymentLink.pricing_type !== 'free') {
      const { data: earning, error: earningError } = await supabase
        .from('merchant_earnings')
        .insert({
          merchant_id: merchantId,
          payment_link_id: paymentLinkId,
          transaction_id: transaction.id,
          amount: merchantAmount,
          platform_fee: platformFee,
          status: 'available', // Earnings are immediately available for withdrawal
          payment_type: paymentType,
          currency: 'Pi'
        })
        .select()
        .single()

      if (earningError) {
        console.error('❌ Failed to create merchant earning:', earningError)
        throw new Error(`Failed to create earning: ${earningError.message}`)
      }

      console.log('✅ Merchant earning recorded:', {
        earningId: earning.id,
        merchantId,
        amount: merchantAmount,
        platformFee
      })
    }

    // Update payment link conversion count
    const { error: conversionError } = await supabase.rpc('increment_conversions', {
      link_id: paymentLinkId
    })

    if (conversionError) {
      console.warn('⚠️ Failed to update conversions:', conversionError.message)
    }

    // Handle subscription activation if this is a subscription payment
    if (isSubscription && payerUsername) {
      try {
        // Extract plan name from payment link title
        const planMatch = paymentLink.title?.match(/(\w+)\s+Plan\s+Subscription/i)
        const planName = planMatch?.[1]
        
        console.log('🔄 Processing subscription activation:', { planName, title: paymentLink.title })
        
        if (planName) {
          // Get plan details by name
          const { data: plans, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .ilike('name', planName)
            .single()
          
          if (planError) {
            console.error('❌ Error fetching plan:', planError)
          }
          
          if (plans) {
            console.log('✅ Found plan:', plans.name, 'ID:', plans.id)
            
            // Update or create user subscription
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .upsert({
                merchant_id: merchantId,
                pi_username: payerUsername,
                plan_id: plans.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                last_payment_at: new Date().toISOString(),
              }, {
                onConflict: 'merchant_id',
              })
            
            if (!subscriptionError) {
              console.log('✅ Subscription activated successfully:', planName)
            } else {
              console.error('❌ Subscription activation error:', subscriptionError)
            }
          } else {
            console.warn('⚠️ Plan not found in database:', planName)
          }
        } else {
          console.warn('⚠️ Could not extract plan name from title:', paymentLink.title)
        }
      } catch (subscriptionError) {
        console.error('❌ Error activating subscription:', subscriptionError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactionId: transaction.id,
        merchantEarning: merchantAmount > 0 ? merchantAmount : null,
        platformFee: platformFee > 0 ? platformFee : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Payment completion error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to complete payment',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})