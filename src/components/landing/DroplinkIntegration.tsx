import { Link2, ExternalLink, CheckCircle2, ArrowRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const integrationFeatures = [
  {
    title: 'One-Click Store Connection',
    description: 'Connect your DropStore to your DropLink profile instantly. Share all your products through a single, beautiful link.',
  },
  {
    title: 'Custom .pi Domain',
    description: 'Get your personalized .pi domain (e.g., yourname.pi) and link it to both your DropLink profile and DropStore.',
  },
  {
    title: 'Unified Bio Page',
    description: 'Showcase your store, social links, Pi wallet, and all your content in one professional link-in-bio page.',
  },
  {
    title: 'Cross-Platform Analytics',
    description: 'Track visitors from your bio page to your store. See which links drive the most sales and engagement.',
  },
  {
    title: 'Mobile-First Design',
    description: 'Both platforms are optimized for mobile. Perfect for sharing on social media, Pi Network, and messaging apps.',
  },
  {
    title: 'Automatic Sync',
    description: 'Products added to DropStore automatically appear on your DropLink profile. Always up-to-date.',
  },
];

export function DroplinkIntegration() {
  return (
    <section id="droplink" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 text-foreground rounded-full text-sm font-medium mb-6">
            <Link2 className="w-4 h-4" />
            DropLink Integration
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Connect Your Store to{' '}
            <span className="gradient-text">DropLink</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Seamlessly integrate your DropStore with DropLink - the #1 link-in-bio platform for Pi Network. 
            Get your custom .pi domain and share everything in one place.
          </p>
        </div>

        {/* Main Integration Showcase */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left - Visual Flow */}
          <div className="relative">
            <div className="space-y-6">
              {/* DropStore Card */}
              <div className="bg-gradient-to-br from-sky-500/10 to-sky-600/10 rounded-2xl p-6 border-2 border-sky-500/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Your DropStore</h4>
                    <p className="text-sm text-muted-foreground">E-commerce Platform</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-background/50 rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground">Store URL:</span>
                    <span className="ml-2 font-medium text-foreground">dropshops.space/shop/yourstore</span>
                  </div>
                </div>
              </div>

              {/* Connection Arrow */}
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center animate-pulse">
                  <ArrowRight className="w-6 h-6 text-white rotate-90" />
                </div>
              </div>

              {/* DropLink Card */}
              <div className="bg-gradient-to-br from-sky-500/10 to-sky-600/10 rounded-2xl p-6 border-2 border-sky-500/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">DropLink Profile</h4>
                    <p className="text-sm text-muted-foreground">Link-in-Bio Platform</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-background/50 rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground">.pi Domain:</span>
                    <span className="ml-2 font-medium text-foreground">yourname.pi</span>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground">DropLink URL:</span>
                    <span className="ml-2 font-medium text-foreground">droplink.space/yourname</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Benefits */}
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
              Why Connect to DropLink?
            </h3>
            <div className="space-y-4">
              {integrationFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
                >
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl p-8 md:p-12 border border-border">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
            How It Works
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-foreground mb-2">Create Your Store</h4>
              <p className="text-sm text-muted-foreground">
                Set up your DropStore with products, branding, and payment options in minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-foreground mb-2">Connect to DropLink</h4>
              <p className="text-sm text-muted-foreground">
                One click to link your store to DropLink and claim your .pi domain.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-foreground mb-2">Share Everywhere</h4>
              <p className="text-sm text-muted-foreground">
                Share your DropLink bio page and .pi domain on social media, Pi Network, and more.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              className="bg-sky-500 hover:bg-sky-600 text-white"
              asChild
            >
              <Link to="/auth?mode=signup">
                Create Your Store
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2"
              asChild
            >
              <a href="https://droplink.space" target="_blank" rel="noopener noreferrer">
                Visit DropLink
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            <strong className="text-foreground">Pro Tip:</strong> Use your .pi domain as your primary link everywhere. 
            Your customers can find both your social profiles and your store in one place!
          </p>
        </div>
      </div>
    </section>
  );
}
