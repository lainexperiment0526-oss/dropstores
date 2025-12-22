// Pi Network SDK Types and Utilities
export interface PiUser {
  uid: string;
  username: string;
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
}

export interface PiAdShowResponse {
  result: 'AD_CLOSED' | 'AD_REWARDED' | 'AD_NOT_READY' | 'ADS_NOT_SUPPORTED';
  adId: string;
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
      Ads?: {
        isAdReady: (adType: string) => Promise<PiAdReadyResponse>;
        showAd: (adType: string) => Promise<PiAdShowResponse>;
        requestAd: (adType: string) => Promise<{ result: 'AD_LOADED' | 'AD_NOT_AVAILABLE' | 'ADS_NOT_SUPPORTED' }>;
      };
    };
  }
}

// Initialize Pi SDK
export const initPiSdk = (sandbox: boolean = false) => {
  if (typeof window !== 'undefined' && window.Pi) {
    const config = {
      version: '2.0',
      sandbox: sandbox
    };
    window.Pi.init(config);
    console.log('Pi SDK initialized:', {
      mode: sandbox ? 'sandbox' : 'mainnet',
      piNetwork: import.meta.env.VITE_PI_NETWORK || 'mainnet',
      hasApiKey: !!import.meta.env.VITE_PI_API_KEY
    });
  } else {
    console.warn('Pi SDK not available - ensure app is opened in Pi Browser');
  }
};

// Check if Pi SDK is available
export const isPiAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.Pi;
};

// Pi Authentication
export const authenticateWithPi = async (
  onIncompletePaymentFound?: (payment: PiPaymentDTO) => void
): Promise<PiAuthResult | null> => {
  if (!isPiAvailable()) {
    console.error('Pi SDK not available');
    return null;
  }

  try {
    const scopes = ['username', 'payments', 'wallet_address'];
    const result = await window.Pi!.authenticate(
      scopes,
      onIncompletePaymentFound || (() => {})
    );
    return result;
  } catch (error) {
    console.error('Pi authentication failed:', error);
    throw error;
  }
};

// Create Pi Payment
export const createPiPayment = (
  paymentData: PiPaymentData,
  callbacks: PiPaymentCallbacks
): void => {
  if (!isPiAvailable()) {
    callbacks.onError(new Error('Pi SDK not available'));
    return;
  }

  window.Pi!.createPayment(paymentData, callbacks);
};

// Pi AdNetwork - Check if ad is ready
export const isPiAdReady = async (adType: 'interstitial' | 'rewarded'): Promise<boolean> => {
  if (!isPiAvailable() || !window.Pi?.Ads) {
    return false;
  }

  try {
    const response = await window.Pi.Ads.isAdReady(adType);
    return response.ready === true;
  } catch {
    return false;
  }
};

// Pi AdNetwork - Request ad (manually load ad)
export const requestPiAd = async (
  adType: 'interstitial' | 'rewarded'
): Promise<boolean> => {
  if (!isPiAvailable() || !window.Pi?.Ads?.requestAd) {
    return false;
  }

  try {
    const response = await window.Pi.Ads.requestAd(adType);
    return response.result === 'AD_LOADED';
  } catch (error) {
    console.error('Failed to request Pi ad:', error);
    return false;
  }
};

// Pi AdNetwork - Show ad
export const showPiAd = async (
  adType: 'interstitial' | 'rewarded'
): Promise<{ adId: string; reward?: boolean } | null> => {
  if (!isPiAvailable() || !window.Pi?.Ads) {
    return null;
  }

  try {
    const response = await window.Pi.Ads.showAd(adType);
    
    if (response.result === 'AD_REWARDED' || response.result === 'AD_CLOSED') {
      return {
        adId: response.adId,
        reward: response.result === 'AD_REWARDED',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to show Pi ad:', error);
    return null;
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

// Subscription Plans - Updated pricing with welcome discounts
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    amount: 0,
    originalAmount: 0,
    welcomeDiscount: 0,
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      '1 Store (Physical only)',
      '1 Product listing',
      'Pi payment integration',
      'Pi Ad Network enabled',
      'Basic store customization',
      'Community support',
    ],
    storeTypes: ['physical'],
    popular: false
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    amount: 19, // 20 - 1 Pi welcome discount
    originalAmount: 20,
    welcomeDiscount: 1,
    period: 'month',
    description: 'Perfect for starting your Pi business',
    features: [
      '1 Store (Physical, Online, or Digital)',
      '25 Products per store',
      'Basic templates',
      'Standard support',
      'Pi payment integration',
      'Basic analytics',
      'Order management',
      'Customer notifications',
    ],
    storeTypes: ['physical', 'online', 'digital'],
    popular: false
  },
  grow: {
    id: 'grow',
    name: 'Grow',
    amount: 47, // 49 - 2 Pi welcome discount
    originalAmount: 49,
    welcomeDiscount: 2,
    period: 'month',
    description: 'For growing businesses',
    features: [
      '3 Stores (Any type)',
      'Unlimited products',
      'Premium templates',
      'Priority support',
      'Remove Drop Store branding',
      'Advanced analytics',
      'Custom store colors',
      'Export orders to CSV',
      'Promotional tools',
      'Inventory management',
    ],
    storeTypes: ['physical', 'online', 'digital'],
    popular: true
  },
  advance: {
    id: 'advance',
    name: 'Advance',
    amount: 57, // 60 - 3 Pi welcome discount
    originalAmount: 60,
    welcomeDiscount: 3,
    period: 'month',
    description: 'Advanced features for serious sellers',
    features: [
      '5 Stores (Any type)',
      'Everything in Grow',
      'Custom domain support',
      'API access',
      'Bulk product import',
      'Multi-staff access',
      'Advanced reporting',
      'Priority queue support',
      'Automated inventory alerts',
    ],
    storeTypes: ['physical', 'online', 'digital'],
    popular: false
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    amount: 95, // 100 - 5 Pi welcome discount
    originalAmount: 100,
    welcomeDiscount: 5,
    period: 'month',
    description: 'Enterprise-level features',
    features: [
      'Unlimited Stores (All types)',
      'Everything in Advance',
      'Dedicated account manager',
      'Custom integrations',
      'White-label option',
      'SLA guarantee',
      'Custom development support',
      'Advanced security features',
      'Multi-location management',
      'Enterprise analytics',
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
