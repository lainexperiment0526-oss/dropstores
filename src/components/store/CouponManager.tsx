import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Percent, Tag, Clock, Users, ShoppingCart, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CouponManagerProps {
  storeId: string;
}

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_purchase: number;
  maximum_uses: number | null;
  used_count: number;
  once_per_customer: boolean;
  applies_to: 'all' | 'specific';
  product_ids: string[];
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
}

export function CouponManager({ storeId }: CouponManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, [storeId]);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons((data as any) || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard');
  };

  const handleToggleActive = async (couponId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !isActive })
        .eq('id', couponId);

      if (error) throw error;
      toast.success(`Coupon ${!isActive ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error('Failed to update coupon');
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `${coupon.discount_value} π OFF`;
    }
  };

  const getUsageDisplay = (coupon: Coupon) => {
    if (!coupon.maximum_uses) return `${coupon.used_count} uses`;
    return `${coupon.used_count} / ${coupon.maximum_uses} uses`;
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.ends_at) return false;
    return new Date(coupon.ends_at) < new Date();
  };

  const isUpcoming = (coupon: Coupon) => {
    return new Date(coupon.starts_at) > new Date();
  };

  if (loading) {
    return <div>Loading coupons...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coupon Codes</h2>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button onClick={() => { setEditingCoupon(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Coupons Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first coupon code to offer discounts to your customers
            </p>
            <Button onClick={() => { setEditingCoupon(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={!coupon.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="px-3 py-1 bg-primary/10 rounded-md font-bold text-primary">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(coupon.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{coupon.title}</CardTitle>
                    {coupon.description && (
                      <CardDescription className="text-sm mt-1">
                        {coupon.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Discount Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-lg font-bold">
                      <Percent className="w-4 h-4 mr-1" />
                      {getDiscountDisplay(coupon)}
                    </Badge>
                    {coupon.minimum_purchase > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Min: {coupon.minimum_purchase} π
                      </span>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    {isExpired(coupon) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    {isUpcoming(coupon) && (
                      <Badge variant="secondary">Upcoming</Badge>
                    )}
                    {coupon.is_active && !isExpired(coupon) && !isUpcoming(coupon) && (
                      <Badge variant="default">Active</Badge>
                    )}
                    {coupon.once_per_customer && (
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        Once per customer
                      </Badge>
                    )}
                  </div>

                  {/* Usage Stats */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {getUsageDisplay(coupon)}
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(coupon.starts_at).toLocaleDateString()}
                    {coupon.ends_at && ` - ${new Date(coupon.ends_at).toLocaleDateString()}`}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                    >
                      {coupon.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCoupon(coupon);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dialogOpen && (
        <CouponDialog
          storeId={storeId}
          coupon={editingCoupon}
          onClose={() => {
            setDialogOpen(false);
            setEditingCoupon(null);
            fetchCoupons();
          }}
        />
      )}
    </div>
  );
}

interface CouponDialogProps {
  storeId: string;
  coupon: Coupon | null;
  onClose: () => void;
}

function CouponDialog({ storeId, coupon, onClose }: CouponDialogProps) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(coupon?.code || '');
  const [title, setTitle] = useState(coupon?.title || '');
  const [description, setDescription] = useState(coupon?.description || '');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(coupon?.discount_type || 'percentage');
  const [discountValue, setDiscountValue] = useState(coupon?.discount_value?.toString() || '');
  const [minimumPurchase, setMinimumPurchase] = useState(coupon?.minimum_purchase?.toString() || '0');
  const [maximumUses, setMaximumUses] = useState(coupon?.maximum_uses?.toString() || '');
  const [oncePerCustomer, setOncePerCustomer] = useState(coupon?.once_per_customer || false);
  const [appliesTo, setAppliesTo] = useState<'all' | 'specific'>(coupon?.applies_to || 'all');
  const [startsAt, setStartsAt] = useState(coupon?.starts_at || new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(coupon?.ends_at || '');
  const [isActive, setIsActive] = useState(coupon?.is_active ?? true);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !title.trim() || !discountValue) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const couponData = {
        store_id: storeId,
        code: code.toUpperCase().trim(),
        title: title.trim(),
        description,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        minimum_purchase: parseFloat(minimumPurchase) || 0,
        maximum_uses: maximumUses ? parseInt(maximumUses) : null,
        once_per_customer: oncePerCustomer,
        applies_to: appliesTo,
        product_ids: [],
        starts_at: startsAt,
        ends_at: endsAt || null,
        is_active: isActive,
      };

      if (coupon) {
        const { error } = await supabase
          .from('discount_codes')
          .update(couponData)
          .eq('id', coupon.id);

        if (error) throw error;
        toast.success('Coupon updated successfully');
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert(couponData);

        if (error) throw error;
        toast.success('Coupon created successfully');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      if (error.code === '23505') {
        toast.error('Coupon code already exists');
      } else {
        toast.error('Failed to save coupon');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                required
                className="font-mono"
              />
              <Button type="button" variant="outline" onClick={generateCode}>
                Generate
              </Button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="20% Off Summer Sale"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Limited time offer..."
              rows={2}
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type *</Label>
              <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (π)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discount Value *</Label>
              <Input
                type="number"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '20' : '10.00'}
                required
              />
            </div>
          </div>

          {/* Minimum Purchase */}
          <div className="space-y-2">
            <Label>Minimum Purchase Amount (π)</Label>
            <Input
              type="number"
              step="0.01"
              value={minimumPurchase}
              onChange={(e) => setMinimumPurchase(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Usage Limits */}
          <div className="space-y-2">
            <Label>Maximum Total Uses</Label>
            <Input
              type="number"
              value={maximumUses}
              onChange={(e) => setMaximumUses(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Limit to one use per customer</Label>
              <p className="text-sm text-muted-foreground">Customer can only use this once</p>
            </div>
            <Switch checked={oncePerCustomer} onCheckedChange={setOncePerCustomer} />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date *</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date (Optional)</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">Customers can use this coupon</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
