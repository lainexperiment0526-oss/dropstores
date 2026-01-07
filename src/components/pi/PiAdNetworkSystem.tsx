import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Gift, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Loader2,
  Star,
  Coins,
  Video,
  Monitor,
  Zap
} from 'lucide-react';
import { 
  piSDK,
  PiAdNetwork,
  AdType,
  PiAdShowResponse
} from '@/lib/pi-sdk';

interface AdReward {
  id: string;
  type: 'interstitial' | 'rewarded';
  amount: number;
  timestamp: Date;
  adId?: string;
}

interface AdStats {
  totalViewed: number;
  rewardedViewed: number;
  interstitialViewed: number;
  totalRewards: number;
  todayViewed: number;
}

interface PiAdNetworkSystemProps {
  isAuthenticated: boolean;
  userPi?: any;
  onAdReward?: (reward: AdReward) => void;
  onAdViewed?: (adType: AdType) => void;
}

export const PiAdNetworkSystem: React.FC<PiAdNetworkSystemProps> = ({
  isAuthenticated,
  userPi,
  onAdReward,
  onAdViewed
}) => {
  const { toast } = useToast();
  
  // Ad system state
  const [isAdNetworkSupported, setIsAdNetworkSupported] = useState(false);
  const [adStats, setAdStats] = useState<AdStats>({
    totalViewed: 0,
    rewardedViewed: 0,
    interstitialViewed: 0,
    totalRewards: 0,
    todayViewed: 0
  });
  const [recentRewards, setRecentRewards] = useState<AdReward[]>([]);
  const [isLoadingAd, setIsLoadingAd] = useState<{ [key in AdType]?: boolean }>({});
  const [adCooldowns, setAdCooldowns] = useState<{ [key in AdType]?: Date }>({});
  const [lastAdViewed, setLastAdViewed] = useState<{ [key in AdType]?: Date }>({});

  // Cooldown settings (in minutes)
  const AD_COOLDOWNS = {
    interstitial: parseInt(import.meta.env.VITE_PI_AD_COOLDOWN_MINUTES || '5', 10),
    rewarded: parseInt(import.meta.env.VITE_PI_AD_COOLDOWN_MINUTES || '5', 10)
  };

  // Daily frequency cap
  const DAILY_FREQUENCY_CAP = parseInt(import.meta.env.VITE_PI_AD_FREQUENCY_CAP || '3', 10);

  useEffect(() => {
    checkAdNetworkSupport();
    loadAdStats();
  }, []);

  const checkAdNetworkSupport = () => {
    const supported = PiAdNetwork.isSupported();
    setIsAdNetworkSupported(supported);
    
    if (!supported) {
      console.log('Ad Network not supported:', {
        piAvailable: piSDK.isAvailable(),
        adNetworkFeature: piSDK.isFeatureSupported('ad_network'),
        features: piSDK.getNativeFeatures()
      });
    }
  };

  const loadAdStats = () => {
    // Load from localStorage or your backend
    const savedStats = localStorage.getItem('pi_ad_stats');
    const savedRewards = localStorage.getItem('pi_ad_rewards');
    const savedCooldowns = localStorage.getItem('pi_ad_cooldowns');
    const savedLastViewed = localStorage.getItem('pi_ad_last_viewed');

    if (savedStats) {
      try {
        setAdStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Failed to load ad stats:', error);
      }
    }

    if (savedRewards) {
      try {
        const rewards = JSON.parse(savedRewards).map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
        setRecentRewards(rewards);
      } catch (error) {
        console.error('Failed to load ad rewards:', error);
      }
    }

    if (savedCooldowns) {
      try {
        const cooldowns = JSON.parse(savedCooldowns);
        const parsedCooldowns: { [key in AdType]?: Date } = {};
        Object.entries(cooldowns).forEach(([key, value]) => {
          parsedCooldowns[key as AdType] = new Date(value as string);
        });
        setAdCooldowns(parsedCooldowns);
      } catch (error) {
        console.error('Failed to load ad cooldowns:', error);
      }
    }

    if (savedLastViewed) {
      try {
        const lastViewed = JSON.parse(savedLastViewed);
        const parsedLastViewed: { [key in AdType]?: Date } = {};
        Object.entries(lastViewed).forEach(([key, value]) => {
          parsedLastViewed[key as AdType] = new Date(value as string);
        });
        setLastAdViewed(parsedLastViewed);
      } catch (error) {
        console.error('Failed to load last viewed times:', error);
      }
    }
  };

  const saveAdStats = (stats: AdStats) => {
    localStorage.setItem('pi_ad_stats', JSON.stringify(stats));
    setAdStats(stats);
  };

  const saveAdRewards = (rewards: AdReward[]) => {
    localStorage.setItem('pi_ad_rewards', JSON.stringify(rewards));
    setRecentRewards(rewards);
  };

  const saveCooldowns = (cooldowns: { [key in AdType]?: Date }) => {
    const serializable = Object.fromEntries(
      Object.entries(cooldowns).map(([key, value]) => [key, value?.toISOString()])
    );
    localStorage.setItem('pi_ad_cooldowns', JSON.stringify(serializable));
    setAdCooldowns(cooldowns);
  };

  const saveLastViewed = (lastViewed: { [key in AdType]?: Date }) => {
    const serializable = Object.fromEntries(
      Object.entries(lastViewed).map(([key, value]) => [key, value?.toISOString()])
    );
    localStorage.setItem('pi_ad_last_viewed', JSON.stringify(serializable));
    setLastAdViewed(lastViewed);
  };

  const isOnCooldown = (adType: AdType): boolean => {
    const cooldownEnd = adCooldowns[adType];
    if (!cooldownEnd) return false;
    return new Date() < cooldownEnd;
  };

  const getCooldownRemaining = (adType: AdType): number => {
    const cooldownEnd = adCooldowns[adType];
    if (!cooldownEnd) return 0;
    const remaining = cooldownEnd.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // minutes
  };

  const hasReachedDailyLimit = (): boolean => {
    return adStats.todayViewed >= DAILY_FREQUENCY_CAP;
  };

  const updateStatsForAdView = (adType: AdType, wasRewarded: boolean = false) => {
    const now = new Date();
    const today = new Date().toDateString();
    
    // Check if we need to reset daily counter
    const lastViewedToday = Object.values(lastAdViewed).some(date => 
      date && date.toDateString() === today
    );

    const newStats = {
      ...adStats,
      totalViewed: adStats.totalViewed + 1,
      todayViewed: lastViewedToday ? adStats.todayViewed + 1 : 1,
      [adType === 'rewarded' ? 'rewardedViewed' : 'interstitialViewed']: 
        adStats[adType === 'rewarded' ? 'rewardedViewed' : 'interstitialViewed'] + 1,
      totalRewards: wasRewarded ? adStats.totalRewards + 1 : adStats.totalRewards
    };

    saveAdStats(newStats);

    // Set cooldown
    const cooldownEnd = new Date(now.getTime() + AD_COOLDOWNS[adType] * 60 * 1000);
    const newCooldowns = { ...adCooldowns, [adType]: cooldownEnd };
    saveCooldowns(newCooldowns);

    // Update last viewed
    const newLastViewed = { ...lastAdViewed, [adType]: now };
    saveLastViewed(newLastViewed);

    onAdViewed?.(adType);
  };

  const addReward = (adType: AdType, adId?: string) => {
    const reward: AdReward = {
      id: `reward_${Date.now()}`,
      type: adType,
      amount: 1, // Base reward amount
      timestamp: new Date(),
      adId
    };

    const newRewards = [reward, ...recentRewards.slice(0, 19)]; // Keep last 20
    saveAdRewards(newRewards);
    onAdReward?.(reward);
  };

  const handleShowInterstitialAd = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate to view ads",
        variant: "destructive"
      });
      return;
    }

    if (!isAdNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update Pi Browser or check app approval",
        variant: "destructive"
      });
      return;
    }

    if (hasReachedDailyLimit()) {
      toast({
        title: "Daily Limit Reached",
        description: `You've reached the daily limit of ${DAILY_FREQUENCY_CAP} ads`,
        variant: "destructive"
      });
      return;
    }

    if (isOnCooldown('interstitial')) {
      const remaining = getCooldownRemaining('interstitial');
      toast({
        title: "Cooldown Active",
        description: `Please wait ${remaining} minute(s) before viewing another ad`,
        variant: "destructive"
      });
      return;
    }

    setIsLoadingAd({ ...isLoadingAd, interstitial: true });

    try {
      const response = await PiAdNetwork.showInterstitialAd();
      
      if (response.result === 'AD_CLOSED') {
        updateStatsForAdView('interstitial');
        
        toast({
          title: "Ad Completed",
          description: "Thanks for viewing the ad!",
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

    setIsLoadingAd({ ...isLoadingAd, interstitial: false });
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

    if (!isAdNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update Pi Browser or check app approval",
        variant: "destructive"
      });
      return;
    }

    if (hasReachedDailyLimit()) {
      toast({
        title: "Daily Limit Reached",
        description: `You've reached the daily limit of ${DAILY_FREQUENCY_CAP} ads`,
        variant: "destructive"
      });
      return;
    }

    if (isOnCooldown('rewarded')) {
      const remaining = getCooldownRemaining('rewarded');
      toast({
        title: "Cooldown Active",
        description: `Please wait ${remaining} minute(s) before viewing another rewarded ad`,
        variant: "destructive"
      });
      return;
    }

    setIsLoadingAd({ ...isLoadingAd, rewarded: true });

    try {
      const response = await PiAdNetwork.showRewardedAd();
      
      if (response.result === 'AD_REWARDED') {
        updateStatsForAdView('rewarded', true);
        addReward('rewarded', response.adId);
        
        toast({
          title: "Reward Earned!",
          description: "You've earned a reward for watching the ad!",
        });
      } else if (response.result === 'AD_CLOSED') {
        updateStatsForAdView('rewarded', false);
        
        toast({
          title: "Ad Closed",
          description: "Ad was closed without completing the reward",
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

    setIsLoadingAd({ ...isLoadingAd, rewarded: false });
  };

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes <= 0) return 'Ready';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Ad Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pi Ad Network Status
          </CardTitle>
          <CardDescription>
            Earn rewards by viewing ads on Pi Network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={isAdNetworkSupported ? "default" : "destructive"}>
              {isAdNetworkSupported ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {isAdNetworkSupported ? "Ads Supported" : "Ads Not Available"}
            </Badge>
            
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
            
            <Badge variant={hasReachedDailyLimit() ? "destructive" : "default"}>
              <Zap className="h-3 w-3 mr-1" />
              {adStats.todayViewed}/{DAILY_FREQUENCY_CAP} Today
            </Badge>
          </div>

          {/* Daily Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Daily Ad Limit</span>
              <span>{adStats.todayViewed}/{DAILY_FREQUENCY_CAP}</span>
            </div>
            <Progress value={(adStats.todayViewed / DAILY_FREQUENCY_CAP) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Ad Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Your Ad Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{adStats.totalViewed}</div>
              <div className="text-sm text-muted-foreground">Total Ads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{adStats.rewardedViewed}</div>
              <div className="text-sm text-muted-foreground">Rewarded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{adStats.interstitialViewed}</div>
              <div className="text-sm text-muted-foreground">Interstitial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{adStats.totalRewards}</div>
              <div className="text-sm text-muted-foreground">Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interstitial Ad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Interstitial Ad
            </CardTitle>
            <CardDescription>
              Full-screen ad shown between content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isOnCooldown('interstitial') ? (
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">Next ad in:</p>
                <p className="text-lg font-bold">
                  {formatTimeRemaining(getCooldownRemaining('interstitial'))}
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleShowInterstitialAd}
                disabled={isLoadingAd.interstitial || !isAdNetworkSupported || !isAuthenticated || hasReachedDailyLimit()}
                className="w-full"
                variant="outline"
              >
                {isLoadingAd.interstitial ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading Ad...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Interstitial
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Rewarded Ad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewarded Ad
            </CardTitle>
            <CardDescription>
              Earn rewards for watching ads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isOnCooldown('rewarded') ? (
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">Next reward in:</p>
                <p className="text-lg font-bold">
                  {formatTimeRemaining(getCooldownRemaining('rewarded'))}
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleShowRewardedAd}
                disabled={isLoadingAd.rewarded || !isAdNetworkSupported || !isAuthenticated || hasReachedDailyLimit()}
                className="w-full"
              >
                {isLoadingAd.rewarded ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading Reward...
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    Watch for Reward
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Rewards */}
      {recentRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Recent Rewards
            </CardTitle>
            <CardDescription>
              Your latest earned rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentRewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Coins className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {reward.type} Ad Reward
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{reward.amount} reward points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {reward.timestamp.toLocaleTimeString()}
                    </p>
                    {reward.adId && (
                      <p className="text-xs text-muted-foreground">
                        ID: {reward.adId.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Alerts */}
      {!isAdNetworkSupported && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ad Network Unavailable</AlertTitle>
          <AlertDescription>
            The Pi Ad Network is not available. This may be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Older Pi Browser version - please update</li>
              <li>App not approved for monetization</li>
              <li>Geographic restrictions</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasReachedDailyLimit() && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Daily Limit Reached</AlertTitle>
          <AlertDescription>
            You've reached today's ad limit of {DAILY_FREQUENCY_CAP} ads. Come back tomorrow to earn more rewards!
          </AlertDescription>
        </Alert>
      )}

      {isAdNetworkSupported && !isAuthenticated && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please authenticate with Pi Network to view rewarded ads. Interstitial ads may be available without authentication.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PiAdNetworkSystem;