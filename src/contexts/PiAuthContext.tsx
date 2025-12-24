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
    // Use sandbox mode if explicitly enabled, otherwise use mainnet
    const isSandbox = false; // Mainnet mode for production
    
    console.log('PiAuth: Configuration:', {
      sandbox: isSandbox,
      network: import.meta.env.VITE_PI_NETWORK,
      apiUrl: import.meta.env.VITE_API_URL
    });
    
    initPiSdk(isSandbox);
    const available = isPiAvailable();
    setPiAvailable(available);
    
    console.log('PiAuth: Pi SDK availability:', available);
  }, []);

  // Handle incomplete payments found during authentication
  const handleIncompletePayment = useCallback((payment: PiPaymentDTO) => {
    console.log('Incomplete payment found:', payment);
    toast.info('You have an incomplete payment. Please complete it to continue.');
  }, []);

  // Sign in with Pi Network
  const signInWithPi = async (shouldNavigate: boolean = true) => {
    if (!piAvailable) {
      toast.error('Pi Network is not available. Please open this app in Pi Browser.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('PiAuth: Starting Pi authentication...');
      const result: PiAuthResult | null = await authenticateWithPi(handleIncompletePayment);
      
      if (result) {
        console.log('PiAuth: Pi SDK auth successful, user:', result.user.username);
        setPiUser(result.user);
        setPiAccessToken(result.accessToken);
        
                // Try to fetch wallet address automatically
                if (result.user.wallet_address) {
                  setWalletAddress(result.user.wallet_address);
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
          toast.error('Authentication verification failed. Please try again.');
          return;
        }

        console.log('PiAuth: Backend response:', data);

        // If backend returns a Supabase session, set it
        if (data && data.session) {
          console.log('PiAuth: Setting Supabase session...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          
          if (sessionError) {
            console.error('PiAuth: Failed to set session:', sessionError);
            toast.error('Failed to complete sign in. Please try again.');
            return;
          }
          
          console.log('PiAuth: Session set successfully!');
          toast.success(`Welcome, ${result.user.username}!`);
          
          // Only navigate if requested
          if (shouldNavigate) {
            // Small delay to ensure session is propagated
            setTimeout(() => {
              navigate('/dashboard');
            }, 100);
          }
        } else {
          console.error('PiAuth: No session returned from backend');
          toast.error('Authentication failed. Please try again.');
        }
      } else {
        console.log('PiAuth: No result from Pi authentication');
        toast.error('Pi authentication was cancelled or failed.');
      }
    } catch (error) {
      console.error('PiAuth: Pi authentication error:', error);
      toast.error('Failed to authenticate with Pi Network. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with custom scopes (e.g., ['username','payments','wallet_address'])
  const signInWithPiScopes = async (scopes: string[], shouldNavigate: boolean = true) => {
    if (!piAvailable) {
      toast.error('Pi Network is not available. Please open this app in Pi Browser.');
      return;
    }

    setIsLoading(true);
    try {
      const result: PiAuthResult | null = await authenticateWithPi(handleIncompletePayment, scopes);
      if (result) {
        setPiUser(result.user);
        setPiAccessToken(result.accessToken);
        if (result.user.wallet_address) setWalletAddress(result.user.wallet_address);

        const { data, error } = await supabase.functions.invoke('pi-auth', {
          body: { accessToken: result.accessToken, piUser: result.user }
        });
        if (error) {
          console.error('PiAuth: Backend verification failed:', error);
          toast.error('Authentication verification failed.');
          return;
        }
        if (data && data.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          if (sessionError) {
            console.error('PiAuth: Failed to set session:', sessionError);
            toast.error('Failed to complete sign in.');
            return;
          }
          toast.success(`Welcome, ${result.user.username}!`);
          if (shouldNavigate) setTimeout(() => navigate('/dashboard'), 100);
        } else {
          toast.error('Authentication failed. Please try again.');
        }
      } else {
        toast.error('Pi authentication was cancelled or failed.');
      }
    } catch (error) {
      console.error('PiAuth: Pi authentication error:', error);
      toast.error('Failed to authenticate with Pi Network.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wallet address from Pi Platform API
  const fetchWalletAddress = async () => {
    if (!piAccessToken) {
      toast.error('Please authenticate first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.minepi.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${piAccessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet address');
      }

      const userData = await response.json();
      if (userData.wallet_address) {
        setWalletAddress(userData.wallet_address);
        
        // Update piUser with wallet address
        if (piUser) {
          setPiUser({ ...piUser, wallet_address: userData.wallet_address });
        }
        
        toast.success('Wallet address retrieved!');
      } else {
        toast.warning('No wallet address found for this account');
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      toast.error('Failed to fetch wallet address');
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
      
      if (result) {
        // Store Pi user data linked to current user
        const { error } = await supabase
          .from('pi_users')
          .upsert({
            user_id: user.id,
            pi_uid: result.user.uid,
            pi_username: result.user.username
          });

        if (error) {
          console.error('Failed to link Pi account:', error);
          toast.error('Failed to link Pi account');
          return;
        }

        setPiUser(result.user);
        setPiAccessToken(result.accessToken);
        toast.success('Pi account linked successfully!');
      }
    } catch (error) {
      console.error('Pi linking error:', error);
      toast.error('Failed to link Pi account');
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
