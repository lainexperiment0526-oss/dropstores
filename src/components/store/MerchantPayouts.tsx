import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  AlertCircle, 
  Loader2, 
  ArrowUpRight, 
  Clock, 
  CheckCircle,
  XCircle,
  Info,
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MerchantPayoutsProps {
  storeId: string;
  payoutWallet: string | null;
}

interface Sale {
  id: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  pi_txid: string | null;
  payout_status: string;
  created_at: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  wallet_address: string;
  pi_txid: string | null;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

export function MerchantPayouts({ storeId, payoutWallet }: MerchantPayoutsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState(payoutWallet || '');

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sales
      const { data: salesData, error: salesError } = await supabase
        .from('merchant_sales')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;
      setSales(salesData || []);

      // Fetch payout requests
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('merchant_payouts')
        .select('*')
        .eq('store_id', storeId)
        .order('requested_at', { ascending: false });

      if (payoutsError) throw payoutsError;
      setPayouts(payoutsData || []);
    } catch (error) {
      console.error('Error fetching payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableBalance = sales
    .filter(s => s.payout_status === 'pending')
    .reduce((sum, s) => sum + Number(s.net_amount), 0);

  const totalGrossSales = sales.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalEarnings = sales.reduce((sum, s) => sum + Number(s.net_amount), 0);
  const totalPlatformFees = sales.reduce((sum, s) => sum + Number(s.platform_fee), 0);
  const pendingPayouts = payouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive'
      });
      return;
    }

    if (!withdrawWallet.trim()) {
      toast({
        title: 'Missing wallet',
        description: 'Please enter your Pi wallet address.',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > availableBalance) {
      toast({
        title: 'Insufficient balance',
        description: `You can only withdraw up to ${availableBalance.toFixed(2)} π`,
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: {
          storeId,
          amount,
          walletAddress: withdrawWallet.trim(),
          notes: 'Manual withdrawal request'
        }
      });

      if (error) throw error;

      toast({
        title: 'Withdrawal requested',
        description: data.message || 'Your payout request has been submitted.'
      });

      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      fetchData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: 'Withdrawal failed',
        description: error instanceof Error ? error.message : 'Failed to submit withdrawal request.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-500 text-white"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Contract Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Manual Payouts</AlertTitle>
        <AlertDescription>
          Smart contracts are not yet available on Pi Network. All payouts are processed manually and may take 1-3 business days. 
          Once Pi Network enables smart contracts, automatic payouts will be available.
        </AlertDescription>
      </Alert>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gross Sales</CardDescription>
            <CardTitle className="text-2xl">{totalGrossSales.toFixed(2)} π</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            Total customer payments
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Platform Fees (5%)</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{totalPlatformFees.toFixed(2)} π</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            Deducted from sales
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earned (Net)</CardDescription>
            <CardTitle className="text-2xl text-green-600">{totalEarnings.toFixed(2)} π</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            After platform fees
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-2xl text-primary">{availableBalance.toFixed(2)} π</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            Ready to withdraw
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Payouts</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{pendingPayouts.toFixed(2)} π</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            Being processed
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Button */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogTrigger asChild>
          <Button 
            className="w-full md:w-auto" 
            disabled={availableBalance <= 0}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Request Withdrawal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the amount you want to withdraw and your Pi wallet address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
                Payouts are processed manually (1-3 business days). Smart contracts will enable instant payouts in the future.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Available Balance</Label>
              <div className="text-2xl font-bold text-green-600">{availableBalance.toFixed(2)} π</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Withdrawal Amount (π)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min="0"
                max={availableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
              />
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-xs"
                onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
              >
                Withdraw all
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-wallet">Pi Wallet Address</Label>
              <Input
                id="withdraw-wallet"
                value={withdrawWallet}
                onChange={(e) => setWithdrawWallet(e.target.value)}
                placeholder="Your Pi wallet address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><ArrowUpRight className="w-4 h-4 mr-2" /> Request Withdrawal</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>Your withdrawal request history</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{Number(payout.amount).toFixed(2)} π</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payout.requested_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      To: {payout.wallet_address}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    {getStatusBadge(payout.status)}
                    {payout.pi_txid && (
                      <div className="text-xs font-mono text-muted-foreground">
                        TxID: {payout.pi_txid.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Detailed breakdown of sales with platform fees</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sales yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Sale #{sale.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString()} at {new Date(sale.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(sale.payout_status)}
                    </div>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="bg-muted/50 rounded p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sale amount:</span>
                      <span className="font-medium">{Number(sale.amount).toFixed(2)} π</span>
                    </div>
                    <div className="flex justify-between text-amber-600">
                      <span>Platform fee (5%):</span>
                      <span className="font-medium">-{Number(sale.platform_fee).toFixed(2)} π</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="font-semibold">You earned:</span>
                      <span className="font-bold text-green-600">{Number(sale.net_amount).toFixed(2)} π</span>
                    </div>
                  </div>

                  {sale.pi_txid && (
                    <div className="text-xs font-mono text-muted-foreground">
                      TX: {sale.pi_txid}
                    </div>
                  )}
                </div>
              ))}
              {sales.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  Showing 10 of {sales.length} sales
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
