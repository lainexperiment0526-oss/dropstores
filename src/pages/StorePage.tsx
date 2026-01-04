import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Store } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  heading_text_color?: string | null;
  body_text_color?: string | null;
  font_heading?: string | null;
  font_body?: string | null;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
}

export default function StorePage() {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug && pageSlug) {
      fetchData(slug, pageSlug);
    }
  }, [slug, pageSlug]);

  useEffect(() => {
    if (!store) return;
    const root = document.documentElement;
    const primary = store.primary_color || '#0EA5E9';
    const secondary = store.secondary_color || '#64748B';
    const headingColor = store.heading_text_color || '#000000';
    const bodyColor = store.body_text_color || '#333333';
    const headingFont = store.font_heading || 'Inter';
    const bodyFont = store.font_body || 'Inter';

    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);
    root.style.setProperty('--heading-text-color', headingColor);
    root.style.setProperty('--body-text-color', bodyColor);
    root.style.setProperty('--foreground', headingColor);
    root.style.setProperty('--muted-foreground', bodyColor);
    root.style.setProperty('--font-heading', headingFont);
    root.style.setProperty('--font-body', bodyFont);
  }, [store]);

  const fetchData = async (storeSlug: string, pageSlugValue: string) => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data: storeData, error: storeError } = await (supabase as any)
        .from('stores')
        .select('*')
        .eq('slug', storeSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!storeData) {
        setNotFound(true);
        return;
      }

      setStore(storeData as StoreData);

      const { data: pageData, error: pageError } = await (supabase as any)
        .from('store_pages')
        .select('id, title, slug, content')
        .eq('store_id', storeData.id)
        .eq('slug', pageSlugValue)
        .eq('is_published', true)
        .maybeSingle();

      if (pageError) throw pageError;
      if (!pageData) {
        setNotFound(true);
        return;
      }

      setPage(pageData as PageData);
    } catch (error) {
      console.error('Error loading page', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !store || !page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Store className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Page not found</h1>
            <p className="text-muted-foreground">This page is unavailable or unpublished.</p>
          </div>
          <Button asChild>
            <Link to={`/shop/${slug}`}>Back to store</Link>
          </Button>
        </div>
      </div>
    );
  }

  const headingColor = store.heading_text_color || '#000000';
  const bodyColor = store.body_text_color || '#333333';
  const headingFont = store.font_heading || 'Inter';
  const bodyFont = store.font_body || 'Inter';

  return (
    <div className="min-h-screen bg-background" style={{ color: bodyColor, fontFamily: bodyFont }}>
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{store.slug}</p>
              <h1 className="text-xl font-display font-bold truncate" style={{ color: headingColor, fontFamily: headingFont }}>
                {store.name}
              </h1>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to={`/shop/${store.slug}`}>View Store</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Custom Page</p>
            <h2 className="text-3xl font-display font-bold" style={{ color: headingColor, fontFamily: headingFont }}>
              {page.title}
            </h2>
          </div>
          <Card>
            <CardContent className="prose max-w-none py-6" style={{ color: bodyColor, fontFamily: bodyFont }}>
              <div className="whitespace-pre-line leading-relaxed text-lg">
                {page.content || 'No content yet.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
