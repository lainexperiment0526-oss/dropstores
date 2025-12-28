# Pi Auth Quick Reference

## Get Pi User Information

```typescript
import { usePiAuth } from '@/contexts/PiAuthContext';

const { piUser, walletAddress, isPiAuthenticated, signInWithPi } = usePiAuth();

// Sign in
await signInWithPi();

// Access user info
console.log(piUser?.username);     // @username
console.log(piUser?.uid);          // user_id
console.log(walletAddress);        // GXXXXXXX...
```

## Create Pi Payment with User Info

```typescript
import { usePiPayment } from '@/hooks/usePiPayment';
import { usePiAuth } from '@/contexts/PiAuthContext';

const { createSubscriptionPayment } = usePiPayment();
const { piUser, walletAddress, signInWithPi, isPiAuthenticated } = usePiAuth();

// Ensure authenticated
if (!isPiAuthenticated) {
  await signInWithPi();
}

// Create payment with user info
await createSubscriptionPayment('pro', storeId, {
  piUsername: piUser?.username,
  walletAddress: walletAddress
});
```

## Fetch Wallet Address

```typescript
const { walletAddress, fetchWalletAddress, isLoading } = usePiAuth();

// Manual fetch
await fetchWalletAddress();

// Or with custom token
await fetchWalletAddress(customAccessToken);
```

## Check Pi Availability

```typescript
import { isPiAvailable } from '@/lib/pi-sdk';

if (!isPiAvailable()) {
  toast.error('Please open in Pi Browser');
  return;
}
```

## Component Example

```typescript
import { usePiAuth } from '@/contexts/PiAuthContext';
import { Button } from '@/components/ui/button';

export function PiLoginComponent() {
  const { 
    piUser, 
    walletAddress,
    isPiAuthenticated, 
    signInWithPi,
    isLoading,
    fetchWalletAddress
  } = usePiAuth();

  return (
    <div className="space-y-4">
      {!isPiAuthenticated ? (
        <Button onClick={() => signInWithPi()} disabled={isLoading}>
          {isLoading ? 'Authenticating...' : 'Sign In with Pi'}
        </Button>
      ) : (
        <div>
          <p><strong>Username:</strong> {piUser?.username}</p>
          <p><strong>ID:</strong> {piUser?.uid}</p>
          <p><strong>Wallet:</strong> {walletAddress || 'Loading...'}</p>
          
          {!walletAddress && (
            <Button 
              onClick={fetchWalletAddress}
              variant="outline"
              disabled={isLoading}
            >
              Fetch Wallet Address
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

## Console Debugging

Look for these indicators in console:

✅ Successful operations:
```
✓ Pi SDK initialized successfully
✓ Pi authentication successful
✓ Wallet address retrieved
```

❌ Errors:
```
✗ Pi SDK not available
✗ Pi authentication failed
✗ Failed to fetch wallet address
```

## Environment Variables

```bash
VITE_PI_NETWORK=mainnet
VITE_PI_API_KEY=your_api_key
VITE_API_URL=your_api_url
```

## Required HTML Script

Ensure in `index.html`:
```html
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
```

---

**All Pi Auth Features Ready! ✅**
