import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Copy, Check, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface GiftCardRedeemProps {
  onRedeem?: (code: string) => Promise<void>;
  isLoading?: boolean;
}

export function GiftCardRedeem({ onRedeem, isLoading = false }: GiftCardRedeemProps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error('Please enter a gift card code');
      return;
    }

    try {
      await onRedeem?.(code.trim().toUpperCase());
      setCode('');
    } catch (error) {
      console.error('Redemption error:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copied!');
    } catch {
      toast.error('Failed to copy code');
    }
  };

  return (
    <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-600" />
          <div>
            <CardTitle>Redeem Gift Card</CardTitle>
            <CardDescription>Enter your gift card code to activate your subscription</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="giftCode" className="text-sm font-medium">
            Gift Card Code
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="giftCode"
              placeholder="XMAS-2024-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              className="font-mono"
            />
            {code && (
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            You can find this in your gift email
          </p>
        </div>

        <Button
          onClick={handleRedeem}
          disabled={isLoading || !code.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redeeming...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Redeem Gift Card
            </>
          )}
        </Button>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-green-200 dark:border-green-800 text-sm text-muted-foreground">
          <p>💡 <strong>Tip:</strong> Check your email (including spam folder) for your gift card code and message from the sender!</p>
        </div>
      </CardContent>
    </Card>
  );
}
