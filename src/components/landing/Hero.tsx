import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store, ShoppingBag, BarChart3 } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4 animate-fade-in">
            <span>Powered by Pi Network Mainnet</span>
          </div>
          
          {/* Droplink Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in ml-2">
            <span>by Droplink • Mrwain Organization</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Build Your Dream
            <span className="text-gradient block">Pi-Powered Store</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Drop Store is powered by Droplink under Mrwain Organization. Create your online store on Pi Network Mainnet. 
            Accept Pi payments, reach millions of Pi users, and grow your business with our e-commerce platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="gradient-hero shadow-glow hover:opacity-90 transition-opacity text-lg px-8" asChild>
              <Link to="/auth?mode=signup">
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          {/* Stats section removed as requested */}
        </div>

        {/* Floating Cards */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Management */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Product Management</h3>
              <p className="text-muted-foreground text-sm">Add unlimited products with variants, images, and inventory tracking.</p>
            </div>

            {/* Digital Products */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Digital Products</h3>
              <p className="text-muted-foreground text-sm">Sell digital downloads, courses, and licenses with instant delivery.</p>
            </div>

            {/* Analytics & Insights */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Analytics & Insights</h3>
              <p className="text-muted-foreground text-sm">Track your sales, visitors, and growth with powerful analytics.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}