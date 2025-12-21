import { Button } from '@/components/ui/button';
import { Loader2, Gift } from 'lucide-react';
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';
import { toast } from 'sonner';

interface RewardedAdButtonProps {
  onReward?: (adId: string) => void | Promise<void>;
  rewardText?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

export function RewardedAdButton({
  onReward,
  rewardText = 'Earn Reward',
  buttonText = 'Watch Ad',
  className,
  disabled = false,
}: RewardedAdButtonProps) {
  const { showRewardedAd, isLoading, canShowAd, config } = usePiAdNetwork();

  const handleWatchAd = async () => {
    const result = await showRewardedAd();
    
    if (result.success && result.rewarded && result.adId) {
      toast.success(rewardText || 'Reward earned!');
      
      // Call the reward callback if provided
      if (onReward) {
        try {
          await onReward(result.adId);
        } catch (error) {
          console.error('Reward callback failed:', error);
          toast.error('Failed to process reward. Please contact support.');
        }
      }
    } else if (result.success && !result.rewarded) {
      toast.info('Ad was shown but not completed. No reward granted.');
    }
  };

  if (!config.enabled || !config.rewardedEnabled) {
    return null;
  }

  return (
    <Button
      onClick={handleWatchAd}
      disabled={disabled || isLoading || !canShowAd}
      className={className}
      variant="outline"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading Ad...
        </>
      ) : (
        <>
          <Gift className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
