import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS, STORE_TYPES } from "@/lib/pi-sdk";
import { Check, Coins, Zap, Crown, Building2, Rocket, Store, Globe, Download } from "lucide-react";
import TermsPrivacyModal from "./TermsPrivacyModal";

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="w-6 h-6" />;
      case 'grow': return <Crown className="w-6 h-6" />;
      case 'advance': return <Rocket className="w-6 h-6" />;
      case 'plus': return <Building2 className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getStoreIcon = (storeId: string) => {
    switch (storeId) {
      case 'physical': return <Store className="w-8 h-8" />;
      case 'online': return <Globe className="w-8 h-8" />;
      case 'digital': return <Download className="w-8 h-8" />;
      default: return <Store className="w-8 h-8" />;
    }
  };

  const handleGetStarted = (planId: string) => {
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button className="gradient-hero" asChild>
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Coins className="w-4 h-4" />
            <span>Pay with Pi Cryptocurrency</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your business. Create Physical, Online, or Digital stores.
          </p>
        </div>

        {/* Store Types Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-display font-bold text-center mb-8">
            Three Store Types, One Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Object.values(STORE_TYPES).map((storeType) => (
              <Card key={storeType.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                    {getStoreIcon(storeType.id)}
                  </div>
                  <CardTitle>{storeType.name}</CardTitle>
                  <CardDescription>{storeType.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {storeType.instructions.slice(0, 4).map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 text-primary">
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
                variant="outline"
                onClick={() => handleGetStarted('basic')}
              >
                <Coins className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Grow Plan - Popular */}
          <Card className="relative border-2 border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 text-primary">
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
                onClick={() => handleGetStarted('grow')}
              >
                <Coins className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </CardFooter>
          </Card>

          {/* Advance Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 text-primary">
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
                onClick={() => handleGetStarted('advance')}
              >
                <Coins className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </CardFooter>
          </Card>

          {/* Plus Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 text-primary">
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
                onClick={() => handleGetStarted('plus')}
              >
                <Coins className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">How do I pay with Pi?</h3>
              <p className="text-muted-foreground">
                Open Drop Store in the Pi Browser app, select a plan, and confirm the payment using your Pi wallet. All transactions are processed on Pi Network Mainnet.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">What's the difference between store types?</h3>
              <p className="text-muted-foreground">
                <strong>Physical Store:</strong> For brick-and-mortar retail with local pickup/delivery. <strong>Online Store:</strong> E-commerce for products shipped worldwide. <strong>Digital Store:</strong> Sell downloads, software, courses, and digital services.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade at any time, and the new features will be available immediately. Downgrades take effect at the end of your current billing period.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
              <p className="text-muted-foreground">
                Due to the nature of cryptocurrency payments, all sales are final. However, if you experience any issues, please contact our support team.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">
            Ready to start selling with Pi?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of Pi merchants building their businesses on Drop Store.
          </p>
          <Button className="gradient-hero shadow-glow" size="lg" asChild>
            <Link to="/auth?mode=signup">
              Start Your Store Today
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Payments powered by Pi Network Mainnet</p>
          <div className="mt-2">
            <TermsPrivacyModal />
          </div>
          <p className="mt-2">© 2024 Drop Store by Droplink · Mrwain Organization</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
