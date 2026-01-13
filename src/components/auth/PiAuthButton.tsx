import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePiAuth } from '@/contexts/PiAuthContext';
import { RewardedAdButton } from '@/components/ads/RewardedAdButton';
import { Loader2, Wallet, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface PiAuthButtonProps {
  onSuccess?: () => void;
  showRewardOption?: boolean;
  className?: string;
}

export function PiAuthButton({ 
  onSuccess, 
  showRewardOption = true,
  className 
}: PiAuthButtonProps) {
  const { 
    signInWithPi, 
    isPiAuthenticated, 
    piUser, 
    isLoading,
    offerAuthReward 
  } = usePiAuth();
  const [showReward, setShowReward] = useState(false);

  const handleSignIn = async () => {
    await signInWithPi(false); // Don't auto-navigate
    
    if (showRewardOption) {
      setShowReward(true);
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleRewardClaimed = async (adId: string) => {
    console.log('Welcome bonus ad completed:', adId);
    toast.success('🎉 Welcome! You earned 50 bonus points!');
    // TODO: Verify on backend and credit account
    setShowReward(false);
  };

  if (isPiAuthenticated && piUser) {
    if (showReward) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Welcome Bonus!
            </CardTitle>
            <CardDescription>
              Watch a quick ad to earn 50 bonus points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RewardedAdButton
              onReward={handleRewardClaimed}
              buttonText="Claim Welcome Bonus"
              rewardText="50 bonus points earned!"
              className="w-full"
            />
            <Button 
              variant="ghost" 
              onClick={() => setShowReward(false)}
              className="w-full mt-2"
            >
              Skip for now
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{piUser.username}</span>
        </div>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Sign in with Pi
        </>
      )}
    </Button>
  );
}
