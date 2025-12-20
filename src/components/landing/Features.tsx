import { 
  Palette, 
  Globe, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  BarChart3,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Palette,
    title: 'Beautiful Templates',
    description: 'Choose from stunning pre-designed templates or create your own unique look.',
  },
  {
    icon: Globe,
    title: 'Custom Domain',
    description: 'Get your own shareable store URL or connect your custom domain.',
  },
  {
    icon: ShoppingCart,
    title: 'Easy Product Management',
    description: 'Add products with images, variants, pricing, and inventory in seconds.',
  },
  {
    icon: Truck,
    title: 'Order Management',
    description: 'Track and manage all your orders from a single dashboard.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Accept payments securely with multiple payment gateway options.',
  },
  {
    icon: BarChart3,
    title: 'Sales Analytics',
    description: 'Get insights into your store performance with detailed analytics.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Your store looks perfect on all devices - desktop, tablet, and mobile.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed to give your customers the best experience.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need to Sell Online
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features to help you build, manage, and grow your online business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:gradient-hero group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
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
      </div>
    </section>
  );
}