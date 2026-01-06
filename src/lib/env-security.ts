/**
 * Environment Security Module
 * Prevents sensitive environment variables from being exposed in console logs
 */

// List of sensitive environment variables that should never be logged
const SENSITIVE_ENV_VARS = [
  'VITE_PI_API_KEY',
  'VITE_PI_VALIDATION_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_PI_PAYMENT_RECEIVER_WALLET',
  'VITE_DROP_DISTRIBUTOR',
  'VITE_DROP_ISSUER'
];

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

/**
 * Sanitize console arguments to remove sensitive data
 */
const sanitizeArgs = (args: any[]): any[] => {
  return args.map(arg => {
    if (typeof arg === 'string') {
      let sanitized = arg;
      SENSITIVE_ENV_VARS.forEach(envVar => {
        const envValue = import.meta.env[envVar];
        if (envValue && sanitized.includes(envValue)) {
          sanitized = sanitized.replace(new RegExp(envValue, 'g'), '[REDACTED]');
        }
      });
      return sanitized;
    }
    
    if (typeof arg === 'object' && arg !== null) {
      const sanitized = { ...arg };
      Object.keys(sanitized).forEach(key => {
        if (SENSITIVE_ENV_VARS.some(envVar => key.includes(envVar.replace('VITE_', '')))) {
          sanitized[key] = '[REDACTED]';
        }
        if (typeof sanitized[key] === 'string') {
          SENSITIVE_ENV_VARS.forEach(envVar => {
            const envValue = import.meta.env[envVar];
            if (envValue && sanitized[key].includes(envValue)) {
              sanitized[key] = '[REDACTED]';
            }
          });
        }
      });
      return sanitized;
    }
    
    return arg;
  });
};

/**
 * Secure console wrapper that prevents sensitive data from being logged
 */
export const secureConsole = {
  log: (...args: any[]) => {
    if (import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV) {
      originalConsole.log(...sanitizeArgs(args));
    }
  },
  
  error: (...args: any[]) => {
    originalConsole.error(...sanitizeArgs(args));
  },
  
  warn: (...args: any[]) => {
    originalConsole.warn(...sanitizeArgs(args));
  },
  
  info: (...args: any[]) => {
    if (import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV) {
      originalConsole.info(...sanitizeArgs(args));
    }
  },
  
  debug: (...args: any[]) => {
    if (import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV) {
      originalConsole.debug(...sanitizeArgs(args));
    }
  }
};

/**
 * Get sanitized environment info for debugging (safe to log)
 */
export const getSafeEnvInfo = () => {
  return {
    environment: import.meta.env.VITE_ENVIRONMENT,
    network: import.meta.env.VITE_PI_NETWORK,
    mainnetMode: import.meta.env.VITE_PI_MAINNET_MODE,
    sandboxMode: import.meta.env.VITE_PI_SANDBOX_MODE,
    devMode: import.meta.env.VITE_DEV_MODE,
    domain: import.meta.env.VITE_DOMAIN,
    platformName: import.meta.env.VITE_PLATFORM_NAME,
    // Only show existence of sensitive keys, not their values
    hasApiKey: !!import.meta.env.VITE_PI_API_KEY,
    hasValidationKey: !!import.meta.env.VITE_PI_VALIDATION_KEY,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    hasPaymentWallet: !!import.meta.env.VITE_PI_PAYMENT_RECEIVER_WALLET
  };
};

/**
 * Validate that sensitive environment variables are not being exposed
 */
export const validateEnvSecurity = () => {
  const issues: string[] = [];
  
  // Check if any sensitive values appear in localStorage or sessionStorage
  try {
    const storage = { ...localStorage, ...sessionStorage };
    Object.values(storage).forEach((value, index) => {
      SENSITIVE_ENV_VARS.forEach(envVar => {
        const envValue = import.meta.env[envVar];
        if (envValue && value.includes(envValue)) {
          issues.push(`Sensitive data found in storage item ${index}`);
        }
      });
    });
  } catch (err) {
    // Storage not available, skip check
  }
  
  return {
    secure: issues.length === 0,
    issues
  };
};

/**
 * Override console methods in production to prevent accidental logging
 */
export const enableProductionLoggingSecurity = () => {
  if (import.meta.env.VITE_ENVIRONMENT === 'production' && import.meta.env.VITE_DEV_MODE !== 'true') {
    // In production, only allow error and warn logs, and sanitize them
    console.log = secureConsole.log;
    console.info = () => {}; // Disable info logs in production
    console.debug = () => {}; // Disable debug logs in production
    console.warn = secureConsole.warn;
    console.error = secureConsole.error;
    
    secureConsole.warn('🔒 Production logging security enabled. Console logs are sanitized.');
  }
};

/**
 * Log configuration status safely (for debugging)
 */
export const logConfigStatus = () => {
  const safeInfo = getSafeEnvInfo();
  secureConsole.log('🔒 Environment Configuration Status:', safeInfo);
  
  const security = validateEnvSecurity();
  if (!security.secure) {
    secureConsole.warn('⚠️ Security issues detected:', security.issues);
  } else {
    secureConsole.log('✅ Environment security validation passed');
  }
};