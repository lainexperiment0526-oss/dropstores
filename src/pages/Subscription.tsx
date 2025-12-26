import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePiAuth } from '@/contexts/PiAuthContext';
import { usePiPayment } from '@/hooks/usePiPayment';
import { SUBSCRIPTION_PLANS, STORE_TYPES, PlanType } from '@/lib/pi-sdk';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, Coins, Loader2, AlertCircle, Crown, Zap, Building2, Rocket, Store, Globe, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import TermsPrivacyModal from './TermsPrivacyModal';

interface CurrentSubscription {
  id: string;
  plan_type: string;
  status: string;
  expires_at: string;
}

const Subscription = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPiAvailable, isPiAuthenticated, signInWithPi, isLoading: piLoading } = usePiAuth();
  const { isProcessing, status, createSubscriptionPayment, resetPayment } = usePiPayment();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setCurrentSubscription(data);
        }
      } catch (err) {
        console.log('No active subscription found');
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // Redirect to dashboard when payment completes
  useEffect(() => {
    if (status === 'completed') {
      toast.success('Subscription activated! Redirecting to dashboard...');
      setTimeout(() => {
        setIsActivating(false);
        setSelectedPlan(null);
        resetPayment();
        navigate('/dashboard');
      }, 2000);
    }
  }, [status, navigate, resetPayment]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubscribe = async (planType: PlanType) => {
    setSelectedPlan(planType);
    setIsActivating(true);
    
    try {
      const plan = SUBSCRIPTION_PLANS[planType];
      
      console.log('Processing subscription:', {
        userId: user!.id,
        planType,
        planAmount: plan.amount,
        isPiAvailable,
        isPiAuthenticated
      });
      
      // Free plan doesn't require Pi payment
      if (planType === 'free') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 365); // 1 year for free
        
        // Check for existing subscription
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user!.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (existingSubscription) {
          const { data, error } = await supabase
            .from('subscriptions')
            .update({
              plan_type: planType,
              amount: 0,
              expires_at: expiryDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSubscription.id)
            .select()
            .single();
          
          if (error) throw error;
          toast.success(`🎉 Free plan activated!`);
          setCurrentSubscription(data);
        } else {
          const { data, error } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user!.id,
              plan_type: planType,
              status: 'active',
              amount: 0,
              expires_at: expiryDate.toISOString(),
            })
            .select()
            .single();
          
          if (error) throw error;
          toast.success(`🎉 Free plan activated!`);
          setCurrentSubscription(data);
        }
        
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      
      // For paid plans, require Pi authentication
      if (!isPiAvailable) {
        toast.error('Pi Network is not available. Please open this app in Pi Browser.');
        setIsActivating(false);
        setSelectedPlan(null);
        return;
      }

      if (!isPiAuthenticated) {
        toast.info('Please authenticate with Pi Network first to subscribe');
        // Trigger Pi auth
        await signInWithPi(false);
        setIsActivating(false);
        setSelectedPlan(null);
        return;
      }
      
      // Create Pi payment for paid plans
      console.log('Creating Pi payment for plan:', planType);
      setIsActivating(false);
      await createSubscriptionPayment(planType);
      
    } catch (error: any) {
      console.error('Subscription error:', error);
      const errorMessage = error?.message || 'Failed to process subscription';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsActivating(false);
      setSelectedPlan(null);
    }
  };

  // Mock payment handler for testing
  const handleMockPayment = async (planType: PlanType) => {
    setIsActivating(true);
    setSelectedPlan(planType);
    
    try {
      const plan = SUBSCRIPTION_PLANS[planType];
      
      console.log('Mock payment - Creating subscription:', {
        userId: user!.id,
        planType,
        planAmount: plan.amount
      });
      
      // Calculate expiry date (30 days for monthly plans)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      // First, check if there's an existing active subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .single();
      
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
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
        
        toast.success(`🎉 ${plan.name} activated! (Test Mode) Redirecting to dashboard...`);
        setCurrentSubscription(data);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        console.log('No existing subscription, creating new one');
        // Create subscription directly in database
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user!.id,
            plan_type: planType,
            status: 'active',
            amount: plan.amount,
            expires_at: expiryDate.toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating subscription:', error);
          throw error;
        }
        
        toast.success(`🎉 ${plan.name} activated! (Test Mode) Redirecting to dashboard...`);
        
        // Update current subscription state
        setCurrentSubscription(data);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Mock payment error:', error);
      const errorMessage = error?.message || 'Failed to activate subscription';
      toast.error(`Error: ${errorMessage}. Check console for details.`);
    } finally {
      setIsActivating(false);
      setSelectedPlan(null);
    }
  };

  const isCurrentPlan = (planType: string) => {
    if (!currentSubscription) return false;
    return currentSubscription.plan_type === planType;
  };

  const formatExpiryDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Store className="w-5 h-5" />;
      case 'basic': return <Zap className="w-5 h-5" />;
      case 'grow': return <Crown className="w-5 h-5" />;
      case 'advance': return <Rocket className="w-5 h-5" />;
      case 'plus': return <Building2 className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getStoreIcon = (storeId: string) => {
    switch (storeId) {
      case 'physical': return <Store className="w-6 h-6" />;
      case 'online': return <Globe className="w-6 h-6" />;
      case 'digital': return <Download className="w-6 h-6" />;
      default: return <Store className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">Subscription Plans</h1>
                <p className="text-sm text-muted-foreground">Pay with Pi • Powered by Droplink</p>
              </div>
            </div>
            {/* Test Mode Toggle */}
            <Button
              variant={isTestMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsTestMode(!isTestMode)}
              className="shrink-0"
            >
              {isTestMode ? "🧪 Test Mode ON" : "Enable Test Mode"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Test Mode Alert */}
          {isTestMode && (
            <Alert className="mb-8 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <span className="font-semibold">🧪 Test Mode Enabled</span> - Subscriptions will be activated instantly without Pi payment. Use this to test the gift card feature and other functionality.
              </AlertDescription>
            </Alert>
          )}

          {/* Pi Network Notice */}
          {!isPiAvailable && !isTestMode && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To subscribe with Pi, please open this app in the Pi Browser. 
                <a 
                  href="https://minepi.com/download" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary ml-1 underline"
                >
                  Download Pi Browser
                </a>
              </AlertDescription>
            </Alert>
          )}

          {/* Pi Authentication Status */}
          {isPiAvailable && !isPiAuthenticated && !isTestMode && (
            <Alert className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <Coins className="h-4 w-4 text-amber-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-amber-900 dark:text-amber-100">
                  <span className="font-semibold">Connect Pi Network</span> to subscribe to paid plans
                </span>
                <Button 
                  onClick={() => signInWithPi(false)}
                  disabled={piLoading}
                  size="sm"
                  variant="outline"
                  className="border-amber-600 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                >
                  {piLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Connect Pi
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Pi Authenticated Success */}
          {isPiAvailable && isPiAuthenticated && (
            <Alert className="mb-8 border-green-500 bg-green-50 dark:bg-green-950/20">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <span className="font-semibold">Pi Network Connected</span> • You can now subscribe to any paid plan
              </AlertDescription>
            </Alert>
          )}

          {/* Current Subscription Banner */}
          {currentSubscription && (
            <Alert className="mb-8 border-primary bg-primary/5">
              <Crown className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                <span className="font-semibold">Current Plan: {SUBSCRIPTION_PLANS[currentSubscription.plan_type as PlanType]?.name || currentSubscription.plan_type}</span>
                <span className="text-muted-foreground ml-2">
                  • Expires: {formatExpiryDate(currentSubscription.expires_at)}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Coins className="w-4 h-4" />
              <span>Pay with Pi Cryptocurrency</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Unlock premium features and grow your business on Pi Network Mainnet
            </p>
          </div>

          {/* Upgrade Benefits - Show for free users */}
          {currentSubscription?.plan_type === 'free' && (
            <Alert className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <Rocket className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-foreground">
                <span className="font-semibold text-amber-900 dark:text-amber-100">🚀 Upgrade to unlock:</span>
                <span className="text-amber-800 dark:text-amber-200 ml-2">
                  Multiple stores • Unlimited products • Premium templates • Priority support • Custom domain • Advanced analytics • Remove ads
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Welcome Discount Banner */}
          <div className="bg-gradient-to-r from-green-500/10 via-primary/10 to-green-500/10 rounded-lg p-4 mb-4 text-center border border-green-500/20">
            <p className="text-sm font-medium">
              🎁 <span className="text-green-600 dark:text-green-400 font-semibold">Welcome Discount Applied!</span> Save up to 5π on your first subscription
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Basic: -1π • Grow: -2π • Advance: -3π • Plus: -5π
            </p>
          </div>

          {/* Limited Time Offer */}
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm font-medium">
              🎉 <span className="text-primary font-semibold">Special Launch Offer:</span> Get 20% off on annual plans! Use code: <span className="font-mono bg-primary/20 px-2 py-1 rounded">LAUNCH2025</span>
            </p>
          </div>

          {/* Store Types Info */}
          <div className="mb-12">
            <h3 className="text-xl font-display font-semibold text-center mb-6">All Plans Support Three Store Types</h3>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {Object.values(STORE_TYPES).map((storeType) => (
                <div key={storeType.id} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {getStoreIcon(storeType.id)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{storeType.name}</p>
                    <p className="text-xs text-muted-foreground">{storeType.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Free Plan */}
            <Card className={`relative border-2 transition-colors ${isCurrentPlan('free') ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="outline" className="bg-card">Limited</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon('free')}
                  <CardTitle>{SUBSCRIPTION_PLANS.free.name}</CardTitle>
                </div>
                <CardDescription>{SUBSCRIPTION_PLANS.free.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold">Free</span>
                  <span className="text-muted-foreground ml-2">/ forever</span>
                </div>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan('free') ? 'secondary' : 'outline'}
                  onClick={() => handleSubscribe('free')}
                  disabled={isProcessing || piLoading || isCurrentPlan('free')}
                >
                  {isProcessing && selectedPlan === 'free' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : isCurrentPlan('free') ? (
                    'Current Plan'
                  ) : (
                    'Start Free'
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Basic Plan */}
            <Card className={`relative border-2 transition-colors ${isCurrentPlan('basic') ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-600 text-white">Best Value</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon('basic')}
                  <CardTitle>{SUBSCRIPTION_PLANS.basic.name}</CardTitle>
                </div>
                <CardDescription>{SUBSCRIPTION_PLANS.basic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.basic.amount} π</span>
                    <span className="text-lg line-through text-muted-foreground">{SUBSCRIPTION_PLANS.basic.originalAmount}π</span>
                  </div>
                  <span className="text-muted-foreground">/ month</span>
                  <div className="mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded">
                      Save {SUBSCRIPTION_PLANS.basic.welcomeDiscount}π Welcome Discount
                    </span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.basic.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan('basic') ? 'secondary' : 'outline'}
                  onClick={() => handleSubscribe('basic')}
                  disabled={isProcessing || isActivating || isCurrentPlan('basic')}
                >
                  {((isProcessing || isActivating) && selectedPlan === 'basic') ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isTestMode ? 'Activating...' : 'Processing...'}
                    </>
                  ) : isCurrentPlan('basic') ? (
                    'Current Plan'
                  ) : (
                    <>
                      {isTestMode ? '🧪' : <Coins className="w-4 h-4 mr-2" />}
                      {isTestMode ? 'Test Subscribe' : 'Subscribe'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Grow Plan - Popular */}
            <Card className={`relative border-2 ${isCurrentPlan('grow') ? 'border-primary bg-primary/5' : 'border-primary'}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon('grow')}
                  <CardTitle>{SUBSCRIPTION_PLANS.grow.name}</CardTitle>
                </div>
                <CardDescription>{SUBSCRIPTION_PLANS.grow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.grow.amount} π</span>
                    <span className="text-lg line-through text-muted-foreground">{SUBSCRIPTION_PLANS.grow.originalAmount}π</span>
                  </div>
                  <span className="text-muted-foreground">/ month</span>
                  <div className="mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded">
                      Save {SUBSCRIPTION_PLANS.grow.welcomeDiscount}π Welcome Discount
                    </span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.grow.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gradient-hero" 
                  onClick={() => handleSubscribe('grow')}
                  disabled={isProcessing || isActivating || isCurrentPlan('grow')}
                >
                  {((isProcessing || isActivating) && selectedPlan === 'grow') ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : isCurrentPlan('grow') ? (
                    'Current Plan'
                  ) : (
                    <>
                      {isTestMode ? '🧪' : <Coins className="w-4 h-4 mr-2" />}
                      {isTestMode ? 'Test Subscribe' : 'Subscribe'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Advance Plan */}
            <Card className={`relative border-2 transition-colors ${isCurrentPlan('advance') ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon('advance')}
                  <CardTitle>{SUBSCRIPTION_PLANS.advance.name}</CardTitle>
                </div>
                <CardDescription>{SUBSCRIPTION_PLANS.advance.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.advance.amount} π</span>
                    <span className="text-lg line-through text-muted-foreground">{SUBSCRIPTION_PLANS.advance.originalAmount}π</span>
                  </div>
                  <span className="text-muted-foreground">/ month</span>
                  <div className="mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded">
                      Save {SUBSCRIPTION_PLANS.advance.welcomeDiscount}π Welcome Discount
                    </span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.advance.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('advance')}
                  disabled={isProcessing || isActivating || isCurrentPlan('advance')}
                >
                  {((isProcessing || isActivating) && selectedPlan === 'advance') ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : isCurrentPlan('advance') ? (
                    'Current Plan'
                  ) : (
                    <>
                      {isTestMode ? '🧪' : <Coins className="w-4 h-4 mr-2" />}
                      {isTestMode ? 'Test Subscribe' : 'Subscribe'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Plus Plan */}
            <Card className={`relative border-2 transition-colors ${isCurrentPlan('plus') ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon('plus')}
                  <CardTitle>{SUBSCRIPTION_PLANS.plus.name}</CardTitle>
                </div>
                <CardDescription>{SUBSCRIPTION_PLANS.plus.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.plus.amount} π</span>
                    <span className="text-lg line-through text-muted-foreground">{SUBSCRIPTION_PLANS.plus.originalAmount}π</span>
                  </div>
                  <span className="text-muted-foreground">/ month</span>
                  <div className="mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded">
                      Save {SUBSCRIPTION_PLANS.plus.welcomeDiscount}π Welcome Discount
                    </span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.plus.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('plus')}
                  disabled={isProcessing || isActivating || isCurrentPlan('plus')}
                >
                  {((isProcessing || isActivating) && selectedPlan === 'plus') ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : isCurrentPlan('plus') ? (
                    'Current Plan'
                  ) : (
                    <>
                      {isTestMode ? '🧪' : <Coins className="w-4 h-4 mr-2" />}
                      {isTestMode ? 'Test Subscribe' : 'Subscribe'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Why Upgrade Section */}
          <div className="mt-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-display font-bold text-center mb-8">Why Upgrade from Free?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Rocket className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Scale Your Business</h4>
                <p className="text-sm text-muted-foreground">
                  List unlimited products across multiple stores. Reach more customers and increase your revenue potential.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Crown className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Professional Features</h4>
                <p className="text-sm text-muted-foreground">
                  Get premium templates, custom domains, advanced analytics, and priority support to look professional.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Grow Faster</h4>
                <p className="text-sm text-muted-foreground">
                  Access bulk imports, promotional tools, inventory management, and integrations to automate and grow faster.
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">Start with π20/month and scale as you grow</p>
              <Button size="lg" className="gradient-hero" onClick={() => handleSubscribe('basic')}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Basic Now
              </Button>
            </div>
          </div>

          {/* Success Stories */}
          <div className="mt-16">
            <h3 className="text-2xl font-display font-bold text-center mb-8">Merchants Who Upgraded Are Earning More</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    JM
                  </div>
                  <div>
                    <p className="font-semibold">John's Electronics</p>
                    <p className="text-sm text-muted-foreground">Upgraded to Grow</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic mb-2">
                  "After upgrading from free to Grow plan, my sales increased 5x in just 2 months. Unlimited products and premium templates made all the difference!"
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  <span>+500% Revenue Growth</span>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    SK
                  </div>
                  <div>
                    <p className="font-semibold">Sarah's Fashion</p>
                    <p className="text-sm text-muted-foreground">Upgraded to Basic</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic mb-2">
                  "The Basic plan gave me everything I needed to start serious. 25 products was perfect for testing the market before scaling up."
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Professional Store in Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {status !== 'idle' && (
            <div className="mt-8 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                status === 'completed' ? 'bg-green-500/10 text-green-500' :
                status === 'error' ? 'bg-destructive/10 text-destructive' :
                status === 'cancelled' ? 'bg-muted text-muted-foreground' :
                'bg-primary/10 text-primary'
              }`}>
                {status === 'pending' && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === 'approved' && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === 'completed' && <Check className="w-4 h-4" />}
                {status === 'error' && <AlertCircle className="w-4 h-4" />}
                <span>
                  {status === 'pending' && 'Awaiting payment...'}
                  {status === 'approved' && 'Payment approved, completing transaction...'}
                  {status === 'completed' && 'Subscription activated successfully!'}
                  {status === 'cancelled' && 'Payment cancelled'}
                  {status === 'error' && 'Payment failed - please try again'}
                </span>
              </div>
              {(status === 'cancelled' || status === 'error') && (
                <Button variant="ghost" size="sm" className="ml-2" onClick={resetPayment}>
                  Try Again
                </Button>
              )}
            </div>
          )}

          {/* Features Comparison */}
          <div className="mt-16">
            <h3 className="text-2xl font-display font-bold text-center mb-8">Why Subscribe?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Multiple Store Types</h4>
                <p className="text-sm text-muted-foreground">
                  Create Physical, Online, or Digital stores to sell anything
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Premium Features</h4>
                <p className="text-sm text-muted-foreground">
                  Access advanced analytics, custom domains, and priority support
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Pi Payments</h4>
                <p className="text-sm text-muted-foreground">
                  Accept Pi cryptocurrency payments directly to your wallet
                </p>
              </div>
            </div>
          </div>

          {/* Christmas Gift Card Section */}
          <div className="mt-16 bg-gradient-to-br from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 rounded-xl p-8 border border-red-200 dark:border-red-800/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-display font-bold mb-3">
                  🎁 Gift Subscriptions This Holiday!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Give the gift of premium features to your loved ones. Share subscriptions with unique gift codes that can be redeemed anytime.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Generate unique gift codes</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Include personalized messages</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Valid for 12 months</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Share via email or link</span>
                  </li>
                </ul>
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                  <Link to="/redeem-gift-card">
                    Get Started with Gifts
                  </Link>
                </Button>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">🎄</div>
                <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-200 dark:border-green-800/50">
                  <CardContent className="pt-6">
                    <p className="font-mono text-lg font-bold text-primary mb-2">
                      XMAS-2024-A7K9
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Example gift code
                    </p>
                    <div className="text-2xl font-display font-bold text-green-600 dark:text-green-400">
                      Grow Plan • 3 months
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Payments processed securely on Pi Network Mainnet
            </p>
            <div className="mt-2">
              <TermsPrivacyModal />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              © {new Date().getFullYear()} Drop Store by Droplink · Mrwain Organization
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
