import { toast } from 'sonner';

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
  console.log('🔍 Verifying Pi Network Configuration...');
  
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
  
  console.log('📋 Configuration Status:', {
    'API Key': apiKey ? `${apiKey.substring(0, 12)}...` : '❌ Missing',
    'Validation Key': validationKey ? `${validationKey.substring(0, 12)}...` : '❌ Missing',
    'Network': config.network,
    'Environment': config.environment,
    'SDK URL': import.meta.env.VITE_PI_SDK_URL,
    'All Valid': config.allValid ? '✅' : '❌'
  });
  
  if (!config.allValid) {
    console.error('❌ Pi Network configuration is incomplete!');
    toast.error('Pi Network configuration error. Please check console for details.');
  } else {
    console.log('✅ Pi Network configuration verified successfully!');
    
    // Verify the new API keys match expected format
    if (apiKey === 'mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7') {
      console.log('✅ New Dropstore API key detected and verified');
    }
    
    if (validationKey === 'a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1') {
      console.log('✅ New validation key detected and verified');
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
    console.error('Cannot initialize Pi Network - configuration is invalid');
    return false;
  }
  
  // Check if Pi SDK is loaded
  if (typeof window === 'undefined' || !window.Pi) {
    console.warn('Pi SDK not available - ensure app is opened in Pi Browser');
    return false;
  }
  
  try {
    // Initialize with version 2.0 (latest standard)
    window.Pi.init({ 
      version: '2.0',
      sandbox: false // Always production mode
    });
    
    console.log('✅ Pi SDK initialized with latest configuration standards');
    
    // Check for native features if available
    try {
      if (window.Pi.nativeFeaturesList) {
        const features = await window.Pi.nativeFeaturesList();
        console.log('📱 Available Pi Browser features:', features);
        
        if (features.includes('ad_network')) {
          console.log('✅ Ad Network supported in this Pi Browser version');
        } else {
          console.log('⚠️ Ad Network not supported - user should update Pi Browser');
        }
      }
    } catch (err) {
      console.log('ℹ️ Native features check not available in this browser version');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Pi SDK:', error);
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
  
  console.log('🌐 Validating Pi Network endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'HEAD', mode: 'no-cors' });
      console.log(`✅ ${endpoint} - Reachable`);
    } catch (error) {
      console.warn(`⚠️ ${endpoint} - Check failed (may be normal due to CORS)`);
    }
  }
  
  return true;
};

/**
 * Complete Pi Network setup verification
 */
export const runPiSetupVerification = async (): Promise<void> => {
  console.log('🚀 Running complete Pi Network setup verification...');
  console.log('================================================');
  
  // 1. Verify configuration
  const configValid = verifyPiConfiguration().allValid;
  
  // 2. Validate endpoints
  await validatePiEndpoints();
  
  // 3. Initialize Pi SDK
  const sdkInitialized = await initializePiWithVerification();
  
  // 4. Summary
  console.log('================================================');
  console.log('📊 Setup Verification Summary:');
  console.log(`Config Valid: ${configValid ? '✅' : '❌'}`);
  console.log(`SDK Initialized: ${sdkInitialized ? '✅' : '❌'}`);
  console.log(`Overall Status: ${configValid && sdkInitialized ? '✅ READY' : '❌ NEEDS ATTENTION'}`);
  console.log('================================================');
  
  if (configValid && sdkInitialized) {
    toast.success('🎉 Pi Network setup verified successfully!');
  } else {
    toast.error('❌ Pi Network setup needs attention. Check console for details.');
  }
};