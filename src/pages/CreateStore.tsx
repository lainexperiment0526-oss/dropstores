import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ArrowLeft, Loader2, Sparkles, Check, Lock, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StoreTypeSelector, StoreTypeInstructions } from '@/components/store/StoreTypeSelector';
import { useSubscription } from '@/hooks/useSubscription';

const templates = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean and minimal design',
    color: '#0EA5E9',
  },
  {
    id: 'bold',
    name: 'Bold & Vibrant',
    description: 'Eye-catching colorful design',
    color: '#8B5CF6',
  },
  {
    id: 'elegant',
    name: 'Elegant Classic',
    description: 'Sophisticated premium look',
    color: '#1F2937',
  },
  {
    id: 'fresh',
    name: 'Fresh & Natural',
    description: 'Organic and natural feel',
    color: '#10B981',
  },
];

export default function CreateStore() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isActive, isLoading: subscriptionLoading, planLimits, subscription } = useSubscription();
  
  const [loading, setLoading] = useState(false);
  const [storeCount, setStoreCount] = useState(0);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    template: 'modern',
    storeType: 'online',
    logo: undefined as File | undefined,
    banner: undefined as File | undefined,
  });

  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(undefined);

  // Check authentication and subscription
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch current store count
  useEffect(() => {
    if (user) {
      supabase
        .from('stores')
        .select('id', { count: 'exact' })
        .eq('owner_id', user.id)
        .then(({ count }) => setStoreCount(count || 0));
    }
  }, [user]);

  // Check if user can create stores
  const canCreate = isActive && planLimits && storeCount < planLimits.maxStores;
  const isLoadingChecks = authLoading || subscriptionLoading;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, banner: file }));
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: 'Store name required',
        description: 'Please enter a name for your store.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const selectedTemplate = templates.find(t => t.id === formData.template);
      
      const { data, error } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          name: formData.name.trim(),
          slug: formData.slug || generateSlug(formData.name),
          description: formData.description.trim() || null,
          template_id: formData.template,
          primary_color: selectedTemplate?.color || '#0EA5E9',
          store_type: formData.storeType,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Store URL taken',
            description: 'This store URL is already in use. Please choose a different name or URL.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Store created!',
          description: 'Your store has been created successfully.',
        });
        navigate(`/store/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: 'Error',
        description: 'Failed to create store. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (isLoadingChecks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show subscription required message if no active plan
  if (!isActive) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 max-w-md">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Subscription Required
              </h2>
              <p className="text-muted-foreground mb-6">
                You need an active subscription plan to create stores. Choose a plan to unlock store creation and all features.
              </p>
              <Button className="gradient-hero shadow-glow hover:opacity-90" asChild>
                <Link to="/subscription">
                  <Crown className="w-4 h-4 mr-2" />
                  View Plans
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show store limit reached message
  if (!canCreate && planLimits) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 max-w-md">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Store Limit Reached
              </h2>
              <p className="text-muted-foreground mb-6">
                You've reached the maximum of {planLimits.maxStores} store(s) for your {subscription?.plan_type} plan. Upgrade to create more stores.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                </Button>
                <Button className="gradient-hero shadow-glow hover:opacity-90" asChild>
                  <Link to="/subscription">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 md:gap-4 mb-8 overflow-x-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'gradient-hero text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`font-medium text-sm hidden sm:inline ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Type' : s === 2 ? 'Details' : 'Template'}
              </span>
              {s < 3 && <div className="w-8 md:w-12 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Store Type */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-display flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Choose Store Type
              </CardTitle>
              <CardDescription>
                Select the type of store you want to create.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <StoreTypeSelector
                value={formData.storeType}
                onChange={(value) => setFormData({ ...formData, storeType: value })}
              />
              
              <StoreTypeInstructions storeType={formData.storeType} />

              <Button 
                className="w-full gradient-hero shadow-glow hover:opacity-90"
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-display flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Store Details
              </CardTitle>
              <CardDescription>
                Enter the basic information for your new store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Store Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden border">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="object-cover w-full h-full" />
                    ) : (
                      <img src="/logo.png" alt="Default Logo" className="object-cover w-full h-full opacity-60" />
                    )}
                  </div>
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                </div>
              </div>

              {/* Store Banner Upload */}
              <div className="space-y-2">
                <Label htmlFor="banner">Store Banner</Label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-12 bg-muted rounded flex items-center justify-center overflow-hidden border">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner Preview" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Banner</span>
                    )}
                  </div>
                  <Input id="banner" type="file" accept="image/*" onChange={handleBannerChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Store"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Store URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm whitespace-nowrap">dropstore.app/shop/</span>
                  <Input
                    id="slug"
                    placeholder="my-awesome-store"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your store..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  className="flex-1 gradient-hero shadow-glow hover:opacity-90"
                  onClick={() => setStep(3)}
                  disabled={!formData.name.trim()}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Template */}
        {step === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Choose a Template</CardTitle>
              <CardDescription>
                Select a design template for your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, template: template.id })}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      formData.template === template.id
                        ? 'border-primary bg-secondary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div 
                      className="w-full h-20 rounded-lg mb-3"
                      style={{ backgroundColor: template.color }}
                    />
                    <h4 className="font-medium text-foreground">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    {formData.template === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 gradient-hero rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button 
                  className="flex-1 gradient-hero shadow-glow hover:opacity-90"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Store
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}