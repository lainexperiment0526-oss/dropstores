import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Basic',
    price: '10 π / month',
    features: [
      '1 Store',
      '1 Product per Store',
      'Basic Analytics',
      'Community Support',
    ],
    cta: 'Choose Basic',
  },
  {
    name: 'Premium',
    price: '20 π / month',
    features: [
      'Up to 3 Stores',
      '5 Products per Store',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding',
    ],
    cta: 'Choose Premium',
  },
  {
    name: 'Pro',
    price: '30 π / month',
    features: [
      'Up to 5 Stores',
      '10 Products per Store',
      'All Premium Features',
      'Dedicated Support',
    ],
    cta: 'Choose Pro',
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    features: [
      'Unlimited Stores',
      'Dedicated Account Manager',
      'Custom Integrations',
      'Premium Support',
    ],
    cta: 'Contact Sales',
  },
];

export default function Pricing() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col items-center p-6">
            <CardHeader className="text-center">
              <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
              <div className="text-3xl font-bold mb-4">{plan.price}</div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center">
              <ul className="mb-6 space-y-2 text-muted-foreground text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i}>• {feature}</li>
                ))}
              </ul>
              <Button className="w-full mt-auto">{plan.cta}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
