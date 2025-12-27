import { Zap, Shield, TrendingUp, Users, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const piFeatures = [
  {
    icon: Wallet,
    title: 'Native Pi Payments',
    description: 'First and only platform with full Pi Network payment integration. Accept Pi cryptocurrency seamlessly with zero hassle.',
  },
  {
    icon: Shield,
    title: 'Pi Mainnet Ready',
    description: 'Built on Pi Mainnet with verified transactions. Your customers shop with confidence using their Pi wallet.',
  },
  {
    icon: Users,
    title: 'Pi Community First',
    description: 'Access to 50M+ Pi Network users worldwide. Tap into the fastest-growing crypto community for your business.',
  },
  {
    icon: Zap,
    title: 'Instant Settlements',
    description: 'Receive Pi payments instantly with real-time transaction verification. No waiting periods or holds.',
  },
  {
    icon: TrendingUp,
    title: 'Lower Fees',
    description: 'Save up to 90% on payment processing fees compared to traditional payment processors. Keep more of your revenue.',
  },
  {
    icon: CheckCircle2,
    title: 'KYC Verified',
    description: 'All transactions are secure with Pi Network KYC verification. Trust and safety built into every sale.',
  },
];

const stats = [
  { value: '#1', label: 'E-commerce Platform on Pi Network' },
  { value: '50M+', label: 'Potential Pi Network Customers' },
  { value: '0.1%', label: 'Transaction Fee (vs 3-5% Traditional)' },
  { value: '100+', label: 'Countries Supported' },
];

export function PiNetwork() {
  return (
    <section id="pi-network" className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Pi Network Integration
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            The #1 E-commerce Platform on{' '}
            <span className="gradient-text">Pi Network</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            DropStore is the leading e-commerce solution built exclusively for the Pi Network ecosystem. 
            Join thousands of merchants already accepting Pi payments and reaching millions of Pi users worldwide.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {piFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Why Choose DropStore */}
        <div className="bg-card rounded-3xl p-8 md:p-12 border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Why DropStore Leads Pi Network E-commerce
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Trusted by Pi Network Pioneers</h4>
                    <p className="text-sm text-muted-foreground">
                      Trusted by thousands of Pi users worldwide. Built following Pi Network's best practices and guidelines.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Largest Pi Merchant Network</h4>
                    <p className="text-sm text-muted-foreground">
                      10,000+ active stores already using DropStore. Join the biggest marketplace in the Pi ecosystem.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Advanced Pi SDK Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Full Pi Browser compatibility with authentication, payments, and Pi Ads Network support.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Dedicated Pi Support</h4>
                    <p className="text-sm text-muted-foreground">
                      24/7 support team specialized in Pi Network transactions and ecosystem guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 border border-primary/20">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground mb-4">Powered by Pi Network</p>
                  <p className="text-muted-foreground">
                    Built with advanced Pi SDK integration for seamless cryptocurrency payments. Experience fast, secure transactions with the world's largest mobile crypto network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-sky-500 hover:bg-sky-600 text-white text-lg px-8 py-6 h-auto"
                asChild
              >
                <Link to="/auth">
                  Start Accepting Pi Payments Today
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No setup fees • No monthly charges • Start earning Pi in minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
