/**
 * Pi Network SDK - Complete Rewrite Based on Official Docs
 * https://pi-apps.github.io/community-developer-guide/
 * 
 * Following official patterns from:
 * - authentication.md
 * - payments.md
 * - ads.md
 * - SDK_reference.md
 */

// Import Window.Pi types from main pi-sdk to avoid conflicts
import { 
  PiUser, 
  PiAuthResult, 
  PiPaymentData, 
  PiPaymentCallbacks, 
  AdType,
  PiAdReadyResponse,
  PiAdShowResponse,
  PiAdRequestResponse
} from './pi-sdk';

// ============================================================================
// TYPE DEFINITIONS - Reexport and wrap types from pi-sdk
// ============================================================================

/** User Data Transfer Object from Pi API /me endpoint */
export interface UserDTO extends PiUser {}

/** Authentication result from Pi.authenticate() */
export interface AuthResult {
  user: UserDTO;
  accessToken: string;
}

/** Payment data for creating a payment */
export interface PaymentData extends PiPaymentData {}

/** Payment callbacks - called by Pi SDK during payment flow */
export interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: any) => void;
}

/** Response from Pi.Ads.isAdReady() */
export interface IsAdReadyResponse extends PiAdReadyResponse {}

/** Response from Pi.Ads.requestAd() */
export interface RequestAdResponse extends PiAdRequestResponse {}

/** Response from Pi.Ads.showAd() */
export interface ShowAdResponse extends PiAdShowResponse {}

// Ad types are already imported
export type { AdType };

// ============================================================================
// SDK INITIALIZATION
// ============================================================================

/**
 * Initialize Pi SDK
 * Must be called before using any Pi features
 */
export async function initializePiSDK(): Promise<boolean> {
  try {
    if (!window.Pi) {
      console.log('Pi SDK not loaded. Make sure this runs in Pi Browser.');
      return false;
    }

    // Initialize with version 2.0 (latest)
    window.Pi.init({ version: '2.0' });
    console.log('✅ Pi SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Pi SDK:', error);
    return false;
  }
}

/**
 * Check if Pi SDK is available
 */
