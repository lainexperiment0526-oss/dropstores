// Pi Network SDK Types and Utilities - Complete Production Implementation
import { secureConsole, getSafeEnvInfo } from './env-security';

// Add timeout wrapper for Pi SDK operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Pi SDK operation timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
};

export interface PiUser {
  uid: string;
  username: string;
  wallet_address?: string;
}

export interface PiAuthResult {
  user: PiUser;
  accessToken: string;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

export interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  from_address: string;
  to_address: string;
  direction: string;
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

// Ad Network Types
export type AdType = 'interstitial' | 'rewarded';

export interface PiAdReadyResponse {
  ready: boolean;
  type: AdType;
}

export interface PiAdShowResponse {
  result: 'AD_CLOSED' | 'AD_REWARDED' | 'AD_DISPLAY_ERROR' | 'AD_NETWORK_ERROR' | 'AD_NOT_AVAILABLE' | 'ADS_NOT_SUPPORTED' | 'USER_UNAUTHENTICATED';
  type: AdType;
  adId?: string;
}

export interface PiAdRequestResponse {
  result: 'AD_LOADED' | 'AD_FAILED_TO_LOAD' | 'AD_NOT_AVAILABLE' | 'ADS_NOT_SUPPORTED';
  type: AdType;
}

// Pi SDK Global Types
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: PiPaymentDTO) => void
      ) => Promise<PiAuthResult>;
      createPayment: (
        paymentData: PiPaymentData,
        callbacks: PiPaymentCallbacks
      ) => void;
      nativeFeaturesList: () => Promise<string[]>;
      openShareDialog: (title: string, message: string) => void;
      openUrlInSystemBrowser: (url: string) => Promise<void>;
      Ads: {
        isAdReady: (adType: AdType) => Promise<PiAdReadyResponse>;
        showAd: (adType: AdType) => Promise<PiAdShowResponse>;
        requestAd: (adType: AdType) => Promise<PiAdRequestResponse>;
      };
    };
  }
}

// Pi SDK Configuration and State
class PiSDKManager {
  private initialized: boolean = false;
  private nativeFeatures: string[] = [];
  private adNetworkSupported: boolean = false;
  
  // Initialize Pi SDK - Production Mainnet Mode
  async init(sandbox: boolean = false): Promise<boolean> {
    // Force production mode regardless of parameter
    if (typeof window === 'undefined') {
      secureConsole.warn('Window object not available');
      return false;
    }

    // Wait for Pi SDK to be loaded
    const isLoaded = await this.waitForPiSDK();
    if (!isLoaded) {
      return false;
    }

    try {
      // Initialize with production configuration
      const config = {
        version: '2.0',
        sandbox: false  // Always mainnet for production
      };
      
      window.Pi!.init(config);
      
      // Check for native features support
      await this.checkNativeFeatures();
      
      this.initialized = true;
      
      const safeInfo = getSafeEnvInfo();
      secureConsole.log('✓ Pi SDK initialized successfully:', {
        mode: 'mainnet',
        piNetwork: safeInfo.network,
        environment: safeInfo.environment,
        hasApiKey: safeInfo.hasApiKey,
        nativeFeatures: this.nativeFeatures,
        adNetworkSupported: this.adNetworkSupported,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      secureConsole.error('✗ Failed to initialize Pi SDK:', error);
      return false;
    }
  }

  private async waitForPiSDK(maxWaitTime: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkInterval = 100;
      
      const checkForPi = () => {
        if (window.Pi) {
          resolve(true);
        } else if (Date.now() - startTime >= maxWaitTime) {
          secureConsole.warn('Pi SDK not available after waiting - ensure app is opened in Pi Browser');
          resolve(false);
        } else {
          setTimeout(checkForPi, checkInterval);
        }
      };
      
      checkForPi();
    });
  }

  private async checkNativeFeatures(): Promise<void> {
    try {
      if (window.Pi?.nativeFeaturesList) {
        this.nativeFeatures = await window.Pi.nativeFeaturesList();
        this.adNetworkSupported = this.nativeFeatures.includes('ad_network');
      }
    } catch (err) {
      secureConsole.log('Native features check not available in this browser version');
      this.nativeFeatures = [];
      this.adNetworkSupported = false;
    }
  }

