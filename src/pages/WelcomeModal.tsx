import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';

export default function WelcomeModal({ open, onOpenChange, userName }: { open: boolean, onOpenChange: (open: boolean) => void, userName?: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Drop Store!</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="space-y-4 text-left">
            <p>
              {userName ? `Hi ${userName}, ` : ''}We're excited to have you on board. Start by creating your first store or exploring the dashboard features.
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Manage your products and orders</li>
              <li>Customize your store appearance</li>
              <li>Track analytics and payouts</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">Need help? Visit our docs or contact support.</p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
