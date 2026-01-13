import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Gift,
  PlayCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

export function AdNetworkWidget() {
  const { config, adSession, canShowAd } = usePiAdNetwork();
  const navigate = useNavigate();

  if (!config.enabled) {
    return null;
  }

  const cooldownRemaining = () => {
    if (!adSession.lastAdShownAt) return 0;
    const cooldownMs = config.cooldownMinutes * 60 * 1000;
    const elapsed = Date.now() - adSession.lastAdShownAt;
    return Math.max(0, Math.ceil((cooldownMs - elapsed) / 60000));
  };

  const remainingAds = config.frequencyCap - adSession.adsShownCount;
  const adProgress = (adSession.adsShownCount / config.frequencyCap) * 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>Pi Ad Network</CardTitle>
          </div>
          {config.enabled && (
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          Earn revenue by showing ads to your users
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Session Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Session Ads</span>
            <span className="font-semibold">
              {adSession.adsShownCount} / {config.frequencyCap}
            </span>
          </div>
          <Progress value={adProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {remainingAds > 0 
              ? `${remainingAds} ads remaining in this session`
              : 'Session frequency cap reached'
            }
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Cooldown</span>
            </div>
            <p className="font-semibold">
              {cooldownRemaining() > 0 
                ? `${cooldownRemaining()} min`
                : 'Ready'
              }
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Status</span>
            </div>
            <div className="flex items-center gap-2">
              {canShowAd ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-500">Ready</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold text-orange-500">On Hold</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ad Types */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Enabled Ad Types</h4>
          <div className="flex flex-wrap gap-2">
            {config.interstitialEnabled && (
              <Badge variant="secondary" className="gap-1">
                <PlayCircle className="h-3 w-3" />
                Interstitial
              </Badge>
            )}
            {config.rewardedEnabled && (
              <Badge variant="secondary" className="gap-1">
                <Gift className="h-3 w-3" />
                Rewarded
              </Badge>
            )}
            {!config.interstitialEnabled && !config.rewardedEnabled && (
              <span className="text-sm text-muted-foreground">No ad types enabled</span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {adSession.lastAdShownAt && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Last Ad Shown</p>
            <p className="text-sm font-medium">
              {new Date(adSession.lastAdShownAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <Button 
            onClick={() => navigate('/ads-demo')}
            variant="default" 
            className="w-full"
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Ad Network Demo
          </Button>
          
          <Button 
            onClick={() => window.open('https://develop.pinet.com', '_blank')}
            variant="outline" 
            className="w-full"
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Pi Developer Portal
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Cooldown: {config.cooldownMinutes} min between ads</p>
          <p>• Frequency Cap: {config.frequencyCap} ads per session</p>
          <p>• Apply for monetization at develop.pinet.com</p>
        </div>
      </CardContent>
    </Card>
  );
}
