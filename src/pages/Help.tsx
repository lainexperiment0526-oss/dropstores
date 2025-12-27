import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Book, Search, Store, ShoppingCart, CreditCard, Package, 
  Settings, TrendingUp, Users, Zap, Gift, Tag, Truck, 
  DollarSign, BarChart, Shield, HelpCircle, Video, FileText,
  Check, ArrowRight, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  const tutorials = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Sparkles,
      color: 'text-blue-500',
      articles: [
        {
          title: 'Create Your First Store',
          description: 'Step-by-step guide to setting up your DropStore',
          content: `
**Step 1: Sign Up**
- Visit DropStore homepage
- Click "Start Free" or "Sign In"
- Authenticate with your Pi Network account
- Complete your profile information

**Step 2: Choose Your Plan**
- Free Plan: Perfect for testing (1 product)
- Basic Plan: 20π/month (50 products)
- Grow Plan: 49π/month (200 products)
- Advance Plan: 60π/month (500 products)
- Plus Plan: 100π/month (Unlimited)

**Step 3: Create Your Store**
- Go to Dashboard → "Create New Store"
- Enter store name (e.g., "My Pi Shop")
- Choose your store URL (e.g., myshop.dropstore.com)
- Add store description
- Upload logo and banner images
- Set your store's primary color

**Step 4: Configure Settings**
- Add contact information (email, phone)
- Set your physical address (if applicable)
- Configure delivery options
- Set up payment methods

**Step 5: Launch Your Store**
- Click "Publish Store"
- Share your store URL
- Start selling!

**Tips for Success:**
✅ Use high-quality images
✅ Write detailed product descriptions
✅ Set competitive prices
✅ Enable multiple payment options
✅ Respond quickly to customer inquiries
          `,
          tags: ['beginner', 'setup', 'store']
        },
        {
          title: 'Understanding Dashboard',
          description: 'Navigate and use your store dashboard effectively',
          content: `
**Dashboard Overview**

**Main Sections:**

1. **Analytics Cards**
   - Total Sales (π earned)
   - Total Orders (number of purchases)
   - Products Listed (active products)
   - Store Views (visitor count)

2. **Quick Actions**
   - Add New Product
   - View Orders
   - Manage Promotions
   - Store Settings

3. **Recent Orders**
   - View latest customer orders
   - Update order status
   - Process refunds
   - Contact customers

4. **Sales Chart**
   - Daily/Weekly/Monthly views
   - Revenue trends
   - Best-selling products
   - Customer insights

**Navigation Menu:**
- 📊 Dashboard: Overview and analytics
- 🏪 Store: Product management
- 📦 Orders: Order processing
- 💰 Payments: Transaction history
- 🎁 Promotions: Marketing tools
- ⚙️ Settings: Store configuration

**Pro Tips:**
- Check dashboard daily for new orders
- Monitor analytics to understand trends
- Use quick actions for efficiency
- Set up notifications for new orders
          `,
          tags: ['dashboard', 'navigation', 'beginner']
        },
        {
          title: 'Adding Your First Product',
          description: 'Complete guide to listing products in your store',
          content: `
**Product Creation Guide**

**Basic Information:**
1. Product Name (clear and descriptive)
2. Description (features, benefits, specifications)
3. Category (organize your products)
4. Product Type (digital or physical)
5. Tags (for search and filtering)

**Pricing:**
- Set your product price (in π)
- Add compare-at price (show savings)
- Platform fee: 1π added automatically
- Sale pricing with date ranges
- Volume discounts for bulk orders

**Inventory:**
- SKU (stock keeping unit)
- Barcode (optional)
- Track inventory (enable/disable)
- Stock quantity
- Low stock alerts

**Variants:**
- Size (S, M, L, XL)
- Color (Red, Blue, Green)
- Material (Cotton, Polyester)
- Up to 3 variant types

**Images:**
- Upload high-quality photos
- Multiple angles recommended
- Use 1:1 aspect ratio
- Maximum 5 images per product
- Set primary image

**Shipping (Physical Products):**
- Weight (for shipping calculation)
- Dimensions (L × W × H)
- Requires shipping (yes/no)
- Shipping class (standard/express)

**SEO Optimization:**
- SEO Title (for search engines)
- SEO Description (meta description)
- URL slug (product-name)
- Alt text for images

**Publishing:**
- Preview your product
- Check all details
- Click "Publish"
- Share product link

**Best Practices:**
✅ Use professional photos
✅ Write detailed descriptions
✅ Set accurate inventory
✅ Use relevant tags
✅ Optimize for SEO
✅ Test on mobile devices
          `,
          tags: ['products', 'listing', 'beginner']
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Fees',
      icon: CreditCard,
      color: 'text-green-500',
      articles: [
        {
          title: 'Pi Payment Setup',
          description: 'Enable Pi Network payments in your store',
          content: `
**Pi Payment Integration**

**What is Pi Payment?**
- Instant cryptocurrency payment
- Built-in Pi Network integration
- Secure on-chain verification
- No chargebacks
- Fast settlement

**How It Works:**

**For Customers:**
1. Select products and checkout
2. Choose "Pi Payment" method
3. Authenticate with Pi Browser
4. Approve payment amount
5. Transaction verified on blockchain
6. Order confirmed instantly

**For Merchants:**
1. Enable Pi Payment in settings
2. Customer pays with Pi
3. Payment verified automatically
4. Funds deposited to your Pi wallet
5. Automatic order fulfillment

**Setup Steps:**
1. Go to Store Settings → Payment Methods
2. Enable "Pi Payment"
3. Verify your Pi wallet address
4. Test with a small transaction
5. Start accepting Pi payments!

**Transaction Flow:**
- Customer initiates payment
- Pi SDK opens authentication
- User approves in Pi Browser
- Blockchain records transaction
- Horizon API verifies on-chain
- Order status updated
- Notification sent

**Benefits:**
✅ Instant payments
✅ Low transaction fees
✅ Global accessibility
✅ No intermediaries
✅ Secure and transparent
✅ Mainnet integration

**Security:**
- End-to-end encryption
- On-chain verification
- No sensitive data stored
- PCI compliance
- Regular security audits
          `,
          tags: ['payments', 'pi-network', 'crypto']
        },
        {
          title: 'Manual Wallet Payments',
          description: 'Accept direct Pi wallet transfers with QR codes',
          content: `
**Manual Wallet Transfer Guide**

**What is Manual Wallet Payment?**
- Direct Pi transfer to your wallet
- Customer scans QR code
- Sends exact amount manually
- You confirm receipt
- Order fulfilled

**Setup:**
1. Add your Pi wallet address
2. System generates QR code
3. Enable in payment methods
4. Customers can now pay manually

**Customer Experience:**
1. Select "Manual Wallet Transfer"
2. See QR code and wallet address
3. Open Pi Wallet app
4. Scan QR or copy address
5. Send exact amount shown
6. Upload payment proof (optional)
7. Wait for merchant confirmation

**Merchant Process:**
1. Receive payment notification
2. Check your Pi wallet
3. Verify amount and transaction
4. Confirm payment in dashboard
5. Process order

**Advantages:**
✅ No payment gateway fees
✅ Direct wallet-to-wallet
✅ QR code convenience
✅ Manual verification
✅ Backup payment option

**Best Practices:**
- Respond quickly to payments
- Verify amounts carefully
- Provide clear instructions
- Set payment deadline (24h)
- Send confirmation emails
- Keep transaction records

**Common Issues:**
❓ Wrong amount sent → Request correction
❓ Payment not received → Check blockchain
❓ Expired QR code → Generate new one
❓ Customer confused → Provide support
          `,
          tags: ['payments', 'wallet', 'qr-code']
        },
        {
          title: 'Understanding Fees',
          description: 'Platform fees, delivery charges, and pricing',
          content: `
**Fee Structure Explained**

**Platform Fee: 1π**
- Fixed fee per product
- Added automatically at checkout
- Covers platform maintenance
- Supports development
- Non-negotiable

**Delivery Fee:**
- Set by merchant (you decide)
- Only for physical products
- Digital products: FREE delivery
- Configurable per store
- Can offer free shipping threshold

**Example Calculations:**

**Digital Product:**
- Product Price: 20π
- Platform Fee: 1π
- Delivery Fee: 0π (digital)
- **Total: 21π**

**Physical Product:**
- Product Price: 50π
- Platform Fee: 1π
- Delivery Fee: 5π
- **Total: 56π**

**Free Delivery Threshold:**
If you set threshold at 80π:
- Order 100π → FREE delivery
- Order 50π → Pay delivery fee

**Merchant Payout:**
Your earnings = Total - Platform Fee

Example:
- Customer pays: 56π
- Platform fee: -1π
- Delivery fee: +5π (you keep)
- **You receive: 60π**

**Setting Delivery Fees:**
1. Go to Settings → Delivery
2. Enable delivery
3. Set delivery fee (e.g., 5π)
4. Set free threshold (optional)
5. Save settings

**Tips to Maximize Revenue:**
✅ Price competitively
✅ Offer free shipping above threshold
✅ Bundle products for higher orders
✅ Use promotions to boost sales
✅ Clearly communicate fees
          `,
          tags: ['fees', 'pricing', 'revenue']
        }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & Promotions',
      icon: TrendingUp,
      color: 'text-purple-500',
      articles: [
        {
          title: 'Creating Coupon Codes',
          description: 'Boost sales with discount coupons',
          content: `
**Coupon Code Mastery**

**Types of Coupons:**

1. **Percentage Discount**
   - Example: 20% OFF
   - Good for: Store-wide sales
   - Customer saves on any purchase

2. **Fixed Amount**
   - Example: 10π OFF
   - Good for: First-time buyers
   - Predictable discount

**Creating a Coupon:**

1. Go to Marketing → Coupons
2. Click "New Coupon"
3. Set coupon code (e.g., SAVE20)
4. Choose discount type
5. Set discount value
6. Add conditions:
   - Minimum purchase
   - Maximum uses
   - One per customer
   - Valid dates
7. Publish coupon

**Advanced Settings:**

**Minimum Purchase:**
- Require 50π minimum order
- Ensures profitability
- Encourages larger orders

**Usage Limits:**
- Total uses: 100 coupons
- Per customer: 1 use only
- Prevents abuse

**Date Range:**
- Start: Dec 25, 2025
- End: Dec 31, 2025
- Limited-time urgency

**Coupon Strategies:**

**Welcome Discount:**
- Code: WELCOME10
- 10π OFF first order
- Minimum: 30π
- Converts new customers

**Holiday Sale:**
- Code: XMAS25
- 25% OFF everything
- Dec 24-26 only
- Seasonal boost

**Bulk Order:**
- Code: BULK50
- 50π OFF
- Minimum: 200π order
- Encourages wholesale

**Loyalty Reward:**
- Code: VIP15
- 15% OFF
- For repeat customers
- One use per customer

**Promotion Tips:**
✅ Share on social media
✅ Email to customers
✅ Display on homepage
✅ Time-limited urgency
✅ Track performance
✅ A/B test different offers

**Coupon Analytics:**
- Track redemption rate
- Monitor revenue impact
- Identify popular codes
- Optimize future campaigns
          `,
          tags: ['coupons', 'discounts', 'marketing']
        },
        {
          title: 'Flash Sales',
          description: 'Create urgency with limited-time offers',
          content: `
**Flash Sale Strategy**

**What is a Flash Sale?**
- Limited-time discount
- Limited quantity available
- Countdown timer creates urgency
- High conversion rates
- Inventory clearance

**Setting Up Flash Sale:**

1. Go to Marketing → Flash Sales
2. Click "New Flash Sale"
3. Choose product
4. Set discount (e.g., 50% OFF)
5. Set quantity limit (e.g., 100 units)
6. Set time period:
   - Start: 12:00 PM today
   - End: 11:59 PM today
7. Add eye-catching title
8. Launch sale

**Flash Sale Elements:**

**Countdown Timer:**
- Shows time remaining
- Creates urgency
- Updates in real-time
- "Only 2h 34m left!"

**Stock Counter:**
- Shows units remaining
- "Only 15 left!"
- Social proof
- FOMO effect

**Discount Badge:**
- "50% OFF - Flash Sale!"
- Prominent display
- Red/yellow colors
- Attention-grabbing

**Best Practices:**

**Timing:**
- 6-24 hours duration
- Start at peak traffic time
- Weekends for B2C
- Weekdays for B2B

**Pricing:**
- 30-70% discount range
- Calculate break-even
- Factor in fees
- Still profitable

**Promotion:**
- Announce 24h before
- Email subscribers
- Social media posts
- Store banner
- SMS alerts

**Product Selection:**
- High-margin items
- Overstocked inventory
- Popular products
- New launches

**Example Flash Sale:**

**Product:** Premium T-Shirt
**Regular Price:** 100π
**Flash Sale:** 50π (50% OFF)
**Quantity:** 50 units
**Duration:** 6 hours
**Result:** Sold out in 3 hours!

**Post-Sale Actions:**
- Analyze performance
- Send thank-you emails
- Suggest related products
- Plan next flash sale
- Review feedback

**Common Mistakes to Avoid:**
❌ Too long duration (no urgency)
❌ Unlimited quantity (no scarcity)
❌ Poor promotion (no traffic)
❌ Loss-making prices (check math!)
❌ No follow-up (missed upsells)
          `,
          tags: ['flash-sales', 'urgency', 'marketing']
        },
        {
          title: 'Holiday Promotions',
          description: 'Seasonal campaigns to boost sales',
          content: `
**Holiday Campaign Guide**

**Major Shopping Holidays:**

**Black Friday (November)**
- Biggest shopping day
- Offer: 40-60% OFF
- Duration: 24-48 hours
- Strategy: Doorbuster deals

**Cyber Monday**
- Online shopping focus
- Offer: Tech products discount
- Bundle deals
- Free shipping

**Christmas (December)**
- Gift shopping season
- Offer: Gift bundles
- Gift wrapping service
- Extended returns

**New Year (January)**
- Fresh start mentality
- Offer: 25-35% OFF
- "New Year, New You"
- Fitness/wellness focus

**Valentine's Day (February)**
- Couple-focused products
- Offer: "2 for the price of 1"
- Gift sets
- Romantic themes

**Creating Holiday Promotion:**

1. Go to Marketing → Holiday Promotions
2. Click "New Campaign"
3. Select holiday preset or custom
4. Set discount percentage
5. Design banner:
   - Holiday theme colors
   - Festive emojis
   - Compelling message
6. Set date range
7. Activate campaign

**Banner Examples:**

**Christmas:**
🎄 "Merry Christmas! 30% OFF Everything" 🎅
- Colors: Red, green, gold
- Snowflake decorations

**Black Friday:**
🛍️ "BLACK FRIDAY: Up to 60% OFF!" 💥
- Colors: Black, yellow, red
- Lightning bolts

**Valentine's:**
❤️ "Love is in the Air - BOGO 50% OFF!" 💕
- Colors: Pink, red, white
- Heart decorations

**Marketing Calendar:**
- Plan 30 days ahead
- Prepare inventory
- Design graphics
- Schedule emails
- Social media posts
- Coordinate with suppliers

**Cross-Selling:**
- Suggest gift bundles
- "Complete the look"
- Accessory add-ons
- Volume discounts
- Last-minute gifts

**Post-Holiday:**
- Clearance sales
- Thank you emails
- Request reviews
- Plan next holiday
- Analyze results
          `,
          tags: ['holidays', 'seasonal', 'campaigns']
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: Settings,
      color: 'text-orange-500',
      articles: [
        {
          title: 'Product Variants',
          description: 'Manage sizes, colors, and other variants',
          content: `
**Product Variant Management**

**What are Variants?**
Same product, different options:
- Sizes (S, M, L, XL)
- Colors (Red, Blue, Green)
- Materials (Cotton, Polyester)
- Styles (Classic, Modern, Vintage)

**Setting Up Variants:**

1. Create/Edit Product
2. Go to "Variants" tab
3. Add variant type (e.g., Size)
4. Add values (S, M, L, XL)
5. Add another type (e.g., Color)
6. Add values (Red, Blue, Black)
7. System generates combinations
8. Set price/inventory per variant

**Example Setup:**

**Product:** T-Shirt

**Variant 1: Size**
- Small
- Medium  
- Large
- X-Large

**Variant 2: Color**
- White
- Black
- Navy

**Result: 12 Combinations**
- Small White
- Small Black
- Small Navy
- Medium White
- (and so on...)

**Variant-Specific Settings:**

**Pricing:**
- Base price: 50π
- Large size: +5π
- X-Large: +10π
- Premium color: +3π

**Inventory:**
- Small White: 20 units
- Medium Black: 15 units
- Large Navy: 10 units
- Track separately

**Images:**
- Upload color-specific photos
- Show actual variant
- Multiple angles
- Customer sees what they get

**SKU & Barcode:**
- Unique per variant
- Example: TSHIRT-M-BLK-001
- Inventory tracking
- Warehouse management

**Variant Display:**

**Customer View:**
1. Sees product
2. Selects size (M)
3. Selects color (Black)
4. Price updates
5. Stock shows (15 available)
6. Add to cart

**Best Practices:**
✅ Clear labels (not confusing)
✅ High-quality variant images
✅ Accurate stock per variant
✅ Logical pricing
✅ Test all combinations
✅ Mobile-friendly selectors

**Common Use Cases:**

**Clothing:**
- Size + Color
- Size + Material
- Style + Color

**Electronics:**
- Storage + Color
- Model + Warranty
- Version + Accessories

**Furniture:**
- Size + Material
- Color + Finish
- Style + Fabric

**Books:**
- Format (eBook, Paperback, Hardcover)
- Language
- Edition

**Limitations:**
- Maximum 3 variant types
- Each type: unlimited values
- Total combinations: 100 max
- Can disable sold-out variants
          `,
          tags: ['variants', 'products', 'advanced']
        },
        {
          title: 'Inventory Management',
          description: 'Track stock levels and prevent overselling',
          content: `
**Inventory Control System**

**Why Track Inventory?**
- Prevent overselling
- Know stock levels
- Automatic low-stock alerts
- Accurate product availability
- Better planning

**Setup Inventory Tracking:**

1. Product Settings
2. Enable "Track Inventory"
3. Set initial stock quantity
4. Set low-stock threshold
5. Configure alerts
6. Save settings

**Stock Levels:**

**In Stock:**
- Quantity > 0
- Available for purchase
- Shows "In Stock"
- Customers can buy

**Low Stock:**
- Quantity < threshold (e.g., 5)
- Warning alert sent
- Shows "Only X left!"
- Reorder reminder

**Out of Stock:**
- Quantity = 0
- Cannot purchase
- Shows "Out of Stock"
- Optional: Allow backorders

**Stock Updates:**

**Automatic:**
- Order placed: -1 from stock
- Order cancelled: +1 to stock
- Refund: +1 to stock
- Real-time updates

**Manual:**
- Bulk import/export
- Adjust quantities
- Physical inventory count
- Sync with warehouse

**Inventory Report:**

**Dashboard View:**
- Total products
- In-stock count
- Low-stock items
- Out-of-stock items
- Stock value (π)

**Export Options:**
- CSV file
- Excel spreadsheet
- PDF report
- All variants included

**Reorder Management:**

**Automatic Alerts:**
Email when stock low:
"⚠️ Low Stock Alert: T-Shirt Blue (M) - Only 3 left!"

**Reorder Points:**
- Set minimum level (e.g., 10)
- Alert triggers at threshold
- Recommended reorder: 50 units
- Lead time consideration

**Multi-Location:**
(Future feature)
- Warehouse A: 50 units
- Warehouse B: 30 units
- Store Front: 10 units
- Total: 90 units

**Best Practices:**
✅ Regular inventory audits
✅ Set realistic thresholds
✅ Monitor fast-sellers
✅ Keep safety stock
✅ Track seasonal trends
✅ Use SKU system
✅ Document adjustments

**Inventory Reports:**
- Daily sales summary
- Weekly stock movement
- Monthly turnover rate
- Slow-moving items
- Dead stock identification
          `,
          tags: ['inventory', 'stock', 'management']
        },
        {
          title: 'Store Analytics',
          description: 'Track performance and make data-driven decisions',
          content: `
**Analytics & Insights**

**Key Metrics:**

**1. Sales Revenue**
- Total π earned
- Daily/Weekly/Monthly
- Growth percentage
- Compare periods
- Revenue trends

**2. Order Statistics**
- Total orders
- Average order value
- Orders per day
- Conversion rate
- Cart abandonment

**3. Product Performance**
- Best sellers
- Revenue per product
- Units sold
- View-to-purchase ratio
- Stock turnover

**4. Customer Insights**
- New vs returning
- Customer lifetime value
- Geographic distribution
- Peak shopping times
- Device breakdown

**5. Store Visits**
- Total page views
- Unique visitors
- Traffic sources
- Bounce rate
- Time on site

**Dashboard Widgets:**

**Revenue Chart:**
- Line graph
- Last 30 days
- Daily breakdowns
- Trend indicators
- Comparison view

**Top Products:**
1. Product Name | Units | Revenue
2. Premium Shirt | 45 | 2,250π
3. Classic Jeans | 32 | 1,600π
4. Summer Dress | 28 | 1,400π

**Recent Orders:**
- Order ID
- Customer
- Amount
- Status
- Date/Time

**Traffic Sources:**
- Direct: 45%
- Social Media: 30%
- Search: 15%
- Referral: 10%

**Performance Indicators:**

**Good Signs:**
✅ Growing revenue trend
✅ Increasing order count
✅ Higher average order value
✅ Low cart abandonment
✅ High conversion rate

**Warning Signs:**
⚠️ Declining sales
⚠️ High bounce rate
⚠️ Low conversion
⚠️ Many abandoned carts
⚠️ Slow-moving inventory

**Actionable Insights:**

**If Sales Drop:**
- Run promotion campaign
- Check competitor pricing
- Improve product images
- Offer limited-time discount
- Email customer list

**If Traffic Low:**
- Boost social media
- SEO optimization
- Paid advertising
- Influencer partnerships
- Content marketing

**If Conversion Low:**
- Simplify checkout
- Add trust badges
- Improve product descriptions
- Better product photos
- Customer reviews

**Export Reports:**
- Date range selection
- All metrics included
- CSV/Excel format
- Share with team
- Historical analysis

**Advanced Analytics:**
(Coming soon)
- Cohort analysis
- Customer segmentation
- Predictive insights
- AI recommendations
- Automated reports
          `,
          tags: ['analytics', 'metrics', 'reports']
        }
      ]
    }
  ];

  const faqs = [
    {
      question: "How much does it cost to start?",
      answer: "You can start completely FREE with our Free Plan (1 product). Paid plans start from just 20π/month for the Basic plan with 50 products. No hidden fees, no setup costs - just transparent pricing."
    },
    {
      question: "How do I receive payments?",
      answer: "You receive payments directly to your Pi wallet. For Pi Payments, funds are automatically transferred after order confirmation. For Manual Wallet payments, customers send Pi directly to your wallet address. You keep all sales revenue minus the 1π platform fee per product."
    },
    {
      question: "Can I sell both digital and physical products?",
      answer: "Yes! DropStore supports both digital products (ebooks, courses, software) and physical products (clothing, electronics, etc.). Digital products have no delivery fees, while physical products can have configurable shipping charges."
    },
    {
      question: "What is the platform fee?",
      answer: "There's a fixed 1π fee per product listing, automatically added at checkout. This covers platform maintenance, security, and development. You keep all other revenue including your product price and delivery fees (if applicable)."
    },
    {
      question: "How do refunds work?",
      answer: "You can process refunds from your dashboard. For Pi Payments, refunds are automatic. For Manual Wallet payments, you send the refund directly to the customer's wallet. Always communicate with customers before processing refunds."
    },
    {
      question: "Can I customize my store design?",
      answer: "Yes! Customize your store with your own logo, banner, primary color, and store description. Choose from multiple templates and themes. Your store gets a unique URL (yourstorename.dropstore.com)."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption, secure Pi Network authentication, and on-chain transaction verification. Your data is stored securely, and we never share it with third parties. Regular security audits ensure platform safety."
    },
    {
      question: "How do I market my store?",
      answer: "Use our built-in marketing tools: coupon codes, flash sales, holiday promotions, and volume discounts. Share your store on social media, use SEO optimization, email your customer list, and leverage Pi Network community channels."
    },
    {
      question: "What payment methods are supported?",
      answer: "Two options: (1) Pi Payment - instant cryptocurrency payment via Pi Network SDK with automatic verification. (2) Manual Wallet Transfer - customers scan QR code and send Pi directly to your wallet. Both methods are secure and reliable."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, anytime! Upgrade for more features and products, or downgrade if needed. Changes take effect immediately. If you upgrade mid-cycle, you're only charged the prorated difference. Downgrading gives credit for next billing cycle."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes! Access our AI-powered support chat 24/7 for instant help. Browse our comprehensive help documentation and tutorials. For complex issues, contact our support team via email. Most queries are resolved within 24 hours."
    },
    {
      question: "How do I track orders?",
      answer: "View all orders in your dashboard with real-time status updates. Customers receive automatic email notifications for order confirmation, processing, and completion. You can manually update order status and add tracking information."
    }
  ];

  const quickGuides = [
    {
      icon: Store,
      title: "Create Store",
      description: "5 min setup",
      link: "#getting-started"
    },
    {
      icon: Package,
      title: "Add Products",
      description: "Step-by-step",
      link: "#getting-started"
    },
    {
      icon: CreditCard,
      title: "Setup Payments",
      description: "Pi & Wallet",
      link: "#payments"
    },
    {
      icon: Tag,
      title: "Create Coupons",
      description: "Boost sales",
      link: "#marketing"
    },
    {
      icon: Zap,
      title: "Flash Sales",
      description: "Limited-time",
      link: "#marketing"
    },
    {
      icon: BarChart,
      title: "View Analytics",
      description: "Track growth",
      link: "#advanced"
    }
  ];

  const filteredTutorials = tutorials.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.articles.length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-background dark:from-blue-950/20 dark:via-sky-950/10 dark:to-background">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-sky-500/5 to-purple-500/5" />
        
        <div className="relative container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-3 mb-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-sky-500/10 border border-blue-500/20">
                <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
                  Help Center
                </h1>
              </div>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                Complete tutorials, guides, and resources to help you build and grow your Pi-powered store
              </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search tutorials, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 focus:border-blue-500 transition-colors shadow-lg"
                />
              </div>
            </div>

            {/* Quick Guides */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {quickGuides.map((guide, index) => {
                const Icon = guide.icon;
                return (
                  <a
                    key={index}
                    href={guide.link}
                    className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm mb-1">{guide.title}</p>
                      <p className="text-xs text-muted-foreground">{guide.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* AI Support CTA */}
            <Card className="bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-purple-500/10 border-blue-500/30 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-xl mb-1">Need instant help?</h3>
                      <p className="text-sm text-muted-foreground">Chat with our AI assistant - available 24/7 to answer any question</p>
                    </div>
                  </div>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link to="/support">
                      Chat Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Content Tabs */}
          <Tabs defaultValue="tutorials" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 p-1">
              <TabsTrigger value="tutorials" className="gap-2 text-base">
                <FileText className="w-5 h-5" />
                Tutorials
              </TabsTrigger>
              <TabsTrigger value="faqs" className="gap-2 text-base">
                <HelpCircle className="w-5 h-5" />
                FAQs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tutorials" className="space-y-12">
              {filteredTutorials.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} id={category.id} className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-8 pb-3 border-b-2 border-blue-500/20">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold">{category.title}</h2>
                      <Badge variant="secondary" className="ml-auto text-sm px-3 py-1">
                        {category.articles.length} {category.articles.length === 1 ? 'article' : 'articles'}
                      </Badge>
                    </div>

                    <div className="grid gap-6">
                      {category.articles.map((article, index) => (
                        <Card key={index} className="border-2 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">
                                    {article.title}
                                  </CardTitle>
                                  {index === 0 && (
                                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-base">{article.description}</CardDescription>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {article.tags.map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline" className="text-xs px-3 py-1">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-ul:my-2 prose-li:my-1">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {article.content}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredTutorials.length === 0 && (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No results found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      We couldn't find any tutorials matching "{searchQuery}". Try different keywords or browse all tutorials.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-6" 
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="faqs">
              <Card className="border-2">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Quick answers to common questions about DropStore features and functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="border-b-2">
                        <AccordionTrigger className="text-left text-base font-semibold hover:text-blue-600 transition-colors py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Additional Resources Section */}
          <div className="mt-16 pt-12 border-t-2">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Need More Help?</h2>
              <p className="text-muted-foreground text-lg">
                Explore additional resources and get personalized support
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Community */}
              <Card className="border-2 hover:border-blue-500 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Join Community</CardTitle>
                  <CardDescription className="text-base">
                    Connect with other store owners, share tips, and get advice from experienced sellers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/community">
                      Visit Community
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Video Tutorials */}
              <Card className="border-2 hover:border-blue-500 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Video Tutorials</CardTitle>
                  <CardDescription className="text-base">
                    Watch step-by-step video guides covering everything from setup to advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://youtube.com/@dropstore" target="_blank" rel="noopener noreferrer">
                      Watch Videos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="border-2 hover:border-blue-500 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Contact Support</CardTitle>
                  <CardDescription className="text-base">
                    Get personalized help from our support team via live chat or email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" asChild>
                    <Link to="/support">
                      Get Support
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
