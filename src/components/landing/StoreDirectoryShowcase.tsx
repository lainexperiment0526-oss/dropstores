import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Eye, ArrowRight, Globe, Download } from 'lucide-react';
import { STORE_TYPES } from '@/lib/pi-sdk';

interface FeaturedStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  store_type: string | null;
  address: string | null;
}

export function StoreDirectoryShowcase() {
  const [featuredStores, setFeaturedStores] = useState<FeaturedStore[]>([]);
  const [loading, setLoading] = useState(true);

  const storeTypeIcons = {
    physical: Store,
    online: Globe,
    digital: Download,
  };

  useEffect(() => {
    const fetchFeaturedStores = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id,name,slug,description,logo_url,banner_url,store_type,address')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setFeaturedStores(data);
      }
      setLoading(false);
    };

    fetchFeaturedStores();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-muted/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Featured Stores</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing stores from our community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-muted/5">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Store className="w-4 h-4" />
            Store Directory
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Featured Stores</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing stores from our community of creators and entrepreneurs
          </p>
        </div>

        {featuredStores.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredStores.map((store) => (
                <Card key={store.id} className="group hover:shadow-lg transition-all duration-300 border-border overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    {store.banner_url ? (
                      <img
                        src={store.banner_url}
                        alt={`${store.name} banner`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-12 h-12 text-primary/40" />
                      </div>
                    )}
                    {store.store_type && (
                      <Badge className="absolute top-3 right-3 bg-background/90 text-foreground flex items-center gap-1">
                        {(() => {
                          const Icon = storeTypeIcons[store.store_type as keyof typeof storeTypeIcons];
                          const storeTypeInfo = STORE_TYPES[store.store_type as keyof typeof STORE_TYPES];
                          return (
                            <>
                              {Icon && <Icon className="w-3 h-3" />}
                              {storeTypeInfo?.name || store.store_type}
                            </>
                          );
                        })()} 
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={`${store.name} logo`}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Store className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{store.name}</h3>
                        {store.address && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{store.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {store.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {store.description}
                      </p>
                    )}

                    <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link to={`/shop/${store.slug}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Visit Store
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="gradient-hero shadow-glow">
                <Link to="/stores">
                  View All Stores
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stores Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to create a store and showcase your products
            </p>
            <Button asChild className="gradient-hero">
              <Link to="/auth?mode=signup">Create Your Store</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}