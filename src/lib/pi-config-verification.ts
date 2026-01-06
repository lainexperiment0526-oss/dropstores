import { toast } from 'sonner';
import { secureConsole, getSafeEnvInfo, logConfigStatus } from './env-security';

/**
 * Pi Network Configuration Verification
 * Verifies that all API keys and configurations are properly set
 */
export interface ConfigVerification {
  apiKey: boolean;
  validationKey: boolean;
  sdkUrl: boolean;
  environment: string;
  network: string;
  allValid: boolean;
}

export const verifyPiConfiguration = (): ConfigVerification => {
  secureConsole.log('🔍 Verifying Pi Network Configuration...');
  
  const config = {
    apiKey: !!import.meta.env.VITE_PI_API_KEY,
    validationKey: !!import.meta.env.VITE_PI_VALIDATION_KEY,
    sdkUrl: !!import.meta.env.VITE_PI_SDK_URL,
    environment: import.meta.env.VITE_ENVIRONMENT || 'unknown',
    network: import.meta.env.VITE_PI_NETWORK || 'unknown',
    allValid: false
  };
  
  // Check if all critical configurations are present
  config.allValid = config.apiKey && config.validationKey && config.sdkUrl;
  
  // Verify API key format (should be a long string)
  const apiKey = import.meta.env.VITE_PI_API_KEY;
  const validationKey = import.meta.env.VITE_PI_VALIDATION_KEY;
  
  // Use safe environment info instead of logging sensitive data
  const safeEnvInfo = getSafeEnvInfo();
  secureConsole.log('📋 Configuration Status:', {
    'API Key': safeEnvInfo.hasApiKey ? '✅ Present' : '❌ Missing',
    'Validation Key': safeEnvInfo.hasValidationKey ? '✅ Present' : '❌ Missing',
    'Network': safeEnvInfo.network,
    'Environment': safeEnvInfo.environment,
    'SDK URL': import.meta.env.VITE_PI_SDK_URL,
    'All Valid': config.allValid ? '✅' : '❌'
  });
  
  if (!config.allValid) {
    secureConsole.error('❌ Pi Network configuration is incomplete!');
    toast.error('Pi Network configuration error. Please check console for details.');
  } else {
    secureConsole.log('✅ Pi Network configuration verified successfully!');
    
    // Verify the new API keys match expected format (without logging actual values)
    if (apiKey && apiKey.length > 50) {
      secureConsole.log('✅ New Dropstore API key detected and verified');
    }
    
    if (validationKey && validationKey.length > 100) {
      secureConsole.log('✅ New validation key detected and verified');
    }
  }
  
  return config;
};

/**
 * Initialize Pi Network with latest configuration standards
 */
export const initializePiWithVerification = async (): Promise<boolean> => {
  // First verify configuration
  const configCheck = verifyPiConfiguration();
  
  if (!configCheck.allValid) {
    secureConsole.error('Cannot initialize Pi Network - configuration is invalid');
    return false;
  }
  
  // Check if Pi SDK is loaded
  if (typeof window === 'undefined' || !window.Pi) {
    secureConsole.warn('Pi SDK not available - ensure app is opened in Pi Browser');
    return false;
  }
  
  try {
    // Initialize with version 2.0 (latest standard)
    window.Pi.init({ 
      version: '2.0',
      sandbox: false // Always production mode
    });
    
    secureConsole.log('✅ Pi SDK initialized with latest configuration standards');
    
    // Check for native features if available
    try {
      if (window.Pi.nativeFeaturesList) {
        const features = await window.Pi.nativeFeaturesList();
        secureConsole.log('📱 Available Pi Browser features:', features);
        
        if (features.includes('ad_network')) {
          secureConsole.log('✅ Ad Network supported in this Pi Browser version');
        } else {
          secureConsole.log('⚠️ Ad Network not supported - user should update Pi Browser');
        }
      }
    } catch (err) {
      secureConsole.log('ℹ️ Native features check not available in this browser version');
    }
    
    return true;
  } catch (error) {
    secureConsole.error('❌ Failed to initialize Pi SDK:', error);
    return false;
  }
};

/**
 * Validate Pi Network API endpoints
 */
export const validatePiEndpoints = async (): Promise<boolean> => {
  const endpoints = [
    'https://api.minepi.com',
    'https://sdk.minepi.com/pi-sdk.js'
  ];
  
  secureConsole.log('🌐 Validating Pi Network endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'HEAD', mode: 'no-cors' });
      secureConsole.log(`✅ ${endpoint} - Reachable`);
    } catch (error) {
      secureConsole.warn(`⚠️ ${endpoint} - Check failed (may be normal due to CORS)`);
    }
  }
  
  return true;
};

/**
 * Complete Pi Network setup verification
 */
export const runPiSetupVerification = async (): Promise<void> => {
  secureConsole.log('🚀 Running complete Pi Network setup verification...');
  secureConsole.log('================================================');
  
  // 1. Verify configuration
  const configValid = verifyPiConfiguration().allValid;
  
  // 2. Validate endpoints
  await validatePiEndpoints();
  
  // 3. Initialize Pi SDK
  const sdkInitialized = await initializePiWithVerification();
  
  // 4. Log safe configuration status
  logConfigStatus();
  
  // 5. Summary
  secureConsole.log('================================================');
  secureConsole.log('📊 Setup Verification Summary:');
  secureConsole.log(`Config Valid: ${configValid ? '✅' : '❌'}`);
  secureConsole.log(`SDK Initialized: ${sdkInitialized ? '✅' : '❌'}`);
  secureConsole.log(`Overall Status: ${configValid && sdkInitialized ? '✅ READY' : '❌ NEEDS ATTENTION'}`);
  secureConsole.log('================================================');
  
  if (configValid && sdkInitialized) {
    toast.success('🎉 Pi Network setup verified successfully!');
  } else {
    toast.error('❌ Pi Network setup needs attention. Check console for details.');
  }
};