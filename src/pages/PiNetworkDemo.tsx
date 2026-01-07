import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Wallet, 
  TrendingUp, 
  Info,
  ExternalLink,
  Book,
  CheckCircle,
  Zap
} from 'lucide-react';
import { PiNetworkIntegration } from '@/components/pi/PiNetworkIntegration';
import { PiPaymentSystem } from '@/components/pi/PiPaymentSystem';
import { PiAdNetworkSystem } from '@/components/pi/PiAdNetworkSystem';
import { PiAuthResult } from '@/lib/pi-sdk';

export default function PiNetworkDemo() {
  // State
  const [authResult, setAuthResult] = useState<PiAuthResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Handlers
  const handleAuthSuccess = (auth: PiAuthResult) => {
    setAuthResult(auth);
    setIsAuthenticated(true);
  };

  const handlePaymentSuccess = (paymentId: string, txid: string) => {
    console.log('Payment successful:', { paymentId, txid });
  };

  const handleAdRewardEarned = (reward: any) => {
    console.log('Ad reward earned:', reward);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Pi Network Integration Demo
            </h1>
            <p className="text-xl text-gray-600">
              Complete Production Implementation
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="default" className="text-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                Pi Mainnet
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Zap className="h-3 w-3 mr-1" />
                Production Ready
              </Badge>
            </div>
          </div>
        </div>

        {/* User Status */}
        {isAuthenticated && authResult && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-900">
                    Welcome, {authResult.user.username}!
                  </p>
                  <p className="text-sm text-green-700">
                    Successfully connected to Pi Network
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ad Network
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Pi Network Integration Features
                </CardTitle>
                <CardDescription>
                  Complete implementation based on official Pi Platform documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Authentication */}
                  <Card className="border-2 border-blue-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Pi Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>✓ Production mainnet connection</li>
                        <li>✓ Username, payments & wallet scopes</li>
                        <li>✓ Incomplete payment handling</li>
                        <li>✓ Official SDK v2.0 integration</li>
                        <li>✓ Secure token management</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Payments */}
                  <Card className="border-2 border-green-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        Pi Payments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>✓ User-to-app payment flow</li>
                        <li>✓ Server-side approval ready</li>
                        <li>✓ Blockchain completion tracking</li>
                        <li>✓ Payment validation & limits</li>
                        <li>✓ Comprehensive error handling</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Ad Network */}
                  <Card className="border-2 border-purple-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Ad Network
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>✓ Interstitial & rewarded ads</li>
                        <li>✓ Ad verification system</li>
                        <li>✓ Cooldown & frequency caps</li>
                        <li>✓ Reward tracking & history</li>
                        <li>✓ Browser compatibility checks</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Implementation Details */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Production Implementation</AlertTitle>
                  <AlertDescription className="mt-2">
                    This implementation follows the official Pi Platform documentation and is configured for production use on Pi Mainnet. 
                    All features include proper error handling, validation, and security measures required for a live application.
                  </AlertDescription>
                </Alert>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://pi-apps.github.io/community-developer-guide/', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Pi Developer Guide
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://github.com/pi-apps/pi-platform-docs', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Platform Docs
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('auth')}
                  >
                    Get Started →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="auth" className="space-y-6">
            <PiNetworkIntegration 
              onAuthSuccess={handleAuthSuccess}
              onPaymentSuccess={handlePaymentSuccess}
              onAdRewardEarned={handleAdRewardEarned}
            />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PiPaymentSystem 
              isAuthenticated={isAuthenticated}
              userPi={authResult}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <PiAdNetworkSystem 
              isAuthenticated={isAuthenticated}
              userPi={authResult}
              onAdReward={handleAdRewardEarned}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Powered by <strong>Pi Network SDK v2.0</strong> | Production Mainnet Integration
              </p>
              <p className="text-xs text-gray-500">
                This demo showcases a complete Pi Network integration following official documentation and best practices.
              </p>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Pi Mainnet
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  SDK v2.0
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Production Ready
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}