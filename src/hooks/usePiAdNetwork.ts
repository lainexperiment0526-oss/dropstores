import { useState, useCallback, useEffect } from 'react';
import { isPiAdReady, showPiAd, isPiAvailable, isPiAdNetworkSupported, requestPiAd, verifyRewardedAdStatus } from '@/lib/pi-sdk';
import { usePiAuth } from '@/contexts/PiAuthContext';
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
  const [adNetworkSupported, setAdNetworkSupported] = useState<boolean | null>(null);
  const { piAccessToken } = usePiAuth(); // Get access token for ad verification
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

  // Check AdNetwork support on mount
  useEffect(() => {
    const checkSupport = async () => {
      if (!adNetworkEnabled || !isPiAvailable()) {
        setAdNetworkSupported(false);
        return;
      }
      
      const supported = await isPiAdNetworkSupported();
      setAdNetworkSupported(supported);
      console.log('Pi AdNetwork support status:', supported);
    };
    
    checkSupport();
  }, [adNetworkEnabled]);

  // Update session storage when adSession changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adSession));
    } catch (error) {
      console.error('Failed to save ad session:', error);
    }
  }, [adSession]);

  const canShowAd = useCallback((): boolean => {
    if (!adNetworkEnabled || !isPiAvailable() || adNetworkSupported === false) {
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
  }, [adNetworkEnabled, adSession, adNetworkSupported]);

  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    if (!interstitialEnabled) {
      console.log('Interstitial ads are disabled');
      return false;
    }

    if (!canShowAd()) {
      console.log('Cannot show ad - cooldown or frequency cap active');
      return false;
    }

    if (!isPiAvailable()) {
      console.warn('Pi SDK not available for interstitial ad');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Checking if interstitial ad is ready...');
      let ready = await isPiAdReady('interstitial');
      
      // If not ready, try to request one
      if (!ready) {
        console.log('Ad not ready, requesting...');
        const requestResult = await requestPiAd('interstitial');
        if (requestResult === 'AD_LOADED') {
          ready = true;
        }
      }
      
      if (!ready) {
        console.log('Interstitial ad not ready after request');
        setIsLoading(false);
        return false;
      }

      console.log('Showing interstitial ad...');
      const result = await showPiAd('interstitial');
      
      if (result?.adId && result.result === 'AD_CLOSED') {
        console.log('Interstitial ad shown successfully:', result.adId);
        setAdSession(prev => ({
          adsShownCount: prev.adsShownCount + 1,
          lastAdShownAt: Date.now(),
        }));
        setIsLoading(false);
        return true;
      }

      console.log('Interstitial ad did not complete:', result);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      setIsLoading(false);
      return false;
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
      console.log('Cannot show ad - cooldown or frequency cap active');
      toast.info('Ads are temporarily unavailable. Please try again later.');
      return { success: false };
    }

    if (!isPiAvailable()) {
      console.warn('Pi SDK not available for rewarded ad');
      toast.error('Ad service not available');
      return { success: false };
    }

    setIsLoading(true);
    try {
      console.log('Checking if rewarded ad is ready...');
      let ready = await isPiAdReady('rewarded');
      
      // If not ready, try to request one
      if (!ready) {
        console.log('Rewarded ad not ready, requesting...');
        const requestResult = await requestPiAd('rewarded');
        if (requestResult === 'AD_LOADED') {
          ready = true;
        }
      }
      
      if (!ready) {
        console.log('Rewarded ad not ready after request');
        toast.error('Ad not available right now. Please try again in a moment.');
        setIsLoading(false);
        return { success: false };
      }

      console.log('Showing rewarded ad...');
      const result = await showPiAd('rewarded');
      
      if (result?.adId && result.result === 'AD_REWARDED') {
        console.log('Rewarded ad completed successfully:', result.adId);
        
        // SECURITY: Verify ad status with Pi Platform API as required by official docs
        if (result.adId && piAccessToken) {
          console.log('Verifying ad reward with Pi Platform API...');
          try {
            const verification = await verifyRewardedAdStatus(result.adId, piAccessToken);
            
            // Handle verification result - can be boolean or object with rewarded property
            const isRewarded = typeof verification === 'boolean' 
              ? verification 
              : (verification as { rewarded?: boolean; error?: string })?.rewarded;
            
            if (isRewarded) {
              console.log('✅ Ad reward verified by Pi Platform API');
              setAdSession(prev => ({
                adsShownCount: prev.adsShownCount + 1,
                lastAdShownAt: Date.now(),
              }));
              
              setIsLoading(false);
              return {
                success: true,
                adId: result.adId,
                rewarded: true,
              };
            } else {
              const errorMsg = typeof verification === 'object' 
                ? (verification as { error?: string })?.error 
                : 'Verification failed';
              console.warn('❌ Ad reward not verified by Pi Platform API:', errorMsg);
              toast.error('Unable to verify ad reward. Please try again.');
              setIsLoading(false);
              return { success: false };
            }
          } catch (error) {
            console.error('Failed to verify ad reward:', error);
            toast.error('Failed to verify ad reward. Please try again.');
            setIsLoading(false);
            return { success: false };
          }
        } else {
          console.warn('Missing adId or access token for verification');
          setIsLoading(false);
          return {
            success: true,
            adId: result.adId,
            rewarded: false, // Cannot verify without proper credentials
          };
        }
      }

      console.log('Rewarded ad did not complete properly:', result);
      toast.error('Failed to complete ad. Please try again.');
      setIsLoading(false);
      return { success: false };
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
      return { success: false };
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
    adNetworkSupported,
    config: {
      enabled: adNetworkEnabled,
      interstitialEnabled,
      rewardedEnabled,
      cooldownMinutes: AD_CONFIG.cooldownMinutes!,
      frequencyCap: AD_CONFIG.frequencyCap!,
    },
  };
}
