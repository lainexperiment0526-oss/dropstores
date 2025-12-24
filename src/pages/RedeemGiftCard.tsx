import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GiftCardRedeem } from '@/components/GiftCardRedeem';
import { GiftCardDisplay } from '@/components/GiftCardDisplay';
import { useGiftCard } from '@/hooks/useGiftCard';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Gift, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RedeemGiftCard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoading, giftCards, redeemGiftCard, fetchUserGiftCards } = useGiftCard();
  const [activeTab, setActiveTab] = useState('redeem');

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserGiftCards();
    }
  }, [user, authLoading, fetchUserGiftCards]);

  const handleRedeem = async (code: string) => {
    try {
      const result = await redeemGiftCard(code);
      toast.success(`🎉 ${result.planType} subscription activated!`);
      
      // Refresh gift cards list
      fetchUserGiftCards();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Redemption failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const purchasedCards = giftCards.filter((g) => !g.redeemed_at);
  const redeemedCards = giftCards.filter((g) => g.redeemed_at);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-amber-600" />
                Gift Cards
              </h1>
              <p className="text-sm text-muted-foreground">Holiday gift card management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="redeem">Redeem Gift Card</TabsTrigger>
              <TabsTrigger value="purchased">
                Purchased ({purchasedCards.length})
              </TabsTrigger>
              <TabsTrigger value="redeemed">
                Redeemed ({redeemedCards.length})
              </TabsTrigger>
            </TabsList>

            {/* Redeem Tab */}
            <TabsContent value="redeem" className="space-y-4">
              <GiftCardRedeem
                onRedeem={handleRedeem}
                isLoading={isLoading}
              />

              <Card>
                <CardHeader>
                  <CardTitle>How to Redeem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 rounded-full bg-primary/10 w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Get your gift code</p>
                      <p className="text-muted-foreground">
                        Check your email (including spam) for the gift card code
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 rounded-full bg-primary/10 w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Enter the code</p>
                      <p className="text-muted-foreground">
                        Paste the code above and click Redeem
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 rounded-full bg-primary/10 w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Subscription activated</p>
                      <p className="text-muted-foreground">
                        Your subscription will be active immediately
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchased Tab */}
            <TabsContent value="purchased" className="space-y-4">
              {purchasedCards.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2 py-8">
                      <Gift className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        You haven't purchased any gift cards yet
                      </p>
                      <Button asChild className="mt-2">
                        <Link to="/subscription">Purchase Gift Card</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                purchasedCards.map((card) => (
                  <GiftCardDisplay
                    key={card.id}
                    code={card.code}
                    planType={card.plan_type}
                    planName={card.plan_type.charAt(0).toUpperCase() + card.plan_type.slice(1)}
                    amount={card.amount}
                    recipientName={card.recipient_name}
                    recipientEmail={card.recipient_email}
                    giftMessage={card.gift_message}
                    createdAt={card.created_at}
                    expiresAt={card.expires_at}
                    redeemed={!!card.redeemed_at}
                  />
                ))
              )}
            </TabsContent>

            {/* Redeemed Tab */}
            <TabsContent value="redeemed" className="space-y-4">
              {redeemedCards.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2 py-8">
                      <Gift className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        You haven't redeemed any gift cards yet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                redeemedCards.map((card) => (
                  <GiftCardDisplay
                    key={card.id}
                    code={card.code}
                    planType={card.plan_type}
                    planName={card.plan_type.charAt(0).toUpperCase() + card.plan_type.slice(1)}
                    amount={card.amount}
                    recipientName={card.recipient_name}
                    recipientEmail={card.recipient_email}
                    giftMessage={card.gift_message}
                    createdAt={card.created_at}
                    expiresAt={card.expires_at}
                    redeemed={!!card.redeemed_at}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default RedeemGiftCard;
