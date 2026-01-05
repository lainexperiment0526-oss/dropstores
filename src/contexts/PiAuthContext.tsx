import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  initPiSdk, 
  authenticateWithPi, 
  isPiAvailable,
  PiUser, 
  PiAuthResult,
  PiPaymentDTO
} from '@/lib/pi-sdk';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface PiAuthContextType {
  user: User | null;
  piUser: PiUser | null;
  piAccessToken: string | null;
    walletAddress: string | null;
  isPiAuthenticated: boolean;
  isPiAvailable: boolean;
  isLoading: boolean;
  signInWithPi: (shouldNavigate?: boolean) => Promise<void>;
  linkPiAccount: () => Promise<void>;
  fetchWalletAddress: () => Promise<void>;
  signInWithPiScopes: (scopes: string[], shouldNavigate?: boolean) => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [piAvailable, setPiAvailable] = useState(false);
  const navigate = useNavigate();

  // Initialize Pi SDK on mount
  useEffect(() => {
    console.log('PiAuth: Initializing Pi SDK...');
    // Use sandbox mode from environment variable
    const isSandbox = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
    
    console.log('PiAuth: Configuration:', {
      sandbox: isSandbox,
      network: isSandbox ? 'sandbox' : 'mainnet',
      apiUrl: isSandbox ? 'https://sandbox.minepi.com' : 'https://api.minepi.com'
    });
    
    initPiSdk(isSandbox).then((initialized) => {
      if (initialized) {
        const available = isPiAvailable();
        setPiAvailable(available);
        console.log('PiAuth: Pi SDK availability:', available);
      } else {
        setPiAvailable(false);
        console.log('PiAuth: Pi SDK initialization failed');
      }
    });
  }, []);

  // Handle incomplete payments found during authentication
  const handleIncompletePayment = useCallback((payment: PiPaymentDTO) => {
    console.log('Incomplete payment found:', payment);
    toast.info('You have an incomplete payment. Please complete it to continue.');
  }, []);

  // Sign in with Pi Network - Always requests username, payments, wallet_address scopes
  const signInWithPi = async (shouldNavigate: boolean = true) => {
    if (!piAvailable) {
      toast.error('Pi Network is not available. Please open this app in Pi Browser.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('PiAuth: Starting Pi authentication with default scopes');
      let result: PiAuthResult | null = null;

      try {
        result = await authenticateWithPi(handleIncompletePayment);
      } catch (authError) {
        console.error('PiAuth: Authentication threw error:', authError);
        const errorMessage = authError instanceof Error ? authError.message : 'Pi authentication failed';
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!result) {
        console.log('PiAuth: No result from Pi authentication');
        toast.error('Pi authentication was cancelled or failed.');
        setIsLoading(false);
        return;
      }

      if (!result.user?.uid || !result.user?.username) {
        console.error('PiAuth: Invalid user data from Pi:', result.user);
        toast.error('Invalid user data received. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('PiAuth: Received Pi user data:', {
        username: result.user.username,
        uid: result.user.uid,
        wallet_address: result.user.wallet_address || 'not provided'
      });

      // Set Pi user and access token
      setPiUser(result.user);
      setPiAccessToken(result.accessToken);
      
      // Set wallet address if provided
      if (result.user.wallet_address) {
        setWalletAddress(result.user.wallet_address);
        console.log('PiAuth: Wallet address retrieved from authentication:', result.user.wallet_address);
      } else {
        console.log('PiAuth: Wallet address not in authentication response, will fetch separately');
        // Try to fetch wallet address immediately
        setTimeout(() => fetchWalletAddress(result.accessToken), 500);
      }

      // Verify the authentication on the backend and get Supabase session
      console.log('PiAuth: Calling backend pi-auth function...');
      const { data, error } = await supabase.functions.invoke('pi-auth', {
        body: { 
          accessToken: result.accessToken,
          piUser: result.user
        }
      });

      if (error) {
        console.error('PiAuth: Backend verification failed:', error);
        setPiUser(null);
        setPiAccessToken(null);
        toast.error('Authentication verification failed. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('PiAuth: Backend response:', data);
      
      // Update wallet address from backend response if available
      if (data?.walletAddress) {
        setWalletAddress(data.walletAddress);
      }

      // If backend returns a Supabase session, set it
      if (data && data.session) {
        console.log('PiAuth: Setting Supabase session...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        if (sessionError) {
          console.error('PiAuth: Failed to set session:', sessionError);
          setPiUser(null);
          setPiAccessToken(null);
          toast.error('Failed to complete sign in. Please try again.');
          setIsLoading(false);
          return;
        }
        
        console.log('PiAuth: Session set successfully!');
        
        // Store/update Pi user data in database
        const sessionUserId = data.session.user?.id || data.userId;
        if (sessionUserId) {
          const { error: storeError } = await supabase
            .from('pi_users')
            .upsert({
              user_id: sessionUserId,
              pi_uid: result.user.uid,
              pi_username: result.user.username,
              wallet_address: result.user.wallet_address || data.walletAddress || null,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'pi_uid'
            });
          if (storeError) {
            console.warn('PiAuth: Failed to store Pi user data:', storeError);
          } else {
            console.log('PiAuth: Pi user data stored successfully');
          }
        }
        
        toast.success(`Welcome, ${result.user.username}!`);
        
        // Only navigate if requested
        if (shouldNavigate) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        }
      } else {
        console.error('PiAuth: No session returned from backend');
        setPiUser(null);
        setPiAccessToken(null);
        toast.error('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('✗ PiAuth: Unexpected error:', error);
      setPiUser(null);
      setPiAccessToken(null);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(`Failed to authenticate: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with custom scopes (e.g., ['username','payments','wallet_address'])
  const signInWithPiScopes = async (scopes: string[], shouldNavigate: boolean = true) => {
    console.log('=== Pi Auth Flow Started ===');
    console.log('piAvailable:', piAvailable);
    console.log('window.Pi:', typeof window !== 'undefined' && window.Pi ? 'available' : 'not available');
    
    if (!piAvailable) {
      const message = 'Pi Network is not available. Please open this app in Pi Browser.';
      console.error(message);
      toast.error(message);
      return;
    }

    // Double check Pi SDK is available
    if (typeof window === 'undefined' || !window.Pi) {
      const message = 'Pi SDK not loaded. Please refresh the page or open in Pi Browser.';
      console.error(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    try {
      console.log('PiAuth: Starting sign in with scopes:', scopes);
      console.log('PiAuth: Calling authenticateWithPi...');
      
      let result: PiAuthResult | null = null;
      
      try {
        result = await authenticateWithPi(handleIncompletePayment, scopes);
        console.log('PiAuth: authenticateWithPi returned:', result ? 'success' : 'null');
      } catch (authError) {
        console.error('PiAuth: Authentication threw error:', authError);
        const errorMessage = authError instanceof Error ? authError.message : 'Pi authentication failed';
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!result) {
        console.log('PiAuth: No result from Pi authentication (user may have cancelled)');
        toast.error('Pi authentication was cancelled or failed.');
        setIsLoading(false);
        return;
      }

      if (!result.user || !result.user.uid || !result.user.username) {
        console.error('PiAuth: Invalid user data:', result.user);
        toast.error('Invalid user data received. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('PiAuth: Got authentication result:', {
        username: result.user.username,
        uid: result.user.uid,
        wallet: result.user.wallet_address ? 'yes' : 'no'
      });

      setPiUser(result.user);
      setPiAccessToken(result.accessToken);
      if (result.user.wallet_address) setWalletAddress(result.user.wallet_address);

      console.log('PiAuth: Calling backend pi-auth function...');
      const { data, error } = await supabase.functions.invoke('pi-auth', {
        body: { 
          accessToken: result.accessToken, 
          piUser: result.user 
        }
      });

      if (error) {
        console.error('PiAuth: Backend verification failed:', error);
        setPiUser(null);
        setPiAccessToken(null);
        toast.error('Authentication verification failed. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('PiAuth: Backend response:', data);

      if (data?.session) {
        console.log('PiAuth: Setting session...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error('PiAuth: Failed to set session:', sessionError);
          setPiUser(null);
          setPiAccessToken(null);
          toast.error('Failed to complete sign in. Please try again.');
          setIsLoading(false);
          return;
        }

        console.log('✓ PiAuth: Session set and user authenticated:', result.user.username);
        toast.success(`Welcome, ${result.user.username}!`);
        
        if (shouldNavigate) {
          setTimeout(() => navigate('/dashboard'), 100);
        }
      } else {
        console.error('PiAuth: No session in backend response');
        setPiUser(null);
        setPiAccessToken(null);
        toast.error('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('✗ PiAuth: Unexpected error:', error);
      setPiUser(null);
      setPiAccessToken(null);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(`Failed to authenticate: ${errorMessage}`);
    } finally {
      console.log('=== Pi Auth Flow Ended ===');
      setIsLoading(false);
    }
  };

  // Fetch wallet address from Pi Platform API
  const fetchWalletAddress = async (token?: string) => {
    const accessToken = token || piAccessToken;
    
    if (!accessToken) {
      console.warn('PiAuth: No access token available for wallet address fetch');
      toast.error('Please authenticate first');
      return;
    }

    setIsLoading(true);
    try {
      console.log('PiAuth: Fetching wallet address from Pi Platform API...');
      const response = await fetch('https://api.minepi.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PiAuth: API error response:', response.status, errorData);
        throw new Error(`Failed to fetch wallet address: ${response.status}`);
      }

      const userData = await response.json();
      console.log('PiAuth: API response:', { uid: userData.uid, username: userData.username, has_wallet: !!userData.wallet_address });
      
      if (userData.wallet_address) {
        setWalletAddress(userData.wallet_address);
        
        // Update piUser with wallet address
        if (piUser) {
          setPiUser({ ...piUser, wallet_address: userData.wallet_address });
        }
        
        console.log('✓ PiAuth: Wallet address retrieved:', userData.wallet_address);
        toast.success('Wallet address retrieved!');
      } else {
        console.warn('PiAuth: No wallet address found for this account');
        toast.warning('No wallet address found for this account');
      }
    } catch (error) {
      console.error('✗ PiAuth: Failed to fetch wallet:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to fetch wallet address: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Link Pi account to existing user
  const linkPiAccount = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    if (!piAvailable) {
      toast.error('Pi Network is not available');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authenticateWithPi(handleIncompletePayment);
      
      if (!result) {
        toast.error('Pi authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!result.user?.uid || !result.user?.username) {
        console.error('Invalid user data:', result.user);
        toast.error('Invalid user data received. Please try again.');
        setIsLoading(false);
        return;
      }

      // Store Pi user data linked to current user
      const { error } = await supabase
        .from('pi_users')
        .upsert({
          user_id: user.id,
          pi_uid: result.user.uid,
          pi_username: result.user.username,
          wallet_address: result.user.wallet_address || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'pi_uid'
        });

      if (error) {
        console.error('Failed to link Pi account:', error);
        toast.error('Failed to link Pi account. Please try again.');
        setIsLoading(false);
        return;
      }

      setPiUser(result.user);
      setPiAccessToken(result.accessToken);
      toast.success('Pi account linked successfully!');
    } catch (error) {
      console.error('Pi linking error:', error);
      toast.error('Failed to link Pi account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PiAuthContext.Provider 
      value={{ 
        user,
        piUser, 
        piAccessToken, 
          walletAddress,
        isPiAuthenticated: !!piUser,
        isPiAvailable: piAvailable,
        isLoading,
        signInWithPi,
        linkPiAccount,
        fetchWalletAddress,
        signInWithPiScopes
      }}
    >
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error('usePiAuth must be used within a PiAuthProvider');
  }
  return context;
}