  // Check if Pi SDK is available and initialized
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Pi && this.initialized;
  }

  // Check if specific feature is supported
  isFeatureSupported(feature: string): boolean {
    return this.nativeFeatures.includes(feature);
  }

  // Get native features list
  getNativeFeatures(): string[] {
    return [...this.nativeFeatures];
  }

  // Check if ads are supported
  isAdNetworkSupported(): boolean {
    return this.adNetworkSupported;
  }
}

// Singleton instance
export const piSDK = new PiSDKManager();

// Authentication
export const authenticateWithPi = async (
  onIncompletePaymentFound?: (payment: PiPaymentDTO) => void,
  reqScopes?: string[]
): Promise<PiAuthResult | null> => {
  if (!piSDK.isAvailable()) {
    throw new Error('Pi SDK not available - ensure app is opened in Pi Browser');
  }

  if (!window.Pi?.authenticate) {
    throw new Error('Pi authentication method not available');
  }

  try {
    // Default scopes as per Pi documentation
    const defaultScopes = ['username', 'payments', 'wallet_address'];
    const scopes = reqScopes && reqScopes.length > 0 ? reqScopes : defaultScopes;
    
    // Ensure username is always included
    if (!scopes.includes('username')) {
      scopes.push('username');
    }
    
    secureConsole.log('Starting Pi authentication with scopes:', scopes);
    
    const result = await window.Pi.authenticate(
      scopes,
      onIncompletePaymentFound || ((payment: PiPaymentDTO) => {
        secureConsole.warn('Incomplete payment detected:', {
          paymentId: payment.identifier,
          amount: payment.amount,
          status: payment.status
        });
      })
    );
    
    secureConsole.log('✓ Pi authentication successful:', {
      username: result.user.username,
      uid: result.user.uid,
      hasWalletAddress: !!result.user.wallet_address,
      timestamp: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    secureConsole.error('✗ Pi authentication failed:', error);
    throw error;
  }
};

// Payment Creation
export const createPiPayment = (
  paymentData: PiPaymentData,
  callbacks: PiPaymentCallbacks
): void => {
  if (!piSDK.isAvailable()) {
    throw new Error('Pi SDK not available - ensure app is opened in Pi Browser');
  }

  if (!window.Pi?.createPayment) {
    throw new Error('Pi payment method not available');
  }

  // Validate payment data
  if (!paymentData.amount || paymentData.amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  if (!paymentData.memo || paymentData.memo.trim() === '') {
    throw new Error('Payment memo is required');
  }

  secureConsole.log('Creating Pi payment:', {
    amount: paymentData.amount,
    memo: paymentData.memo,
    metadata: paymentData.metadata
  });

  window.Pi.createPayment(paymentData, callbacks);
};

// Ad Network Functions
export class PiAdNetwork {
  // Check if ads are supported
  static isSupported(): boolean {
    return piSDK.isAdNetworkSupported() && !!window.Pi?.Ads;
  }

  // Check if specific ad type is ready
  static async isAdReady(adType: AdType): Promise<PiAdReadyResponse> {
    if (!this.isSupported()) {
      throw new Error('Ad network not supported - update Pi Browser or check app approval status');
    }

    try {
      return await window.Pi!.Ads.isAdReady(adType);
    } catch (error) {
      secureConsole.error('Failed to check ad readiness:', error);
      throw error;
    }
  }

  // Request an ad
  static async requestAd(adType: AdType): Promise<PiAdRequestResponse> {
    if (!this.isSupported()) {
      throw new Error('Ad network not supported - update Pi Browser or check app approval status');
    }

    try {
      const response = await window.Pi!.Ads.requestAd(adType);
      secureConsole.log('Ad request result:', { adType, result: response.result });
      return response;
    } catch (error) {
      secureConsole.error('Failed to request ad:', error);
      throw error;
    }
  }

  // Show an ad
  static async showAd(adType: AdType): Promise<PiAdShowResponse> {
    if (!this.isSupported()) {
      throw new Error('Ad network not supported - update Pi Browser or check app approval status');
    }

    try {
      const response = await window.Pi!.Ads.showAd(adType);
      
      secureConsole.log('Ad show result:', {
        adType,
        result: response.result,
        hasAdId: !!response.adId,
        timestamp: new Date().toISOString()
      });
      
      return response;
    } catch (error) {
      secureConsole.error('Failed to show ad:', error);
      throw error;
    }
  }

  // Complete rewarded ad flow with verification
  static async showRewardedAd(): Promise<PiAdShowResponse> {
    try {
      // Check if ad is ready
      const readyResponse = await this.isAdReady('rewarded');
      
      if (!readyResponse.ready) {
        // Try to request an ad
        const requestResponse = await this.requestAd('rewarded');
        
        if (requestResponse.result === 'ADS_NOT_SUPPORTED') {
          throw new Error('Ads not supported - please update Pi Browser');
        }
        
        if (requestResponse.result !== 'AD_LOADED') {
          throw new Error('No ads available at the moment');
        }
      }
      
      // Show the ad
      return await this.showAd('rewarded');
    } catch (error) {
      secureConsole.error('Failed to show rewarded ad:', error);
      throw error;
    }
  }

  // Show interstitial ad
  static async showInterstitialAd(): Promise<PiAdShowResponse> {
    try {
      // Check if ad is ready
      const readyResponse = await this.isAdReady('interstitial');
      
      if (!readyResponse.ready) {
        // Try to request an ad
        const requestResponse = await this.requestAd('interstitial');
        
        if (requestResponse.result === 'ADS_NOT_SUPPORTED') {
          throw new Error('Ads not supported - please update Pi Browser');
        }
        
        if (requestResponse.result !== 'AD_LOADED') {
          throw new Error('No ads available at the moment');
        }
      }
      
      // Show the ad
      return await this.showAd('interstitial');
    } catch (error) {
      secureConsole.error('Failed to show interstitial ad:', error);
      throw error;
    }
  }
}

// Utility Functions
export const openShareDialog = (title: string, message: string): void => {
  if (!piSDK.isAvailable()) {
    throw new Error('Pi SDK not available');
  }

  if (window.Pi?.openShareDialog) {
    window.Pi.openShareDialog(title, message);
  } else {
    // Fallback to web share API if available
    if (navigator.share) {
      navigator.share({ title, text: message });
    } else {
      throw new Error('Share functionality not available');
    }
  }
};

export const openUrlInSystemBrowser = async (url: string): Promise<void> => {
  if (!piSDK.isAvailable()) {
    throw new Error('Pi SDK not available');
  }

  if (window.Pi?.openUrlInSystemBrowser) {
    try {
      await window.Pi.openUrlInSystemBrowser(url);
    } catch (error) {
      secureConsole.error('Failed to open URL in system browser:', error);
      throw error;
    }
  } else {
    // Fallback to window.open
    window.open(url, '_blank');
  }
};

// Initialize Pi SDK automatically when imported
if (typeof window !== 'undefined') {
  // Initialize SDK when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      piSDK.init().catch((error) => {
        secureConsole.error('Failed to auto-initialize Pi SDK:', error);
      });
    });
  } else {
    piSDK.init().catch((error) => {
      secureConsole.error('Failed to auto-initialize Pi SDK:', error);
    });
  }
}

