import { useState, useEffect } from 'react';
import TermsPrivacyModal from './TermsPrivacyModal';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePiAuth } from '@/contexts/PiAuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Mail, Lock, User, ArrowLeft, Loader2, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ecosystemOpen, setEcosystemOpen] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const { isPiAvailable, signInWithPiScopes, isLoading: piLoading } = usePiAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup');
  }, [searchParams]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error.message || 'Please check your credentials.',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Signed in successfully!',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Sign in failed. Please try again.',
      });
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign up failed',
          description: error.message || 'Please try again.',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Account created! Please sign in.',
        });
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Sign up failed. Please try again.',
      });
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Pi Auth Only */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow bg-transparent">
              <img src="https://i.ibb.co/rRN0sS7y/favicon.png" alt="App Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">
                Welcome
              </CardTitle>
              <CardDescription>
                Sign in to manage your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showEmailForm ? (
                <>
                  {/* Primary Pi Network Login */}
                  <div className="space-y-4">
                    <Button
                      type="button"
                      className="w-full h-12 gradient-hero shadow-glow text-lg font-semibold"
                      onClick={() => {
                        if (isPiAvailable) {
                          signInWithPiScopes(['username', 'payments', 'wallet_address']);
                        } else {
                          toast({
                            variant: 'destructive',
                            title: 'Pi Browser Required',
                            description: 'Please open this app in Pi Browser to use Pi Network authentication.',
                          });
                        }
                      }}
                      disabled={piLoading}
                    >
                      {piLoading ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      ) : null}
                      Continue with Pi Network
                    </Button>

                    {/* Terms and Privacy */}
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">
                        By continuing, you agree to our
                      </span>{' '}
                      <TermsPrivacyModal />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-xs text-muted-foreground px-2">Explore Platform</span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => setEcosystemOpen(true)}
                    >
                      Learn the Drop Ecosystem
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => navigate('/AboutPiSupplier')}
                    >
                      Pi Supplier Partner Program
                    </Button>
                  </div>

                  {!isPiAvailable && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        💡 For best experience, open in Pi Browser
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => window.open('https://minepi.com/Wain2020', '_blank')}
                      >
                        Open Pi Browser
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                /* Email Form */
                <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !email || !password}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowEmailForm(false)}
                  >
                    Back
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="max-w-md">
            <h2 className="text-3xl font-display font-bold mb-4">
              Launch Your Store in Minutes
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Join thousands of entrepreneurs who have built successful online businesses with Drop Store.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <span>Beautiful customizable templates</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <span>Easy product management</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <span>Secure checkout & payments</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <span>Analytics & insights</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl" />
      </div>
      
      {/* Ecosystem Modal */}
      <Dialog open={ecosystemOpen} onOpenChange={setEcosystemOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>The Drop Ecosystem for Business & Creators</DialogTitle>
            <DialogDescription>
              Build, sell, and get paid across fully connected Pi apps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  The Complete Pi Economy Platform
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Three powerful apps working together to help you build, sell, and earn in the Pi Network ecosystem
                </p>
              </div>
            </div>

            {/* Apps Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Droplink</h4>
                    <p className="text-xs text-muted-foreground">Traffic & Visibility</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drive massive traffic to your stores with powerful link sharing, social media integration, and viral marketing tools.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded">Link Sharing</span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded">Analytics</span>
                </div>
              </div>

              <div className="space-y-3 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">DropStore</h4>
                    <p className="text-xs text-muted-foreground">Complete Storefront</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build beautiful stores for physical, digital, and online products. Full inventory management and customization.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">Physical</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">Digital</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">Online</span>
                </div>
              </div>

              <div className="space-y-3 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">DropPay</h4>
                    <p className="text-xs text-muted-foreground">Pi Payments</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure Pi payment processing, checkout links, merchant payouts, and earnings management.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded">Payments</span>
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded">Payouts</span>
                </div>
              </div>
            </div>

            {/* Flow Section */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-center">🔄 Complete Business Flow</h4>
              <div className="flex items-center justify-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border">
                  <span>🔗</span>
                  <span>Exposure</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border">
                  <span>🛒</span>
                  <span>Selling</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border">
                  <span>💳</span>
                  <span>Payment</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border">
                  <span>💰</span>
                  <span>Earnings</span>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="space-y-4">
              <h4 className="font-semibold text-center">💡 Perfect For</h4>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="text-center space-y-2 p-3 bg-background rounded-lg border">
                  <div className="text-2xl">🎨</div>
                  <div className="font-medium">Creators</div>
                  <div className="text-muted-foreground">Share content & earn from your audience</div>
                </div>
                <div className="text-center space-y-2 p-3 bg-background rounded-lg border">
                  <div className="text-2xl">🏪</div>
                  <div className="font-medium">Merchants</div>
                  <div className="text-muted-foreground">Sell products & manage your business</div>
                </div>
                <div className="text-center space-y-2 p-3 bg-background rounded-lg border">
                  <div className="text-2xl">🚀</div>
                  <div className="font-medium">Entrepreneurs</div>
                  <div className="text-muted-foreground">Build & scale your Pi-powered venture</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Build. Sell. Get Paid. All in Pi.</span>
            <div className="flex gap-2">
              <Button onClick={() => setEcosystemOpen(false)} variant="outline">Learn More</Button>
              <Button onClick={() => { setEcosystemOpen(false); navigate('/dashboard'); }}>Get Started</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
