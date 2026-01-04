# Product Management Enhancement Guide

## Overview
Enhanced product management system with Shopify-style features including product type filtering, variants, and improved image management.

## Features Added

### 1. **Smart Product Type Filtering**

Products are now filtered based on your store type:

- **Physical Stores**: Can only add physical products
- **Digital Stores**: Can only add digital products  
- **Online Stores**: Can add both physical and digital products

This ensures merchants don't accidentally add incompatible product types to their store.

### 2. **Product Variants (Shopify-Style)**

Add multiple variants to a single product with different options:

**Variant Options:**
- **Title**: Display name (e.g., "Large / Red")
- **SKU**: Stock Keeping Unit for inventory tracking
- **Price**: Override base product price per variant
- **Compare at Price**: Show discounts per variant
- **Inventory**: Track stock separately per variant
- **Option 1, 2, 3**: Flexible options for:
  - Size (Small, Medium, Large, XL)
  - Color (Red, Blue, Green)
  - Material (Cotton, Polyester, Silk)
  - Style, Finish, Weight, etc.

**How to Use Variants:**
1. Enable "Product Variants" toggle when creating/editing a product
2. Base product price is used as default for all variants
3. Add multiple variants with the "Add Another Variant" button
4. Each variant can have its own price, SKU, and inventory
5. Variants are only available for **physical products**

**Example Use Cases:**
- T-Shirt: Small/Blue, Medium/Red, Large/Green
- Shoes: Size 8, Size 9, Size 10
- Phone Case: iPhone 12/Black, iPhone 13/Clear

### 3. **Enhanced Image Management**

Improved image upload with professional features:

**Features:**
- **Upload up to 10 images** per product
- **Featured Image**: First image is automatically featured
- **Reorder Images**: Click image icon to set any image as featured
- **Hover Actions**: Hover over images to see swap and delete buttons
- **Image Counter**: Shows current image count (e.g., "3/10 images")
- **Visual Indicators**: 
  - Featured badge on first image
  - Border highlights on hover
  - Better grid layout (5 columns)

**How to Use:**
1. Upload images - first one becomes featured
2. Hover over any image to see action buttons
3. Click image icon to swap and make it featured
4. Click trash icon to remove image
5. Featured image appears in product listings

### 4. **Grid/List View Toggle**

Switch between grid and list views for product management:
- **Grid View**: Card layout with large images (default)
- **List View**: Compact rows with details and actions

## Database Changes

### Products Table
Added column:
```sql
has_variants BOOLEAN DEFAULT false
```

### Product Variants Table
Already exists with columns:
- `id`, `product_id`, `title`, `sku`
- `price`, `compare_at_price`, `inventory_quantity`
- `option1`, `option2`, `option3`
- `position`, `image_url`, `is_active`

## Migration

Run this SQL to add has_variants column to existing databases:

```sql
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;
```

Or run the migration file:
```bash
psql -d your_database -f database-add-variants.sql
```

## UI Updates

### Product Dialog Enhanced Sections:

1. **Product Type Badge** (Physical/Digital stores)
   - Shows which type is being added
   - No confusing toggles for single-type stores

2. **Product Variants Section** (Physical products only)
   - Collapsible card interface
   - Add unlimited variants
   - Each variant has full details
   - Visual separation with cards

3. **Image Management**
   - 5-column grid layout
   - Featured image badge
   - Hover actions overlay
   - Image limit counter

## Technical Implementation

### TypeScript Interfaces

```typescript
interface ProductVariant {
  id?: string;
  title: string;
  sku: string;
  price: string;
  compare_at_price: string;
  inventory_quantity: string;
  option1?: string;
  option2?: string;
  option3?: string;
  image_url?: string;
}

interface Product {
  // ... existing fields
  has_variants?: boolean;
}
```

### State Management

Product form includes:
```typescript
{
  has_variants: false,
  variants: [] as ProductVariant[],
}
```

### Save Logic

1. Save product with `has_variants` flag
2. If has_variants is true:
   - Delete existing variants
   - Insert new variants with position order
3. If editing and has_variants is false:
   - Delete all variants for product

### Load Logic

When editing a product:
1. Check if product has variants
2. Load variants from `product_variants` table
3. Populate form with variant data
4. Allow editing/adding/removing variants

## Best Practices

### For Variants:
- Use clear, consistent naming (e.g., "Small / Red" not "sm-r")
- Always set SKU for inventory tracking
- Set realistic inventory quantities
- Use option1, option2, option3 consistently across products

### For Images:
- Upload high-quality square images (1:1 ratio)
- Choose your best image as featured
- Use multiple angles/views
- Keep under 10 images for fast loading

### For Product Types:
- Online stores: Use variants for physical products
- Digital stores: Include detailed descriptions
- Physical stores: Track inventory carefully

## Future Enhancements

Potential additions:
- Drag-and-drop image reordering
- Bulk variant import from CSV
- Variant-specific images
- Inventory alerts
- Variant combinations generator

## Testing Checklist

- [ ] Create physical product with variants
- [ ] Edit existing product and add variants
- [ ] Remove variants from product
- [ ] Upload multiple images and reorder
- [ ] Test grid/list view toggle
- [ ] Verify product type filtering by store type
- [ ] Test on mobile devices
- [ ] Check variant prices in checkout
- [ ] Verify inventory deduction per variant

## Support

For issues or questions:
1. Check database migration ran successfully
2. Verify product_variants table exists
3. Check browser console for errors
4. Test with simple products first

---

**Version**: 1.0  
**Date**: January 4, 2026  
**Compatibility**: Requires database migration for existing stores
