import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import PiSDK, { UserDTO, AuthResult } from '@/lib/pi-sdk-new';
import { toast } from 'sonner';

interface PiAuthContextType {
  // Auth state
  supabaseUser: User | null;
  piUser: UserDTO | null;
  piAccessToken: string | null;
  walletAddress: string | null;
  
  // Status
  isAuthenticated: boolean;
  isPiAvailable: boolean;
  isLoading: boolean;
  
  // Methods
  authenticateWithPi: () => Promise<void>;
  fetchWalletAddress: (token?: string, options?: { silent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Auth state
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [piUser, setPiUser] = useState<UserDTO | null>(null);
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [piAvailable, setPiAvailable] = useState(false);

  // ========================================================================
  // 1. Initialize Pi SDK on mount
  // ========================================================================
  useEffect(() => {
    const initPi = async () => {
      try {
        const initialized = await PiSDK.initialize();
        setPiAvailable(initialized);
        
        if (initialized) {
          console.log('✅ Pi SDK initialized and ready');
        } else {
          console.log('⚠️ Pi SDK not available - please open in Pi Browser');
        }
      } catch (error) {
        console.error('Error initializing Pi SDK:', error);
        setPiAvailable(false);
      }
    };

    initPi();
  }, []);

  // ========================================================================
  // 2. Restore session from Supabase on mount
  // ========================================================================
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          // Get stored Pi user data
          const storedPiUser = localStorage.getItem('piUser');
          const storedAccessToken = localStorage.getItem('piAccessToken');
          const storedWalletAddress = localStorage.getItem('walletAddress');
          
          if (storedPiUser) setPiUser(JSON.parse(storedPiUser));
          if (storedAccessToken) setPiAccessToken(storedAccessToken);
          if (storedWalletAddress) setWalletAddress(storedWalletAddress);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      }
    };

    restoreSession();
  }, []);

  // ========================================================================
  // 3. Handle incomplete payments
  // ========================================================================
  const handleIncompletePayment = useCallback((payment: any) => {
    console.log('⚠️ Incomplete payment detected:', payment);
    toast.warning('You have an incomplete payment. Please complete it.');
  }, []);

  // ========================================================================
  // 4. Authenticate with Pi
  // ========================================================================
  const authenticateWithPi = async () => {
    if (!piAvailable) {
      toast.error('Pi Network not available. Please open in Pi Browser.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Get auth result from Pi SDK
      console.log('🔐 Step 1: Authenticating with Pi...');
      const authResult: AuthResult = await PiSDK.authenticate(handleIncompletePayment);
      
      if (!authResult?.user?.uid) {
        throw new Error('No user data returned from Pi authentication');
      }

      // Step 2: Store Pi user data locally
      console.log('💾 Step 2: Storing Pi user data locally...');
      setPiUser(authResult.user);
      setPiAccessToken(authResult.accessToken);
      localStorage.setItem('piUser', JSON.stringify(authResult.user));
      localStorage.setItem('piAccessToken', authResult.accessToken);

      // Step 3: Verify token with Pi API
      console.log('🔍 Step 3: Verifying token with Pi API...');
      try {
        const verifiedUser = await PiSDK.verifyToken(authResult.accessToken);
        console.log('✅ Token verified. User:', verifiedUser.username);
      } catch (verifyError) {
        console.warn('⚠️ Token verification failed (may be offline):', verifyError);
        // Continue anyway - token will be verified on server
      }

      // Step 4: Create/update Supabase session
      console.log('🔐 Step 4: Creating Supabase session...');
      const { data: { session } } = await supabase.auth.signInWithPassword({
        email: `${authResult.user.uid}@pi.app`, // Use Pi UID as unique identifier
        password: authResult.accessToken, // Use access token as password
      }).catch(async () => {
        // If user doesn't exist, sign up
        return await supabase.auth.signUp({
          email: `${authResult.user.uid}@pi.app`,
          password: authResult.accessToken,
          options: {
            data: {
              pi_uid: authResult.user.uid,
              pi_username: authResult.user.username,
              pi_wallet_address: authResult.user.wallet_address,
            }
          }
        });
      });

      if (session?.user) {
        setSupabaseUser(session.user);
        console.log('✅ Supabase session created');
      }

      // Step 5: Request wallet address if available
      console.log('📱 Step 5: Requesting wallet address...');
      const address = await PiSDK.requestWalletAddress();
      if (address) {
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
      }

      toast.success('✅ Authenticated with Pi Network!');
      navigate('/dashboard');

    } catch (error) {
      console.error('❌ Authentication failed:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
      
      // Clear local state on error
      setPiUser(null);
      setPiAccessToken(null);
      localStorage.removeItem('piUser');
      localStorage.removeItem('piAccessToken');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // 5. Fetch wallet address separately
  // ========================================================================
  const fetchWalletAddress = async (token?: string, options: { silent?: boolean } = {}) => {
    const accessToken = token || piAccessToken;
    if (!accessToken) {
      if (!options.silent) {
        toast.error('Please authenticate first');
      }
      return;
    }
    try {
      const address = await PiSDK.requestWalletAddress();
      if (address) {
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        if (!options.silent) {
          toast.success('Wallet address retrieved!');
        }
      }
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      if (!options.silent) {
        toast.error('Failed to fetch wallet address');
      }
    }
  };

  // ========================================================================
  // 6. Logout
  // ========================================================================
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setPiUser(null);
      setPiAccessToken(null);
      setWalletAddress(null);
      localStorage.removeItem('piUser');
      localStorage.removeItem('piAccessToken');
      localStorage.removeItem('walletAddress');
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  // ========================================================================
  // Context value
  // ========================================================================
  const value: PiAuthContextType = {
    supabaseUser,
    piUser,
    piAccessToken,
    walletAddress,
    isAuthenticated: !!supabaseUser && !!piUser,
    isPiAvailable: piAvailable,
    isLoading,
    authenticateWithPi,
    fetchWalletAddress,
    logout,
  };

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}

// ============================================================================
// Hook to use Pi Auth
// ============================================================================
export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (!context) {
    throw new Error('usePiAuth must be used within a PiAuthProvider');
  }
  return context;
}

export default PiAuthContext;
