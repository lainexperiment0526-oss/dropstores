# How to Switch to Your Own Supabase Instance

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Click **Settings** → **API**
4. Copy these values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **Anon/Public Key** → This is your `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`

Your URL looks like: `https://your-project-id.supabase.co`

## Step 2: Update Your .env File

Replace the Supabase values in `.env`:

```env
# OLD (Lovable's Supabase)
VITE_SUPABASE_URL="https://xyqoyfhxslauiwkuopve.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NEW (Your Supabase)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

## Step 3: Configure Database Schema

Your Supabase instance needs these tables:

### Required Tables:

1. **users** (handled by Supabase Auth)
2. **stores**
   ```sql
   id: uuid (primary key)
   user_id: uuid (foreign key to auth.users)
   name: text
   description: text
   logo_url: text
   primary_color: text
   created_at: timestamp
   updated_at: timestamp
   ```

3. **products**
   ```sql
   id: uuid (primary key)
   store_id: uuid (foreign key)
   name: text
   description: text
   price: numeric
   image_url: text
   created_at: timestamp
   ```

4. **orders**
   ```sql
   id: uuid (primary key)
   user_id: uuid
   store_id: uuid
   total_amount: numeric
   status: text
   created_at: timestamp
   ```

5. **pi_users**
   ```sql
   id: uuid (primary key)
   user_id: uuid (foreign key)
   pi_uid: text (unique)
   pi_username: text
   wallet_address: text
   updated_at: timestamp
   ```

6. **subscriptions**
   ```sql
   id: uuid (primary key)
   user_id: uuid
   plan_type: text
   status: text
   expires_at: timestamp
   amount: numeric
   created_at: timestamp
   ```

## Step 4: Set Up Authentication

1. Go to **Authentication** in Supabase
2. Click **Providers**
3. Configure **Email** provider (default)
4. Optionally enable **OAuth** providers

## Step 5: Set Up RLS (Row Level Security)

Your data will be public by default. To secure it:

```sql
-- Example for stores table
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all stores"
ON stores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own stores"
ON stores FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
ON stores FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores"
ON stores FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## Step 6: Configure Storage (for images)

1. In Supabase, go to **Storage**
2. Create a new bucket called `stores`
3. Make it public
4. Update your storage URL in `.env`:

```env
VITE_SUPABASE_STORAGE_URL="https://your-project-id.supabase.co/storage/v1/s3"
```

## Step 7: Set Up Edge Functions (for Pi payments)

These backend functions need to be deployed to Supabase Edge Functions:

```bash
# List of required functions:
- pi-auth
- pi-payment-approve
- pi-payment-complete
- send-email
```

You can find these in `supabase/functions/` directory.

To deploy:
```bash
supabase functions deploy pi-auth
supabase functions deploy pi-payment-approve
supabase functions deploy pi-payment-complete
```

## Step 8: Test the Connection

1. Save your `.env` file
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Open browser console (F12)
4. Try signing up
5. Check if data appears in Supabase dashboard

## Environment Variables Summary

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Your project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key | `eyJ...` |
| `VITE_SUPABASE_ANON_KEY` | Anonymous key | `eyJ...` |
| `VITE_SUPABASE_STORAGE_URL` | Storage bucket URL | `https://abc123.supabase.co/storage/v1/s3` |

## File Locations

The Supabase client is in:
- `/src/integrations/supabase/client.ts` - Main client
- `/src/integrations/supabase/types.ts` - TypeScript types

These files automatically use your `.env` variables.

## Troubleshooting

### "Failed to connect to Supabase"
- Check `.env` file has correct URL
- Verify internet connection
- Check Supabase project is active

### "ANON key is invalid"
- Copy key again from Supabase dashboard
- Make sure it's the **anon/public key**, not the **service key**

### "Can't see my data"
- Log in to Supabase dashboard
- Check the table in the browser
- Verify RLS policies aren't blocking access

### "Storage uploads fail"
- Check bucket name is `stores`
- Verify bucket is public
- Check storage URL is correct

## After Migration Checklist

- [ ] `.env` updated with your Supabase URL and keys
- [ ] All required tables created in Supabase
- [ ] Authentication configured
- [ ] Storage bucket created (if using images)
- [ ] Edge functions deployed
- [ ] RLS policies configured
- [ ] App tested and working

## Next Steps

1. Update your `.env` file with your Supabase credentials
2. Create database tables (use SQL provided above)
3. Restart the development server
4. Test authentication and basic functionality
5. Deploy edge functions to Supabase

---

**Need help?** Check:
- Supabase Docs: https://supabase.com/docs
- Project Settings: https://app.supabase.com
- Console logs (F12) for detailed error messages
