import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/lib/pi-sdk';
import type { PlanType } from '@/lib/pi-sdk';
import { XCircle, CreditCard, ArrowLeft, RotateCcw, MessageCircle } from 'lucide-react';

const DropPayCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract parameters from URL
  const planType = searchParams.get('plan') as PlanType;
  const reason = searchParams.get('reason') || 'Payment was cancelled by user';
  const paymentId = searchParams.get('payment_id');
  const timestamp = searchParams.get('timestamp');

  const plan = planType && SUBSCRIPTION_PLANS[planType] ? SUBSCRIPTION_PLANS[planType] : null;

  const retryPayment = () => {
    // Redirect back to subscription page with the selected plan
    if (planType) {
      navigate(`/subscription?plan=${planType}`);
    } else {
      navigate('/subscription');
    }
  };

  const contactSupport = () => {
    navigate('/support');
  };

  const browsePlans = () => {
    navigate('/pricing');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-red-600">Payment Cancelled</h1>
          <p className="text-muted-foreground">
            Your Droppay payment was cancelled and no charges were made.
          </p>
        </div>

        {/* Cancellation Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Payment Status:</strong> Cancelled - No charges were made to your account
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {plan && (
                <div>
                  <div className="text-muted-foreground">Plan</div>
                  <div className="font-medium flex items-center gap-2">
                    {plan.name}
                    <Badge variant="secondary">{plan.amount}π</Badge>
                  </div>
                </div>
              )}
              <div>
                <div className="text-muted-foreground">Payment Method</div>
                <div className="font-medium">Droppay</div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="text-muted-foreground">Reason</div>
                <div className="font-medium">{reason}</div>
              </div>
              {paymentId && (
                <div className="col-span-1 md:col-span-2">
                  <div className="text-muted-foreground">Payment Reference</div>
                  <div className="font-mono text-sm bg-muted rounded p-2 mt-1">
                    {paymentId}
                  </div>
                </div>
              )}
              {timestamp && (
                <div>
                  <div className="text-muted-foreground">Cancelled At</div>
                  <div className="font-medium">
                    {new Date(parseInt(timestamp) * 1000).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What happens next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <div className="font-medium">No charges were made</div>
                <div className="text-sm text-muted-foreground">
                  Your payment was cancelled before processing - no money was deducted from your account.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <div className="font-medium">You can try again anytime</div>
                <div className="text-sm text-muted-foreground">
                  Feel free to retry the payment or choose a different plan that suits your needs.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <div className="font-medium">Need help?</div>
                <div className="text-sm text-muted-foreground">
                  Our support team is available to help with payment issues or questions about our plans.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Details if available */}
        {plan && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What you would get with {plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-2xl font-display font-bold">{plan.amount}π</span>
                <span className="text-muted-foreground ml-2">
                  {plan.period === 'forever' ? '/ forever' : `/ ${plan.period}`}
                </span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Common cancellation reasons and solutions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Common reasons and solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-1">Insufficient Pi balance?</div>
                <div className="text-sm text-muted-foreground">
                  Make sure you have enough Pi in your wallet. You can also try using a different payment method or wait for more Pi to become available.
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-1">Not sure about the plan?</div>
                <div className="text-sm text-muted-foreground">
                  You can start with our free plan and upgrade anytime. All paid features are available immediately after upgrade.
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-1">Technical issues?</div>
                <div className="text-sm text-muted-foreground">
                  Try refreshing the page or using a different browser. Contact support if the problem persists.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={retryPayment} className="gradient-hero">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Payment Again
          </Button>
          <Button onClick={browsePlans} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Plans
          </Button>
          <Button onClick={contactSupport} variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>

        {/* Additional help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Still having trouble? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a 
              href="https://droppay.space/support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Droppay Support
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <button 
              onClick={() => navigate('/help')}
              className="text-primary hover:underline"
            >
              Drop Store Help
            </button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <button 
              onClick={() => navigate('/support')}
              className="text-primary hover:underline"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropPayCancel;