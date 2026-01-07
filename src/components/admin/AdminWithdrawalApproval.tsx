import { useEffect, useState } from 'react';
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
import { Wallet, CheckCircle, XCircle, Clock, AlertTriangle, UserCheck, DollarSign } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  merchant_id: string;
  amount: number;
  pi_wallet_address: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  notes: string | null;
  merchants: {
    pi_username: string | null;
    business_name: string | null;
  } | null;
}

export function AdminWithdrawalApproval() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          merchants (
            pi_username,
            business_name
          )
        `)
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

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject' | 'complete') => {
    setProcessing(true);
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      };

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // If approving, update merchant earnings status
      if (action === 'approve') {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (request) {
          // Mark earnings as withdrawn up to the withdrawal amount
          await supabase
            .from('merchant_earnings')
            .update({ status: 'withdrawn' })
            .eq('merchant_id', request.merchant_id)
            .eq('status', 'available')
            .lte('amount', request.amount);
        }
      }

      // If rejecting, revert earnings back to available
      if (action === 'reject') {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (request) {
          await supabase
            .from('merchant_earnings')
            .update({ status: 'available' })
            .eq('merchant_id', request.merchant_id)
            .eq('status', 'pending_withdrawal');
        }
      }

      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked as completed';
      toast.success(`Withdrawal request ${actionText} successfully`);
      
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchWithdrawalRequests();
    } catch (error) {
      console.error(`Error ${action}ing withdrawal request:`, error);
      toast.error(`Failed to ${action} withdrawal request`);
    } finally {
      setProcessing(false);
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-foreground">
                  {withdrawalRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-muted-foreground">π {getPendingAmount().toFixed(7)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Requests</p>
                <p className="text-2xl font-bold text-foreground">
                  {withdrawalRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-xs text-muted-foreground">π {getApprovedAmount().toFixed(7)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{withdrawalRequests.length}</p>
                <p className="text-xs text-muted-foreground">
                  π {withdrawalRequests.reduce((sum, r) => sum + r.amount, 0).toFixed(7)}
                </p>
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
            Review and approve merchant withdrawal requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {request.merchants?.business_name || `@${request.merchants?.pi_username}` || 'Unknown'}
                        </p>
                        {request.merchants?.pi_username && (
                          <p className="text-xs text-muted-foreground">@{request.merchants.pi_username}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">π {request.amount.toFixed(7)}</TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate font-mono text-xs">
                        {request.pi_wallet_address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(request.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(request.requested_at).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.requested_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className="flex gap-1">
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
                        </div>
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
                          Mark Complete
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {request.status === 'completed' ? 'Completed' : 'Processed'}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'pending' ? 'Review Withdrawal Request' : 'Mark as Completed'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.status === 'pending'
                ? 'Approve or reject this withdrawal request'
                : 'Mark this approved withdrawal as completed'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Merchant:</span>
                  <span className="text-sm font-medium">
                    {selectedRequest.merchants?.business_name || `@${selectedRequest.merchants?.pi_username}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-mono font-medium">π {selectedRequest.amount.toFixed(7)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Wallet:</span>
                  <span className="text-xs font-mono">{selectedRequest.pi_wallet_address}</span>
                </div>
                {selectedRequest.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Notes:</span>
                    <p className="text-sm mt-1">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

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

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {selectedRequest?.status === 'pending' ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleRequestAction(selectedRequest.id, 'reject')}
                  disabled={processing}
                >
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleRequestAction(selectedRequest!.id, 'complete')}
                disabled={processing}
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