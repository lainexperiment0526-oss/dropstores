import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Calendar, Sparkles, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HolidayPromotionManagerProps {
  storeId: string;
}

interface HolidayPromotion {
  id: string;
  holiday_name: string;
  banner_text: string;
  banner_color: string;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

const HOLIDAY_PRESETS = [
  { name: 'New Year Sale', emoji: '🎆', color: '#FFD700' },
  { name: 'Valentine\'s Day', emoji: '❤️', color: '#FF1493' },
  { name: 'Easter Sale', emoji: '🐰', color: '#98FB98' },
  { name: 'Summer Sale', emoji: '☀️', color: '#FFA500' },
  { name: 'Black Friday', emoji: '🛍️', color: '#000000' },
  { name: 'Cyber Monday', emoji: '💻', color: '#0000FF' },
  { name: 'Christmas Sale', emoji: '🎄', color: '#228B22' },
  { name: 'Back to School', emoji: '📚', color: '#4169E1' },
  { name: 'Mother\'s Day', emoji: '🌸', color: '#FFB6C1' },
  { name: 'Father\'s Day', emoji: '👔', color: '#4682B4' },
];

export function HolidayPromotionManager({ storeId }: HolidayPromotionManagerProps) {
  const [promotions, setPromotions] = useState<HolidayPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<HolidayPromotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, [storeId]);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('holiday_promotions')
        .select('*')
        .eq('store_id', storeId)
        .order('starts_at', { ascending: false });

