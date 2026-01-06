// Pi Network SDK Types and Utilities
import { secureConsole, getSafeEnvInfo } from './env-security';

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

export interface PiAdReadyResponse {
  ready: boolean;
  type?: 'interstitial' | 'rewarded';
}

export interface PiAdShowResponse {
  result: 'AD_CLOSED' | 'AD_REWARDED' | 'AD_DISPLAY_ERROR' | 'AD_NETWORK_ERROR' | 'AD_NOT_AVAILABLE' | 'ADS_NOT_SUPPORTED' | 'USER_UNAUTHENTICATED';
  adId?: string;
  reward?: boolean;
}

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
      nativeFeaturesList?: () => Promise<string[]>;
      Ads?: {
        isAdReady: (adType: string) => Promise<PiAdReadyResponse>;
        showAd: (adType: string) => Promise<PiAdShowResponse>;
        requestAd: (adType: string) => Promise<{ result: 'AD_LOADED' | 'AD_FAILED_TO_LOAD' | 'AD_NOT_AVAILABLE' }>;
      };
    };
  }
}

// Initialize Pi SDK - Force production mainnet mode
export const initPiSdk = (sandbox: boolean = false): Promise<boolean> => {
  // Force production mode - ignore sandbox parameter
  const isProductionMode = true;
  const actualSandboxMode = false;
  
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      secureConsole.warn('Window object not available');
      resolve(false);
      return;
    }

    // Wait for Pi SDK to be loaded (max 5 seconds)
    let attempts = 0;
    const maxAttempts = 50;
    
    const initializeWhenReady = async () => {
      if (window.Pi) {
        // Official Pi SDK configuration - Force production mainnet
        const config = {
          version: '2.0',
          sandbox: false  // Always false for production
        };
        
        try {
          window.Pi.init(config);
          
          // Check for native features support (including ad network)
          let nativeFeatures: string[] = [];
          try {
            if (window.Pi.nativeFeaturesList) {
              nativeFeatures = await window.Pi.nativeFeaturesList();
            }
          } catch (err) {
            secureConsole.log('Native features check not available in this browser version');
          }
          
          // Use safe environment info for logging
          const safeInfo = getSafeEnvInfo();
          secureConsole.log('✓ Pi SDK initialized successfully:', {
            mode: 'mainnet',
            piNetwork: safeInfo.network,
            environment: safeInfo.environment,
            hasApiKey: safeInfo.hasApiKey,
            nativeFeatures,
            adNetworkSupported: nativeFeatures.includes('ad_network'),
            timestamp: new Date().toISOString()
          });
          resolve(true);
        } catch (error) {
          secureConsole.error('✗ Failed to initialize Pi SDK:', error);
          resolve(false);
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(initializeWhenReady, 100);
      } else {
        secureConsole.warn('Pi SDK not available after waiting - ensure app is opened in Pi Browser');
        resolve(false);
      }
    };
    
    // Start initialization
    initializeWhenReady();
  });
};

// Check if Pi SDK is available
export const isPiAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    console.debug('Window not available');
    return false;
  }
  
  const available = !!window.Pi;
  if (!available) {
    console.debug('Pi SDK not available. Ensure app is opened in Pi Browser.');
  }
  return available;
};

// Pi Authentication - Official Pi Network implementation
export const authenticateWithPi = async (
  onIncompletePaymentFound?: (payment: PiPaymentDTO) => void,
  reqScopes?: string[]
): Promise<PiAuthResult | null> => {
  if (!isPiAvailable()) {
    const error = 'Pi SDK not available - ensure app is opened in Pi Browser';
    console.error('✗', error);
    throw new Error(error);
  }

  if (!window.Pi || !window.Pi.authenticate) {
    const error = 'window.Pi.authenticate is not available';
    console.error('✗', error);
    throw new Error(error);
  }

  try {
    // Default scopes as per Pi documentation
    const defaultScopes = ['username', 'payments', 'wallet_address'];
    const scopes = reqScopes && reqScopes.length > 0 ? reqScopes : defaultScopes;
    
    // Ensure username is always included as per official docs
    if (!scopes.includes('username')) {
      scopes.push('username');
    }
    
    console.log('Starting Pi authentication with scopes:', scopes);
    
    const result = await window.Pi.authenticate(
      scopes,
      onIncompletePaymentFound || ((payment: PiPaymentDTO) => {
        console.warn('Incomplete payment detected:', payment);
      })
    );
    
    // Validate result
    if (!result) {
      console.error('✗ Pi authentication returned null result');
      return null;
    }

    if (!result.user) {
      console.error('✗ Pi authentication result missing user object:', result);
      return null;
    }

    const { user, accessToken } = result;

    // Validate required user fields
    if (!user.uid || !user.username) {
      console.error('✗ Pi authentication result missing required user fields:', {
        uid: user.uid || 'MISSING',
        username: user.username || 'MISSING'
      });
      return null;
    }
    
    // Log successful authentication
    console.log('✓ Pi authentication successful:', {
      username: user.username,
      uid: user.uid,
      wallet_address: user.wallet_address || 'will be fetched separately',
      hasAccessToken: !!accessToken
    });
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('✗ Pi authentication failed:', errorMessage);
    throw error;
  }
};

