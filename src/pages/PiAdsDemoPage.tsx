import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';
import { RewardedAdButton } from '@/components/ads/RewardedAdButton';
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';
import { 
  PlayCircle, 
  Gift, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Clock,
  BarChart3,
  Info,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PiAdsDemoPage() {
  const { 
    showInterstitialAd, 
    showRewardedAd, 
    canShowAd, 
    isLoading,
    config,
    adSession
  } = usePiAdNetwork();

  const [adResults, setAdResults] = useState<{
    type: string;
    success: boolean;
    rewarded?: boolean;
    adId?: string;
    timestamp: Date;
  }[]>([]);

  const [actionCount, setActionCount] = useState(0);
  const [triggerInterstitial, setTriggerInterstitial] = useState(false);

  const handleShowInterstitial = async () => {
    const success = await showInterstitialAd();
    setAdResults(prev => [{
      type: 'Interstitial',
      success,
      timestamp: new Date()
    }, ...prev]);

    if (success) {
      toast.success('Interstitial ad shown successfully!');
    } else {
      toast.error('Failed to show interstitial ad');
    }
  };

  const handleShowRewarded = async () => {
    const result = await showRewardedAd();
    setAdResults(prev => [{
      type: 'Rewarded',
      success: result.success,
      rewarded: result.rewarded,
      adId: result.adId,
      timestamp: new Date()
    }, ...prev]);

    if (result.success && result.rewarded) {
      toast.success(`Rewarded ad completed! Ad ID: ${result.adId}`);
    } else if (result.success) {
      toast.info('Ad shown but not completed');
    } else {
      toast.error('Failed to show rewarded ad');
    }
  };

  const handleReward = async (adId: string) => {
    console.log('Granting reward for ad:', adId);
    // In production, verify this on your backend
    toast.success('🎉 You earned 10 bonus points!');
  };

  const handleActionIncrement = () => {
    const newCount = actionCount + 1;
    setActionCount(newCount);
    toast.info(`Action ${newCount} performed`);
  };

  const handleTriggerAd = () => {
    setTriggerInterstitial(true);
    setTimeout(() => setTriggerInterstitial(false), 100);
  };

  const cooldownRemaining = () => {
    if (!adSession.lastAdShownAt) return 0;
    const cooldownMs = config.cooldownMinutes * 60 * 1000;
    const elapsed = Date.now() - adSession.lastAdShownAt;
    return Math.max(0, Math.ceil((cooldownMs - elapsed) / 60000));
  };

  const remainingAds = config.frequencyCap - adSession.adsShownCount;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          Pi Ad Network Demo
        </h1>
        <p className="text-muted-foreground text-lg">
          Test and explore Pi Network's Ad Network integration
        </p>
      </div>

      {/* Status Overview */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ad Network Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Network Status</p>
              <div className="flex items-center gap-2">
                {config.enabled ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Disabled</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ads Shown (Session)</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-2xl">
                  {adSession.adsShownCount} / {config.frequencyCap}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cooldown</p>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">
                  {cooldownRemaining() > 0 
                    ? `${cooldownRemaining()} min remaining`
                    : 'Ready'
                  }
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Badge variant={config.interstitialEnabled ? "default" : "secondary"}>
              Interstitial: {config.interstitialEnabled ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant={config.rewardedEnabled ? "default" : "secondary"}>
              Rewarded: {config.rewardedEnabled ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant={canShowAd ? "default" : "destructive"}>
              Can Show Ads: {canShowAd ? 'Yes' : 'No'}
            </Badge>
            <Badge variant="outline">
              Cooldown: {config.cooldownMinutes} min
            </Badge>
            <Badge variant="outline">
              Frequency Cap: {config.frequencyCap} ads
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ad Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interstitial Ads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-blue-500" />
              Interstitial Ads
            </CardTitle>
            <CardDescription>
              Full-screen ads shown at natural transition points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>About Interstitial Ads</AlertTitle>
              <AlertDescription>
                These are full-screen ads displayed between activities or page transitions.
                Best shown after completing actions or between levels in games.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button 
                onClick={handleShowInterstitial}
                disabled={!canShowAd || isLoading || !config.interstitialEnabled}
                className="w-full"
                size="lg"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Show Interstitial Ad
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {!config.enabled ? 'Ad Network is disabled' :
                 !config.interstitialEnabled ? 'Interstitial ads are disabled' :
                 !canShowAd ? 'Cooldown or frequency cap active' : 
                 'Click to show a full-screen ad'}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Automatic Triggers</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleActionIncrement}
                  className="w-full"
                >
                  Perform Action ({actionCount})
                </Button>
                <p className="text-xs text-muted-foreground">
                  Shows ad every 3 actions
                </p>

                <Button 
                  variant="outline" 
                  onClick={handleTriggerAd}
                  className="w-full"
                >
                  Trigger Transition Ad
                </Button>
                <p className="text-xs text-muted-foreground">
                  Simulates page transition
                </p>
              </div>
            </div>

            {/* Hidden automatic triggers */}
            <InterstitialAdTrigger 
              actionCount={actionCount}
              showEvery={3}
              delay={1000}
            />
            <InterstitialAdTrigger 
              trigger={triggerInterstitial}
              delay={500}
            />
          </CardContent>
        </Card>

        {/* Rewarded Ads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              Rewarded Ads
            </CardTitle>
            <CardDescription>
              Watch ads to earn rewards and unlock features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>About Rewarded Ads</AlertTitle>
              <AlertDescription>
                Users watch these ads voluntarily in exchange for rewards like
                bonus points, extra lives, or premium features.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button 
                onClick={handleShowRewarded}
                disabled={!canShowAd || isLoading || !config.rewardedEnabled}
                className="w-full"
                size="lg"
                variant="default"
              >
                <Gift className="mr-2 h-4 w-4" />
                Show Rewarded Ad
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {!config.enabled ? 'Ad Network is disabled' :
                 !config.rewardedEnabled ? 'Rewarded ads are disabled' :
                 !canShowAd ? 'Cooldown or frequency cap active' : 
                 'Watch ad to earn 10 bonus points'}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Pre-built Components</h4>
              
              <RewardedAdButton
                onReward={handleReward}
                rewardText="🎉 You earned 10 bonus points!"
                buttonText="Get Bonus Points"
                className="w-full"
              />

              <RewardedAdButton
                onReward={handleReward}
                rewardText="⭐ Premium feature unlocked!"
                buttonText="Unlock Premium Feature"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Results History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ad Results History
          </CardTitle>
          <CardDescription>
            Track all ad displays in this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No ads shown yet. Try showing an ad above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {adResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{result.type} Ad</p>
                      <p className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                    {result.rewarded !== undefined && (
                      <Badge variant={result.rewarded ? "default" : "secondary"}>
                        {result.rewarded ? 'Rewarded' : 'Not Rewarded'}
                      </Badge>
                    )}
                    {result.adId && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {result.adId.slice(0, 8)}...
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Configuration & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Current Settings</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cooldown: {config.cooldownMinutes} minutes between ads</li>
                <li>• Frequency Cap: {config.frequencyCap} ads per session</li>
                <li>• Interstitial Ads: {config.interstitialEnabled ? 'Enabled' : 'Disabled'}</li>
                <li>• Rewarded Ads: {config.rewardedEnabled ? 'Enabled' : 'Disabled'}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ Show ads at natural transition points</li>
                <li>✅ Always verify rewarded ads on backend</li>
                <li>✅ Respect cooldown and frequency caps</li>
                <li>❌ Don't show during critical actions</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Production Deployment</AlertTitle>
            <AlertDescription>
              Before deploying to production, apply for Pi Developer Ad Network approval at{' '}
              <a 
                href="https://develop.pinet.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                develop.pinet.com
              </a>
              . Always verify rewarded ads on your backend using the Pi Platform API.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources & Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
            >
              <h4 className="font-semibold mb-1">Pi Ads Documentation</h4>
              <p className="text-sm text-muted-foreground">
                Official ad network integration guide
              </p>
            </a>

            <a 
              href="https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md#ads"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
            >
              <h4 className="font-semibold mb-1">SDK Reference</h4>
              <p className="text-sm text-muted-foreground">
                Complete Pi SDK method definitions
              </p>
            </a>

            <a 
              href="https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
            >
              <h4 className="font-semibold mb-1">Platform API</h4>
              <p className="text-sm text-muted-foreground">
                Backend verification for rewarded ads
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
