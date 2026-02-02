import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wallet, CheckCircle, XCircle, Clock, AlertTriangle, UserCheck, DollarSign, Info, Copy, ExternalLink } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  owner_id: string;
  store_id: string;
  amount: number;
  wallet_address: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
  pi_txid: string | null;
}

interface StoreInfo {
  id: string;
  name: string;
  owner_id: string;
}

const PLATFORM_FEE_PERCENT = 2; // 2% platform fee

export function AdminWithdrawalApproval() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [stores, setStores] = useState<Record<string, StoreInfo>>({});
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [piTxId, setPiTxId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      // Fetch withdrawal requests
      const { data, error } = await supabase
        .from('merchant_payouts')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      setWithdrawalRequests(data || []);

      // Fetch store names for display
      if (data && data.length > 0) {
        const storeIds = [...new Set(data.map(r => r.store_id))];
        const { data: storesData } = await supabase
          .from('stores')
          .select('id, name, owner_id')
          .in('id', storeIds);

        if (storesData) {
          const storeMap: Record<string, StoreInfo> = {};
          storesData.forEach(s => { storeMap[s.id] = s; });
          setStores(storeMap);
        }
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const calculatePlatformFee = (amount: number) => {
    return amount * (PLATFORM_FEE_PERCENT / 100);
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculatePlatformFee(amount);
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject' | 'complete') => {
    setProcessing(true);
    try {
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed';
      
      const updateData: any = {
        status: newStatus,
        processed_at: new Date().toISOString(),
        notes: adminNotes || null,
      };

      // Add Pi transaction ID if completing
      if (action === 'complete' && piTxId) {
        updateData.pi_txid = piTxId;
      }

      const { error } = await supabase
        .from('merchant_payouts')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked as completed';
      toast.success(`Withdrawal request ${actionText} successfully`);
      
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setPiTxId('');
      fetchWithdrawalRequests();
    } catch (error) {
      console.error(`Error ${action}ing withdrawal request:`, error);
      toast.error(`Failed to ${action} withdrawal request`);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <UserCheck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPendingAmount = () => {
    return withdrawalRequests
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const getApprovedAmount = () => {
    return withdrawalRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const getTotalPlatformFees = () => {
    return withdrawalRequests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + calculatePlatformFee(r.amount), 0);
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
      {/* Platform Fee Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>{PLATFORM_FEE_PERCENT}% Platform Fee</strong> is deducted from each withdrawal. 
          Merchants receive the net amount after fee deduction.
        </AlertDescription>
      </Alert>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Pending</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">
                  {withdrawalRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-muted-foreground truncate">π {getPendingAmount().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Approved</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">
                  {withdrawalRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-xs text-muted-foreground truncate">π {getApprovedAmount().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Completed</p>
                <p className="text-lg md:text-2xl font-bold text-foreground">
                  {withdrawalRequests.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Platform Fees</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">
                  π {getTotalPlatformFees().toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{PLATFORM_FEE_PERCENT}% earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Merchant Withdrawal Requests
          </CardTitle>
          <CardDescription>
            Review and approve merchant withdrawal requests. {PLATFORM_FEE_PERCENT}% platform fee applies.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {withdrawalRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Net (After {PLATFORM_FEE_PERCENT}%)</TableHead>
                  <TableHead className="hidden sm:table-cell">Wallet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className="font-medium text-sm truncate max-w-24 md:max-w-32">
                        {stores[request.store_id]?.name || request.store_id.slice(0, 8)}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      π {request.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-green-600 hidden md:table-cell">
                      π {calculateNetAmount(request.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 max-w-24 md:max-w-32">
                        <span className="truncate font-mono text-xs">
                          {request.wallet_address.slice(0, 8)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 flex-shrink-0"
                          onClick={() => copyToClipboard(request.wallet_address)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(request.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          <span className="hidden sm:inline">
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div>
                        <p className="text-sm">{new Date(request.requested_at).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.requested_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => {
                            setSelectedRequest(request);
                            setDialogOpen(true);
                          }}
                        >
                          Review
                        </Button>
                      ) : request.status === 'approved' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedRequest(request);
                            setDialogOpen(true);
                          }}
                        >
                          Complete
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {request.status === 'completed' ? '✓ Done' : 'Processed'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'pending' ? 'Review Withdrawal Request' : 'Complete Withdrawal'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.status === 'pending'
                ? 'Review merchant details and approve or reject this withdrawal'
                : 'Enter the Pi transaction ID to mark this withdrawal as completed'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Store Info */}
              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Store:</span>
                  <span className="text-sm font-medium text-right">
                    {stores[selectedRequest.store_id]?.name || 'Unknown Store'}
                  </span>
                </div>
                
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Requested Amount:</span>
                    <span className="text-sm font-mono font-medium">π {selectedRequest.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-600">
                    <span className="text-sm">Platform Fee ({PLATFORM_FEE_PERCENT}%):</span>
                    <span className="text-sm font-mono font-medium">
                      -π {calculatePlatformFee(selectedRequest.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Net to Merchant:</span>
                    <span className="text-sm font-mono font-bold text-green-600">
                      π {calculateNetAmount(selectedRequest.amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wallet Address:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono truncate max-w-32">{selectedRequest.wallet_address}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => copyToClipboard(selectedRequest.wallet_address)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div className="border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Merchant Notes:</span>
                    <p className="text-sm mt-1">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

              {/* Pi Transaction ID for completion */}
              {selectedRequest.status === 'approved' && (
                <div className="space-y-2">
                  <Label>Pi Transaction ID *</Label>
                  <Input
                    value={piTxId}
                    onChange={(e) => setPiTxId(e.target.value)}
                    placeholder="Enter the Pi blockchain transaction ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the transaction ID after sending π {calculateNetAmount(selectedRequest.amount).toFixed(2)} to the merchant's wallet
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            {selectedRequest?.status === 'pending' ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleRequestAction(selectedRequest.id, 'reject')}
                  disabled={processing}
                >
                  Reject
                </Button>
                <Button
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                  onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleRequestAction(selectedRequest!.id, 'complete')}
                disabled={processing || !piTxId}
                className="w-full sm:w-auto"
              >
                {processing ? 'Processing...' : 'Mark Completed'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