// Create Pi Payment
export const createPiPayment = (
  paymentData: PiPaymentData,
  callbacks: PiPaymentCallbacks
): void => {
  if (!isPiAvailable()) {
    const error = new Error('Pi SDK not available - ensure app is opened in Pi Browser');
    callbacks.onError(error);
    console.error('Payment creation failed:', error);
    return;
  }

  if (!paymentData || paymentData.amount <= 0) {
    const error = new Error('Invalid payment data: amount must be greater than 0');
    callbacks.onError(error);
    console.error('Payment validation failed:', error);
    return;
  }

  try {
    window.Pi!.createPayment(paymentData, callbacks);
    console.log('Payment created:', { amount: paymentData.amount, memo: paymentData.memo });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown payment creation error');
    callbacks.onError(err);
    console.error('Payment creation error:', err);
  }
};

// Pi AdNetwork - Check if AdNetwork is supported in current Pi Browser
export const isPiAdNetworkSupported = async (): Promise<boolean> => {
  if (!isPiAvailable()) {
    console.debug('Pi SDK not available');
    return false;
  }

  if (!window.Pi?.nativeFeaturesList) {
    console.debug('Pi nativeFeaturesList not available');
    return false;
  }

  try {
    const nativeFeatures = await window.Pi.nativeFeaturesList();
    const adNetworkSupported = nativeFeatures.includes('ad_network');
    console.log('Pi AdNetwork supported:', adNetworkSupported, 'Features:', nativeFeatures);
    return adNetworkSupported;
  } catch (error) {
    console.error('Error checking AdNetwork support:', error);
    return false;
  }
};

// Pi AdNetwork - Check if ad is ready
export const isPiAdReady = async (adType: 'interstitial' | 'rewarded'): Promise<boolean> => {
  if (!isPiAvailable()) {
    console.debug('Pi SDK not available for ad check');
    return false;
  }

  if (!window.Pi?.Ads?.isAdReady) {
    console.debug('Pi Ads API not available');
    return false;
  }

  try {
    const response = await window.Pi.Ads.isAdReady(adType);
    console.log(`${adType} ad ready status:`, response);
    return response?.ready === true;
  } catch (error) {
    console.error(`Error checking if ${adType} ad is ready:`, error);
    return false;
  }
};

// Pi AdNetwork - Request ad (manually load ad)
export const requestPiAd = async (
  adType: 'interstitial' | 'rewarded'
): Promise<string | null> => {
  if (!isPiAvailable()) {
    console.debug('Pi SDK not available for ad request');
    return null;
  }

  if (!window.Pi?.Ads?.requestAd) {
    console.debug('Pi Ads requestAd API not available');
    return null;
  }

  try {
    console.log(`Requesting ${adType} ad...`);
    const response = await window.Pi.Ads.requestAd(adType);
    console.log(`${adType} ad request result:`, response?.result);
    return response?.result || null;
  } catch (error) {
    console.error(`Failed to request ${adType} ad:`, error);
    return null;
  }
};

// Pi AdNetwork - Show ad (Official Pi Documentation implementation)
export const showPiAd = async (
  adType: 'interstitial' | 'rewarded'
): Promise<{ adId?: string; result: string; reward?: boolean } | null> => {
  if (!isPiAvailable()) {
    console.error('Pi SDK not available for showing ads');
    return null;
  }

  if (!window.Pi?.Ads?.showAd) {
    console.error('Pi Ads showAd API not available');
    return null;
  }

  try {
    console.log(`Showing ${adType} ad...`);
    const response = await window.Pi.Ads.showAd(adType);
    
    console.log(`${adType} ad response:`, response);
    
    if (!response) {
      console.warn(`Ad shown but no response returned`);
      return { result: 'AD_NOT_AVAILABLE' };
    }
    
    // Handle response according to official Pi docs
    switch (response.result) {
      case 'AD_REWARDED':
        console.log(`Rewarded ad completed successfully`, { adId: response.adId });
        return {
          adId: response.adId,
          result: response.result,
          reward: true,
        };
      
      case 'AD_CLOSED':
        console.log(`Ad closed successfully`, { adId: response.adId });
        return {
          adId: response.adId,
          result: response.result,
          reward: false,
        };
      
      case 'AD_NOT_AVAILABLE':
      case 'AD_DISPLAY_ERROR':
      case 'AD_NETWORK_ERROR':
        console.warn(`Ad error: ${response.result}`);
        return {
          result: response.result,
          reward: false,
        };
      
      case 'ADS_NOT_SUPPORTED':
        console.warn('Ads not supported on this Pi Browser version');
        return {
          result: response.result,
          reward: false,
        };
      
      case 'USER_UNAUTHENTICATED':
        console.warn('User not authenticated for rewarded ads');
        return {
          result: response.result,
          reward: false,
        };
      
      default:
        console.log(`Ad result: ${response.result}`);
        return {
          adId: response.adId,
          result: response.result,
          reward: false,
        };
    }
  } catch (error) {
    console.error(`Failed to show ${adType} ad:`, error);
    return { result: 'AD_DISPLAY_ERROR' };
  }
};

// Verify rewarded ad status with Pi Platform API (Official requirement)
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
      console.error('Failed to verify ad status:', response.status, response.statusText);
      return { rewarded: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    // Check if reward is granted according to official Pi docs
    const rewarded = data.mediator_ack_status === 'granted';
    
    console.log('Ad verification result:', {
      adId,
      status: data.mediator_ack_status,
      rewarded,
    });

    return { rewarded };
  } catch (error) {
    console.error('Error verifying ad status:', error);
    return { rewarded: false, error: 'Network error' };
  }
};

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
