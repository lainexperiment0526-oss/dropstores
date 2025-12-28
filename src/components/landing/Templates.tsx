import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';

const templates = [
  {
    id: 'fashion-boutique',
    name: 'Fashion Boutique',
    description: 'Modern e-commerce store for fashion and lifestyle products with elegant design.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    category: 'Online Store',
    storeUrl: '/shop/fashion-demo',
    liveDemo: true,
  },
  {
    id: 'electronics-hub',
    name: 'Electronics Hub',
    description: 'Tech-forward store showcasing electronics and gadgets with detailed specs.',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop&q=80',
    category: 'Online Store',
    storeUrl: '/shop/electronics-demo',
    liveDemo: true,
  },
  {
    id: 'digital-downloads',
    name: 'Digital Downloads',
    description: 'Clean store for selling digital products, templates, and downloadable content.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop&q=80',
    category: 'Digital Store',
    storeUrl: '/shop/digital-demo',
    liveDemo: true,
  },
  {
    id: 'local-bakery',
    name: 'Local Bakery',
    description: 'Physical store with pickup options for fresh baked goods and cafe items.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&q=80',
    category: 'Physical Store',
    storeUrl: '/shop/bakery-demo',
    liveDemo: true,
  },
  {
    id: 'handmade-crafts',
    name: 'Handmade Crafts',
    description: 'Artisanal marketplace for unique handcrafted items and custom orders.',
    image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop&q=80',
    category: 'Online Store',
    storeUrl: '/shop/crafts-demo',
    liveDemo: true,
  },
  {
    id: 'fitness-studio',
    name: 'Fitness Studio',
    description: 'Book classes and purchase training programs from your local fitness center.',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80',
    category: 'Physical Store',
    storeUrl: '/shop/fitness-demo',
    liveDemo: true,
  },
];

export function Templates() {
  return (
    <section id="templates" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Explore Live Store Examples
          </h2>
          <p className="text-lg text-muted-foreground">
            See real working stores built with DropStore. Visit these live examples to see what you can create.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="gap-2"
                    asChild
                  >
                    <Link to={template.storeUrl}>
                      <ExternalLink className="w-4 h-4" />
                      Visit Store
                    </Link>
                  </Button>
                </div>
                <span className="absolute top-4 left-4 px-3 py-1 bg-sky-500 text-white text-xs font-medium rounded-full">
                  {template.category}
                </span>
                {template.liveDemo && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Live Demo
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {template.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {template.description}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary p-0 flex-1" 
                    asChild
                  >
                    <Link to={template.storeUrl}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Demo
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/auth?template=${template.id}`}>
                      Use Template
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}