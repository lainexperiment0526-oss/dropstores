import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface GiftCardPurchaseProps {
  planType: string;
  planName: string;
  amount: number;
  onPurchase?: (data: GiftCardData) => void;
  isLoading?: boolean;
}

export interface GiftCardData {
  planType: string;
  amount: number;
  recipientName: string;
  recipientEmail: string;
  giftMessage: string;
}

export function GiftCardPurchase({
  planType,
  planName,
  amount,
  onPurchase,
  isLoading = false,
}: GiftCardPurchaseProps) {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    giftMessage: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!formData.recipientName.trim()) {
      toast.error('Please enter recipient name');
      return;
    }
    if (!formData.recipientEmail.trim()) {
      toast.error('Please enter recipient email');
      return;
    }
    if (!formData.recipientEmail.includes('@')) {
      toast.error('Please enter valid email');
      return;
    }

    setSubmitted(true);
    onPurchase?.({
      planType,
      amount,
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail,
      giftMessage: formData.giftMessage,
    });
  };

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-600" />
          <div>
            <CardTitle className="text-lg">Gift This Plan</CardTitle>
            <CardDescription>Share {planName} with someone special this holiday</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Gift Preview */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-center space-y-2">
            <div className="text-4xl">🎄</div>
            <p className="font-semibold text-sm">{planName} Gift Card</p>
            <p className="text-xl font-bold text-amber-600">{amount} Pi</p>
          </div>
        </div>

        {/* Recipient Information */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="recipientName" className="text-sm font-medium">
              Recipient Name
            </Label>
            <Input
              id="recipientName"
              placeholder="John Doe"
              value={formData.recipientName}
              onChange={(e) =>
                setFormData({ ...formData, recipientName: e.target.value })
              }
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="recipientEmail" className="text-sm font-medium">
              Recipient Email
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="recipient@example.com"
              value={formData.recipientEmail}
              onChange={(e) =>
                setFormData({ ...formData, recipientEmail: e.target.value })
              }
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="giftMessage" className="text-sm font-medium">
              Gift Message (Optional)
            </Label>
            <Textarea
              id="giftMessage"
              placeholder="Add a personal message... 'Wishing you a wonderful holiday season!'"
              value={formData.giftMessage}
              onChange={(e) =>
                setFormData({ ...formData, giftMessage: e.target.value })
              }
              disabled={isLoading}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || submitted}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Gift Card...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Gift {planName} - {amount} Pi
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Gift card will be sent to {formData.recipientEmail || 'recipient email'} with a unique code to redeem
        </p>
      </CardContent>
    </Card>
  );
}
