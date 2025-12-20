import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';

const templates = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean and minimal design perfect for fashion and lifestyle brands.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    category: 'Fashion',
  },
  {
    id: 'bold',
    name: 'Bold & Vibrant',
    description: 'Eye-catching design with bold colors for brands that stand out.',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop',
    category: 'Retail',
  },
  {
    id: 'elegant',
    name: 'Elegant Classic',
    description: 'Sophisticated design ideal for luxury and premium products.',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop',
    category: 'Luxury',
  },
  {
    id: 'fresh',
    name: 'Fresh & Natural',
    description: 'Organic feel perfect for health, beauty, and food products.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    category: 'Health',
  },
  {
    id: 'tech',
    name: 'Tech Forward',
    description: 'Modern and sleek design for electronics and tech products.',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop',
    category: 'Electronics',
  },
  {
    id: 'artisan',
    name: 'Artisan Craft',
    description: 'Handcrafted feel for artisanal and handmade products.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=400&fit=crop',
    category: 'Handmade',
  },
];

export function Templates() {
  return (
    <section id="templates" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Start with a Beautiful Template
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose from our collection of professionally designed templates and customize them to match your brand.
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
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
                <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  {template.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {template.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {template.description}
                </p>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary p-0" asChild>
                  <Link to={`/auth?mode=signup&template=${template.id}`}>
                    Use This Template
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}