import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react';
import { runPiIntegrationTests } from '@/lib/pi-integration-tests';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending' | 'skipped';
  error?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

export function PiIntegrationTestComponent() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const { toast } = useToast();

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestStarted(true);
    setResults([]);

    try {
      toast({
        title: 'Testing Pi Integration',
        description: 'Running comprehensive Pi Network tests...',
      });

      const testResults = await runPiIntegrationTests();
      setResults(testResults);

      const passed = testResults.filter(r => r.status === 'pass').length;
      const failed = testResults.filter(r => r.status === 'fail').length;
      const total = testResults.length;

      if (failed === 0) {
        toast({
          title: '✅ All Tests Passed!',
          description: `${passed}/${total} tests completed successfully`,
          variant: 'default',
        });
      } else {
        toast({
          title: '⚠️ Some Tests Failed',
          description: `${passed} passed, ${failed} failed out of ${total} tests`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Test Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-600">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'pending':
        return <Badge variant="secondary">PENDING</Badge>;
      case 'skipped':
        return <Badge variant="outline">SKIPPED</Badge>;
    }
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    pending: results.filter(r => r.status === 'pending').length,
    skipped: results.filter(r => r.status === 'skipped').length,
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pi Network Integration Tests</CardTitle>
          <CardDescription>
            Comprehensive testing suite for Pi authentication, payments, and ad network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRunTests}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>

          {testStarted && (
            <Alert className={results.length > 0 ? (stats.failed === 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : ''}>
              <AlertTitle>
                {isRunning ? 'Testing in progress...' : results.length > 0 ? 'Test Results' : 'Ready to test'}
              </AlertTitle>
              <AlertDescription>
                {isRunning ? (
                  'Running comprehensive Pi Network integration tests...'
                ) : results.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    <p>✅ Passed: {stats.passed}/{stats.total}</p>
                    <p>❌ Failed: {stats.failed}/{stats.total}</p>
                    {stats.pending > 0 && <p>⏳ Pending: {stats.pending}/{stats.total}</p>}
                    {stats.skipped > 0 && <p>⊘ Skipped: {stats.skipped}/{stats.total}</p>}
                  </div>
                ) : (
                  'Click "Run All Tests" to start'
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Results ({results.length} tests)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="mt-1">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-sm">{result.name}</p>
                    {getStatusBadge(result.status)}
                  </div>
                  {result.error && (
                    <p className="text-sm text-red-600">{result.error}</p>
                  )}
                  {result.details && (
                    <div className="text-xs text-gray-600 mt-1">
                      <pre className="bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.duration && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {result.duration.toFixed(2)}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Test Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">SDK Initialization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ SDK Availability</p>
            <p>✓ SDK Initialization</p>
            <p>✓ Mainnet Configuration</p>
            <p>✓ Native Features Detection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Authentication Flow</p>
            <p>✓ Session Creation</p>
            <p>✓ Token Validation</p>
            <p>✓ User Data Storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Payment Creation</p>
            <p>✓ Payment Approval</p>
            <p>✓ Blockchain Verification</p>
            <p>✓ Transaction Completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ad Network</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Ad Network Support</p>
            <p>✓ Interstitial Ads</p>
            <p>✓ Rewarded Ads</p>
            <p>✓ Ad Verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-blue-600">ℹ️</span>
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Network:</strong> Mainnet (Production)</p>
          <p><strong>SDK Version:</strong> 2.0</p>
          <p><strong>API Base:</strong> https://api.minepi.com</p>
          <p><strong>Environment:</strong> {import.meta.env.VITE_PI_ENVIRONMENT}</p>
          <p><strong>Mainnet Mode:</strong> {import.meta.env.VITE_PI_MAINNET_MODE === 'true' ? '✅ Enabled' : '❌ Disabled'}</p>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {results.length > 0 && stats.failed === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              All Tests Passed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Your Pi Network integration is ready for production use:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>✅ Authentication working</li>
              <li>✅ Payments configured</li>
              <li>✅ Ad Network enabled</li>
              <li>✅ All endpoints accessible</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PiIntegrationTestComponent;
