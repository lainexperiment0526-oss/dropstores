import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WelcomeModal from './WelcomeModal';
import { AnalyticsCards, OrderStatusCards } from '@/components/dashboard/AnalyticsCards';
import { MerchantEarnings } from '@/components/dashboard/MerchantEarnings';
import { useSubscription } from '@/hooks/useSubscription';
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';
import { PiAuthButton } from '@/components/auth/PiAuthButton';
import {
  Store, 
  Plus, 
  Settings, 
  LogOut,
  ExternalLink,
  Loader2,
  Sparkles,
  Trash2,
  Crown,
  Globe,
  Download,
  Building,
  Lock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_published: boolean | null;
  store_type: string | null;
  owner_id: string;
  created_at: string;
}

interface OrderData {
  total: number;
  status: string;
}

interface ProductData {
  id: string;
  store_id: string;
}

const storeTypeIcons = {
  physical: Building,
  online: Globe,
  digital: Download,
};

function Dashboard() {
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isActive, isLoading: subscriptionLoading, subscription, daysRemaining } = useSubscription();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);
  const [deleteModalStore, setDeleteModalStore] = useState<StoreData | null>(null);

  const handleDeleteStore = async () => {
    if (!deleteModalStore) return;
    setDeletingStoreId(deleteModalStore.id);
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', deleteModalStore.id);
      if (error) throw error;
      setStores((prev) => prev.filter((s) => s.id !== deleteModalStore.id));
      setDeleteModalStore(null);
    } catch (error) {
      alert('Failed to delete store.');
      console.error('Delete store error:', error);
    } finally {
      setDeletingStoreId(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch stores
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (storesError) throw storesError;
      setStores(storesData || []);

      // Fetch all orders for user's stores
      if (storesData && storesData.length > 0) {
        const storeIds = storesData.map(s => s.id);
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total, status')
          .in('store_id', storeIds);
        
        if (!ordersError) setOrders(ordersData || []);

        // Fetch all products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, store_id')
          .in('store_id', storeIds);
        
        if (!productsError) setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const analyticsData = {
    totalRevenue,
    totalOrders,
    totalProducts: products.length,
    averageOrderValue,
    revenueChange: 12, // Placeholder - would need historical data
    ordersChange: 8,   // Placeholder
    pendingOrders,
    completedOrders,
  };

  if (authLoading || subscriptionLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <WelcomeModal open={welcomeOpen} onOpenChange={setWelcomeOpen} userName={user?.user_metadata?.full_name} />
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent">
                  <img src="https://i.ibb.co/rRN0sS7y/favicon.png" alt="App Logo" className="w-10 h-10 object-contain" />
                </div>
                <span className="text-xl font-display font-bold text-foreground hidden sm:inline">Drop Store</span>
              </Link>

              <div className="flex items-center gap-2">
                <PiAuthButton showRewardOption={false} />
                <Button variant="outline" size="sm" asChild>
                  <Link to="/stores">
                    <Store className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Store Directory</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/support">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">AI Support</span>
                  </Link>
                </Button>
                {isActive ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/subscription">
                      <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="hidden sm:inline">{subscription?.plan_type} ({daysRemaining}d)</span>
                    </Link>
                  </Button>
                ) : (
                  <Button variant="default" size="sm" className="gradient-hero" asChild>
                    <Link to="/subscription">
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Get Started</span>
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Subscription Status Banner */}
          {subscriptionLoading ? (
            <Card className="mb-8 bg-muted">
              <CardContent className="py-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading subscription...</span>
                </div>
              </CardContent>
            </Card>
          ) : subscription ? (
            // Active or Expired Subscription
            <Card className={`mb-8 ${isActive ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'}`}>
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full ${isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'} flex items-center justify-center flex-shrink-0`}>
                      <Crown className={`w-6 h-6 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isActive ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'}`}>
                          {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} Plan
                        </h3>
                        <Badge variant={isActive ? 'default' : 'destructive'} className="text-xs">
                          {isActive ? 'Active' : 'Expired'}
                        </Badge>
                      </div>
                      <div className={`text-sm ${isActive ? 'text-green-700 dark:text-green-200' : 'text-orange-700 dark:text-orange-200'} space-y-1`}>
                        {isActive ? (
                          <>
                            <p className="flex items-center gap-2">
                              <span>Expires in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong></span>
                              {daysRemaining <= 7 && (
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                              )}
                            </p>
                            <p className="text-xs opacity-75">
                              Started: {new Date(subscription.started_at).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">Your subscription has expired</p>
                            <p className="text-xs opacity-75">
                              Expired on: {new Date(subscription.expires_at).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    {isActive ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto border-green-500 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20" 
                          asChild
                        >
                          <Link to="/subscription">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Upgrade
                          </Link>
                        </Button>
                        {daysRemaining <= 7 && (
                          <Button 
                            size="sm"
                            className="w-full sm:w-auto gradient-hero" 
                            asChild
                          >
                            <Link to="/subscription">
                              <Crown className="w-4 h-4 mr-2" />
                              Renew Now
                            </Link>
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        className="w-full sm:w-auto gradient-hero shadow-glow hover:opacity-90" 
                        asChild
                      >
                        <Link to="/subscription">
                          <Crown className="w-4 h-4 mr-2" />
                          Renew Subscription
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // No Subscription (Free Plan)
            <Card className="mb-8 border-primary/50 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">Free Plan</h3>
                        <Badge variant="secondary" className="text-xs">Limited</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        You're using the Free plan with limited features
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• 1 Physical Store only</li>
                        <li>• 1 Product listing</li>
                        <li>• Basic features</li>
                      </ul>
                    </div>
                  </div>
                  <Button className="gradient-hero shadow-glow hover:opacity-90 w-full sm:w-auto" asChild>
                    <Link to="/subscription">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Manage your stores and track your business growth.
            </p>
          </div>

          {/* Analytics Cards */}
          <div className="mb-8">
            <AnalyticsCards data={analyticsData} />
          </div>

          {/* Order Status */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Status</h2>
            <OrderStatusCards pending={pendingOrders} completed={completedOrders} />
          </div>

          {/* Merchant Earnings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Earnings & Withdrawals</h2>
            <MerchantEarnings />
          </div>

          {/* Stores Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Your Stores</h2>
            {isActive ? (
              <Button className="gradient-hero shadow-glow hover:opacity-90 w-full sm:w-auto" asChild>
                <Link to="/create-store">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Store
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full sm:w-auto" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Create Store (Locked)
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : stores.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  {isActive ? (
                    <Sparkles className="w-8 h-8 text-primary" />
                  ) : (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {isActive ? 'Create Your First Store' : 'Subscription Required'}
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {isActive 
                    ? 'Get started by creating your first online store. Choose a template, add your products, and start selling!'
                    : 'Subscribe to a plan to create stores and unlock all features.'}
                </p>
                {isActive ? (
                  <Button className="gradient-hero shadow-glow hover:opacity-90" asChild>
                    <Link to="/create-store">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Store
                    </Link>
                  </Button>
                ) : (
                  <Button className="gradient-hero shadow-glow hover:opacity-90" asChild>
                    <Link to="/subscription">
                      <Crown className="w-4 h-4 mr-2" />
                      View Plans
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => {
                const StoreTypeIcon = storeTypeIcons[store.store_type as keyof typeof storeTypeIcons] || Globe;
                return (
                  <Card key={store.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {store.logo_url ? (
                            <img 
                              src={store.logo_url} 
                              alt={store.name} 
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
                              <Store className="w-6 h-6 text-primary-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <CardTitle className="text-lg truncate">{store.name}</CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1">
                              <StoreTypeIcon className="w-3 h-3" />
                              {store.store_type || 'online'}
                            </CardDescription>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          store.is_published 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {store.is_published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {store.description || 'No description yet'}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={`/store/${store.id}`}>
                            <Settings className="w-4 h-4 mr-1" />
                            Manage
                          </Link>
                        </Button>
                        {store.is_published && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/shop/${store.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingStoreId === store.id}
                          onClick={() => setDeleteModalStore(store)}
                        >
                          {deletingStoreId === store.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteModalStore} onOpenChange={(open) => !open && setDeleteModalStore(null)}>
          <DialogContent>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold">Delete Store</h2>
              <p>Are you sure you want to delete <span className="font-semibold">{deleteModalStore?.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeleteModalStore(null)} disabled={!!deletingStoreId}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteStore} disabled={!!deletingStoreId}>
                  {deletingStoreId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default Dashboard;