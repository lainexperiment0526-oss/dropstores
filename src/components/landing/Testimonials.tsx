import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Boutique Owner',
    store: 'Trendy Threads',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80',
    rating: 5,
    feedback: "DropStore transformed my business! Setting up was incredibly easy, and I had my online store running in less than 30 minutes. Sales increased by 200% in just 3 months.",
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Electronics Store Manager',
    store: 'Tech Haven',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    rating: 5,
    feedback: "The Pi payment integration is seamless! My customers love paying with Pi, and the transaction fees are much lower than traditional payment processors. Highly recommend!",
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Digital Creator',
    store: 'Creative Templates Hub',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80',
    rating: 5,
    feedback: "Perfect for selling digital products! Instant delivery works flawlessly, and my customers receive their downloads immediately after purchase. The platform is intuitive and powerful.",
  },
  {
    id: 4,
    name: 'David Martinez',
    role: 'Local Bakery Owner',
    store: 'Sweet Delights Bakery',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    rating: 5,
    feedback: "As a physical store, the pickup and delivery options are game-changers. Customers can order online and pick up fresh goods. My revenue doubled since joining DropStore!",
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Handmade Crafts Seller',
    store: 'Artisan Corner',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&q=80',
    rating: 5,
    feedback: "The customization options are amazing! I can showcase my handmade products beautifully. The platform is so user-friendly, and customer support is excellent.",
  },
  {
    id: 6,
    name: 'James Wilson',
    role: 'Fitness Studio Owner',
    store: 'FitLife Studio',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80',
    rating: 5,
    feedback: "Managing class bookings and selling training programs has never been easier. The analytics help me understand my business better. Best decision I made for my studio!",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Loved by Merchants Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of successful merchants who trust DropStore to power their business. See what they have to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-10 h-10 text-primary/20" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Feedback */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.feedback}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/10"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {testimonial.store}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
