import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Percent, Tag, Calendar, Clock, Gift, Package, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormEnhancedProps {
  storeId: string;
  product?: any;
  onSave: (productData: any) => Promise<void>;
  onClose: () => void;
}

export function ProductFormEnhanced({ storeId, product, onSave, onClose }: ProductFormEnhancedProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Basic product info
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price || '');
  const [category, setCategory] = useState(product?.category || '');
  const [productType, setProductType] = useState(product?.product_type || 'physical');
  
  // Inventory
  const [sku, setSku] = useState(product?.sku || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [inventoryCount, setInventoryCount] = useState(product?.inventory_count || 0);
  const [trackInventory, setTrackInventory] = useState(true);
  
  // Variants
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>([
    { name: 'Size', values: [] },
  ]);
  
  // Sale/Discount
  const [onSale, setOnSale] = useState(false);
  const [saleType, setSaleType] = useState<'percentage' | 'fixed'>('percentage');
  const [saleValue, setSaleValue] = useState('');
  const [saleStartDate, setSaleStartDate] = useState('');
  const [saleEndDate, setSaleEndDate] = useState('');
  
  // Volume Discounts
  const [volumeDiscounts, setVolumeDiscounts] = useState<{ min: number; max?: number; type: 'percentage' | 'fixed'; value: number }[]>([]);
  
  // Shipping
  const [requiresShipping, setRequiresShipping] = useState(productType === 'physical');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  
  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const addOption = () => {
    if (options.length < 3) {
      setOptions([...options, { name: `Option ${options.length + 1}`, values: [] }]);
    }
  };

  const updateOption = (index: number, field: 'name' | 'values', value: any) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const addVolumeDiscount = () => {
    setVolumeDiscounts([...volumeDiscounts, { min: 1, type: 'percentage', value: 0 }]);
  };

  const updateVolumeDiscount = (index: number, field: string, value: any) => {
    const updated = [...volumeDiscounts];
    updated[index] = { ...updated[index], [field]: value };
    setVolumeDiscounts(updated);
  };

  const removeVolumeDiscount = (index: number) => {
    setVolumeDiscounts(volumeDiscounts.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const calculateSalePrice = () => {
    if (!onSale || !saleValue || !price) return null;
    
    const originalPrice = parseFloat(price);
    if (saleType === 'percentage') {
      return originalPrice * (1 - parseFloat(saleValue) / 100);
    } else {
      return originalPrice - parseFloat(saleValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        store_id: storeId,
        name: name.trim(),
        description,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        category,
        product_type: productType,
        sku,
        barcode,
        inventory_count: trackInventory ? parseInt(inventoryCount as any) : null,
        requires_shipping: requiresShipping,
        weight: weight ? parseFloat(weight) : null,
        weight_unit: weightUnit,
        tags,
        seo_title: seoTitle,
        seo_description: seoDescription,
        // Sale data
        sale_data: onSale ? {
          type: saleType,
          value: parseFloat(saleValue),
          start_date: saleStartDate,
          end_date: saleEndDate,
        } : null,
        // Options and variants
        has_variants: hasVariants,
        options: hasVariants ? options.filter(opt => opt.name && opt.values.length > 0) : [],
        // Volume discounts
        volume_discounts: volumeDiscounts.filter(vd => vd.min > 0 && vd.value > 0),
      };

      await onSave(productData);
      toast.success('Product saved successfully!');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const salePrice = calculateSalePrice();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* BASIC TAB */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Classic T-Shirt"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Clothing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_type">Product Type</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* PRICING TAB */}
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (π) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Platform fee of 1π added per product at checkout
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compare_price">Compare at Price (π)</Label>
                  <Input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="0.00"
                  />
                  {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price || '0') && (
                    <p className="text-xs text-green-600">
                      Save {(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Sale/Discount Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Sale Price
                    </CardTitle>
                    <Switch checked={onSale} onCheckedChange={setOnSale} />
                  </div>
                </CardHeader>
                {onSale && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Discount Type</Label>
                        <Select value={saleType} onValueChange={(v: any) => setSaleType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Discount Value</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={saleValue}
                          onChange={(e) => setSaleValue(e.target.value)}
                          placeholder={saleType === 'percentage' ? '0' : '0.00'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sale Price</Label>
                        <div className="text-xl font-bold text-green-600">
                          {salePrice !== null ? `${salePrice.toFixed(2)} π` : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sale_start">Start Date</Label>
                        <Input
                          id="sale_start"
                          type="datetime-local"
                          value={saleStartDate}
                          onChange={(e) => setSaleStartDate(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sale_end">End Date</Label>
                        <Input
                          id="sale_end"
                          type="datetime-local"
                          value={saleEndDate}
                          onChange={(e) => setSaleEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Volume Discounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Volume Discounts (Bulk Pricing)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {volumeDiscounts.map((discount, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Min Quantity</Label>
                        <Input
                          type="number"
                          value={discount.min}
                          onChange={(e) => updateVolumeDiscount(index, 'min', parseInt(e.target.value))}
                          placeholder="1"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Max Quantity</Label>
                        <Input
                          type="number"
                          value={discount.max || ''}
                          onChange={(e) => updateVolumeDiscount(index, 'max', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Type</Label>
                        <Select 
                          value={discount.type}
                          onValueChange={(v) => updateVolumeDiscount(index, 'type', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">π</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Discount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={discount.value}
                          onChange={(e) => updateVolumeDiscount(index, 'value', parseFloat(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeVolumeDiscount(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addVolumeDiscount} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Volume Discount
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* INVENTORY TAB */}
            <TabsContent value="inventory" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ABC-12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="123456789012"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Track Inventory</Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor stock levels for this product
                  </p>
                </div>
                <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
              </div>

              {trackInventory && (
                <div className="space-y-2">
                  <Label htmlFor="inventory">Quantity</Label>
                  <Input
                    id="inventory"
                    type="number"
                    value={inventoryCount}
                    onChange={(e) => setInventoryCount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              )}

              {productType === 'physical' && (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Requires Shipping</Label>
                      <p className="text-sm text-muted-foreground">
                        This product needs to be shipped
                      </p>
                    </div>
                    <Switch checked={requiresShipping} onCheckedChange={setRequiresShipping} />
                  </div>

                  {requiresShipping && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight_unit">Unit</Label>
                        <Select value={weightUnit} onValueChange={setWeightUnit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                            <SelectItem value="oz">oz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* VARIANTS TAB */}
            <TabsContent value="variants" className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>This product has variants</Label>
                  <p className="text-sm text-muted-foreground">
                    Like size, color, material, etc.
                  </p>
                </div>
                <Switch checked={hasVariants} onCheckedChange={setHasVariants} />
              </div>

              {hasVariants && (
                <div className="space-y-4">
                  {options.map((option, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Option {index + 1}</CardTitle>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label>Option Name</Label>
                          <Input
                            value={option.name}
                            onChange={(e) => updateOption(index, 'name', e.target.value)}
                            placeholder="E.g., Size, Color"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Values (comma-separated)</Label>
                          <Input
                            value={option.values.join(', ')}
                            onChange={(e) => updateOption(index, 'values', e.target.value.split(',').map(v => v.trim()).filter(v => v))}
                            placeholder="E.g., Small, Medium, Large"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {options.length < 3 && (
                    <Button type="button" variant="outline" onClick={addOption} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Option
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Leave empty to use product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description for search engines"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
