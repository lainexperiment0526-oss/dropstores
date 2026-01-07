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
import { Wallet, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Download, PieChart } from 'lucide-react';

interface Earning {
  id: string;
  amount: number;
  payment_link_id: string;
  transaction_id: string;
  status: 'pending' | 'available' | 'withdrawn';
  created_at: string;
  payment_links: {
    title: string;
  } | null;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  pi_wallet_address: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
}

export function MerchantEarnings() {
  const { merchant, piUser } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [piWalletAddress, setPiWalletAddress] = useState('');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  useEffect(() => {
    if (merchant?.id || piUser?.uid) {
      fetchEarnings();
      fetchWithdrawalRequests();
    }
  }, [merchant?.id, piUser?.uid]);

  const fetchEarnings = async () => {
    try {
      const merchantId = merchant?.id || piUser?.uid;
      if (!merchantId) return;

      const { data, error } = await supabase
        .from('merchant_earnings')
        .select(`
          *,
          payment_links (
            title
          )
        `)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEarnings(data || []);
      
      // Calculate totals
      const total = (data || []).reduce((sum, earning) => sum + earning.amount, 0);
      const available = (data || []).filter(e => e.status === 'available').reduce((sum, earning) => sum + earning.amount, 0);
      
      setTotalEarnings(total);
      setAvailableBalance(available);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings');
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const merchantId = merchant?.id || piUser?.uid;
      if (!merchantId) return;

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      setWithdrawalRequests(data || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!merchant?.id && !piUser?.uid) {
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
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          merchant_id: merchant?.id || piUser?.uid,
          amount: amount,
          pi_wallet_address: piWalletAddress,
          status: 'pending',
          notes: withdrawalNotes || null,
        });

      if (error) throw error;

      // Update earnings status to 'pending_withdrawal'
      const { error: earningsError } = await supabase
        .from('merchant_earnings')
        .update({ status: 'pending_withdrawal' })
        .eq('merchant_id', merchant?.id || piUser?.uid)
        .eq('status', 'available')
        .lte('amount', amount);

      if (earningsError) throw earningsError;

      toast.success('Withdrawal request submitted successfully! Admin will review it shortly.');
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount('');
      setPiWalletAddress('');
      setWithdrawalNotes('');
      
      // Refresh data
      fetchEarnings();
      fetchWithdrawalRequests();
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
      case 'available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-foreground">π {availableBalance.toFixed(7)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">π {totalEarnings.toFixed(7)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Withdrawal Requests</p>
                <p className="text-2xl font-bold text-foreground">{withdrawalRequests.length}</p>
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

      {/* Withdrawal Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Withdrawal Requests
          </CardTitle>
          <CardDescription>
            Track the status of your withdrawal requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests yet
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
                {withdrawalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">π {request.amount.toFixed(7)}</TableCell>
                    <TableCell className="font-mono text-xs">{request.pi_wallet_address}</TableCell>
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

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Earnings History
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your earnings from payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No earnings yet. Start selling to see your earnings here!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Link</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="font-medium">π {earning.amount.toFixed(7)}</TableCell>
                    <TableCell>{earning.payment_links?.title || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">{earning.transaction_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(earning.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(earning.status)}
                          {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}