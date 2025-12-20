import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Variant {
  id?: string;
  title: string;
  sku: string;
  barcode: string;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  option1: string;
  option2: string;
  option3: string;
  is_active: boolean;
  requires_shipping: boolean;
  weight: number | null;
  weight_unit: string;
}

interface ProductOption {
  id?: string;
  name: string;
  values: string[];
}

interface ProductVariantsProps {
  productId: string;
  variants: Variant[];
  options: ProductOption[];
  onVariantsChange: (variants: Variant[]) => void;
  onOptionsChange: (options: ProductOption[]) => void;
}

export function ProductVariants({
  productId,
  variants,
  options,
  onVariantsChange,
  onOptionsChange,
}: ProductVariantsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const addOption = () => {
    if (options.length >= 3) {
      toast.error('Maximum 3 options allowed');
      return;
    }
    const newOption: ProductOption = {
      name: options.length === 0 ? 'Size' : options.length === 1 ? 'Color' : 'Material',
      values: [],
    };
    onOptionsChange([...options, newOption]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onOptionsChange(newOptions);
    regenerateVariants(newOptions);
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    onOptionsChange(newOptions);
  };

  const updateOptionValues = (index: number, valuesString: string) => {
    const newOptions = [...options];
    newOptions[index].values = valuesString.split(',').map((v) => v.trim()).filter(Boolean);
    onOptionsChange(newOptions);
    regenerateVariants(newOptions);
  };

  const regenerateVariants = (currentOptions: ProductOption[]) => {
    if (currentOptions.length === 0 || currentOptions.every((o) => o.values.length === 0)) {
      onVariantsChange([]);
      return;
    }

    const generateCombinations = (opts: ProductOption[]): Variant[] => {
      const validOptions = opts.filter((o) => o.values.length > 0);
      if (validOptions.length === 0) return [];

      const combinations: string[][] = [];
      const generate = (current: string[], optionIndex: number) => {
        if (optionIndex === validOptions.length) {
          combinations.push([...current]);
          return;
        }
        for (const value of validOptions[optionIndex].values) {
          current.push(value);
          generate(current, optionIndex + 1);
          current.pop();
        }
      };
      generate([], 0);

      return combinations.map((combo) => ({
        title: combo.join(' / '),
        sku: '',
        barcode: '',
        price: 0,
        compare_at_price: null,
        inventory_quantity: 0,
        option1: combo[0] || '',
        option2: combo[1] || '',
        option3: combo[2] || '',
        is_active: true,
        requires_shipping: true,
        weight: null,
        weight_unit: 'kg',
      }));
    };

    onVariantsChange(generateCombinations(currentOptions));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    onVariantsChange(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
  };

  const saveVariants = async () => {
    if (!productId) {
      toast.error('Please save the product first');
      return;
    }

    setIsLoading(true);
    try {
      // Delete existing variants
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);

      // Delete existing options
      await supabase
        .from('product_options')
        .delete()
        .eq('product_id', productId);

      // Insert new options
      if (options.length > 0) {
        const { error: optionsError } = await supabase
          .from('product_options')
          .insert(
            options.map((opt, idx) => ({
              product_id: productId,
              name: opt.name,
              position: idx,
              values: opt.values,
            }))
          );

        if (optionsError) throw optionsError;
      }

      // Insert new variants
      if (variants.length > 0) {
        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(
            variants.map((v, idx) => ({
              product_id: productId,
              title: v.title,
              sku: v.sku || null,
              barcode: v.barcode || null,
              price: v.price,
              compare_at_price: v.compare_at_price,
              inventory_quantity: v.inventory_quantity,
              option1: v.option1 || null,
              option2: v.option2 || null,
              option3: v.option3 || null,
              is_active: v.is_active,
              requires_shipping: v.requires_shipping,
              weight: v.weight,
              weight_unit: v.weight_unit,
              position: idx,
            }))
          );

        if (variantsError) throw variantsError;
      }

      toast.success('Variants saved successfully');
    } catch (error: any) {
      console.error('Error saving variants:', error);
      toast.error(error.message || 'Failed to save variants');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Product Variants</span>
          <Button onClick={saveVariants} disabled={isLoading} size="sm">
            {isLoading ? 'Saving...' : 'Save Variants'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Options Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Options</Label>
            <Button variant="outline" size="sm" onClick={addOption} disabled={options.length >= 3}>
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>

          {options.map((option, index) => (
            <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Option Name</Label>
                <Input
                  value={option.name}
                  onChange={(e) => updateOptionName(index, e.target.value)}
                  placeholder="e.g., Size, Color"
                />
              </div>
              <div className="flex-[2] space-y-2">
                <Label>Values (comma-separated)</Label>
                <Input
                  value={option.values.join(', ')}
                  onChange={(e) => updateOptionValues(index, e.target.value)}
                  placeholder="e.g., Small, Medium, Large"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
                className="mt-6"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        {/* Variants Section */}
        {variants.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Variants ({variants.length})</Label>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 text-sm font-medium">
                <div className="col-span-3">Variant</div>
                <div className="col-span-2">Price (π)</div>
                <div className="col-span-2">Compare Price</div>
                <div className="col-span-2">SKU</div>
                <div className="col-span-2">Inventory</div>
                <div className="col-span-1"></div>
              </div>
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-3 border-t items-center"
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{variant.title}</span>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={variant.compare_at_price || ''}
                      onChange={(e) =>
                        updateVariant(index, 'compare_at_price', e.target.value ? parseFloat(e.target.value) : null)
                      }
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="SKU"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={variant.inventory_quantity}
                      onChange={(e) =>
                        updateVariant(index, 'inventory_quantity', parseInt(e.target.value) || 0)
                      }
                      min="0"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {options.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add options like Size or Color to create product variants
          </p>
        )}
      </CardContent>
    </Card>
  );
}
