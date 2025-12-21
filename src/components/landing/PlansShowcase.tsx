import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, Rocket } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  icon: React.ElementType;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  buttonText: string;
  buttonVariant?: 'default' | 'secondary' | 'outline';
}

const plans: Plan[] = [
  {
    name: 'Basic',
    icon: Sparkles,
    price: '20',
    period: 'per month in Pi',
    description: 'Perfect for starting your Pi business',
    features: [
      { text: '1 Store (Physical, Online, or Digital)', included: true },
      { text: '25 Products per store', included: true },
      { text: 'Basic templates', included: true },
      { text: 'Standard support', included: true },
      { text: 'Pi payment integration', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Order management', included: true },
      { text: 'Customer notifications', included: true },
      { text: 'Unlimited products', included: false },
      { text: 'Premium templates', included: false },
      { text: 'Priority support', included: false },
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline',
  },
  {
    name: 'Grow',
    icon: Zap,
    price: '49',
    period: 'per month in Pi',
    description: 'For growing businesses',
    features: [
      { text: '3 Stores (Any type)', included: true },
      { text: 'Unlimited products', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Priority support', included: true },
      { text: 'Remove Drop Store branding', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom store colors', included: true },
      { text: 'Export orders to CSV', included: true },
      { text: 'Promotional tools', included: true },
      { text: 'Inventory management', included: true },
    ],
    highlighted: true,
    buttonText: 'Upgrade to Grow',
    buttonVariant: 'default',
  },
  {
    name: 'Advance',
    icon: Rocket,
    price: '60',
    period: 'per month in Pi',
    description: 'Advanced features for serious sellers',
    features: [
      { text: '5 Stores (Any type)', included: true },
      { text: 'Everything in Grow', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'API access', included: true },
      { text: 'Bulk product import', included: true },
      { text: 'Multi-staff access', included: true },
      { text: 'Advanced reporting', included: true },
      { text: 'Priority queue support', included: true },
      { text: 'Automated inventory alerts', included: true },
    ],
    buttonText: 'Get Advance',
    buttonVariant: 'secondary',
  },
  {
    name: 'Plus',
    icon: Crown,
    price: '100',
    period: 'per month in Pi',
    description: 'Enterprise-level features',
    features: [
      { text: 'Unlimited Stores (All types)', included: true },
      { text: 'Everything in Advance', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'White-label option', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Custom development support', included: true },
      { text: 'Advanced security features', included: true },
      { text: 'Multi-location management', included: true },
      { text: 'Enterprise analytics', included: true },
    ],
    buttonText: 'Get Plus',
    buttonVariant: 'secondary',
  },
];

export function PlansShowcase() {
  return (
    <section className="py-24 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.highlighted
                  ? 'border-primary shadow-xl scale-105 md:scale-110'
                  : 'border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.highlighted
                      ? 'bg-primary/10'
                      : 'bg-secondary/50'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${
                      plan.highlighted ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 'Custom' ? plan.price : `π${plan.price}`}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.price === 'Custom' && (
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          feature.included
                            ? 'text-primary'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground/50 line-through'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.buttonVariant}
                  asChild
                >
                  <Link to="/subscription">
                    {plan.buttonText}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by 10,000+ merchants on Pi Network
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Free updates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
