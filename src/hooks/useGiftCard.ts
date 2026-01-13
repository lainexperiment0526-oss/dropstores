import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GiftCard {
  id: string;
  code: string;
  plan_type: string;
  amount: number;
  recipient_name: string;
  recipient_email: string;
  gift_message?: string;
  created_at: string;
  expires_at: string;
  redeemed_at?: string;
}

export function useGiftCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);

  // Generate unique gift card code
  const generateCode = useCallback((): string => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `XMAS-${year}-${random}`;
  }, []);

  // Redeem gift card
  const redeemGiftCard = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('giftcard-redeem', {
        body: { code: code.trim().toUpperCase() },
      });

      if (error) {
        console.error('Redemption error:', error);
        toast.error(error.message || 'Failed to redeem gift card');
        throw error;
      }

      if (data?.success) {
        toast.success(data.subscription?.message || 'Gift card redeemed successfully!');
        return data.subscription;
      } else {
        throw new Error(data?.error || 'Failed to redeem gift card');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to redeem gift card';
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's gift cards (purchased and redeemed)
  const fetchUserGiftCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in first');
        return;
      }

      // Fetch gift cards purchased by user
      const { data, error } = await (supabase
        .from('giftcards' as any)
        .select('*')
        .eq('purchased_by', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) {
        console.error('Failed to fetch gift cards:', error);
        toast.error('Failed to fetch gift cards');
        return;
      }

      setGiftCards((data as any) || []);
    } catch (err) {
      console.error('Error fetching gift cards:', err);
      toast.error('Failed to load gift cards');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create gift card (via payment)
  const createGiftCard = useCallback(
    async (
      planType: string,
      amount: number,
      recipientName: string,
      recipientEmail: string,
      giftMessage: string
    ) => {
      const code = generateCode();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // This would be called after successful payment
      const { data, error } = await (supabase
        .from('giftcards' as any)
        .insert({
          code,
          plan_type: planType,
          amount,
          purchased_by: user.id,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          gift_message: giftMessage || null,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        })
        .select()
        .single() as any);

      if (error) {
        console.error('Failed to create gift card:', error);
        throw error;
      }

      return data;
    },
    [generateCode]
  );

  return {
    isLoading,
    giftCards,
    generateCode,
    redeemGiftCard,
    fetchUserGiftCards,
    createGiftCard,
  };
}