export function isPiSDKAvailable(): boolean {
  return !!window.Pi;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Authenticate user with Pi Network
 * 
 * Step 1: Call Pi.authenticate() to get access token
 * Step 2: Verify token on your server with /me endpoint
 * 
 * @param onIncompletePaymentFound - Callback for incomplete payments
 * @returns AuthResult with user data and access token
 */
export async function authenticateWithPi(
  onIncompletePaymentFound: (payment: any) => void
): Promise<AuthResult> {
  if (!window.Pi) {
    throw new Error('Pi SDK is not available');
  }

  // Request scopes for authentication and payments
  const scopes = ['payments'];

  try {
    console.log('🔐 Starting Pi authentication...');
    
    const authResult = await window.Pi.authenticate(
      scopes,
      onIncompletePaymentFound
    );

    console.log('✅ User authenticated:', authResult.user.username);
    return authResult;
  } catch (error) {
    console.error('❌ Pi authentication failed:', error);
    throw error;
  }
}

/**
 * Verify access token with Pi Platform API /me endpoint
 * 
 * This should be called from your backend server
 * 
 * @param accessToken - Token from Pi.authenticate()
 * @returns User data from Pi API
 */
export async function verifyAccessTokenWithApi(accessToken: string): Promise<UserDTO> {
  try {
    const response = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API verification failed: ${response.status} ${response.statusText}`);
    }

    const userData: UserDTO = await response.json();
    console.log('✅ Token verified with Pi API');
    return userData;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    throw error;
  }
}

// ============================================================================
// PAYMENTS - USER TO APP
// ============================================================================

/**
 * Create a payment request from user to app
 * 
 * Payment Flow:
 * 1. createPayment() - Frontend initiates payment
 * 2. onReadyForServerApproval - Backend approves payment
 * 3. User signs transaction in Pi Wallet
 * 4. onReadyForServerCompletion - Backend completes payment
 * 
 * @param amount - Amount of Pi to request
 * @param memo - Description of payment (shown to user)
 * @param metadata - Custom data for your app
 * @param callbacks - Callbacks for payment flow stages
 */
export function createPaymentRequest(
  amount: number,
  memo: string,
  metadata: Record<string, any> | undefined,
  callbacks: PaymentCallbacks
): void {
  if (!window.Pi) {
    callbacks.onError(new Error('Pi SDK is not available'));
    return;
  }

  const paymentData: PaymentData = {
    amount,
    memo,
    metadata,
  };

  console.log('💳 Creating payment request:', { amount, memo });

  window.Pi.createPayment(paymentData, callbacks);
}

/**
 * Approve payment on your backend
 * 
 * Called from your backend server during onReadyForServerApproval callback
 * 
 * @param paymentId - Payment ID from SDK
 * @param apiKey - Your Pi API key from environment
 * @returns Payment approval response
 */
export async function approvePaymentWithBackend(
  paymentId: string,
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Approval failed: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Payment approved by backend:', paymentId);
    return await response.json();
  } catch (error) {
    console.error('❌ Payment approval failed:', error);
    throw error;
  }
}

/**
 * Complete payment on your backend after user signs transaction
 * 
 * Called from your backend server during onReadyForServerCompletion callback
 * 
 * @param paymentId - Payment ID from SDK
 * @param txid - Transaction ID from blockchain
 * @param apiKey - Your Pi API key from environment
 * @returns Payment completion response
 */
export async function completePaymentWithBackend(
  paymentId: string,
  txid: string,
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!response.ok) {
      throw new Error(`Completion failed: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Payment completed:', paymentId);
    return await response.json();
  } catch (error) {
    console.error('❌ Payment completion failed:', error);
    throw error;
  }
}

// ============================================================================
// AD NETWORK
// ============================================================================

/**
 * Check if ad network is supported in user's Pi Browser
 * 
 * Old Pi Browser versions may not support ads
 */
export async function isAdNetworkSupported(): Promise<boolean> {
  if (!window.Pi) {
    return false;
  }

  try {
    const nativeFeatures = await window.Pi.nativeFeaturesList();
    const supported = nativeFeatures.includes('ad_network');
    console.log(`📢 Ad Network supported: ${supported}`);
    return supported;
  } catch (error) {
    console.error('Error checking ad network support:', error);
    return false;
  }
}

/**
 * Check if an ad is ready to be displayed
 * 
 * @param adType - 'interstitial' or 'rewarded'
 * @returns Whether ad is ready
 */
export async function checkIfAdReady(adType: AdType): Promise<boolean> {
  if (!window.Pi?.Ads) {
    return false;
  }

  try {
    const response = await window.Pi.Ads.isAdReady(adType);
    return response.ready;
  } catch (error) {
    console.error(`Error checking if ${adType} ad is ready:`, error);
    return false;
  }
}

/**
 * Request ad from Pi Ad Network
 * 
 * Use this if checkIfAdReady() returns false
 * 
 * @param adType - 'interstitial' or 'rewarded'
 * @returns Request response
 */
export async function requestAdFromNetwork(adType: AdType): Promise<RequestAdResponse> {
  if (!window.Pi?.Ads) {
    throw new Error('Pi Ads not available');
  }

  try {
    const response = await window.Pi.Ads.requestAd(adType);
    console.log(`📢 Ad request response (${adType}):`, response.result);
    return response;
  } catch (error) {
    console.error(`Error requesting ${adType} ad:`, error);
    throw error;
  }
}

/**
 * Display an interstitial ad
 * 
 * Full-screen ad, usually shown between content
 * 
 * @returns Ad display response
 */
export async function showInterstitialAd(): Promise<ShowAdResponse> {
  if (!window.Pi?.Ads) {
    throw new Error('Pi Ads not available');
  }

  try {
    console.log('📢 Showing interstitial ad...');
    const response = await window.Pi.Ads.showAd('interstitial');
    console.log('✅ Interstitial ad result:', response.result);
    return response;
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
    throw error;
  }
}

/**
 * Display a rewarded ad
 * 
 * Full-screen ad in exchange for reward
 * 
 * IMPORTANT: Must verify with backend before rewarding user!
 * 
 * @returns Ad display response with adId for verification
 */
export async function showRewardedAd(): Promise<ShowAdResponse> {
  if (!window.Pi?.Ads) {
    throw new Error('Pi Ads not available');
  }

  try {
    console.log('📢 Showing rewarded ad...');
    const response = await window.Pi.Ads.showAd('rewarded');
    console.log('✅ Rewarded ad result:', response.result, 'Ad ID:', response.adId);
    return response;
  } catch (error) {
    console.error('Error showing rewarded ad:', error);
    throw error;
  }
}

/**
 * Verify rewarded ad completion with backend
 * 
 * IMPORTANT: Always verify before rewarding user!
 * Users might be running hacked SDK versions
 * 
 * @param adId - Ad ID from showRewardedAd() response
 * @param accessToken - User's Pi access token
 * @param apiKey - Your Pi API key
 * @returns Verification result
 */
export async function verifyRewardedAdWithBackend(
  adId: string,
  accessToken: string,
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch(`https://api.minepi.com/v2/ads/${adId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'X-User-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Rewarded ad verified:', result);
    return result;
  } catch (error) {
    console.error('❌ Rewarded ad verification failed:', error);
    throw error;
  }
}

// ============================================================================
// ADVANCED USAGE
// ============================================================================

/**
 * Request wallet address from user
 * 
 * Available in newer Pi Browser versions
 */
export async function requestWalletAddress(): Promise<string | null> {
  if (!window.Pi) {
    return null;
  }

  try {
    // This method may not be available in all Pi Browser versions
    if (window.Pi.requestWalletAddress) {
      const address = await (window.Pi.requestWalletAddress as any)();
      console.log('✅ Wallet address requested:', address);
      return address;
    }
    return null;
  } catch (error) {
    console.warn('requestWalletAddress not available or user declined');
    return null;
  }
}

/**
 * Open URL in system browser
 * 
 * Useful for opening external links
 */
export async function openLinkInSystemBrowser(url: string): Promise<void> {
  if (!window.Pi?.openUrlInSystemBrowser) {
    window.open(url, '_blank');
    return;
  }

  try {
    await window.Pi.openUrlInSystemBrowser(url);
  } catch (error) {
    console.error('Error opening URL in system browser:', error);
    window.open(url, '_blank');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const PiSDK = {
  // Initialization
  initialize: initializePiSDK,
  isAvailable: isPiSDKAvailable,

  // Authentication
  authenticate: authenticateWithPi,
  verifyToken: verifyAccessTokenWithApi,

  // Payments
  createPayment: createPaymentRequest,
  approvePayment: approvePaymentWithBackend,
  completePayment: completePaymentWithBackend,

  // Ad Network
  isAdNetworkSupported,
  checkAdReady: checkIfAdReady,
  requestAd: requestAdFromNetwork,
  showInterstitialAd,
  showRewardedAd,
  verifyRewardedAd: verifyRewardedAdWithBackend,

  // Advanced
  requestWalletAddress,
  openLink: openLinkInSystemBrowser,
};

export default PiSDK;
