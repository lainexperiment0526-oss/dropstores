import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { initPiSdk, isPiAvailable as checkPiAvailable, authenticateWithPi, PiAuthResult, PiPaymentDTO } from '@/lib/pi-sdk';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPiBrowser: boolean;
  isSdkReady: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  // Initialize Pi SDK
  useEffect(() => {
    console.log('Auth: Initializing Pi SDK...');
    initPiSdk(false).then((initialized) => {
      if (initialized) {
        const available = checkPiAvailable();
        setIsPiBrowser(available);
        setIsSdkReady(true);
        console.log('Auth: Pi SDK initialized, browser check:', available);
      } else {
        setIsPiBrowser(false);
        setIsSdkReady(true); // Still mark as ready even if not in Pi Browser for demo mode
        console.log('Auth: Pi SDK initialization failed, marking as ready for demo');
      }
    });
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Pi Network login function
  const login = async () => {
    if (!isSdkReady) {
      throw new Error('Pi SDK is not ready yet. Please wait...');
    }

    if (!isPiBrowser) {
      console.log('Auth: Not in Pi Browser, using demo mode');
      toast.info('Demo mode: Simulating Pi Network authentication');
      // In demo mode, you might want to create a test user or handle differently
      return;
    }

    setIsLoading(true);
    try {
      console.log('Auth: Starting Pi Network authentication...');
      
      // Handle incomplete payments callback
      const handleIncompletePayment = (payment: PiPaymentDTO) => {
        console.log('Incomplete payment found:', payment);
        toast.info('You have an incomplete payment. Please complete it to continue.');
      };

      const result: PiAuthResult | null = await authenticateWithPi(handleIncompletePayment);

      if (!result) {
        throw new Error('Authentication was cancelled or failed');
      }

      if (!result.user?.uid || !result.user?.username) {
        throw new Error('Invalid user data received from Pi Network');
      }

      console.log('Auth: Pi authentication successful, verifying with backend...');

      // Verify with backend
      const { data, error } = await supabase.functions.invoke('pi-auth', {
        body: { 
          accessToken: result.accessToken,
          piUser: result.user
        }
      });

      if (error) {
        console.error('Auth: Backend verification failed:', error);
        throw new Error('Authentication verification failed');
      }

      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          throw new Error('Failed to set session');
        }

        console.log('Auth: Successfully authenticated with Pi Network');
        toast.success(`Welcome, ${result.user.username}!`);
      } else {
        throw new Error('No session returned from backend');
      }
    } catch (error) {
      console.error('Auth: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isLoading,
      isAuthenticated: !!user,
      isPiBrowser,
      isSdkReady,
      signUp, 
      signIn, 
      signOut,
      login
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}