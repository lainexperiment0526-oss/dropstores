import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiscountCode {
  id: string;
  code: string;
  title: string;
  discount_type: string;
  discount_value: number;
  minimum_purchase: number;
  maximum_uses: number | null;
  used_count: number;
  once_per_customer: boolean;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
}

interface DiscountCodesProps {
  storeId: string;
}

const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function DiscountCodes({ storeId }: DiscountCodesProps) {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discount_type: 'percentage',
    discount_value: 10,
    minimum_purchase: 0,
    maximum_uses: null as number | null,
    once_per_customer: false,
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: '',
    is_active: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, [storeId]);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error: any) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discount codes');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: generateRandomCode(),
      title: '',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_purchase: 0,
      maximum_uses: null,
      once_per_customer: false,
      starts_at: new Date().toISOString().split('T')[0],
      ends_at: '',
      is_active: true,
    });
    setEditingDiscount(null);
  };

  const openDialog = (discount?: DiscountCode) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        code: discount.code,
        title: discount.title || '',
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        minimum_purchase: discount.minimum_purchase,
        maximum_uses: discount.maximum_uses,
        once_per_customer: discount.once_per_customer,
        starts_at: discount.starts_at?.split('T')[0] || '',
        ends_at: discount.ends_at?.split('T')[0] || '',
        is_active: discount.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      toast.error('Discount code is required');
      return;
    }

    try {
      const payload = {
        store_id: storeId,
        code: formData.code.toUpperCase(),
        title: formData.title || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        minimum_purchase: formData.minimum_purchase,
        maximum_uses: formData.maximum_uses,
        once_per_customer: formData.once_per_customer,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : new Date().toISOString(),
        ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
        is_active: formData.is_active,
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from('discount_codes')
          .update(payload)
          .eq('id', editingDiscount.id);

        if (error) throw error;
        toast.success('Discount code updated');
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert(payload);

        if (error) throw error;
        toast.success('Discount code created');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      toast.error(error.message || 'Failed to save discount code');
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Discount code deleted');
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      toast.error('Failed to delete discount code');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscountValue = (discount: DiscountCode) => {
    switch (discount.discount_type) {
      case 'percentage':
        return `${discount.discount_value}% off`;
      case 'fixed_amount':
        return `${discount.discount_value}π off`;
      case 'free_shipping':
        return 'Free shipping';
      default:
        return '';
    }
  };

  const isExpired = (discount: DiscountCode) => {
    if (!discount.ends_at) return false;
    return new Date(discount.ends_at) < new Date();
  };

  const isMaxedOut = (discount: DiscountCode) => {
    if (!discount.maximum_uses) return false;
    return discount.used_count >= discount.maximum_uses;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Discount Codes</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                Create Discount
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Discount Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., SAVE10"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title (Optional)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(v: any) => setFormData({ ...formData, discount_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.discount_type !== 'free_shipping' && (
                    <div className="space-y-2">
                      <Label>
                        {formData.discount_type === 'percentage' ? 'Percentage' : 'Amount (π)'}
                      </Label>
                      <Input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) =>
                          setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })
                        }
                        min="0"
                        max={formData.discount_type === 'percentage' ? 100 : undefined}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Purchase (π)</Label>
                    <Input
                      type="number"
                      value={formData.minimum_purchase}
                      onChange={(e) =>
                        setFormData({ ...formData, minimum_purchase: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Usage Limit</Label>
                    <Input
                      type="number"
                      value={formData.maximum_uses || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maximum_uses: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.starts_at}
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.once_per_customer}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, once_per_customer: checked })
                      }
                    />
                    <Label>One use per customer</Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingDiscount ? 'Update Discount' : 'Create Discount'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading...</p>
        ) : discounts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No discount codes yet. Create one to attract more customers!
          </p>
        ) : (
          <div className="space-y-3">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-bold">
                      {discount.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyCode(discount.code)}
                    >
                      {copiedCode === discount.code ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    {!discount.is_active && <Badge variant="secondary">Inactive</Badge>}
                    {isExpired(discount) && <Badge variant="destructive">Expired</Badge>}
                    {isMaxedOut(discount) && <Badge variant="outline">Maxed Out</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDiscountValue(discount)}
                    {discount.minimum_purchase > 0 && ` • Min. ${discount.minimum_purchase}π`}
                    {discount.maximum_uses && ` • ${discount.used_count}/${discount.maximum_uses} used`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(discount)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteDiscount(discount.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