// Store Types
export const STORE_TYPES = {
  physical: {
    id: 'physical',
    name: 'Physical Store',
    icon: 'Store',
    description: 'Brick-and-mortar retail locations',
    instructions: [
      'Set up your store address and contact information',
      'Add your product inventory with accurate stock counts',
      'Configure pickup/delivery options for local customers',
      'Set business hours and availability',
      'Add photos of your physical location',
      'Enable location-based notifications for nearby customers',
    ]
  },
  online: {
    id: 'online',
    name: 'Online Store',
    icon: 'Globe',
    description: 'E-commerce for physical products shipped worldwide',
    instructions: [
      'Create compelling product listings with high-quality images',
      'Set up shipping zones and delivery rates',
      'Configure payment methods and checkout flow',
      'Add product categories and filters',
      'Set up inventory tracking and low-stock alerts',
      'Create promotional campaigns and discounts',
    ]
  },
  digital: {
    id: 'digital',
    name: 'Digital Store',
    icon: 'Download',
    description: 'Sell digital products, downloads, and services',
    instructions: [
      'Upload digital files (PDFs, videos, software, etc.)',
      'Set up instant delivery after purchase',
      'Configure download limits and expiration',
      'Add product previews and samples',
      'Set up licensing terms for digital products',
      'Create subscription-based digital content',
    ]
  }
};

// Welcome discounts for each plan
export const WELCOME_DISCOUNTS: Record<string, number> = {
  basic: 1,    // 1 Pi discount
  grow: 2,     // 2 Pi discount
  advance: 3,  // 3 Pi discount
  plus: 5,     // 5 Pi discount
};

