import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Checkout,
  CheckoutPayload,
  CheckoutCustomer,
  Address,
  ShippingDetails,
  OrderItem,
} from '@/types/checkout';
import { validateCheckout, sanitizeCheckout, ValidationError } from '@/lib/checkout-validator';
import { AlertCircle, CheckCircle2, Loader2, MapPin, CreditCard, Package } from 'lucide-react';

interface CheckoutFormProps {
  storeId: string;
  initialItems: OrderItem[];
  initialCustomer?: Partial<CheckoutCustomer>;
  onSubmit: (checkout: CheckoutPayload) => Promise<void>;
  onError?: (error: Error) => void;
  isLoading?: boolean;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IN', name: 'India' },
  { code: 'ZA', name: 'South Africa' },
  // Add more as needed
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VG', 'WA', 'WV', 'WI', 'WY',
];

export function CheckoutForm({
  storeId,
  initialItems,
  initialCustomer,
  onSubmit,
  onError,
  isLoading = false,
}: CheckoutFormProps) {
  const [currentTab, setCurrentTab] = useState('customer');
  const [loading, setLoading] = useState(isLoading);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Customer form state
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    customer_id: null,
    email: initialCustomer?.email || '',
    phone: initialCustomer?.phone || '',
  });

  // Billing address state
  const [useBillingAddress, setUseBillingAddress] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  // Shipping address state
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const shippingCosts = { standard: 5.99, express: 12.99 };

  // Order notes
  const [notes, setNotes] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  // Calculate totals
  const subtotal = initialItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = shippingCosts[shippingMethod];
  const taxRate = 0.08; // 8% tax
  const taxAmount = (subtotal + shippingCost) * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  // Handle customer address change
  const handleAddressChange = (
    setter: React.Dispatch<React.SetStateAction<Address>>,
    field: keyof Address,
    value: string,
  ) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  // Sync shipping with billing if needed
  const handleBillingAddressChange = (field: keyof Address, value: string) => {
    handleAddressChange(setBillingAddress, field, value);
    if (sameAsShipping) {
      handleAddressChange(setShippingAddress, field, value);
    }
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Build checkout object
      const checkout: CheckoutPayload = {
        store_id: storeId,
        customer,
        billing: useBillingAddress ? { address: billingAddress } : undefined,
        shipping: {
          address: shippingAddress,
          shipping_method: shippingMethod,
          shipping_cost: shippingCost,
        },
        items: initialItems,
        subtotal,
        tax: {
          rate: taxRate,
          amount: taxAmount,
        },
        payment: {
          method: 'pi_wallet',
          currency: 'PI',
          amount_total: total,
          status: 'pending',
        },
        metadata: {
          checkout_id: `chk_${Date.now()}`,
          source: 'web',
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
          created_at: new Date().toISOString(),
        },
        notes: notes || undefined,
        gift_message: giftMessage || undefined,
      };

      // Validate
      const validation = validateCheckout(checkout);
      if (!validation.valid) {
        setErrors(validation.errors);
        if (onError) {
          onError(new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`));
        }
        setLoading(false);
        return;
      }

      // Sanitize
      const sanitized = sanitizeCheckout(checkout);

      // Submit
      await onSubmit(sanitized);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      if (onError) {
        onError(err);
      }
      setLoading(false);
    }
  };

  const errorsByField = (field: string) => errors.filter(e => e.field.startsWith(field));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Standard Checkout
        </CardTitle>
        <CardDescription>
          Industry-standard checkout format for Pi Network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display Validation Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Please fix the following errors:</div>
              <ul className="list-disc pl-5 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm">
                    {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <span className="hidden sm:inline">Customer</span>
                {!errorsByField('customer').length && customer.email && <CheckCircle2 className="w-4 h-4" />}
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Shipping</span>
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Review</span>
              </TabsTrigger>
            </TabsList>

            {/* Customer Tab */}
            <TabsContent value="customer" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className={errorsByField('customer.email').length ? 'border-red-500' : ''}
                  />
                  {errorsByField('customer.email').length > 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      {errorsByField('customer.email')[0].message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={customer.phone || ''}
                    onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className={errorsByField('customer.phone').length ? 'border-red-500' : ''}
                  />
                  {errorsByField('customer.phone').length > 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      {errorsByField('customer.phone')[0].message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-4 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="useBilling"
                  checked={useBillingAddress}
                  onChange={(e) => setUseBillingAddress(e.target.checked)}
                />
                <Label htmlFor="useBilling" className="cursor-pointer">
                  Use billing address
                </Label>
              </div>

              {useBillingAddress && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="billing-name">Full Name *</Label>
                    <Input
                      id="billing-name"
                      value={billingAddress.full_name}
                      onChange={(e) => handleBillingAddressChange('full_name', e.target.value)}
                      placeholder="John Doe"
                      className={errorsByField('billing').length ? 'border-red-500' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="billing-address1">Street Address *</Label>
                    <Input
                      id="billing-address1"
                      value={billingAddress.address_line_1}
                      onChange={(e) => handleBillingAddressChange('address_line_1', e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div>
                    <Label htmlFor="billing-address2">Apartment, Suite (Optional)</Label>
                    <Input
                      id="billing-address2"
                      value={billingAddress.address_line_2}
                      onChange={(e) => handleBillingAddressChange('address_line_2', e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing-city">City *</Label>
                      <Input
                        id="billing-city"
                        value={billingAddress.city}
                        onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-state">State *</Label>
                      <Select value={billingAddress.state} onValueChange={(value) => handleBillingAddressChange('state', value)}>
                        <SelectTrigger id="billing-state">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing-zip">Postal Code *</Label>
                      <Input
                        id="billing-zip"
                        value={billingAddress.postal_code}
                        onChange={(e) => handleBillingAddressChange('postal_code', e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-country">Country *</Label>
                      <Select value={billingAddress.country} onValueChange={(value) => handleBillingAddressChange('country', value)}>
                        <SelectTrigger id="billing-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="space-y-4 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="sameAsShipping"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                />
                <Label htmlFor="sameAsShipping" className="cursor-pointer">
                  Same as billing address
                </Label>
              </div>

              {!sameAsShipping && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shipping-name">Full Name *</Label>
                    <Input
                      id="shipping-name"
                      value={shippingAddress.full_name}
                      onChange={(e) => handleAddressChange(setShippingAddress, 'full_name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shipping-address1">Street Address *</Label>
                    <Input
                      id="shipping-address1"
                      value={shippingAddress.address_line_1}
                      onChange={(e) => handleAddressChange(setShippingAddress, 'address_line_1', e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shipping-address2">Apartment, Suite (Optional)</Label>
                    <Input
                      id="shipping-address2"
                      value={shippingAddress.address_line_2}
                      onChange={(e) => handleAddressChange(setShippingAddress, 'address_line_2', e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping-city">City *</Label>
                      <Input
                        id="shipping-city"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange(setShippingAddress, 'city', e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-state">State *</Label>
                      <Select value={shippingAddress.state} onValueChange={(value) => handleAddressChange(setShippingAddress, 'state', value)}>
                        <SelectTrigger id="shipping-state">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping-zip">Postal Code *</Label>
                      <Input
                        id="shipping-zip"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleAddressChange(setShippingAddress, 'postal_code', e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-country">Country *</Label>
                      <Select value={shippingAddress.country} onValueChange={(value) => handleAddressChange(setShippingAddress, 'country', value)}>
                        <SelectTrigger id="shipping-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Method */}
              <div className="mt-6 pt-6 border-t">
                <Label className="text-base font-semibold mb-4 block">Shipping Method</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => setShippingMethod('standard')}>
                    <input
                      type="radio"
                      id="standard"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod('standard')}
                    />
                    <div className="flex-1">
                      <Label htmlFor="standard" className="cursor-pointer font-medium">
                        Standard Shipping
                      </Label>
                      <p className="text-sm text-gray-600">5-7 business days</p>
                    </div>
                    <Badge variant="secondary">π{shippingCosts.standard.toFixed(2)}</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => setShippingMethod('express')}>
                    <input
                      type="radio"
                      id="express"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => setShippingMethod('express')}
                    />
                    <div className="flex-1">
                      <Label htmlFor="express" className="cursor-pointer font-medium">
                        Express Shipping
                      </Label>
                      <p className="text-sm text-gray-600">2-3 business days</p>
                    </div>
                    <Badge variant="secondary">π{shippingCosts.express.toFixed(2)}</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="space-y-6 mt-6">
              {/* Items Summary */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                  {initialItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.title} x {item.quantity}</span>
                      <span className="font-medium">π{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 border rounded-lg p-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>π{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({shippingMethod})</span>
                  <span>π{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>π{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>π{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or delivery instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="gift">Gift Message (Optional)</Label>
                  <Textarea
                    id="gift"
                    placeholder="Add a personalized message..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Address Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {useBillingAddress && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Billing Address</h4>
                    <p className="text-sm space-y-1">
                      <div>{billingAddress.full_name}</div>
                      <div>{billingAddress.address_line_1}</div>
                      {billingAddress.address_line_2 && <div>{billingAddress.address_line_2}</div>}
                      <div>{billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}</div>
                      <div>{billingAddress.country}</div>
                    </p>
                  </div>
                )}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <p className="text-sm space-y-1">
                    <div>{sameAsShipping ? billingAddress.full_name : shippingAddress.full_name}</div>
                    <div>{sameAsShipping ? billingAddress.address_line_1 : shippingAddress.address_line_1}</div>
                    {(sameAsShipping ? billingAddress : shippingAddress).address_line_2 && (
                      <div>{(sameAsShipping ? billingAddress : shippingAddress).address_line_2}</div>
                    )}
                    <div>
                      {sameAsShipping ? billingAddress.city : shippingAddress.city}, {sameAsShipping ? billingAddress.state : shippingAddress.state} {sameAsShipping ? billingAddress.postal_code : shippingAddress.postal_code}
                    </div>
                    <div>{sameAsShipping ? billingAddress.country : shippingAddress.country}</div>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentTab !== 'customer' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ['customer', 'billing', 'shipping', 'review'];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex > 0) {
                    setCurrentTab(tabs[currentIndex - 1]);
                  }
                }}
              >
                Back
              </Button>
            )}
            
            {currentTab !== 'review' && (
              <Button
                type="button"
                onClick={() => {
                  const tabs = ['customer', 'billing', 'shipping', 'review'];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex < tabs.length - 1) {
                    setCurrentTab(tabs[currentIndex + 1]);
                  }
                }}
                className="ml-auto"
              >
                Next
              </Button>
            )}

            {currentTab === 'review' && (
              <Button
                type="submit"
                disabled={loading}
                className="ml-auto"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Purchase with Pi Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
