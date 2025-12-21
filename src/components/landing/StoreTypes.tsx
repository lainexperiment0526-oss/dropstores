import { Store, Globe2, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const storeTypes = [
  {
    icon: Store,
    title: 'Physical Store',
    subtitle: 'Brick-and-mortar retail locations',
    description: 'Perfect for local businesses with physical locations. Connect your in-store experience with online ordering and delivery.',
    features: [
      'Set up your store address and contact information',
      'Add your product inventory with accurate stock counts',
      'Configure pickup/delivery options for local customers',
      'Set business hours and availability',
    ],
    color: 'from-sky-400 to-sky-500',
  },
  {
    icon: Globe2,
    title: 'Online Store',
    subtitle: 'E-commerce for physical products shipped worldwide',
    description: 'Reach customers globally with a fully-featured e-commerce platform. Ship products anywhere in the world.',
    features: [
      'Create compelling product listings with high-quality images',
      'Set up shipping zones and delivery rates',
      'Configure payment methods and checkout flow',
      'Add product categories and filters',
    ],
    color: 'from-sky-400 to-sky-500',
  },
  {
    icon: Download,
    title: 'Digital Store',
    subtitle: 'Sell digital products, downloads, and services',
    description: 'Monetize your digital content with instant delivery. Perfect for creators, designers, and software developers.',
    features: [
      'Upload digital files (PDFs, videos, software, etc.)',
      'Set up instant delivery after purchase',
      'Configure download limits and expiration',
      'Add product previews and samples',
    ],
    color: 'from-sky-400 to-sky-500',
  },
];

export function StoreTypes() {
  return (
    <section id="store-types" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Create Your Perfect Store
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you run a physical shop, sell online, or offer digital products, we have you covered. Choose the store type that fits your business model.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {storeTypes.map((store, index) => (
            <div
              key={store.title}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group flex flex-col"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Icon and Title */}
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${store.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300`}>
                  <store.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground mb-2">
                  {store.title}
                </h3>
                <p className="text-sm font-medium text-primary mb-3">
                  {store.subtitle}
                </p>
                <p className="text-muted-foreground">
                  {store.description}
                </p>
              </div>

              {/* Features List */}
              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {store.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button 
                asChild 
                className="w-full bg-sky-500 hover:bg-sky-600 text-white group-hover:shadow-lg transition-all duration-300"
              >
                <Link to="/auth?mode=signup">
                  Get Started
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="bg-muted/50 rounded-2xl p-8 border border-border">
            <h3 className="font-display font-semibold text-xl text-foreground mb-3">
              Not sure which one to choose?
            </h3>
            <p className="text-muted-foreground mb-4">
              You can easily switch between store types or even combine them as your business grows. Start with one and expand later.
            </p>
            <Button variant="outline" asChild>
              <Link to="/auth?mode=signup">
                Create Your Store Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
