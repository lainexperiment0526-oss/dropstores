import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_LIMITS, PlanLimits } from '@/lib/pi-sdk';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  expires_at: string;
  started_at: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  isActive: boolean;
  isExpired: boolean;
  isLoading: boolean;
  daysRemaining: number;
  planLimits: PlanLimits | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    isActive: false,
    isExpired: false,
    isLoading: true,
    daysRemaining: 0,
    planLimits: null,
  });

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (data) {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        const isActive = data.status === 'active' && expiresAt > now;
        const isExpired = expiresAt <= now;
        const daysRemaining = isActive ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const planLimits = PLAN_LIMITS[data.plan_type] || null;

        // Auto-expire if needed
        if (data.status === 'active' && isExpired) {
          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('id', data.id);
          
          setState({
            subscription: { ...data, status: 'expired' },
            isActive: false,
            isExpired: true,
            isLoading: false,
            daysRemaining: 0,
            planLimits: null,
          });
        } else {
          setState({
            subscription: data,
            isActive,
            isExpired,
            isLoading: false,
            daysRemaining,
            planLimits: isActive ? planLimits : null,
          });
        }
      } else {
        setState({
          subscription: null,
          isActive: false,
          isExpired: false,
          isLoading: false,
          daysRemaining: 0,
          planLimits: null,
        });
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const canCreateStore = useCallback((currentStoreCount: number): boolean => {
    if (!state.isActive || !state.planLimits) return false;
    return currentStoreCount < state.planLimits.maxStores;
  }, [state.isActive, state.planLimits]);

  const canAddProduct = useCallback((currentProductCount: number): boolean => {
    if (!state.isActive || !state.planLimits) return false;
    return currentProductCount < state.planLimits.maxProductsPerStore;
  }, [state.isActive, state.planLimits]);

  const hasFeature = useCallback((feature: keyof PlanLimits): boolean => {
    if (!state.isActive || !state.planLimits) return false;
    const value = state.planLimits[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return !!value;
  }, [state.isActive, state.planLimits]);

  return {
    ...state,
    refetch: fetchSubscription,
    canCreateStore,
    canAddProduct,
    hasFeature,
  };
}
