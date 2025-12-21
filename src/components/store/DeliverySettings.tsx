import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Truck, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeliverySettingsProps {
  storeId: string;
}

export function DeliverySettings({ storeId }: DeliverySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [storeId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('delivery_enabled, delivery_fee, free_delivery_threshold')
        .eq('id', storeId)
        .single();

      if (error) throw error;

      if (data) {
        const storeData = data as any;
        setDeliveryEnabled(storeData.delivery_enabled ?? true);
        setDeliveryFee(storeData.delivery_fee?.toString() || '0');
        setFreeDeliveryThreshold(storeData.free_delivery_threshold?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      toast.error('Failed to load delivery settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('stores')
        .update({
          delivery_enabled: deliveryEnabled,
          delivery_fee: parseFloat(deliveryFee) || 0,
          free_delivery_threshold: freeDeliveryThreshold ? parseFloat(freeDeliveryThreshold) : null,
        })
        .eq('id', storeId);

      if (error) throw error;
      toast.success('Delivery settings saved successfully');
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      toast.error('Failed to save delivery settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading delivery settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Configuration
          </CardTitle>
          <CardDescription>
            Configure delivery fees for physical products. Digital products are always delivered free.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Delivery */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Enable Delivery</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to select delivery for physical products
              </p>
            </div>
            <Switch
              checked={deliveryEnabled}
              onCheckedChange={setDeliveryEnabled}
            />
          </div>

          {/* Delivery Fee */}
          <div className="space-y-2">
            <Label htmlFor="deliveryFee" className="text-base font-semibold">
              Delivery Fee (π)
            </Label>
            <Input
              id="deliveryFee"
              type="number"
              step="0.01"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="5.00"
              disabled={!deliveryEnabled}
            />
            <p className="text-sm text-muted-foreground">
              Flat delivery fee charged for physical products. Set to 0 for free delivery.
            </p>
          </div>

          {/* Free Delivery Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold" className="text-base font-semibold">
              Free Delivery Threshold (π)
            </Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              min="0"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              placeholder="Leave empty for no free delivery"
              disabled={!deliveryEnabled}
            />
            <p className="text-sm text-muted-foreground">
              Orders above this amount get free delivery. Leave empty to always charge delivery fee.
            </p>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Delivery Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Platform Fee Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Platform Fee
          </CardTitle>
          <CardDescription>
            Information about platform listing fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  1π Platform Fee Per Product
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Every product listed on your store includes a 1π platform fee. This fee is automatically added to the total and helps maintain the marketplace.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className="font-semibold">Fee Breakdown Example:</h4>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Product Price:</span>
                  <span>20.00 π</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span>1.00 π</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee (if physical):</span>
                  <span>{parseFloat(deliveryFee || '0').toFixed(2)} π</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground pt-2 border-t">
                  <span>Total:</span>
                  <span>{(20 + 1 + parseFloat(deliveryFee || '0')).toFixed(2)} π</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
