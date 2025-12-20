import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Wallet, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  pi_payment_id?: string;
  pi_txid?: string;
  payout_status?: string;
  payout_txid?: string;
  created_at: string;
  stores?: {
    name: string;
    payout_wallet: string | null;
  };
}

export default function AdminPayouts() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        stores:store_id (
          name,
          payout_wallet
        )
      `)
      .in('status', ['paid', 'pending'])
      .order('created_at', { ascending: false });
      
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const processPayout = async (order: Order) => {
    if (!order.stores?.payout_wallet) {
      toast({
        title: 'Cannot process payout',
        description: 'Merchant has not configured their payout wallet.',
        variant: 'destructive',
      });
      return;
    }

    setProcessingId(order.id);
    
    try {
      const response = await supabase.functions.invoke('merchant-payout', {
        body: { orderId: order.id }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Payout failed');
      }

      toast({
        title: 'Payout initiated',
        description: `Payout of ${order.total} π sent to merchant wallet.`,
      });
      
      fetchPendingOrders();
    } catch (error) {
      console.error('Payout error:', error);
      toast({
        title: 'Payout failed',
        description: error instanceof Error ? error.message : 'Failed to process payout',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const markAsApproved = async (order: Order) => {
    setProcessingId(order.id);
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'approved',
        payout_status: 'completed'
      })
      .eq('id', order.id);
      
    if (!error) {
      toast({
        title: 'Order approved',
        description: 'Order marked as approved for manual payout.',
      });
      fetchPendingOrders();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    }
    
    setProcessingId(null);
  };

  const getPayoutStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-600">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-600">Processing</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-600">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-600">Pending</span>;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Merchant Payouts</h1>
        <Button variant="outline" onClick={fetchPendingOrders} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No pending payouts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Order #{order.id.slice(-6)}</span>
                  {getPayoutStatusBadge(order.payout_status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground">Store</p>
                  <p className="font-medium">{order.stores?.name || 'Unknown'}</p>
                </div>
                
                <div className="text-sm">
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                </div>
                
                <div className="text-sm">
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-bold text-primary text-lg">{order.total} π</p>
                </div>
                
                <div className="text-sm">
                  <p className="text-muted-foreground">Merchant Wallet</p>
                  {order.stores?.payout_wallet ? (
                    <p className="font-mono text-xs break-all">{order.stores.payout_wallet}</p>
                  ) : (
                    <p className="text-yellow-600 text-xs">Not configured</p>
                  )}
                </div>
                
                {order.pi_txid && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Payment TxID</p>
                    <p className="font-mono text-xs break-all">{order.pi_txid}</p>
                  </div>
                )}
                
                {order.payout_txid && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Payout TxID</p>
                    <p className="font-mono text-xs break-all">{order.payout_txid}</p>
                  </div>
                )}
                
                <div className="pt-3 border-t flex gap-2">
                  {order.payout_status !== 'completed' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!!processingId || !order.stores?.payout_wallet}
                        onClick={() => processPayout(order)}
                      >
                        {processingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Wallet className="w-4 h-4 mr-1" />
                            Auto Payout
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!!processingId}
                        onClick={() => markAsApproved(order)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Manual
                      </Button>
                    </>
                  )}
                  {order.payout_status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Payout completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
