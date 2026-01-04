import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ImageUpload } from './ImageUpload';
import { Palette, Type, Layout, Bell, Share2, FileText, Image, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StoreTheme {
  id: string;
  primary_color: string;
  secondary_color: string;
  font_heading: string;
  font_body: string;
  layout_style: string;
  header_style: string;
  footer_style: string;
  show_announcement_bar: boolean;
  announcement_text: string | null;
  announcement_link: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_tiktok: string | null;
  about_page: string | null;
  contact_page: string | null;
  shipping_policy: string | null;
  refund_policy: string | null;
  privacy_policy: string | null;
  terms_of_service: string | null;
  show_product_reviews: boolean;
  enable_wishlist: boolean;
  enable_compare: boolean;
  products_per_page: number;
  show_stock_count: boolean;
  show_sold_count: boolean;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_button_text: string;
  hero_button_link: string | null;
  banner_url: string | null;
  logo_url: string | null;
}

interface StoreThemeCustomizerProps {
  storeId: string;
  theme: StoreTheme;
  onUpdate: (theme: Partial<StoreTheme>) => void;
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
];

const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grid Layout' },
  { value: 'list', label: 'List Layout' },
  { value: 'masonry', label: 'Masonry Layout' },
];

const HEADER_STYLES = [
  { value: 'simple', label: 'Simple' },
  { value: 'centered', label: 'Centered Logo' },
  { value: 'sticky', label: 'Sticky Header' },
  { value: 'transparent', label: 'Transparent' },
];

const FOOTER_STYLES = [
  { value: 'simple', label: 'Simple' },
  { value: 'detailed', label: 'Multi-column' },
  { value: 'minimal', label: 'Minimal' },
];

