import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wallet, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, PieChart } from 'lucide-react';
import { FloatingAISupport } from '@/components/FloatingAISupport';

interface Sale {
  id: string;
  amount: number;
  net_amount: number;
  platform_fee: number;
  order_id: string;
  store_id: string;
  payout_status: string;
  pi_txid: string | null;
  created_at: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  wallet_address: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

export function MerchantEarnings() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [piWalletAddress, setPiWalletAddress] = useState('');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSales();
      fetchPayoutRequests();
    }
  }, [user?.id]);

  const fetchSales = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('merchant_sales')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSales(data || []);
      
      // Calculate totals
      const total = (data || []).reduce((sum, sale) => sum + sale.net_amount, 0);
      const available = (data || []).filter(s => s.payout_status === 'pending').reduce((sum, sale) => sum + sale.net_amount, 0);
      
      setTotalEarnings(total);
      setAvailableBalance(available);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales');
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('merchant_payouts')
        .select('*')
        .eq('owner_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      setPayoutRequests(data || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      toast.error('Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!user?.id) {
      toast.error('Please sign in to request withdrawal');
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      toast.error('Insufficient available balance');
      return;
    }

    if (!piWalletAddress || !piWalletAddress.startsWith('G') || piWalletAddress.length < 25) {
      toast.error('Please enter a valid Pi wallet address');
      return;
    }

    setSubmittingWithdrawal(true);

    try {
      // Get user's first store
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      const storeId = stores?.[0]?.id;
      if (!storeId) {
        toast.error('No store found');
        return;
      }

      const { error } = await supabase
        .from('merchant_payouts')
        .insert({
          owner_id: user.id,
          store_id: storeId,
          amount: amount,
          wallet_address: piWalletAddress,
          status: 'pending',
          notes: withdrawalNotes || null,
        });

      if (error) throw error;

      toast.success('Withdrawal request submitted successfully! Admin will review it shortly.');
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount('');
      setPiWalletAddress('');
      setWithdrawalNotes('');
      
      // Refresh data
      fetchSales();
      fetchPayoutRequests();
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Available Balance</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">π {availableBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Total Earnings</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">π {totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Payout Requests</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">{payoutRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Button */}
      <div className="flex justify-end">
        <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={availableBalance <= 0} className="gap-2">
              <Wallet className="w-4 h-4" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>
                Request to withdraw your available earnings. Admin approval required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (π)</Label>
                <Input
                  type="number"
                  step="0.0000001"
                  max={availableBalance}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder={`Max: π ${availableBalance.toFixed(7)}`}
                />
                <p className="text-xs text-muted-foreground">
                  Available: π {availableBalance.toFixed(7)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Pi Wallet Address</Label>
                <Input
                  value={piWalletAddress}
                  onChange={(e) => setPiWalletAddress(e.target.value)}
                  placeholder="G... (your Pi wallet address)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your Pi mainnet wallet address where you want to receive the withdrawal
                </p>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                  placeholder="Any additional notes for the admin..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWithdrawalRequest} disabled={submittingWithdrawal}>
                {submittingWithdrawal ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payout Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Payout Requests
          </CardTitle>
          <CardDescription>
            Track the status of your payout requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payout requests yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">π {request.amount.toFixed(7)}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-32">{request.wallet_address}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(request.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.requested_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.processed_at ? new Date(request.processed_at).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Sales History
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales yet. Start selling to see your earnings here!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">π {sale.amount.toFixed(7)}</TableCell>
                    <TableCell className="text-muted-foreground">π {sale.platform_fee.toFixed(7)}</TableCell>
                    <TableCell className="font-medium text-green-600">π {sale.net_amount.toFixed(7)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(sale.payout_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(sale.payout_status)}
                          {sale.payout_status.charAt(0).toUpperCase() + sale.payout_status.slice(1)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Floating AI Support for earnings/withdrawal assistance */}
      <FloatingAISupport />
    </div>
  );
}
