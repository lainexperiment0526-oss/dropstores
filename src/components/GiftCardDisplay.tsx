import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface GiftCardDisplayProps {
  code: string;
  planType: string;
  planName: string;
  amount: number;
  recipientName: string;
  recipientEmail: string;
  giftMessage?: string;
  createdAt: string;
  expiresAt: string;
  redeemed?: boolean;
}

export function GiftCardDisplay({
  code,
  planType,
  planName,
  amount,
  recipientName,
  recipientEmail,
  giftMessage,
  createdAt,
  expiresAt,
  redeemed = false,
}: GiftCardDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`You received a DropStore ${planName} Gift Card! 🎄`);
    const body = encodeURIComponent(
      `Hi ${recipientName},\n\nYou've received a gift! Someone special sent you a ${planName} subscription gift card for DropStore.\n\nGift Code: ${code}\n\n${giftMessage ? `Message from sender: ${giftMessage}\n\n` : ''}To redeem your gift:\n1. Visit dropstore.space\n2. Go to Redeem Gift Card\n3. Enter code: ${code}\n\nThis gift expires on ${new Date(expiresAt).toLocaleDateString()}\n\nHappy Holidays! 🎁`
    );
    window.open(`mailto:${recipientEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const expiryDate = new Date(expiresAt);
  const isExpired = new Date() > expiryDate;
  const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`border-2 ${redeemed ? 'border-gray-200 dark:border-gray-700' : 'border-amber-200 dark:border-amber-800'}`}>
      <CardHeader className={redeemed ? 'bg-gray-100 dark:bg-gray-800' : 'bg-amber-50 dark:bg-amber-950'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle>Gift Card</CardTitle>
              {redeemed && <Badge variant="secondary">Redeemed</Badge>}
              {isExpired && !redeemed && <Badge variant="destructive">Expired</Badge>}
              {!redeemed && !isExpired && daysLeft <= 7 && (
                <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                  {daysLeft} days left
                </Badge>
              )}
            </div>
            <CardDescription>
              For: <strong>{recipientName}</strong> ({recipientEmail})
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">{amount}</p>
            <p className="text-xs text-muted-foreground">Pi</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Plan Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="font-semibold">{planName}</p>
        </div>

        {/* Gift Message */}
        {giftMessage && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground mb-1">Message from sender:</p>
            <p className="text-sm italic">{giftMessage}</p>
          </div>
        )}

        {/* Gift Code */}
        {!redeemed && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Gift Code</label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-slate-900 dark:bg-slate-800 text-amber-400 rounded font-mono text-sm text-center">
                {code}
              </code>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created</span>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Expires</span>
            <span className={isExpired ? 'text-red-600' : daysLeft <= 7 ? 'text-yellow-600' : ''}>
              {expiryDate.toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!redeemed && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleShareEmail}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Share via Email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
