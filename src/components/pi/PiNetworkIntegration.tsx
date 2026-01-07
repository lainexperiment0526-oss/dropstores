import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Zap, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Gift,
  TrendingUp
} from 'lucide-react';
import { 
  piSDK, 
  authenticateWithPi, 
  createPiPayment, 
  PiAdNetwork,
  PiAuthResult, 
  PiPaymentData,
  PiPaymentDTO 
} from '@/lib/pi-sdk';

interface PiNetworkIntegrationProps {
  onAuthSuccess?: (authResult: PiAuthResult) => void;
  onPaymentSuccess?: (paymentId: string, txid: string) => void;
  onAdRewardEarned?: (adId: string, reward: any) => void;
}

export const PiNetworkIntegration: React.FC<PiNetworkIntegrationProps> = ({
  onAuthSuccess,
  onPaymentSuccess,
  onAdRewardEarned
}) => {
  const { toast } = useToast();
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authResult, setAuthResult] = useState<PiAuthResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [piFeatures, setPiFeatures] = useState<string[]>([]);
  const [adNetworkSupported, setAdNetworkSupported] = useState(false);
  
  // Initialize Pi SDK on component mount
  useEffect(() => {
    initializePiSDK();
  }, []);

  const initializePiSDK = async () => {
    setIsLoading(true);
    try {
      const success = await piSDK.init(false); // Force production mode
      setIsInitialized(success);
      
      if (success) {
        const features = piSDK.getNativeFeatures();
        setPiFeatures(features);
        setAdNetworkSupported(piSDK.isAdNetworkSupported());
        
        toast({
          title: "Pi Network Ready",
          description: `Connected to Pi Mainnet with ${features.length} features`,
        });
      } else {
        toast({
          title: "Pi Network Unavailable",
          description: "Please open this app in Pi Browser",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to initialize Pi SDK:', error);
      toast({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleAuthentication = async () => {
    if (!isInitialized) {
      toast({
        title: "Not Ready",
        description: "Pi SDK is not initialized",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authenticateWithPi(
        (payment: PiPaymentDTO) => {
          toast({
            title: "Incomplete Payment Found",
            description: `Payment ${payment.identifier} needs completion`,
            variant: "destructive"
          });
        },
        ['username', 'payments', 'wallet_address']
      );

      if (result) {
        setAuthResult(result);
        setIsAuthenticated(true);
        onAuthSuccess?.(result);
        
        toast({
          title: "Authentication Successful",
          description: `Welcome, ${result.user.username}!`,
        });
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleTestPayment = async () => {
    if (!isAuthenticated || !authResult) {
      toast({
        title: "Not Authenticated",
        description: "Please authenticate first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const paymentData: PiPaymentData = {
        amount: 1.0,
        memo: "Test payment from DropStore",
        metadata: {
          orderId: Date.now(),
          productType: "test"
        }
      };

      createPiPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          toast({
            title: "Payment Created",
            description: `Payment ${paymentId} ready for approval`,
          });
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          toast({
            title: "Payment Submitted",
            description: `Transaction ${txid} submitted to blockchain`,
          });
          onPaymentSuccess?.(paymentId, txid);
        },
        onCancel: (paymentId: string) => {
          toast({
            title: "Payment Cancelled",
            description: `Payment ${paymentId} was cancelled`,
            variant: "destructive"
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Payment Error",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleShowInterstitialAd = async () => {
    if (!adNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update Pi Browser or check app approval",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await PiAdNetwork.showInterstitialAd();
      
      if (response.result === 'AD_CLOSED') {
        toast({
          title: "Ad Completed",
          description: "Interstitial ad was viewed successfully",
        });
      } else {
        toast({
          title: "Ad Error",
          description: `Ad result: ${response.result}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      toast({
        title: "Ad Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleShowRewardedAd = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate to view rewarded ads",
        variant: "destructive"
      });
      return;
    }

    if (!adNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update Pi Browser or check app approval",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await PiAdNetwork.showRewardedAd();
      
      if (response.result === 'AD_REWARDED') {
        toast({
          title: "Reward Earned!",
          description: "You've earned a reward for watching the ad",
        });
        
        if (response.adId) {
          onAdRewardEarned?.(response.adId, { type: 'ad_reward', value: 1 });
        }
      } else if (response.result === 'AD_CLOSED') {
        toast({
          title: "Ad Closed",
          description: "Ad was closed without reward",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Ad Error",
          description: `Ad result: ${response.result}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      toast({
        title: "Ad Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Pi Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pi Network Status
          </CardTitle>
          <CardDescription>
            Production integration with Pi Mainnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={isInitialized ? "default" : "destructive"}>
              {isInitialized ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {isInitialized ? "SDK Ready" : "SDK Not Ready"}
            </Badge>
            
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
            
            <Badge variant={adNetworkSupported ? "default" : "secondary"}>
              {adNetworkSupported ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {adNetworkSupported ? "Ads Supported" : "Ads Not Available"}
            </Badge>
          </div>

          {piFeatures.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Available Features:</p>
              <div className="flex flex-wrap gap-1">
                {piFeatures.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Information */}
      {isAuthenticated && authResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Pi User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Username</p>
                <p className="text-sm text-muted-foreground">{authResult.user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono text-xs">
                  {authResult.user.uid.substring(0, 16)}...
                </p>
              </div>
              {authResult.user.wallet_address && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Wallet Address</p>
                  <p className="text-sm text-muted-foreground font-mono text-xs">
                    {authResult.user.wallet_address}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Authentication */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleAuthentication}
              disabled={isLoading || !isInitialized || isAuthenticated}
              className="w-full"
            >
              {isLoading ? "Authenticating..." : isAuthenticated ? "Authenticated" : "Authenticate with Pi"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Payment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Test Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestPayment}
              disabled={isLoading || !isAuthenticated}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Send 1 Pi"}
            </Button>
          </CardContent>
        </Card>

        {/* Interstitial Ad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Interstitial Ad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleShowInterstitialAd}
              disabled={isLoading || !adNetworkSupported}
              className="w-full"
              variant="outline"
            >
              {isLoading ? "Loading..." : "Show Ad"}
            </Button>
          </CardContent>
        </Card>

        {/* Rewarded Ad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewarded Ad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleShowRewardedAd}
              disabled={isLoading || !isAuthenticated || !adNetworkSupported}
              className="w-full"
              variant="outline"
            >
              {isLoading ? "Loading..." : "Watch for Reward"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {!isInitialized && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pi Browser Required</AlertTitle>
          <AlertDescription>
            This app requires the Pi Browser to function. Please open it in the official Pi Browser app.
          </AlertDescription>
        </Alert>
      )}

      {isInitialized && !adNetworkSupported && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ad Network Unavailable</AlertTitle>
          <AlertDescription>
            The Pi Ad Network is not available. This may be due to an older Pi Browser version or pending app approval.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PiNetworkIntegration;