# Pi Authentication Test Guide

## Overview
Your DropStores app now has a Pi Authentication test page that retrieves:
- ✅ Pi Username
- ✅ Pi User ID (UID)  
- ✅ Pi Wallet Address
- ✅ Access Token

## How to Use

### Step 1: Access the Test Page

Navigate to the Pi Auth test page:
```
http://localhost:8081/pi-test
```

### Step 2: Authenticate with Pi Network

1. Click the "Authenticate with Pi Network" button
2. The Pi SDK authentication window will open
3. Approve the authentication request in Pi Browser
4. The following scopes are requested:
   - `username` - Your Pi username
   - `payments` - Permission to create payments
   - `wallet_address` - Your Pi wallet address

### Step 3: View Your Information

After successful authentication, you'll see:

- **Username**: Your Pi Network username (e.g., @yourname)
- **User ID (UID)**: Your unique Pi user identifier
- **Wallet Address**: Your Pi blockchain wallet address (click "Fetch Wallet Address" if not shown)
- **Access Token**: Truncated version of your Pi access token

### Step 4: Fetch Wallet Address (if needed)

If the wallet address isn't automatically retrieved:
1. Click "Fetch Wallet Address" button
2. The app will call the Pi Platform API
3. Your wallet address will be displayed

## Features

### What's Been Implemented

1. **PiAuthContext Enhancement**
   - Added `walletAddress` state
   - Added `fetchWalletAddress()` function
   - Automatically fetches wallet address after auth

2. **PiAuthTest Component**
   - Full Pi authentication test UI
   - Displays all user information
   - Manual wallet address fetch option
   - Re-authentication capability

3. **Pi SDK Integration**
   - Updated `PiUser` interface to include `wallet_address`
   - Proper scope requests: `['username', 'payments', 'wallet_address']`
   - Mainnet configuration

## Using in Your App

### Get Pi User Information

```typescript
import { usePiAuth } from '@/contexts/PiAuthContext';

function YourComponent() {
  const { 
    piUser,           // { uid, username, wallet_address? }
    walletAddress,    // Wallet address string
    isPiAuthenticated,
    signInWithPi,
    fetchWalletAddress
  } = usePiAuth();

  return (
    <div>
      {isPiAuthenticated ? (
        <div>
          <p>Username: {piUser?.username}</p>
          <p>UID: {piUser?.uid}</p>
          <p>Wallet: {walletAddress || 'Not fetched'}</p>
        </div>
      ) : (
        <button onClick={() => signInWithPi()}>
          Sign In with Pi
        </button>
      )}
    </div>
  );
}
```

### Manually Fetch Wallet Address

```typescript
const { fetchWalletAddress, isLoading } = usePiAuth();

<button 
  onClick={fetchWalletAddress}
  disabled={isLoading}
>
  Get Wallet Address
</button>
```

## Important Notes

### Requirements
- ✅ Must be opened in **Pi Browser**
- ✅ User must have Pi Network account
- ✅ Mainnet mode is configured
- ✅ API Key is set in environment variables

### Environment Variables
Make sure these are set in your `.env`:
```env
VITE_PI_API_KEY=your_api_key_here
VITE_PI_NETWORK=mainnet
VITE_PI_MAINNET_MODE=true
VITE_API_URL=https://api.minepi.com
```

### Scopes Requested
The authentication requests these scopes:
```typescript
const scopes = ['username', 'payments', 'wallet_address'];
```

## API Endpoints Used

### 1. Pi Authentication
```typescript
window.Pi.authenticate(scopes, onIncompletePaymentFound)
```

### 2. Pi Platform API - Get User Info
```
GET https://api.minepi.com/v2/me
Authorization: Bearer {accessToken}
```

Returns:
```json
{
  "uid": "user_id",
  "username": "@username",
  "wallet_address": "GXXXXXXX..."
}
```

## Troubleshooting

### "Pi SDK not available"
- Ensure app is opened in Pi Browser
- Check that Pi SDK script is loaded in `index.html`

### "Wallet address not found"
- User may not have set up their Pi wallet yet
- Try clicking "Fetch Wallet Address" button
- Check Pi Platform API response

### Authentication fails
- Check internet connection
- Verify API key is correct
- Ensure Pi Browser has latest version
- Check browser console for errors

## Testing Checklist

- [ ] Open app in Pi Browser
- [ ] Navigate to `/pi-test`
- [ ] Click "Authenticate with Pi Network"
- [ ] Approve authentication request
- [ ] Verify username is displayed
- [ ] Verify UID is displayed
- [ ] Click "Fetch Wallet Address"
- [ ] Verify wallet address is displayed
- [ ] Try re-authentication
- [ ] Check browser console for any errors

## Files Modified

1. `/src/contexts/PiAuthContext.tsx` - Added wallet address support
2. `/src/lib/pi-sdk.ts` - Updated PiUser interface
3. `/src/components/PiAuthTest.tsx` - New test component
4. `/src/App.tsx` - Added `/pi-test` route

## Next Steps

Your Pi authentication is now fully functional! You can:
1. Use the Pi username for personalization
2. Use the wallet address for direct Pi transfers
3. Use the access token for Pi Platform API calls
4. Create Pi payments with proper authentication

Happy building! 🚀
