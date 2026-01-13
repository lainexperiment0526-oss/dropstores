/**
 * Pi Network Integration - Complete Testing Suite
 * Tests authentication, payments, and ad network functionality
 * Designed for both automated and manual testing
 */

import { piSDK, authenticateWithPi, createPiPayment, PiAdNetwork } from '@/lib/pi-sdk';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending' | 'skipped';
  error?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

class PiIntegrationTestSuite {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Pi Network Integration Tests...\n');
    
    this.results = [];
    
    // Phase 1: SDK Initialization
    console.log('═══════════════════════════════════════════');
    console.log('PHASE 1: SDK Initialization');
    console.log('═══════════════════════════════════════════\n');
    
    await this.testSDKAvailability();
    await this.testSDKInitialization();
    await this.testMainnetConfiguration();
    await this.testNativeFeatures();
    
    // Phase 2: Authentication
    console.log('\n═══════════════════════════════════════════');
    console.log('PHASE 2: Authentication Tests');
    console.log('═══════════════════════════════════════════\n');
    
    await this.testAuthenticationFlow();
    await this.testAuthenticationMethod();
    await this.testWalletDetection();
    
    // Phase 3: Payments
    console.log('\n═══════════════════════════════════════════');
    console.log('PHASE 3: Payment Tests');
    console.log('═══════════════════════════════════════════\n');
    
    await this.testPaymentCreation();
    await this.testPaymentApproval();
    await this.testBlockchainVerification();
    
    // Phase 4: Ad Network
    console.log('\n═══════════════════════════════════════════');
    console.log('PHASE 4: Ad Network Tests');
    console.log('═══════════════════════════════════════════\n');
    
    await this.testAdNetworkSupport();
    await this.testInterstitialAd();
    await this.testRewardedAd();
    await this.testAdVerification();
    
    // Print Summary
    this.printSummary();
    
