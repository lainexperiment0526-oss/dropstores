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
        navigate('/dashboard');
      }, 2000);
    }
  }, [status, navigate]);

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
    
    if (!isPiAuthenticated) {
      await signInWithPi();
    }
    
    await createSubscriptionPayment(planType);
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Pi Network Notice */}
          {!isPiAvailable && (
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basic Plan */}
            <Card className={`relative border-2 transition-colors ${isCurrentPlan('basic') ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon('basic')}
                  <CardTitle>{SUBSCRIPTION_PLANS.basic.name}</CardTitle>
                </div>
                <CardDescription>{SUBSCRIPTION_PLANS.basic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.basic.amount} π</span>
                  <span className="text-muted-foreground ml-2">/ month</span>
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
                  disabled={isProcessing || !isPiAvailable || piLoading || isCurrentPlan('basic')}
                >
                  {isProcessing && selectedPlan === 'basic' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan('basic') ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Subscribe
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
                  <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.grow.amount} π</span>
                  <span className="text-muted-foreground ml-2">/ month</span>
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
                  disabled={isProcessing || !isPiAvailable || piLoading || isCurrentPlan('grow')}
                >
                  {isProcessing && selectedPlan === 'grow' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan('grow') ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Subscribe
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
                  <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.advance.amount} π</span>
                  <span className="text-muted-foreground ml-2">/ month</span>
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
                  disabled={isProcessing || !isPiAvailable || piLoading || isCurrentPlan('advance')}
                >
                  {isProcessing && selectedPlan === 'advance' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan('advance') ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Subscribe
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
                  <span className="text-4xl font-display font-bold">{SUBSCRIPTION_PLANS.plus.amount} π</span>
                  <span className="text-muted-foreground ml-2">/ month</span>
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
                  disabled={isProcessing || !isPiAvailable || piLoading || isCurrentPlan('plus')}
                >
                  {isProcessing && selectedPlan === 'plus' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan('plus') ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
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

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Payments processed securely on Pi Network Mainnet
            </p>
            <div className="mt-2">
              <TermsPrivacyModal />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              © 2024 Drop Store by Droplink · Mrwain Organization
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
