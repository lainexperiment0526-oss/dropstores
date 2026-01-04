import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, Sparkles, HelpCircle, Book, MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DROPSTORE_CONTEXT = `
# DropStore Platform Information

## Overview
DropStore is a modern e-commerce platform built specifically for Pi Network integration, allowing merchants to create online stores and accept Pi (π) cryptocurrency payments.

## Key Features

### 1. Store Creation & Management
- Quick store setup with customizable templates
- Product listing with variants, pricing, inventory
- Digital and physical product support
- Collections and categories organization
- SEO optimization for products

### 2. Payment Options
- **Pi Payment**: Instant payment via Pi Network SDK
- **Manual Wallet Transfer**: QR code-based wallet payments
- Mainnet Pi Network integration
- Secure on-chain transaction verification

### 3. Pricing & Fees
- **Platform Fee**: 1π per product listing (automatic)
- **Delivery Fee**: Configurable by merchant for physical products
- **Free Delivery Threshold**: Optional minimum order for free shipping
- **Digital Products**: Always free delivery

### 4. Subscription Plans
- **Free Plan**: Basic features, limited products
- **Basic Plan**: 20π/month - More products and features
- **Grow Plan**: 49π/month - Advanced features
- **Advance Plan**: 60π/month - Premium features
- **Plus Plan**: 100π/month - All features unlimited

### 5. Marketing & Promotions
- **Coupon Codes**: Percentage or fixed discounts
- **Flash Sales**: Limited-time offers with countdown
- **Holiday Promotions**: Seasonal campaigns with custom banners
- **Volume Discounts**: Bulk pricing tiers
- **BOGO Deals**: Buy one get one promotions

### 6. Product Features
- Product variants (size, color, material)
- Sale pricing with date ranges
- Inventory tracking with SKU/barcode
- Shipping configuration
- Product reviews and ratings
- Wishlist functionality
- Pre-order support

### 7. Order Management
- Real-time order tracking
- Automatic order status updates
- Customer notifications
- Merchant payout system
- Order analytics and reporting

### 8. Store Customization
- Custom store URL (subdomain)
- Brand colors and logo
- Banner images
- Store description and policies
- Contact information

### 9. Pi Network Integration
- **Authentication**: Secure Pi Network login
- **Payments**: SDK-based payment processing
- **Verification**: Horizon API blockchain verification
- **Ad Network**: Pi Ad integration support
- **Mainnet Ready**: Full mainnet support

### 10. Technical Features
- Responsive design (mobile, tablet, desktop)
- Fast loading with modern tech stack
- Secure data handling
- Cloud storage for images
- Database backup and recovery

## Getting Started

### For Merchants:
1. Sign up with Pi Network account
2. Choose a subscription plan
3. Create your store
4. Add products
5. Configure payment methods
6. Set delivery fees (if physical products)
7. Launch and share your store

### For Customers:
1. Browse stores
2. Add products to cart
3. Choose payment method (Pi or Manual Wallet)
4. Complete checkout
5. Receive order confirmation
6. Track order status

## Payment Process

### Pi Payment:
1. Customer selects Pi Payment
2. Authenticate with Pi Network
3. Approve payment in Pi Browser
4. Transaction verified on blockchain
5. Order confirmed

### Manual Wallet Payment:
1. Customer selects Manual Wallet
2. Scan QR code or copy wallet address
3. Send exact amount in Pi
4. Merchant confirms receipt
5. Order processed

## Support Topics

### Common Questions:
- How to create a store?
- How to add products?
- What payment methods are supported?
- How do fees work?
- How to set up delivery?
- How to create promotions?
- How to track orders?
- How to get paid as a merchant?

### Technical Issues:
- Pi Network authentication
- Payment processing
- Store customization
- Product management
- Order tracking

### Account & Billing:
- Subscription management
- Plan upgrades/downgrades
- Payment history
- Refund policies

## Platform Limits (by Plan)

### Free:
- 1 product
- Basic features only

### Basic (20π/month):
- 50 products
- Collections
- Basic analytics

### Grow (49π/month):
- 200 products
- Flash sales
- Advanced analytics

### Advance (60π/month):
- 500 products
- All promotional features
- Priority support

### Plus (100π/month):
- Unlimited products
- All features
- Dedicated support

## Contact & Resources
- Platform: DropStore
- Currency: Pi (π)
- Network: Pi Network Mainnet
- Support: AI-powered chat support
- Documentation: Available in platform

## Safety & Security
- Secure Pi Network authentication
- Encrypted data storage
- On-chain transaction verification
- PCI-compliant payment handling
- Regular security audits
`;

export default function Support() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your DropStore AI assistant. I can help you with:\n\n• Store setup and management\n• Payment processing (Pi & Manual Wallet)\n• Product listings and promotions\n• Subscription plans and pricing\n• Technical questions\n• And much more!\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'DropStore Support'
        },
        body: JSON.stringify({
          model: 'xiaomi/mimo-v2-flash:free',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant for DropStore, an e-commerce platform with Pi Network integration. Use the following information to answer questions accurately and helpfully:\n\n${DROPSTORE_CONTEXT}\n\nBe concise, friendly, and helpful. If you're not sure about something, be honest. Always provide accurate information based on the context above.`
            },
            ...messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: input
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How do I create a store?",
    "What payment methods are supported?",
    "How do fees work?",
    "How to set up delivery?",
    "What are the subscription plans?"
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">AI Support Assistant</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Get instant help with DropStore features, payments, and more
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">Platform Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn about features, plans, and capabilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <CardTitle className="text-lg">24/7 AI Chat</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Instant answers powered by advanced AI
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-500" />
                  <CardTitle className="text-lg">Expert Help</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive knowledge of all DropStore features
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white">
                    <img 
                      src="https://i.ibb.co/rRN0sS7y/favicon.png" 
                      alt="AI Support" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle>DropStore Support</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Online - AI Powered
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Assistant
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="h-[500px] overflow-y-auto p-6 space-y-4"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
                        <img 
                          src="https://i.ibb.co/rRN0sS7y/favicon.png" 
                          alt="AI Support" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-secondary rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="px-6 pb-4 border-t pt-4">
                  <p className="text-sm font-medium mb-3 text-muted-foreground">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(question);
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about DropStore..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by AI • Trained on DropStore documentation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
