import { useState, useCallback, useEffect } from 'react';
import { isPiAdReady, showPiAd, isPiAvailable } from '@/lib/pi-sdk';
import { toast } from 'sonner';

interface AdConfig {
  cooldownMinutes?: number;
  frequencyCap?: number;
}

interface AdSession {
  adsShownCount: number;
  lastAdShownAt: number | null;
}

const AD_CONFIG: AdConfig = {
  cooldownMinutes: parseInt(import.meta.env.VITE_PI_AD_COOLDOWN_MINUTES || '5'),
  frequencyCap: parseInt(import.meta.env.VITE_PI_AD_FREQUENCY_CAP || '3'),
};

const SESSION_STORAGE_KEY = 'pi_ad_session';

export function usePiAdNetwork() {
  const [isLoading, setIsLoading] = useState(false);
  const [adSession, setAdSession] = useState<AdSession>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { adsShownCount: 0, lastAdShownAt: null };
    } catch {
      return { adsShownCount: 0, lastAdShownAt: null };
    }
  });

  const adNetworkEnabled = import.meta.env.VITE_PI_AD_NETWORK_ENABLED === 'true';
  const interstitialEnabled = import.meta.env.VITE_PI_INTERSTITIAL_ADS_ENABLED === 'true';
  const rewardedEnabled = import.meta.env.VITE_PI_REWARDED_ADS_ENABLED === 'true';

  // Update session storage when adSession changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adSession));
    } catch (error) {
      console.error('Failed to save ad session:', error);
    }
  }, [adSession]);

  const canShowAd = useCallback((): boolean => {
    if (!adNetworkEnabled || !isPiAvailable()) {
      return false;
    }

    // Check frequency cap
    if (adSession.adsShownCount >= AD_CONFIG.frequencyCap!) {
      console.log('Ad frequency cap reached:', AD_CONFIG.frequencyCap);
      return false;
    }

    // Check cooldown
    if (adSession.lastAdShownAt) {
      const cooldownMs = AD_CONFIG.cooldownMinutes! * 60 * 1000;
      const timeSinceLastAd = Date.now() - adSession.lastAdShownAt;
      if (timeSinceLastAd < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastAd) / 60000);
        console.log(`Ad cooldown active: ${remainingMinutes} minutes remaining`);
        return false;
      }
    }

    return true;
  }, [adNetworkEnabled, adSession]);

  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    if (!interstitialEnabled) {
      console.log('Interstitial ads are disabled');
      return false;
    }

    if (!canShowAd()) {
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Checking if interstitial ad is ready...');
      const ready = await isPiAdReady('interstitial');
      
      if (!ready) {
        console.log('Interstitial ad not ready');
        return false;
      }

      console.log('Showing interstitial ad...');
      const result = await showPiAd('interstitial');
      
      if (result?.adId) {
        console.log('Interstitial ad shown successfully:', result.adId);
        setAdSession(prev => ({
          adsShownCount: prev.adsShownCount + 1,
          lastAdShownAt: Date.now(),
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [interstitialEnabled, canShowAd]);

  const showRewardedAd = useCallback(async (): Promise<{
    success: boolean;
    adId?: string;
    rewarded?: boolean;
  }> => {
    if (!rewardedEnabled) {
      console.log('Rewarded ads are disabled');
      return { success: false };
    }

    if (!canShowAd()) {
      toast.info('Ads are temporarily unavailable. Please try again later.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      console.log('Checking if rewarded ad is ready...');
      const ready = await isPiAdReady('rewarded');
      
      if (!ready) {
        console.log('Rewarded ad not ready');
        toast.error('Ad not available right now. Please try again in a moment.');
        return { success: false };
      }

      console.log('Showing rewarded ad...');
      const result = await showPiAd('rewarded');
      
      if (result?.adId) {
        console.log('Rewarded ad shown:', result.adId, 'Rewarded:', result.reward);
        setAdSession(prev => ({
          adsShownCount: prev.adsShownCount + 1,
          lastAdShownAt: Date.now(),
        }));
        
        return {
          success: true,
          adId: result.adId,
          rewarded: result.reward,
        };
      }

      toast.error('Failed to show ad. Please try again.');
      return { success: false };
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      toast.error('Something went wrong. Please try again.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [rewardedEnabled, canShowAd]);

  const resetSession = useCallback(() => {
    setAdSession({ adsShownCount: 0, lastAdShownAt: null });
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset ad session:', error);
    }
  }, []);

  return {
    showInterstitialAd,
    showRewardedAd,
    canShowAd: canShowAd(),
    isLoading,
    adSession,
    resetSession,
    config: {
      enabled: adNetworkEnabled,
      interstitialEnabled,
      rewardedEnabled,
      cooldownMinutes: AD_CONFIG.cooldownMinutes!,
      frequencyCap: AD_CONFIG.frequencyCap!,
    },
  };
}