      if (error) throw error;
      setPromotions((data as any) || []);
    } catch (error) {
      console.error('Error fetching holiday promotions:', error);
      toast.error('Failed to load holiday promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this holiday promotion?')) return;

    try {
      const { error } = await (supabase as any)
        .from('holiday_promotions')
        .delete()
        .eq('id', promotionId);

      if (error) throw error;
      toast.success('Holiday promotion deleted successfully');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting holiday promotion:', error);
      toast.error('Failed to delete holiday promotion');
    }
  };

  const handleToggleActive = async (promotionId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('holiday_promotions')
        .update({ is_active: !isActive })
        .eq('id', promotionId);

      if (error) throw error;
      toast.success(`Holiday promotion ${!isActive ? 'activated' : 'deactivated'}`);
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling holiday promotion:', error);
      toast.error('Failed to update holiday promotion');
    }
  };

  const isLive = (promo: HolidayPromotion) => {
    const now = new Date();
    const start = new Date(promo.starts_at);
    const end = new Date(promo.ends_at);
    return promo.is_active && now >= start && now <= end;
  };

  const isUpcoming = (promo: HolidayPromotion) => {
    return new Date(promo.starts_at) > new Date();
  };

  const isEnded = (promo: HolidayPromotion) => {
    return new Date(promo.ends_at) < new Date();
  };

  const getHolidayEmoji = (holidayName: string) => {
    const preset = HOLIDAY_PRESETS.find(p => p.name.toLowerCase() === holidayName.toLowerCase());
    return preset?.emoji || '🎉';
  };

  if (loading) {
    return <div>Loading holiday promotions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Holiday Promotions</h2>
          <p className="text-muted-foreground">Create seasonal campaigns and special offers</p>
        </div>
        <Button onClick={() => { setEditingPromotion(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Holiday Promotion
        </Button>
      </div>

      {promotions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Holiday Promotions Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create seasonal campaigns to boost sales during holidays
            </p>
            <Button onClick={() => { setEditingPromotion(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <Card 
              key={promo.id} 
              className={!promo.is_active ? 'opacity-50' : ''}
              style={{ borderColor: promo.banner_color, borderWidth: '2px' }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{getHolidayEmoji(promo.holiday_name)}</span>
                      {promo.holiday_name}
                    </CardTitle>
                    <CardDescription className="text-sm mt-2">
                      {promo.banner_text}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex flex-wrap gap-2">
                    {isLive(promo) && (
                      <Badge variant="default" className="bg-green-500">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE NOW
                        </div>
                      </Badge>
                    )}
                    {isUpcoming(promo) && (
                      <Badge variant="secondary">
                        <Calendar className="w-3 h-3 mr-1" />
                        Upcoming
                      </Badge>
                    )}
                    {isEnded(promo) && (
                      <Badge variant="destructive">Ended</Badge>
                    )}
                  </div>

                  {/* Discount Badge */}
                  <div 
                    className="inline-flex items-center px-4 py-2 rounded-lg text-white font-bold text-lg"
                    style={{ backgroundColor: promo.banner_color }}
                  >
                    <Tag className="w-5 h-5 mr-2" />
                    {promo.discount_percentage}% OFF
                  </div>

                  {/* Date Range */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Starts: {new Date(promo.starts_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Ends: {new Date(promo.ends_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Banner Preview */}
                  <div 
                    className="p-3 rounded-lg text-center font-semibold text-sm"
                    style={{ 
                      backgroundColor: promo.banner_color + '20',
                      color: promo.banner_color,
                      border: `2px solid ${promo.banner_color}`
                    }}
                  >
                    {promo.banner_text}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleActive(promo.id, promo.is_active)}
                    >
                      {promo.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPromotion(promo);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promo.id)}
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
        <HolidayPromotionDialog
          storeId={storeId}
          promotion={editingPromotion}
          onClose={() => {
            setDialogOpen(false);
            setEditingPromotion(null);
            fetchPromotions();
          }}
        />
      )}
    </div>
  );
}

interface HolidayPromotionDialogProps {
  storeId: string;
  promotion: HolidayPromotion | null;
  onClose: () => void;
}

function HolidayPromotionDialog({ storeId, promotion, onClose }: HolidayPromotionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [holidayName, setHolidayName] = useState(promotion?.holiday_name || '');
  const [bannerText, setBannerText] = useState(promotion?.banner_text || '');
  const [bannerColor, setBannerColor] = useState(promotion?.banner_color || '#FF6B6B');
  const [discountPercentage, setDiscountPercentage] = useState(promotion?.discount_percentage?.toString() || '');
  const [startsAt, setStartsAt] = useState(
    promotion?.starts_at ? new Date(promotion.starts_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [endsAt, setEndsAt] = useState(
    promotion?.ends_at ? new Date(promotion.ends_at).toISOString().slice(0, 16) : ''
  );
  const [isActive, setIsActive] = useState(promotion?.is_active ?? true);

  const handlePresetSelect = (preset: typeof HOLIDAY_PRESETS[0]) => {
    setHolidayName(preset.name);
    setBannerColor(preset.color);
    if (!bannerText) {
      setBannerText(`${preset.emoji} ${preset.name} - Special Offer!`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!holidayName.trim() || !bannerText.trim() || !discountPercentage || !endsAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    const discount = parseFloat(discountPercentage);
    if (discount <= 0 || discount >= 100) {
      toast.error('Discount must be between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      const promotionData = {
        store_id: storeId,
        holiday_name: holidayName.trim(),
        banner_text: bannerText.trim(),
        banner_color: bannerColor,
        discount_percentage: discount,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: isActive,
      };

      if (promotion) {
        const { error } = await (supabase as any)
          .from('holiday_promotions')
          .update(promotionData)
          .eq('id', promotion.id);

        if (error) throw error;
        toast.success('Holiday promotion updated successfully');
      } else {
        const { error } = await (supabase as any)
          .from('holiday_promotions')
          .insert(promotionData);

        if (error) throw error;
        toast.success('Holiday promotion created successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving holiday promotion:', error);
      toast.error('Failed to save holiday promotion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit Holiday Promotion' : 'Create New Holiday Promotion'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Holiday Presets */}
          {!promotion && (
            <div className="space-y-2">
              <Label>Quick Select Holiday</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {HOLIDAY_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    className="justify-start"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <span className="text-xl mr-2">{preset.emoji}</span>
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="holidayName">Holiday Name *</Label>
            <Input
              id="holidayName"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="Black Friday"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerText">Banner Text *</Label>
            <Textarea
              id="bannerText"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="🎉 Black Friday Sale - Up to 50% OFF Everything!"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bannerColor">Banner Color *</Label>
              <div className="flex gap-2">
                <Input
                  id="bannerColor"
                  type="color"
                  value={bannerColor}
                  onChange={(e) => setBannerColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={bannerColor}
                  onChange={(e) => setBannerColor(e.target.value)}
                  placeholder="#FF6B6B"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount Percentage * (0-100)</Label>
              <Input
                id="discount"
                type="number"
                min="1"
                max="99"
                step="1"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="50"
                required
              />
            </div>
          </div>

          {/* Banner Preview */}
          <div className="space-y-2">
            <Label>Banner Preview</Label>
            <div 
              className="p-4 rounded-lg text-center font-bold text-white"
              style={{ backgroundColor: bannerColor }}
            >
              {bannerText || 'Your banner text will appear here'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date & Time *</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date & Time *</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">Enable this holiday promotion</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : promotion ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
