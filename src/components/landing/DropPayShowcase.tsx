import { CreditCard, ExternalLink, CheckCircle2, Zap, Lock, Globe, ArrowRight, Code2, Package, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const paymentMethods = [
  {
    title: 'Payment Links',
    description: 'Create shareable Pi checkout links in seconds. Perfect for social media and email.',
    icon: CreditCard,
  },
  {
    title: 'Embeddable Checkout',
    description: 'Add a beautiful checkout widget to your website with just a few lines of code.',
    icon: Code2,
  },
  {
    title: 'Developer API',
    description: 'Powerful REST API with webhooks for seamless integration into any application.',
    icon: Zap,
  },
];

const features = [
  {
    title: 'Lightning Fast',
    description: '<100ms Response Time',
    icon: Zap,
  },
  {
    title: 'Highly Secure',
    description: 'Enterprise-grade encryption',
    icon: Lock,
  },
  {
    title: 'Global Coverage',
    description: 'Accept Pi worldwide',
    icon: Globe,
  },
];

interface CodeExample {
  title: string;
  code: string;
}

const codeExamples: CodeExample[] = [
  {
    title: 'Create Payment Link',
    code: `// Create a payment in seconds
const payment = await droppay.paymentLinks.create({
  amount: 25.00,
  title: 'Premium Subscription',
  description: 'Annual plan',
  successUrl: 'https://yoursite.com',
  metadata: {
    userId: 'user_123'
  }
});

console.log(payment.payment_url);
// https://droppay.space/pay/abc123`,
  },
  {
    title: 'Handle Webhook',
    code: `// Receive payment notifications
app.post('/webhook', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'payment.completed') {
    // Process payment
    updateUserSubscription(data.metadata.userId);
    sendConfirmationEmail(data.payer);
  }
  
  res.json({ success: true });
});`,
  },
];

export function DropPayShowcase() {
  const [selectedExample, setSelectedExample] = useState(0);

  return (
    <section id="droppay" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <CreditCard className="w-4 h-4" />
            Pi Payment Processing
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Accept Pi Payments{' '}
            <span className="gradient-text">Everywhere</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            DropPay is the simplest way to accept Pi cryptocurrency payments. 
            Create payment links, embed checkout widgets, and process transactions seamlessly.
          </p>
        </div>

        {/* Why DropPay */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-6 text-center">
                  <Icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Code Example Section */}
        <div className="mb-16 grid md:grid-cols-2 gap-12 items-center">
          {/* Code Display */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 overflow-hidden">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex gap-2 mb-4 border-b border-slate-700 pb-3">
              {codeExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedExample(index)}
                  className={`text-sm px-3 py-1 rounded transition-all ${
                    selectedExample === index
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </div>
            <pre className="text-sm text-slate-300 overflow-x-auto">
              <code>{codeExamples[selectedExample].code}</code>
            </pre>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
              Why Choose DropPay?
            </h3>
            <div className="space-y-4">
              {[
                'Create payment links in seconds - no coding required',
                'Embed checkout widgets on your website',
                'Real-time webhook notifications',
                'Advanced analytics and reporting',
                'Multi-currency support',
                'Enterprise-grade security',
                ' Instant Pi Network verification',
                '24/7 developer support',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
            Multiple Payment Methods
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="bg-card border-border hover:border-primary/30 transition-all group">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-foreground mb-2">{method.title}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Build Once, Share Everywhere */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-12 text-center">
            Build Once, Share Everywhere
          </h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every builder outputs link + embed + QR. Hand off to marketing or devs without extra work.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Payment Links & Invoices',
                description: 'Generate shareable Pi checkout links with invoice presets. Every link ships with redirect, QR, and embed snippet.',
                features: ['Invoice preset included', 'Link + embed + QR', 'Dashboard + API creation'],
                link: 'https://droppay.space/dashboard/links',
              },
              {
                title: 'Payment Buttons',
                description: 'Create buttons that output shareable links, embeds, and QR codes. Includes cart, donate, and subscribe presets.',
                features: ['Cart, donate, subscribe', 'Absolute URLs for sharing', 'Inline guidance'],
                link: 'https://droppay.space/dashboard/payment-buttons/create-link',
              },
              {
                title: 'Merchant Pay Pages',
                description: 'Spin up product pages with variants and images. Get analytics, QR, and embed in one place.',
                features: ['Multi-item with images', 'Share or embed instantly', 'Track conversions'],
                link: 'https://droppay.space/dashboard/merchant/create-link',
              },
            ].map((builder, index) => (
              <Card key={index} className="bg-card border-border hover:border-primary/30 transition-all flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <h4 className="font-semibold text-foreground mb-2 text-lg">{builder.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{builder.description}</p>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {builder.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                    asChild
                  >
                    <a href={builder.link} target="_blank" rel="noopener noreferrer">
                      Open Builder
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl p-8 md:p-12 border border-border mb-16">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
            Get Started in 3 Steps
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-foreground mb-2">Sign Up & Get API Key</h4>
              <p className="text-sm text-muted-foreground">
                Create your free DropPay account in seconds. Get instant access to your dashboard and API credentials.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-foreground mb-2">Create Payment Links</h4>
              <p className="text-sm text-muted-foreground">
                Generate payment links through the dashboard or API. Customize amounts, descriptions, and success URLs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-foreground mb-2">Get Paid Instantly</h4>
              <p className="text-sm text-muted-foreground">
                Receive instant webhooks, blockchain verification, and automatic withdrawals to your Pi wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Built for Every Business */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-12 text-center">
            Built for Every Business
          </h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            From startups to enterprises, DropPay scales with your needs
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'E-Commerce',
                description: 'Perfect for online stores selling digital or physical products.',
                features: ['Automatic inventory sync', 'Order management', 'Customer notifications'],
                icon: ShoppingCart,
                link: 'https://droppay.space/use-cases/ecommerce',
              },
              {
                title: 'SaaS & Subscriptions',
                description: 'Ideal for subscription-based services and recurring billing.',
                features: ['Recurring payments', 'Usage-based billing', 'Plan management'],
                icon: Code2,
                link: 'https://droppay.space/use-cases/saas',
              },
              {
                title: 'Marketplaces',
                description: 'Build multi-vendor marketplaces with split payments.',
                features: ['Split payments', 'Seller dashboards', 'Commission management'],
                icon: Package,
                link: 'https://droppay.space/use-cases/marketplaces',
              },
              {
                title: 'Donations & Crowdfunding',
                description: 'Accept donations for your cause or crowdfund projects.',
                features: ['One-time & recurring', 'Donor management', 'Campaign tracking'],
                icon: Heart,
                link: 'https://droppay.space/use-cases/donations',
              },
              {
                title: 'Gaming & NFTs',
                description: 'Monetize your game or sell digital collectibles.',
                features: ['In-game purchases', 'NFT payments', 'Virtual goods'],
                icon: Zap,
                link: 'https://droppay.space/use-cases/gaming',
              },
              {
                title: 'Education & Courses',
                description: 'Sell online courses, tutorials, and educational content.',
                features: ['Course payments', 'Student management', 'Certificate delivery'],
                icon: CheckCircle2,
                link: 'https://droppay.space/use-cases/education',
              },
            ].map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <Card key={index} className="bg-card border-border hover:border-primary/30 transition-all flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full">
                    <Icon className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">{useCase.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                    <ul className="space-y-2 mb-6 flex-grow text-sm">
                      {useCase.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                      asChild
                    >
                      <a href={useCase.link} target="_blank" rel="noopener noreferrer">
                        Learn More
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Don't see your use case?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="https://droppay.space/contact" target="_blank" rel="noopener noreferrer">
                  Contact Sales
                </a>
              </Button>
              <Button asChild>
                <a href="https://droppay.space/docs" target="_blank" rel="noopener noreferrer">
                  Read Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
            Simple, Transparent Pricing
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '0',
                features: ['1 Payment Link', 'Basic analytics', '1% platform fee', 'Community support'],
              },
              {
                name: 'Basic',
                price: '10',
                features: ['5 Payment Links', 'Basic analytics', '0.75% platform fee', 'Email support'],
              },
              {
                name: 'Pro',
                price: '20',
                popular: true,
                features: ['10 Payment Links', 'Advanced analytics', '0.5% platform fee', 'Priority support', 'Custom branding'],
              },
              {
                name: 'Enterprise',
                price: '50',
                features: ['Unlimited Links', 'Full analytics', '0% platform fee', '24/7 Support', 'Dedicated Manager'],
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative transition-all ${
                  plan.popular
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 scale-105'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <h4 className="font-bold text-foreground mb-2">{plan.name}</h4>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">π{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <a href="https://droppay.space/auth" target="_blank" rel="noopener noreferrer">
                      Get Started
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enterprise Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: '<100ms response' },
            { icon: Lock, title: 'Secure', desc: 'Bank-level security' },
            { icon: Globe, title: 'Global', desc: 'Accept worldwide' },
            { icon: CreditCard, title: 'Multiple Methods', desc: 'Links, widgets, API' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <Icon className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl p-8 md:p-12 border border-primary/30 text-center">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Ready to Accept Pi Payments?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of merchants accepting Pi payments with DropPay. 
            Get started free today with no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2"
              asChild
            >
              <a href="https://droppay.space/auth" target="_blank" rel="noopener noreferrer">
                Start Free Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              asChild
            >
              <a href="https://droppay.space" target="_blank" rel="noopener noreferrer">
                Learn More
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