export function StoreThemeCustomizer({ storeId, theme, onUpdate }: StoreThemeCustomizerProps) {
  const [localTheme, setLocalTheme] = useState<StoreTheme>(theme);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof StoreTheme, value: any) => {
    setLocalTheme(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          primary_color: localTheme.primary_color,
          secondary_color: localTheme.secondary_color,
          font_heading: localTheme.font_heading,
          font_body: localTheme.font_body,
          layout_style: localTheme.layout_style,
          header_style: localTheme.header_style,
          footer_style: localTheme.footer_style,
          show_announcement_bar: localTheme.show_announcement_bar,
          announcement_text: localTheme.announcement_text,
          announcement_link: localTheme.announcement_link,
          social_facebook: localTheme.social_facebook,
          social_instagram: localTheme.social_instagram,
          social_twitter: localTheme.social_twitter,
          social_tiktok: localTheme.social_tiktok,
          about_page: localTheme.about_page,
          contact_page: localTheme.contact_page,
          shipping_policy: localTheme.shipping_policy,
          refund_policy: localTheme.refund_policy,
          privacy_policy: localTheme.privacy_policy,
          terms_of_service: localTheme.terms_of_service,
          show_product_reviews: localTheme.show_product_reviews,
          enable_wishlist: localTheme.enable_wishlist,
          enable_compare: localTheme.enable_compare,
          products_per_page: localTheme.products_per_page,
          show_stock_count: localTheme.show_stock_count,
          show_sold_count: localTheme.show_sold_count,
          hero_title: localTheme.hero_title,
          hero_subtitle: localTheme.hero_subtitle,
          hero_button_text: localTheme.hero_button_text,
          hero_button_link: localTheme.hero_button_link,
          banner_url: localTheme.banner_url,
          logo_url: localTheme.logo_url,
        })
        .eq('id', storeId);

      if (error) throw error;

      onUpdate(localTheme);
      toast({ title: 'Theme saved', description: 'Your store theme has been updated.' });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({ title: 'Error', description: 'Failed to save theme settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Customizer
            </CardTitle>
            <CardDescription>
              Customize your store's appearance like Shopify
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Theme
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colors */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Colors
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localTheme.primary_color || '#0EA5E9'}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={localTheme.primary_color || '#0EA5E9'}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localTheme.secondary_color || '#38BDF8'}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={localTheme.secondary_color || '#38BDF8'}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Typography
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Heading Font</Label>
                    <Select
                      value={localTheme.font_heading || 'Inter'}
                      onValueChange={(value) => handleChange('font_heading', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Font</Label>
                    <Select
                      value={localTheme.font_body || 'Inter'}
                      onValueChange={(value) => handleChange('font_body', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo & Banner */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Image className="w-4 h-4" />
                Logo & Banner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Store Logo"
                  onUpload={(url) => handleChange('logo_url', url)}
                  currentUrl={localTheme.logo_url}
                  folder="logos"
                  aspectRatio="logo"
                />
                <ImageUpload
                  label="Store Banner"
                  onUpload={(url) => handleChange('banner_url', url)}
                  currentUrl={localTheme.banner_url}
                  folder="banners"
                  aspectRatio="banner"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Social Media
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    placeholder="https://facebook.com/yourstore"
                    value={localTheme.social_facebook || ''}
                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    placeholder="https://instagram.com/yourstore"
                    value={localTheme.social_instagram || ''}
                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter/X URL</Label>
                  <Input
                    placeholder="https://twitter.com/yourstore"
                    value={localTheme.social_twitter || ''}
                    onChange={(e) => handleChange('social_twitter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>TikTok URL</Label>
                  <Input
                    placeholder="https://tiktok.com/@yourstore"
                    value={localTheme.social_tiktok || ''}
                    onChange={(e) => handleChange('social_tiktok', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Product Layout</Label>
                <Select
                  value={localTheme.layout_style || 'grid'}
                  onValueChange={(value) => handleChange('layout_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_OPTIONS.map((layout) => (
                      <SelectItem key={layout.value} value={layout.value}>
                        {layout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Header Style</Label>
                <Select
                  value={localTheme.header_style || 'simple'}
                  onValueChange={(value) => handleChange('header_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEADER_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Footer Style</Label>
                <Select
                  value={localTheme.footer_style || 'simple'}
                  onValueChange={(value) => handleChange('footer_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOTER_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Products Per Page</Label>
              <Select
                value={String(localTheme.products_per_page || 12)}
                onValueChange={(value) => handleChange('products_per_page', parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Announcement Bar */}
            <div className="space-y-4 p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <Label>Announcement Bar</Label>
                </div>
                <Switch
                  checked={localTheme.show_announcement_bar || false}
                  onCheckedChange={(checked) => handleChange('show_announcement_bar', checked)}
                />
              </div>
              {localTheme.show_announcement_bar && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Announcement Text</Label>
                    <Input
                      placeholder="Free shipping on orders over π100!"
                      value={localTheme.announcement_text || ''}
                      onChange={(e) => handleChange('announcement_text', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link (optional)</Label>
                    <Input
                      placeholder="/collections/sale"
                      value={localTheme.announcement_link || ''}
                      onChange={(e) => handleChange('announcement_link', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Hero Tab */}
          <TabsContent value="hero" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Title</Label>
                <Input
                  placeholder="Welcome to Our Store"
                  value={localTheme.hero_title || ''}
                  onChange={(e) => handleChange('hero_title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Subtitle</Label>
                <Textarea
                  placeholder="Discover amazing products at great prices"
                  value={localTheme.hero_subtitle || ''}
                  onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    placeholder="Shop Now"
                    value={localTheme.hero_button_text || 'Shop Now'}
                    onChange={(e) => handleChange('hero_button_text', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    placeholder="#products"
                    value={localTheme.hero_button_link || ''}
                    onChange={(e) => handleChange('hero_button_link', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label>Product Reviews</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to leave reviews</p>
                </div>
                <Switch
                  checked={localTheme.show_product_reviews || false}
                  onCheckedChange={(checked) => handleChange('show_product_reviews', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label>Wishlist</Label>
                  <p className="text-sm text-muted-foreground">Let customers save favorites</p>
                </div>
                <Switch
                  checked={localTheme.enable_wishlist || false}
                  onCheckedChange={(checked) => handleChange('enable_wishlist', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label>Compare Products</Label>
                  <p className="text-sm text-muted-foreground">Enable product comparison</p>
                </div>
                <Switch
                  checked={localTheme.enable_compare || false}
                  onCheckedChange={(checked) => handleChange('enable_compare', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label>Show Stock Count</Label>
                  <p className="text-sm text-muted-foreground">Display available stock</p>
                </div>
                <Switch
                  checked={localTheme.show_stock_count ?? true}
                  onCheckedChange={(checked) => handleChange('show_stock_count', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label>Show Sold Count</Label>
                  <p className="text-sm text-muted-foreground">Display number sold</p>
                </div>
                <Switch
                  checked={localTheme.show_sold_count || false}
                  onCheckedChange={(checked) => handleChange('show_sold_count', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Content Tab - About, Contact, Social Media */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    About Your Store
                  </CardTitle>
                  <CardDescription>
                    Tell your customers about your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Describe your business, mission, and values..."
                    value={localTheme.about_page || ''}
                    onChange={(e) => handleChange('about_page', e.target.value)}
                    rows={5}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>
                    How customers can get in touch with you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Additional contact information or inquiries page content..."
                    value={localTheme.contact_page || ''}
                    onChange={(e) => handleChange('contact_page', e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Social Media Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Social Media Links
                  </CardTitle>
                  <CardDescription>
                    Connect with customers on social platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/yourpage"
                      value={localTheme.social_facebook || ''}
                      onChange={(e) => handleChange('social_facebook', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/yourprofile"
                      value={localTheme.social_instagram || ''}
                      onChange={(e) => handleChange('social_instagram', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X URL</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/yourprofile"
                      value={localTheme.social_twitter || ''}
                      onChange={(e) => handleChange('social_twitter', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok URL</Label>
                    <Input
                      id="tiktok"
                      placeholder="https://tiktok.com/@yourprofile"
                      value={localTheme.social_tiktok || ''}
                      onChange={(e) => handleChange('social_tiktok', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Announcement Bar Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Announcement Bar
                  </CardTitle>
                  <CardDescription>
                    Display a notification banner at the top of your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <Label>Enable Announcement Bar</Label>
                      <p className="text-xs text-muted-foreground">Show banner to customers</p>
                    </div>
                    <Switch
                      checked={localTheme.show_announcement_bar || false}
                      onCheckedChange={(checked) => handleChange('show_announcement_bar', checked)}
                    />
                  </div>
                  {localTheme.show_announcement_bar && (
                    <>
                      <div className="space-y-2">
                        <Label>Announcement Text</Label>
                        <Input
                          placeholder="e.g., Free shipping on orders over $50"
                          value={localTheme.announcement_text || ''}
                          onChange={(e) => handleChange('announcement_text', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Announcement Link (Optional)</Label>
                        <Input
                          placeholder="https://example.com/promo"
                          value={localTheme.announcement_link || ''}
                          onChange={(e) => handleChange('announcement_link', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pages Tab - Policies */}
          <TabsContent value="pages" className="space-y-6 mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="shipping">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Shipping Policy
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Textarea
                    placeholder="Describe your shipping methods, costs, and delivery times..."
                    value={localTheme.shipping_policy || ''}
                    onChange={(e) => handleChange('shipping_policy', e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Refund & Return Policy
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Textarea
                    placeholder="Describe your refund period, conditions, and return procedures..."
                    value={localTheme.refund_policy || ''}
                    onChange={(e) => handleChange('refund_policy', e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Privacy Policy
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Textarea
                    placeholder="Explain how you collect, use, and protect customer data..."
                    value={localTheme.privacy_policy || ''}
                    onChange={(e) => handleChange('privacy_policy', e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="terms">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Terms of Service
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Textarea
                    placeholder="Define the terms under which customers can use your store..."
                    value={localTheme.terms_of_service || ''}
                    onChange={(e) => handleChange('terms_of_service', e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
