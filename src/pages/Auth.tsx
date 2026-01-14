import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Auth() {
  const { login, isLoading, isAuthenticated, isPiBrowser, isSdkReady } = useAuth();
  const { showInterstitialAd, canShowAd } = usePiAdNetwork();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Show ad on page visit
  useEffect(() => {
    if (!isAuthenticated && canShowAd) {
      showInterstitialAd().catch((err) => {
        console.log('Ad not shown on auth page:', err);
      });
    }
  }, [canShowAd, showInterstitialAd, isAuthenticated]);

  const handlePiLogin = async () => {
    if (isConnecting) {
      return;
    }

    setIsConnecting(true);
    setAuthError(''); // Clear any previous errors
    
    try {
      await login();
      toast.success('Successfully connected with Pi Network!');
      
      // Try to show an interstitial ad after successful auth (non-blocking)
      if (isPiBrowser && canShowAd) {
        console.log('Attempting to show welcome ad...');
        showInterstitialAd().catch((err) => {
          console.log('Ad not shown:', err);
          // Continue to dashboard even if ad fails
        });
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to connect. Please try again.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow bg-transparent">
              <img 
                src="https://i.ibb.co/rRN0sS7y/favicon.png" 
                alt="Drop Store Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-foreground">Drop Store</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Connect with Pi Network to access your dashboard</p>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle>Sign in with Pi Network</CardTitle>
            <CardDescription>
              Use your Pi Network account to authenticate securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SDK Status Indicator */}
            {isSdkReady && (
              <Alert variant={isPiBrowser ? "default" : "destructive"} className="mb-4">
                {isPiBrowser ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {isPiBrowser 
                    ? "Pi Browser detected. Ready for authentication."
                    : "Not in Pi Browser. Demo mode will be used for testing."}
                </AlertDescription>
              </Alert>
            )}

            {/* Error display with retry option */}
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{authError}</p>
                  {authError.includes('timeout') && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePiLogin}
                        disabled={isConnecting}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePiLogin}
              disabled={isConnecting || isLoading || !isSdkReady}
              className="w-full h-14 text-lg gradient-primary hover:opacity-90 transition-opacity"
              title={!isSdkReady ? "Waiting for Pi SDK to load..." : ""}
            >
              {!isSdkReady ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting to Pi Network...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {isPiBrowser ? 'Connect with Pi Network' : 'Continue in Demo Mode'}
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">
                  Secure authentication
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              By connecting, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have a Pi account?{' '}
          <a
            href="https://minepi.com/Wain2020"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Download Pi Network
          </a>
        </p>

        {!isPiBrowser && isSdkReady && (
          <p className="text-center text-xs text-muted-foreground mt-4 px-4">
            For full functionality, open this app in the{' '}
            <a
              href="https://minepi.com/Wain2020"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Pi Browser
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
