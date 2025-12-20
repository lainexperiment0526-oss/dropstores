import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>No credit card required</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
            Ready to Build Your Online Store?
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
            Join thousands of entrepreneurs who have launched their online stores with Drop Store. 
            Start free today and scale as you grow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
              asChild
            >
              <Link to="/auth?mode=signup">
                Create Your Store
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            {/* Sign In button removed as requested */}
          </div>
        </div>
      </div>
    </section>
  );
}