import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/lib/pi-sdk';
import type { PlanType } from '@/lib/pi-sdk';
import { CheckCircle, Loader2, ArrowRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const DropPaySuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isActivating, setIsActivating] = useState(true);
  const [activationComplete, setActivationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // Extract parameters from URL
  const planType = searchParams.get('plan') as PlanType;
  const paymentId = searchParams.get('payment_id');
  const amount = searchParams.get('amount');
  const timestamp = searchParams.get('timestamp');

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/payment/droppay/success');
      return;
    }

    if (!planType || !SUBSCRIPTION_PLANS[planType]) {
      setError('Invalid plan type specified');
      setIsActivating(false);
      return;
    }

    activatePlan();
  }, [user, planType]);

  const activatePlan = async () => {
    if (!user || !planType) return;

    try {
      setIsActivating(true);
      setError(null);

      const plan = SUBSCRIPTION_PLANS[planType];
      
      console.log('Droppay Payment Success - Activating plan:', {
        userId: user.id,
        planType,
        planAmount: plan.amount,
        paymentId,
        amount,
        timestamp
      });

      // Calculate expiry date (30 days for monthly plans, 1 year for free)
      const expiryDate = new Date();
      if (planType === 'free') {
        expiryDate.setDate(expiryDate.getDate() + 365);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 30);
      }

      // Check for existing subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      let subscriptionResult;
      
      if (existingSubscription) {
        console.log('Found existing subscription, updating to new plan');
        // Update existing subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            plan_type: planType,
            amount: plan.amount,
            expires_at: expiryDate.toISOString(),
            updated_at: new Date().toISOString(),
            // Store Droppay payment reference
            payment_method: 'droppay',
            payment_reference: paymentId,
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
        
        subscriptionResult = data;
      } else {
        console.log('No existing subscription, creating new one');
        // Create new subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: planType,
            status: 'active',
            amount: plan.amount,
            expires_at: expiryDate.toISOString(),
            // Store Droppay payment reference
            payment_method: 'droppay',
            payment_reference: paymentId,
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating subscription:', error);
          throw error;
        }
        
        subscriptionResult = data;
      }

      setSubscriptionData(subscriptionResult);
      setActivationComplete(true);
      
      toast.success(`🎉 ${plan.name} plan activated successfully via Droppay!`);
      
      // Auto-redirect to dashboard after success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error('Plan activation error:', error);
      const errorMessage = error?.message || 'Failed to activate plan';
      setError(`Error activating plan: ${errorMessage}`);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsActivating(false);
    }
  };

  const retryActivation = () => {
    setError(null);
    activatePlan();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!planType || !SUBSCRIPTION_PLANS[planType]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Invalid plan type or missing payment information.</p>
            <Button onClick={() => navigate('/pricing')} variant="outline">
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = SUBSCRIPTION_PLANS[planType];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            {activationComplete ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : isActivating ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <CreditCard className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {activationComplete 
              ? 'Payment Successful!' 
              : isActivating 
                ? 'Activating Plan...' 
                : error 
                  ? 'Activation Failed' 
                  : 'Processing Payment'
            }
          </h1>
          <p className="text-muted-foreground">
            {activationComplete 
              ? `Your ${plan.name} plan has been successfully activated.`
              : isActivating 
                ? 'We\'re setting up your subscription...' 
                : 'Droppay payment received'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Plan</div>
                <div className="font-medium flex items-center gap-2">
                  {plan.name}
                  <Badge variant="secondary">{plan.amount}π</Badge>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Payment Method</div>
                <div className="font-medium">Droppay</div>
              </div>
              {paymentId && (
                <div className="col-span-2">
                  <div className="text-muted-foreground">Payment ID</div>
                  <div className="font-mono text-sm bg-muted rounded p-2 mt-1">
                    {paymentId}
                  </div>
                </div>
              )}
              {amount && (
                <div>
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-medium">{amount}π</div>
                </div>
              )}
              {timestamp && (
                <div>
                  <div className="text-muted-foreground">Timestamp</div>
                  <div className="font-medium">
                    {new Date(parseInt(timestamp) * 1000).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {subscriptionData && (
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Subscription Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {subscriptionData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span>{new Date(subscriptionData.expires_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What's included in your {plan.name} plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mt-6 border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-900 dark:text-red-100">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button onClick={retryActivation} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Actions */}
        {activationComplete && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/dashboard')} className="gradient-hero">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={() => navigate('/subscription')} variant="outline">
              View Subscription
            </Button>
          </div>
        )}

        {/* Loading state actions */}
        {isActivating && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              This may take a few moments. You'll be automatically redirected...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropPaySuccess;