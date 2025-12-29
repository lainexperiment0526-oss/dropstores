import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search, Store } from 'lucide-react';

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  store_type: string | null;
  address: string | null;
  is_published: boolean;
  created_at: string;
}

export default function StoreDirectory() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('id,name,slug,description,logo_url,banner_url,store_type,address,is_published,created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load stores', error);
        setStores([]);
      } else {
        setStores(data || []);
      }
      setLoading(false);
    };

    fetchStores();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return stores.filter((store) => {
      const matchesTerm = term
        ? (store.name || '').toLowerCase().includes(term) || (store.description || '').toLowerCase().includes(term)
        : true;
      const matchesType = typeFilter ? store.store_type === typeFilter : true;
      return matchesTerm && matchesType;
    });
  }, [stores, search, typeFilter]);

  const storeTypes = useMemo(() => {
    const types = new Set<string>();
    stores.forEach((s) => s.store_type && types.add(s.store_type));
    return Array.from(types);
  }, [stores]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Explore Stores</h1>
              <p className="text-sm text-muted-foreground">Browse all published stores from the community</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/create-store">Create your store</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stores by name or description"
                className="pl-10"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                size="sm"
                variant={!typeFilter ? 'default' : 'outline'}
                onClick={() => setTypeFilter(null)}
              >
                All types
              </Button>
              {storeTypes.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={typeFilter === type ? 'default' : 'outline'}
                  onClick={() => setTypeFilter(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} store{filtered.length === 1 ? '' : 's'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading stores...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No published stores found. Be the first to <Link to="/create-store" className="text-primary underline">create one</Link>.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((store) => (
              <Card key={store.id} className="overflow-hidden border-border/70">
                {store.banner_url && (
                  <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${store.banner_url})` }} />
                )}
                <CardHeader className="flex-row items-center gap-3 pb-2">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{store.name}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {store.store_type && <Badge variant="outline">{store.store_type}</Badge>}
                      <span>Published</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground line-clamp-2">{store.description || 'No description provided.'}</p>
                  {store.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{store.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Updated {new Date(store.created_at).toLocaleDateString()}</span>
                    <Button asChild size="sm">
                      <Link to={`/shop/${store.slug}`}>View store</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
