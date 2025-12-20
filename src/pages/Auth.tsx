import { useState, useEffect } from 'react';
import TermsPrivacyModal from './TermsPrivacyModal';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePiAuth } from '@/contexts/PiAuthContext';
import { Button } from '@/components/ui/button';
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

  const { user } = useAuth();
  const { isPiAvailable, signInWithPi, isLoading: piLoading } = usePiAuth();
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
              <img src="https://i.ibb.co/C5PXP14b/Gemini-Generated-Image-9v9qpu9v9qpu9v9q-1-removebg-preview.png" alt="App Logo" className="w-10 h-10 object-contain" />
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
              {/* Pi Network Login Only */}
              {isPiAvailable && (
                <>
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={signInWithPi}
                      disabled={piLoading}
                    >
                      {piLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Continue with Pi Network
                    </Button>
                  </div>
                  {/* Terms and Privacy Modal Link Below Button */}
                  <div className="mt-4 text-center">
                    <span className="text-xs text-muted-foreground">
                      By continuing, you agree to our
                    </span>{' '}
                    <TermsPrivacyModal />
                  </div>
                </>
              )}
              
              {!isPiAvailable && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Please open this app in Pi Browser to continue with Pi Network authentication.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://minepi.com', '_blank')}
                  >
                    Learn about Pi Network
                  </Button>
                </div>
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
    </div>
  );
}
