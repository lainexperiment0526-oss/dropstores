import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SubscriptionDebug() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDebugInfo = async () => {
      try {
        // Get all subscriptions for user
        const { data: subs, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setData({
          subscriptions: subs || [],
          error: error?.message,
          userId: user.id,
          currentTime: new Date().toISOString(),
        });
      } catch (err) {
        console.error(err);
        setData({ error: String(err) });
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, [user]);

  if (!user) return null;
  if (loading) return <div>Loading debug info...</div>;

  return (
    <Card className="mb-4 border-yellow-500">
      <CardHeader>
        <CardTitle className="text-sm">🐛 Subscription Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs font-mono">
          <div>
            <strong>User ID:</strong> {data?.userId}
          </div>
          <div>
            <strong>Current Time:</strong> {data?.currentTime}
          </div>
          {data?.error && (
            <div className="text-red-600">
              <strong>Error:</strong> {data.error}
            </div>
          )}
          <div>
            <strong>Subscriptions Found:</strong> {data?.subscriptions?.length || 0}
          </div>
          {data?.subscriptions?.map((sub: any, idx: number) => (
            <Card key={idx} className="p-2 mt-2 bg-slate-50">
              <div><strong>Plan:</strong> {sub.plan_type}</div>
              <div>
                <strong>Status:</strong>{' '}
                <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                  {sub.status}
                </Badge>
              </div>
              <div><strong>Started:</strong> {sub.started_at}</div>
              <div><strong>Expires:</strong> {sub.expires_at}</div>
              <div>
                <strong>Active?</strong>{' '}
                {sub.status === 'active' && new Date(sub.expires_at) > new Date() ? '✅ YES' : '❌ NO'}
              </div>
              <div><strong>Amount:</strong> {sub.amount}π</div>
              {sub.pi_payment_id && (
                <div className="text-xs text-gray-500">Payment: {sub.pi_payment_id.substring(0, 20)}...</div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
