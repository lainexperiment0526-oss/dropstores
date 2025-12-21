import { useEffect, useRef } from 'react';
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';

interface InterstitialAdTriggerProps {
  /**
   * Trigger condition - when this changes to true, an ad may be shown
   */
  trigger?: boolean;
  
  /**
   * Action counter - show ad every N actions
   * For example, every 3 page views or every 5 product views
   */
  actionCount?: number;
  
  /**
   * Show ad every N actions (works with actionCount)
   */
  showEvery?: number;
  
  /**
   * Delay in milliseconds before showing the ad
   */
  delay?: number;
}

export function InterstitialAdTrigger({
  trigger = false,
  actionCount,
  showEvery = 3,
  delay = 1000,
}: InterstitialAdTriggerProps) {
  const { showInterstitialAd, config } = usePiAdNetwork();
  const lastTriggerRef = useRef<number>(0);

  useEffect(() => {
    if (!config.enabled || !config.interstitialEnabled) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    // Trigger-based ad showing
    if (trigger && !lastTriggerRef.current) {
      lastTriggerRef.current = Date.now();
      timeoutId = setTimeout(() => {
        showInterstitialAd().catch(console.error);
      }, delay);
    }

    // Action count-based ad showing
    if (actionCount && actionCount > 0 && actionCount % showEvery === 0) {
      timeoutId = setTimeout(() => {
        showInterstitialAd().catch(console.error);
      }, delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [trigger, actionCount, showEvery, delay, config, showInterstitialAd]);

  // This component doesn't render anything
  return null;
}
