
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top';

const AboutPiSupplier: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        <div className="container mx-auto px-4 max-w-3xl bg-card/80 rounded-xl shadow-lg backdrop-blur-md">
          <div className="prose prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-primary mx-auto py-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <span>Coming Soon</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
                🌐 Pi Supplier Partner Program
              </h1>
              <p className="text-xl text-muted-foreground">Revolutionizing Dropshipping with Pi Network</p>
            </div>
            <h2>🔥 The Vision</h2>
            <p>
              Most dropshipping platforms force sellers to work with overseas suppliers, deal with fiat payments, and navigate complex compliance issues. 
              We're taking a different approach with the <b>Pi Supplier Partner Program</b>.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 my-6">
              <p className="font-semibold mb-2">Here's the concept:</p>
              <ul className="list-none space-y-2">
                <li>✅ Verified Pi businesses become suppliers in our network</li>
                <li>✅ Store owners list and sell these supplier products</li>
                <li>✅ Customers pay with Pi — simple and straightforward</li>
                <li>✅ Suppliers handle fulfillment and shipping directly</li>
              </ul>
            </blockquote>
            <p className="text-lg font-medium">The entire transaction happens within Pi Network — no currency conversion, no middlemen, no complications.</p>
            <hr />
            <h2>🧩 How It Works</h2>
            <p className="text-muted-foreground mb-4">
              The flow is straightforward:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 my-6 border-2 border-primary/20">
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
                  <span><b>Customer</b> places order and pays in Pi</span>
                </div>
                <div className="pl-5 text-muted-foreground">↓</div>
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
                  <span><b>DropStore Platform</b> routes order to supplier</span>
                </div>
                <div className="pl-5 text-muted-foreground">↓</div>
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
                  <span><b>Pi Supplier</b> receives order & ships product</span>
                </div>
                <div className="pl-5 text-muted-foreground">↓</div>
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">4</span>
                  <span><b>Customer</b> receives product</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <span className="text-2xl">✔️</span>
                <h4 className="font-semibold mt-2">No Fiat Currency</h4>
                <p className="text-sm text-muted-foreground">Pure Pi transactions only</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <span className="text-2xl">✔️</span>
                <h4 className="font-semibold mt-2">No Crypto Bridges</h4>
                <p className="text-sm text-muted-foreground">Native Pi Network integration</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <span className="text-2xl">✔️</span>
                <h4 className="font-semibold mt-2">No Compliance Risk</h4>
                <p className="text-sm text-muted-foreground">Fully Pi-compliant marketplace</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <span className="text-2xl">✔️</span>
                <h4 className="font-semibold mt-2">Full Pi Utility</h4>
                <p className="text-sm text-muted-foreground">Real-world commerce use case</p>
              </div>
            </div>
            <hr />
            <h2>🏗️ The Players</h2>
            <p className="text-muted-foreground mb-6">
              Three types of participants make this work:
            </p>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-lg p-6">
                <h3 className="flex items-center gap-2">1️⃣ Suppliers</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Pi businesses with products to sell and the ability to fulfill orders.
                </p>
                <ul className="space-y-2">
                  <li><b>Owns and manages inventory</b> — Maintains stock levels</li>
                  <li><b>Handles shipping & logistics</b> — Manages order fulfillment</li>
                  <li><b>Sets wholesale prices in Pi</b> — Determines profit margins</li>
                  <li><b>Provides tracking information</b> — Ensures transparency</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-lg p-6">
                <h3 className="flex items-center gap-2">2️⃣ Store Owners</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Merchants who sell products without managing inventory.
                </p>
                <ul className="space-y-2">
                  <li><b>Lists supplier products</b> — Curates product catalog</li>
                  <li><b>Sets retail prices in Pi</b> — Controls profit margins</li>
                  <li><b>Handles marketing & sales</b> — Drives customer acquisition</li>
                  <li><b>Manages customer relationships</b> — Provides support</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-lg p-6">
                <h3 className="flex items-center gap-2">3️⃣ DropStore Platform</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  We connect suppliers with store owners and handle the infrastructure.
                </p>
                <ul className="space-y-2">
                  <li><b>Order routing & management</b> — Automated order distribution</li>
                  <li><b>Pi payment processing</b> — Secure transaction handling</li>
                  <li><b>Dispute resolution</b> — Fair conflict management</li>
                  <li><b>Platform fees collection</b> — Sustainable ecosystem maintenance</li>
                </ul>
              </div>
            </div>
            <hr />
            <h2>💳 Payment Flow</h2>
            <p className="text-muted-foreground mb-6">
              Payments are split automatically at checkout — everyone gets paid instantly:
            </p>
            
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">RECOMMENDED</span>
                <h3 className="text-xl font-bold m-0">Option A – Instant Split</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                When a customer pays, funds are split immediately between supplier, seller, and platform.
              </p>
              <div className="bg-card rounded-lg p-4 mb-4 border border-border">
                <div className="space-y-2 font-mono text-sm">
                  <div>💰 <b>Customer pays:</b> 100 Pi (example)</div>
                  <div className="pl-6">→ <b>Supplier receives:</b> 70 Pi (wholesale price)</div>
                  <div className="pl-6">→ <b>Seller receives:</b> 27 Pi (profit margin)</div>
                  <div className="pl-6">→ <b>DropStore receives:</b> 3 Pi (platform fee)</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl mb-1">✨</div>
                  <div className="text-xs font-semibold">Clean</div>
                  <div className="text-xs text-muted-foreground">Simple process</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔍</div>
                  <div className="text-xs font-semibold">Transparent</div>
                  <div className="text-xs text-muted-foreground">Clear breakdown</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs font-semibold">Automated</div>
                  <div className="text-xs text-muted-foreground">Instant split</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-xs font-semibold">Safe</div>
                  <div className="text-xs text-muted-foreground">No escrow risk</div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>Option B – Escrow Hold</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">Advanced</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                For high-value transactions or when additional buyer protection is needed.
              </p>
              <ul className="space-y-2 text-sm">
                <li>🏦 <b>DropStore holds Pi</b> in escrow until delivery confirmed</li>
                <li>📦 <b>Funds released</b> after shipment tracking shows delivery</li>
                <li>⏱️ <b>Time-based release</b> if no disputes filed within window</li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm">
                ⚠️ <b>Note:</b> Use only when necessary. Split payment (Option A) is preferred for most transactions.
              </div>
            </div>
            <hr />
            <h2>🧠 What We're Building</h2>
            <p className="text-muted-foreground mb-6">
              The platform will include:
            </p>
            
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <h3 className="flex items-center gap-2 text-xl mb-3">
                  <span className="text-2xl">📊</span>
                  <span>Supplier Dashboard</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Everything suppliers need to manage their products and orders.
                </p>
                <ul className="space-y-2">
                  <li>📦 <b>Inventory Management</b> — Real-time stock tracking and alerts</li>
                  <li>💰 <b>Wholesale Pi Pricing</b> — Set and adjust prices in Pi</li>
                  <li>🌍 <b>Shipping Zones</b> — Configure regional delivery options</li>
                  <li>📍 <b>Order Tracking</b> — Monitor all orders and shipments</li>
                  <li>👛 <b>Wallet Setup</b> — Pi payment integration</li>
                </ul>
              </div>
              
              <div className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <h3 className="flex items-center gap-2 text-xl mb-3">
                  <span className="text-2xl">🏪</span>
                  <span>Store Owner Tools</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Simple tools to find products and add them to your store.
                </p>
                <ul className="space-y-2">
                  <li>📚 <b>Product Catalog</b> — Browse verified supplier products</li>
                  <li>⚡ <b>1-Click Import</b> — Add products instantly to your store</li>
                  <li>💵 <b>Retail Price Control</b> — Set your profit margins</li>
                  <li>📈 <b>Profit Preview</b> — See earnings before listing</li>
                  <li>🎯 <b>Performance Analytics</b> — Track sales and revenue</li>
                </ul>
              </div>
              
              <div className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <h3 className="flex items-center gap-2 text-xl mb-3">
                  <span className="text-2xl">🔄</span>
                  <span>Automatic Order Routing</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Orders automatically go to the right supplier. No manual work needed.
                </p>
                <ul className="space-y-2">
                  <li>🤖 <b>Auto-Assign Orders</b> — Automatic routing to suppliers</li>
                  <li>🔀 <b>Multi-Supplier Support</b> — Multiple sources per product (coming)</li>
                  <li>📢 <b>Real-Time Updates</b> — Instant status notifications</li>
                  <li>🔔 <b>Smart Alerts</b> — Notify all parties automatically</li>
                </ul>
              </div>
              
              <div className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <h3 className="flex items-center gap-2 text-xl mb-3">
                  <span className="text-2xl">🚚</span>
                  <span>Shipping Integration</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Support for local couriers and international shipping providers.
                </p>
                <ul className="space-y-2">
                  <li>🇵🇭 <b>Local Couriers</b> — LBC, J&T, NinjaVan integration</li>
                  <li>🌏 <b>International Shipping</b> — Global delivery partners</li>
                  <li>✍️ <b>Manual Tracking</b> — Add tracking numbers manually</li>
                  <li>🔌 <b>API Integration</b> — Automated tracking updates</li>
                </ul>
              </div>
            </div>
            <hr />
            <h2>🧾 DATABASE MODEL (SIMPLE)</h2>
            <h3>Tables:</h3>
            <ul>
              <li>suppliers</li>
              <li>supplier_products</li>
              <li>supplier_inventory</li>
              <li>seller_products</li>
              <li>orders</li>
              <li>order_items</li>
              <li>shipments</li>
              <li>disputes</li>
            </ul>
            <hr />
            <h2>⚖️ Why This Works with Pi Network</h2>
            <p className="text-muted-foreground mb-6">
              This model aligns with Pi Network's guidelines:
            </p>
            <div className="bg-gradient-to-r from-green-500/10 to-transparent border-2 border-green-500/30 rounded-lg p-6 mb-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Native Pi Settlement</h4>
                    <p className="text-xs text-muted-foreground">Pi cryptocurrency used for all transactions</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-bold text-sm mb-1">No Currency Conversion</h4>
                    <p className="text-xs text-muted-foreground">Pure Pi ecosystem, no fiat exchanges</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-bold text-sm mb-1">On-Platform Only</h4>
                    <p className="text-xs text-muted-foreground">All transactions within DropStore</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Marketplace Model</h4>
                    <p className="text-xs text-muted-foreground">Verified suppliers & transparent operations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
              <p className="font-semibold text-primary">Real commerce using Pi. No conversions. No complications. This is what Pi Network was built for.</p>
            </div>
            <hr />
            <h2>🌍 The Advantage</h2>
            <p className="text-muted-foreground mb-6">
              Compare this to traditional dropshipping platforms:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-3 text-left font-semibold">External Dropshipping</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold bg-primary/10">Pi Supplier Program ✨</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <div>
                          <div className="font-medium">Fiat Payments</div>
                          <div className="text-xs text-muted-foreground">Complex currency conversion</div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-border px-4 py-3 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <div>
                          <div className="font-medium">Pure Pi Payments</div>
                          <div className="text-xs text-muted-foreground">Native cryptocurrency only</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <div>
                          <div className="font-medium">Slow Shipping</div>
                          <div className="text-xs text-muted-foreground">30-60 days from overseas</div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-border px-4 py-3 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <div>
                          <div className="font-medium">Fast Delivery</div>
                          <div className="text-xs text-muted-foreground">Local & regional suppliers</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <div>
                          <div className="font-medium">Compliance Risks</div>
                          <div className="text-xs text-muted-foreground">Payment processor issues</div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-border px-4 py-3 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <div>
                          <div className="font-medium">Fully Compliant</div>
                          <div className="text-xs text-muted-foreground">Pi Network approved model</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <div>
                          <div className="font-medium">Low Trust</div>
                          <div className="text-xs text-muted-foreground">Unknown suppliers</div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-border px-4 py-3 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <div>
                          <div className="font-medium">Verified Partners</div>
                          <div className="text-xs text-muted-foreground">Vetted Pi businesses</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <div>
                          <div className="font-medium">No Ecosystem</div>
                          <div className="text-xs text-muted-foreground">External dependencies</div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-border px-4 py-3 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <div>
                          <div className="font-medium">Pi Economy Growth</div>
                          <div className="text-xs text-muted-foreground">Builds Pi utility</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr />
            <h2>🚀 The Roadmap</h2>
            <p className="text-muted-foreground mb-6">
              We're rolling this out in three phases:
            </p>
            
            <div className="space-y-6">
              <div className="border-2 border-primary rounded-lg p-6 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <h3 className="text-xl font-bold mb-0">Phase 1: MVP Launch</h3>
                    <p className="text-sm text-muted-foreground">Timeline: 30 days</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✅</span>
                    <div>
                      <div className="font-semibold text-sm">Supplier Onboarding</div>
                      <div className="text-xs text-muted-foreground">Application form & verification</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✅</span>
                    <div>
                      <div className="font-semibold text-sm">Manual Approval</div>
                      <div className="text-xs text-muted-foreground">Quality control & vetting</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✅</span>
                    <div>
                      <div className="font-semibold text-sm">Basic Logistics</div>
                      <div className="text-xs text-muted-foreground">Manual tracking input</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✅</span>
                    <div>
                      <div className="font-semibold text-sm">Pi Payments</div>
                      <div className="text-xs text-muted-foreground">Core payment integration</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-primary/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/70 text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <h3 className="text-xl font-bold mb-0">Phase 2: Growth & Optimization</h3>
                    <p className="text-sm text-muted-foreground">Timeline: 60 days</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">⭐</span>
                    <div>
                      <div className="font-semibold text-sm">Supplier Ratings</div>
                      <div className="text-xs text-muted-foreground">Reviews & reputation system</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">⭐</span>
                    <div>
                      <div className="font-semibold text-sm">Auto Order Routing</div>
                      <div className="text-xs text-muted-foreground">Smart assignment algorithm</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">⭐</span>
                    <div>
                      <div className="font-semibold text-sm">Tracking Sync</div>
                      <div className="text-xs text-muted-foreground">API integration with couriers</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">⭐</span>
                    <div>
                      <div className="font-semibold text-sm">Analytics Dashboard</div>
                      <div className="text-xs text-muted-foreground">Performance metrics</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-primary/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/50 text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <h3 className="text-xl font-bold mb-0">Phase 3: Scale & Expand</h3>
                    <p className="text-sm text-muted-foreground">Timeline: 90+ days</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">🚀</span>
                    <div>
                      <div className="font-semibold text-sm">Cross-Border Suppliers</div>
                      <div className="text-xs text-muted-foreground">International expansion</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">🚀</span>
                    <div>
                      <div className="font-semibold text-sm">Regional Warehouses</div>
                      <div className="text-xs text-muted-foreground">Distributed inventory</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">🚀</span>
                    <div>
                      <div className="font-semibold text-sm">White-Label Fulfillment</div>
                      <div className="text-xs text-muted-foreground">Branded packaging service</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">🚀</span>
                    <div>
                      <div className="font-semibold text-sm">AI-Powered Matching</div>
                      <div className="text-xs text-muted-foreground">Smart supplier selection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <h2>💡 Revenue Model</h2>
            <p className="text-muted-foreground mb-6">
              Multiple revenue streams ensure sustainable growth:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                <div className="text-3xl mb-3">💵</div>
                <h4 className="font-bold mb-2">Transaction Fees</h4>
                <p className="text-sm text-muted-foreground">2–5% platform fee on each sale</p>
              </div>
              <div className="border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                <div className="text-3xl mb-3">🎫</div>
                <h4 className="font-bold mb-2">Supplier Subscriptions</h4>
                <p className="text-sm text-muted-foreground">Premium tiers paid in Pi</p>
              </div>
              <div className="border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                <div className="text-3xl mb-3">⭐</div>
                <h4 className="font-bold mb-2">Featured Placement</h4>
                <p className="text-sm text-muted-foreground">Promoted product listings</p>
              </div>
              <div className="border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                <div className="text-3xl mb-3">🚚</div>
                <h4 className="font-bold mb-2">Fulfillment Services</h4>
                <p className="text-sm text-muted-foreground">Optional logistics management</p>
              </div>
            </div>
            <hr />
            <div className="py-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">🔥 Market Position</h2>
              <p className="text-center text-muted-foreground mb-8">This positions DropStore as a category leader in Pi commerce</p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🏬</div>
                  <h3 className="text-xl font-bold mb-2">B2B Marketplace</h3>
                  <p className="text-sm text-muted-foreground">Like Alibaba, but for Pi</p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🛍️</div>
                  <h3 className="text-xl font-bold mb-2">Full-Stack Platform</h3>
                  <p className="text-sm text-muted-foreground">E-commerce + wholesale in one</p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-xl font-bold mb-2">Pi Infrastructure</h3>
                  <p className="text-sm text-muted-foreground">Real commerce utility</p>
                </div>
              </div>
            </div>
            <hr />
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/30 rounded-xl p-8">
              <h3 className="text-2xl font-display font-bold mb-4 text-center">Implementation Strategy</h3>
              <p className="text-center text-muted-foreground mb-6">Recommended approach for maximum impact</p>
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-card rounded-lg p-5 border-2 border-primary/40">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1">1</span>
                    <div>
                      <div className="font-bold text-lg mb-1">Priority: Pi Supplier Program</div>
                      <div className="text-sm text-muted-foreground">Build the native Pi ecosystem first. This creates real value and aligns with Pi Network's mission.</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-5 border border-border">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary/70 text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1">2</span>
                    <div>
                      <div className="font-bold text-lg mb-1">Optional: External Dropshipping</div>
                      <div className="text-sm text-muted-foreground">Add traditional dropshipping later as a supplementary option for merchants who need it.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="bg-muted/50 border-2 border-border rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-center">Get Started</h3>
              <p className="text-center text-muted-foreground mb-8">Interested in becoming a supplier or want to learn more?</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🧱</span>
                    <div>
                      <div className="font-bold text-sm">Onboarding Process</div>
                      <div className="text-xs text-muted-foreground">Application & verification</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📐</span>
                    <div>
                      <div className="font-bold text-sm">Technical Documentation</div>
                      <div className="text-xs text-muted-foreground">API & integration guides</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📜</span>
                    <div>
                      <div className="font-bold text-sm">Partnership Terms</div>
                      <div className="text-xs text-muted-foreground">Supplier agreements</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🧠</span>
                    <div>
                      <div className="font-bold text-sm">Payment System</div>
                      <div className="text-xs text-muted-foreground">Pi split-payment setup</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📣</span>
                    <div>
                      <div className="font-bold text-sm">Marketing Support</div>
                      <div className="text-xs text-muted-foreground">Supplier promotion tools</div>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📊</span>
                    <div>
                      <div className="font-bold text-sm">Analytics Dashboard</div>
                      <div className="text-xs text-muted-foreground">Performance tracking</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">Want to be part of the Pi Supplier Network?</p>
                <a href="/support" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    <ScrollToTopButton />
  </div>
);

export default AboutPiSupplier;
