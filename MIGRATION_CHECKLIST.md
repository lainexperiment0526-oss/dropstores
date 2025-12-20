# 📋 Cloud Storage Migration Checklist

## Phase 1: Local Setup ✅

- [x] Verify Supabase client configured
- [x] Create enhanced ImageUpload component
- [x] Create API routes (upload, delete, image)
- [x] Create storage utilities library
- [x] Create migration script
- [x] Create documentation

## Phase 2: Supabase Configuration

### Create Storage Bucket
- [ ] Go to [Supabase Dashboard](https://app.supabase.com)
- [ ] Select project: `xyqoyfhxslauiwkuopve`
- [ ] Navigate to **Storage**
- [ ] Click **Create Bucket**
- [ ] Name: `store-assets`
- [ ] Set visibility: **Public**
- [ ] Click **Create**

### Set Bucket Policies
- [ ] Go to **Authentication** → **Policies**
- [ ] Create policy for **store-assets** bucket
- [ ] Add "Public Read" policy
- [ ] Add "Authenticated Upload" policy
- [ ] Add "User Delete" policy

### Verify Buckets
- [ ] `store-assets` exists and is public
- [ ] RLS policies are in place
- [ ] CORS is configured (default: OK)

## Phase 3: Vercel Deployment

### Install Vercel CLI
```bash
npm install -g vercel
```
- [ ] Vercel CLI installed

### Connect to Vercel
```bash
vercel login
vercel link
```
- [ ] Logged in to Vercel
- [ ] Project linked to Vercel

### Add Environment Variables
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```
- [ ] `VITE_SUPABASE_URL` = https://xyqoyfhxslauiwkuopve.supabase.co
- [ ] `VITE_SUPABASE_ANON_KEY` = (from your .env)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase settings)

### Deploy
```bash
vercel
```
- [ ] Project deployed to Vercel
- [ ] API routes accessible at `/api/*`

## Phase 4: Testing

### Local Testing
```bash
npm run dev
```
- [ ] Dev server running at http://localhost:8081
- [ ] Navigate to image upload section
- [ ] Upload test image
- [ ] Image appears in preview
- [ ] Check Supabase Dashboard → Storage → store-assets
- [ ] File visible in bucket

### API Testing
```bash
# Test upload API
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"file":"base64data","bucket":"store-assets"}'

# Test delete API
curl -X POST http://localhost:3000/api/delete \
  -H "Content-Type: application/json" \
  -d '{"bucket":"store-assets","path":"test.jpg"}'
```
- [ ] Upload API responds with URL
- [ ] Delete API confirms deletion
- [ ] Image optimization API works

### Vercel Preview
- [ ] Deploy preview branch
- [ ] Test upload on preview deployment
- [ ] Verify files appear in Supabase Storage

## Phase 5: Migration (Optional)

### Prepare Migration
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```
- [ ] Environment variables set correctly
- [ ] Supabase connection working

### Run Migration
```bash
npx ts-node scripts/migrate-images.ts
```
- [ ] Migration script runs
- [ ] Progress shown in console
- [ ] migration-log.json created
- [ ] Check migration results
- [ ] No "FAILED" entries (or acceptable errors)

### Verify Migration
- [ ] Old images still work (fallback to Loveble)
- [ ] New images in Supabase Storage
- [ ] Database updated with new URLs
- [ ] No broken image links

## Phase 6: Production Deployment

### Final Checks
- [ ] All tests passing locally
- [ ] All tests passing on Vercel preview
- [ ] Migration complete (if applicable)
- [ ] Documentation reviewed
- [ ] Team informed of changes

### Deploy to Production
```bash
vercel --prod
```
- [ ] Production deployment successful
- [ ] API routes working in production
- [ ] File uploads working in production
- [ ] Supabase Storage receiving files
- [ ] CDN serving files properly

### Monitor
- [ ] Check error logs in Vercel
- [ ] Monitor Supabase Storage usage
- [ ] Verify file uploads succeeding
- [ ] Check image loading on live site

## Phase 7: Cleanup

### Remove Old Storage
- [ ] Export any critical files from Loveble
- [ ] Verify all files migrated to Supabase
- [ ] Delete bucket/account from Loveble (if applicable)
- [ ] Document final migration date

### Update Documentation
- [ ] Update team wiki/docs
- [ ] Document storage architecture
- [ ] Create runbook for file operations
- [ ] Train team on new system

## Phase 8: Ongoing Maintenance

### Regular Tasks
- [ ] Monitor storage usage monthly
- [ ] Check Supabase alerts/quotas
- [ ] Review access logs quarterly
- [ ] Test disaster recovery
- [ ] Update documentation as needed

### Monitoring
- [ ] Storage quota alerts set
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Performance metrics tracked

## 📞 Support Resources

| Topic | Resource |
|-------|----------|
| Supabase Storage | https://supabase.com/docs/guides/storage |
| Vercel Functions | https://vercel.com/docs/serverless-functions |
| Environment Vars | https://vercel.com/docs/build-output-api/v3#environment-variables |
| RLS Policies | https://supabase.com/docs/guides/auth/row-level-security |
| CDN/Caching | https://supabase.com/docs/guides/storage/cdn |

## ⏱️ Timeline Estimate

| Phase | Time | Notes |
|-------|------|-------|
| Phase 1 | ✅ Done | Already completed |
| Phase 2 | 5 min | Create bucket + policies |
| Phase 3 | 10 min | Vercel setup + deploy |
| Phase 4 | 15 min | Test locally + on Vercel |
| Phase 5 | 30 min | Migration (if applicable) |
| Phase 6 | 5 min | Production deploy |
| Phase 7 | 15 min | Cleanup + docs |
| **Total** | **~80 min** | **Complete system** |

## ✨ Success Criteria

- [ ] Images upload to Supabase Storage
- [ ] Images serve via public CDN URL
- [ ] File deletion working
- [ ] Migration complete (if needed)
- [ ] No errors in logs
- [ ] Performance equivalent or better
- [ ] Team trained on new system

---

**Start Date**: December 20, 2025
**Target Completion**: December 20, 2025
**Status**: Ready to begin

Once you complete all items, your cloud storage migration will be complete! 🎉
