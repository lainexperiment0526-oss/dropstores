import { usePiAuth } from '@/contexts/PiAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PiAuthTest() {
  const { 
    piUser, 
    piAccessToken,
      walletAddress,
    isPiAvailable, 
    isPiAuthenticated,
    isLoading,
    signInWithPi,
    fetchWalletAddress
  } = usePiAuth();

  const handleAuthenticate = async () => {
    try {
      await signInWithPi(false); // Don't navigate after auth
      toast.success('Pi Authentication successful!');
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            Pi Network Authentication Test
          </CardTitle>
          <CardDescription>
            Test Pi Network authentication and retrieve user information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pi SDK Status */}
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            {isPiAvailable ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Pi SDK Available</span>
                <Badge className="ml-auto bg-green-500 text-white">Ready</Badge>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium">Pi SDK Not Available</span>
                <Badge variant="destructive" className="ml-auto">Unavailable</Badge>
              </>
            )}
          </div>

          {/* Authentication Button */}
          {!isPiAuthenticated ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to authenticate with Pi Network. This will open the Pi authentication window.
              </p>
              <Button 
                onClick={handleAuthenticate}
                disabled={!isPiAvailable || isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Authenticate with Pi Network
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Authenticated Status */}
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Authenticated</span>
              </div>

              {/* User Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">User Information</h3>
                
                {/* Username */}
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <User className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-mono font-semibold">{piUser?.username || 'N/A'}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <User className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">User ID (UID)</p>
                    <p className="font-mono text-xs break-all">{piUser?.uid || 'N/A'}</p>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Wallet className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    {walletAddress ? (
                      <p className="font-mono text-xs break-all">{walletAddress}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not fetched yet</p>
                    )}
                  </div>
                </div>

                {/* Fetch Wallet Button */}
                {!walletAddress && (
                  <Button 
                    onClick={fetchWalletAddress}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching Wallet...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Fetch Wallet Address
                      </>
                    )}
                  </Button>
                )}

                {/* Access Token (truncated) */}
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Access Token</p>
                    <p className="font-mono text-xs break-all">
                      {piAccessToken 
                        ? `${piAccessToken.substring(0, 20)}...${piAccessToken.substring(piAccessToken.length - 20)}`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Re-authenticate Button */}
              <Button 
                onClick={handleAuthenticate}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Re-authenticating...
                  </>
                ) : (
                  'Re-authenticate'
                )}
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className="text-sm text-muted-foreground space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-700 dark:text-blue-300">Note:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>This app must be opened in Pi Browser for authentication to work</li>
              <li>Authentication requests username, payments, and wallet_address scopes</li>
              <li>The wallet address is fetched separately from the Pi Platform API</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