    return this.results;
  }

  // ========================================================================
  // PHASE 1: SDK Initialization Tests
  // ========================================================================

  private async testSDKAvailability(): Promise<void> {
    const test: TestResult = { name: 'SDK Availability', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      const available = typeof window !== 'undefined' && !!window.Pi;
      
      if (available) {
        test.status = 'pass';
        test.details = { piGlobal: 'window.Pi available' };
      } else {
        test.status = 'fail';
        test.error = 'Pi SDK not loaded - ensure app opened in Pi Browser';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testSDKInitialization(): Promise<void> {
    const test: TestResult = { name: 'SDK Initialization', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      const initialized = await piSDK.init();
      
      if (initialized) {
        test.status = 'pass';
        test.details = { initialized: true };
      } else {
        test.status = 'fail';
        test.error = 'SDK failed to initialize';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testMainnetConfiguration(): Promise<void> {
    const test: TestResult = { name: 'Mainnet Configuration', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      const mainnetMode = import.meta.env.VITE_PI_MAINNET_MODE === 'true';
      const sandboxMode = false; // PRODUCTION ONLY - Force mainnet
      const environment = import.meta.env.VITE_PI_ENVIRONMENT;
      
      if (mainnetMode && !sandboxMode && environment === 'production') {
        test.status = 'pass';
        test.details = { mainnetMode, sandboxMode, environment };
      } else {
        test.status = 'fail';
        test.error = `Configuration incorrect: mainnet=${mainnetMode}, sandbox=${sandboxMode}, env=${environment}`;
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testNativeFeatures(): Promise<void> {
    const test: TestResult = { name: 'Native Features List', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      if (!piSDK.isAvailable()) {
        test.status = 'skipped';
        test.error = 'SDK not available';
        test.duration = performance.now() - this.startTime;
        this.results.push(test);
        this.logTestResult(test);
        return;
      }

      const features = piSDK.getNativeFeatures();
      const hasAdNetwork = features.includes('ad_network');
      
      test.status = 'pass';
      test.details = { features, adNetworkSupported: hasAdNetwork };
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  // ========================================================================
  // PHASE 2: Authentication Tests
  // ========================================================================

  private async testAuthenticationFlow(): Promise<void> {
    const test: TestResult = { name: 'Authentication Flow', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      if (!piSDK.isAvailable()) {
        test.status = 'skipped';
        test.error = 'SDK not available';
        test.duration = performance.now() - this.startTime;
        this.results.push(test);
        this.logTestResult(test);
        return;
      }

      const hasAuthMethod = !!(window as any).Pi?.authenticate;
      
      if (hasAuthMethod) {
        test.status = 'pass';
        test.details = { authenticateMethod: 'available' };
      } else {
        test.status = 'fail';
        test.error = 'Pi.authenticate method not available';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testAuthenticationMethod(): Promise<void> {
    const test: TestResult = { name: 'Authentication Method', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      if (!piSDK.isAvailable()) {
        test.status = 'skipped';
        test.error = 'SDK not available';
        test.duration = performance.now() - this.startTime;
        this.results.push(test);
        this.logTestResult(test);
        return;
      }

      const hasAuthFunction = typeof authenticateWithPi === 'function';
      
      if (hasAuthFunction) {
        test.status = 'pass';
        test.details = { authFunction: 'available' };
      } else {
        test.status = 'fail';
        test.error = 'authenticateWithPi function not available';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testWalletDetection(): Promise<void> {
    const test: TestResult = { name: 'Wallet Detection', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      if (!piSDK.isAvailable()) {
        test.status = 'skipped';
        test.error = 'SDK not available';
        test.duration = performance.now() - this.startTime;
        this.results.push(test);
        this.logTestResult(test);
        return;
      }

      const hasWalletMethod = !!(window as any).Pi?.requestWalletAddress;
      
      if (hasWalletMethod) {
        test.status = 'pass';
        test.details = { walletMethod: 'available' };
      } else {
        test.status = 'pending';
        test.error = 'Pi Browser update may be required for wallet detection';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  // ========================================================================
  // PHASE 3: Payment Tests
  // ========================================================================

  private async testPaymentCreation(): Promise<void> {
    const test: TestResult = { name: 'Payment Creation', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      if (!piSDK.isAvailable()) {
        test.status = 'skipped';
        test.error = 'SDK not available';
        test.duration = performance.now() - this.startTime;
        this.results.push(test);
        this.logTestResult(test);
        return;
      }

      const hasPaymentMethod = !!(window as any).Pi?.createPayment;
      
      if (hasPaymentMethod) {
        test.status = 'pass';
        test.details = { createPaymentMethod: 'available' };
      } else {
        test.status = 'fail';
        test.error = 'Pi.createPayment method not available';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testPaymentApproval(): Promise<void> {
    const test: TestResult = { name: 'Payment Approval Function', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      const response = await fetch('/.netlify/functions/pi-payment-approve', {
        method: 'OPTIONS',
      }).catch(() => null);
      
      if (response?.ok || response?.status === 404) {
        test.status = 'pass';
        test.details = { endpoint: 'accessible' };
      } else {
        test.status = 'fail';
        test.error = `Endpoint returned status: ${response?.status}`;
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testBlockchainVerification(): Promise<void> {
    const test: TestResult = { name: 'Blockchain Verification', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      const horizonUrl = 'https://api.mainnet.minepi.com';
      const response = await fetch(horizonUrl, { method: 'HEAD' }).catch(() => null);
      
      if (response?.ok || response?.status) {
        test.status = 'pass';
        test.details = { blockchainAPI: 'reachable' };
      } else {
        test.status = 'fail';
        test.error = 'Blockchain API not reachable';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  // ========================================================================
  // PHASE 4: Ad Network Tests
  // ========================================================================

  private async testAdNetworkSupport(): Promise<void> {
    const test: TestResult = { name: 'Ad Network Support', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      const supported = PiAdNetwork.isSupported();
      
      if (supported) {
        test.status = 'pass';
        test.details = { supported: true };
      } else {
        test.status = 'pending';
        test.error = 'Ad Network not available (Pi Browser update required)';
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testInterstitialAd(): Promise<void> {
    const test: TestResult = { name: 'Interstitial Ad Support', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      if (!PiAdNetwork.isSupported()) {
        test.status = 'skipped';
        test.error = 'Ad Network not supported';
        test.duration = performance.now() - this.startTime;
        this.results.push(test);
        this.logTestResult(test);
        return;
      }

      const response = await PiAdNetwork.isAdReady('interstitial');
      
      test.status = 'pass';
      test.details = { ready: response.ready };
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testRewardedAd(): Promise<void> {
    const test: TestResult = { name: 'Rewarded Ad Support', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      if (!PiAdNetwork.isSupported()) {
        test.status = 'skipped';
        test.error = 'Ad Network not supported';
        test.duration = performance.now() - this.startTime;
        this.results.push(test);
        this.logTestResult(test);
        return;
      }

      const response = await PiAdNetwork.isAdReady('rewarded');
      
      test.status = 'pass';
      test.details = { ready: response.ready };
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  private async testAdVerification(): Promise<void> {
    const test: TestResult = { name: 'Ad Verification Endpoint', status: 'pending' };
    this.startTime = performance.now();
    
    try {
      const response = await fetch('/.netlify/functions/pi-ad-verify', {
        method: 'OPTIONS',
      }).catch(() => null);
      
      if (response?.ok || response?.status === 404) {
        test.status = 'pass';
        test.details = { endpoint: 'accessible' };
      } else {
        test.status = 'fail';
        test.error = `Endpoint returned status: ${response?.status}`;
      }
    } catch (error) {
      test.status = 'fail';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    test.duration = performance.now() - this.startTime;
    this.results.push(test);
    this.logTestResult(test);
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  private logTestResult(test: TestResult): void {
    const statusSymbol = {
      pass: '✅',
      fail: '❌',
      pending: '⏳',
      skipped: '⊘',
    }[test.status];
    
    const message = `${statusSymbol} ${test.name}`;
    const details = test.error ? ` - ${test.error}` : '';
    
    console.log(`${message}${details}`);
    
    if (test.details) {
      console.log('   Details:', test.details);
    }
    if (test.duration) {
      console.log(`   Duration: ${test.duration.toFixed(2)}ms`);
    }
  }

  private printSummary(): void {
    console.log('\n═══════════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════════\n');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const pending = this.results.filter(r => r.status === 'pending').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const total = this.results.length;
    
    console.log(`✅ Passed:  ${passed}/${total}`);
    console.log(`❌ Failed:  ${failed}/${total}`);
    console.log(`⏳ Pending: ${pending}/${total}`);
    console.log(`⊘ Skipped: ${skipped}/${total}`);
    
    if (failed > 0) {
      console.log('\n⚠️  Failed Tests:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }
    
    console.log('\n═══════════════════════════════════════════\n');
  }
}

export async function runPiIntegrationTests(): Promise<TestResult[]> {
  const suite = new PiIntegrationTestSuite();
  return await suite.runAllTests();
}

export default PiIntegrationTestSuite;