// Subscription Plans - Updated pricing with welcome discounts and accurate Dropstore features
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    amount: 0,
    originalAmount: 0,
    welcomeDiscount: 0,
    period: 'forever',
    description: 'Start your journey with essential features',
    features: [
      '1 Physical Store',
      '1 Product listing',
      'Basic dashboard & analytics',
      'Order management',
      'Pi payment integration',
      'Pi Ad Network',
      'Basic theme colors',
      'Product reviews',
      'QR code generator',
      'Community support',
    ],
    storeTypes: ['physical'],
    popular: false
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    amount: 19, // 20π - 1π welcome discount
    originalAmount: 20,
    welcomeDiscount: 1,
    period: 'month',
    description: 'Perfect for starting your online business',
    features: [
      '1 Store (Physical, Online, or Digital)',
      '25 Products with variants',
      'Full theme customization',
      'Hero section editor',
      'Announcement bar',
      'Banner & logo upload',
      'Store pages (About, Contact, Policies)',
      'Social media integration',
      'Order & inventory tracking',
      'Product reviews & ratings',
      'Payout management',
      'Email notifications',
      'Standard support',
    ],
    storeTypes: ['physical', 'online', 'digital'],
    popular: false
  },
  grow: {
    id: 'grow',
    name: 'Grow',
    amount: 47, // 49π - 2π welcome discount
    originalAmount: 49,
    welcomeDiscount: 2,
    period: 'month',
    description: 'Scale your business with advanced tools',
    features: [
      '3 Stores (Any type)',
      'Unlimited products & variants',
      'Advanced analytics dashboard',
      'Revenue & performance tracking',
      'Customer analytics',
      'Traffic analytics',
      'Export orders (CSV)',
      'Advanced reporting',
      'Remove Drop Store branding',
      'Custom navigation menu',
      'Wishlist & compare features',
      'Stock count display',
      'Multiple staff accounts',
      'Priority email support',
      'All Basic features',
    ],
    storeTypes: ['physical', 'online', 'digital'],
    popular: true
  },
  advance: {
    id: 'advance',
    name: 'Advance',
    amount: 57, // 60π - 3π welcome discount
    originalAmount: 60,
    welcomeDiscount: 3,
    period: 'month',
    description: 'Professional tools for serious merchants',
    features: [
      '5 Stores (Any type)',
      'Everything in Grow +',
      'Custom domain support',
      'API access & webhooks',
      'Bulk product import/export',
      'Multi-staff management',
      'Advanced inventory alerts',
      'Automated stock tracking',
      'Custom integrations',
      'Advanced security settings',
      'Geographic analytics',
      'Device analytics',
      'Conversion tracking',
      'Priority chat & phone support',
      'Quarterly business review',
    ],
    storeTypes: ['physical', 'online', 'digital'],
    popular: false
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    amount: 95, // 100π - 5π welcome discount
    originalAmount: 100,
    welcomeDiscount: 5,
    period: 'month',
    description: 'Enterprise solution with premium support',
    features: [
      'Unlimited Stores (All types)',
      'Everything in Advance +',
      'Dedicated account manager',
      'Custom development support',
      'White-label branding',
      'SLA guarantee (99.9% uptime)',
      'Custom API integrations',
      'Enterprise security features',
      'Multi-location management',
      'Advanced fraud protection',
      'Custom reporting dashboard',
      'Training & onboarding',
      'Priority feature requests',
      '24/7 phone & chat support',
      'Monthly strategy calls',
    ],
    storeTypes: ['physical', 'online', 'digital'],
    popular: false
  }
};

