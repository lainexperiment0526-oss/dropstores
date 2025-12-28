import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Users, TrendingUp } from 'lucide-react';

export function PiSupplierShowcase() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Coming Soon</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center text-foreground mb-4">
            🌐 Pi Supplier Partner Program
          </h2>
          <p className="text-lg md:text-xl text-center text-muted-foreground max-w-3xl mx-auto mb-12">
            Join the first Pi-native dropshipping ecosystem. Connect suppliers with store owners—all powered by Pi.
          </p>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border-2 border-primary/20 rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">For Suppliers</h3>
              <p className="text-sm text-muted-foreground">
                List your products and reach thousands of Pi stores instantly
              </p>
            </div>

            <div className="bg-card border-2 border-primary/20 rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">For Store Owners</h3>
              <p className="text-sm text-muted-foreground">
                Source quality products without inventory or upfront costs
              </p>
            </div>

            <div className="bg-card border-2 border-primary/20 rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">100% Pi Native</h3>
              <p className="text-sm text-muted-foreground">
                All transactions in Pi—no fiat, no conversions, no complexity
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="gradient-hero shadow-glow hover:opacity-90 transition-opacity text-lg px-8" 
              asChild
            >
              <Link to="/AboutPiSupplier">
                Learn More About the Program
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Be among the first to join when we launch
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