// Plan limits - consistent type structure
export interface PlanLimits {
  maxStores: number;
  maxProductsPerStore: number;
  hasCustomDomain: boolean;
  hasAdvancedAnalytics: boolean;
  hasBranding: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  allowedStoreTypes: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxStores: 1,
    maxProductsPerStore: 1,
    hasCustomDomain: false,
    hasAdvancedAnalytics: false,
    hasBranding: true,
    hasApiAccess: false,
    hasPrioritySupport: false,
    allowedStoreTypes: ['physical'],
  },
  basic: {
    maxStores: 1,
    maxProductsPerStore: 25,
    hasCustomDomain: false,
    hasAdvancedAnalytics: false,
    hasBranding: true,
    hasApiAccess: false,
    hasPrioritySupport: false,
    allowedStoreTypes: ['physical', 'online', 'digital'],
  },
  grow: {
    maxStores: 3,
    maxProductsPerStore: 999999,
    hasCustomDomain: false,
    hasAdvancedAnalytics: true,
    hasBranding: false,
    hasApiAccess: false,
    hasPrioritySupport: true,
    allowedStoreTypes: ['physical', 'online', 'digital'],
  },
  advance: {
    maxStores: 5,
    maxProductsPerStore: 999999,
    hasCustomDomain: true,
    hasAdvancedAnalytics: true,
    hasBranding: false,
    hasApiAccess: true,
    hasPrioritySupport: true,
    allowedStoreTypes: ['physical', 'online', 'digital'],
  },
  plus: {
    maxStores: 999999,
    maxProductsPerStore: 999999,
    hasCustomDomain: true,
    hasAdvancedAnalytics: true,
    hasBranding: false,
    hasApiAccess: true,
    hasPrioritySupport: true,
    allowedStoreTypes: ['physical', 'online', 'digital'],
  }
};

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;
export type StoreType = keyof typeof STORE_TYPES;

// Platform Fee Configuration
export const PLATFORM_FEE_PERCENT = 0.05; // 5%

export const calculatePlatformFee = (amount: number): number => {
  return amount * PLATFORM_FEE_PERCENT;
};

export const calculateNetAmount = (amount: number): number => {
  return amount - calculatePlatformFee(amount);
};

export const calculateTotalWithFee = (baseAmount: number): number => {
  // When merchant sets a price, calculate what customer pays to cover platform fee
  return baseAmount / (1 - PLATFORM_FEE_PERCENT);
};

// Export the SDK manager and main functions
export { piSDK as default };

// Legacy exports for backward compatibility
export const initPiSdk = (sandbox: boolean = false) => piSDK.init(sandbox);
export const isPiAvailable = () => {
  try {
    return piSDK.isAvailable();
  } catch (error) {
    secureConsole.error('Error checking Pi availability:', error);
    return false;
  }
};

// Additional standalone exports for backward compatibility with existing hooks
export const isPiAdNetworkSupported = (): Promise<boolean> => {
  try {
    return withTimeout(Promise.resolve(piSDK.isAdNetworkSupported()), 5000).catch(() => false);
  } catch (error) {
    secureConsole.error('Error checking Pi Ad Network support:', error);
    return Promise.resolve(false);
  }
};

export const isPiAdReady = (adType: AdType): Promise<any> => {
  try {
    return withTimeout(Promise.resolve(PiAdNetwork.isAdReady(adType)), 10000).catch(() => false);
  } catch (error) {
    secureConsole.error('Error checking Pi Ad ready status:', error);
    return Promise.resolve(false);
  }
};

export const showPiAd = (adType: AdType): Promise<any> => {
  try {
    return withTimeout(Promise.resolve(PiAdNetwork.showAd(adType)), 30000);
  } catch (error) {
    secureConsole.error('Error showing Pi Ad:', error);
    return Promise.reject(error);
  }
};

export const requestPiAd = (adType: AdType): Promise<any> => {
  try {
    return withTimeout(Promise.resolve(PiAdNetwork.requestAd(adType)), 15000);
  } catch (error) {
    secureConsole.error('Error requesting Pi Ad:', error);
    return Promise.reject(error);
  }
};

// Verify rewarded ad status with Pi Platform API
export const verifyRewardedAdStatus = async (
  adId: string,
  accessToken: string
): Promise<{ rewarded: boolean; error?: string }> => {
  if (!adId || !accessToken) {
    return { rewarded: false, error: 'Missing adId or access token' };
  }

  try {
    const response = await fetch(`https://api.minepi.com/v2/ads_network/status/${adId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      secureConsole.error('Failed to verify ad status:', response.status, response.statusText);
      return { rewarded: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    // Check if reward is granted according to official Pi docs
    const rewarded = data.mediator_ack_status === 'granted';
    
    secureConsole.log('Ad verification result:', {
      adId,
      status: data.mediator_ack_status,
      rewarded,
    });

    return { rewarded };
  } catch (error) {
    secureConsole.error('Error verifying ad status:', error);
    return { rewarded: false, error: 'Network error' };
  }
};
