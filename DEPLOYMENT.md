# ShadcnForge Deployment Guide

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier)
- [Neon Account](https://neon.tech) (free tier)
- [GitHub Account](https://github.com) (for deployment)

## Step 1: Setup Neon Postgres Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project called "shadcnforge"
3. Copy the connection string (looks like: `postgresql://user:password@ep-xxx.neon.tech/shadcnforge`)
4. Save it for later - you'll need it as `DATABASE_URL`

## Step 2: Setup Vercel Blob Storage

1. Go to [vercel.com](https://vercel.com) and sign up
2. Create a new project (or use existing)
3. Go to Storage → Create Database → Blob
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Save it for later

## Step 3: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/shadcnforge.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: shadcnforge
# - Directory: ./
# - Override settings? No
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `bun run build`
   - Output Directory: (leave empty)
   - Install Command: `bun install`

## Step 5: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/shadcnforge

# Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# API URL (will be your Vercel URL)
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

**Important**: After adding environment variables, redeploy:
```bash
vercel --prod
```

## Step 6: Push Database Schema

```bash
# Set DATABASE_URL locally
export DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/shadcnforge"

# Push schema
bun run db:push
```

## Step 7: Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Check API health: `https://your-project.vercel.app/api/health`
3. Check API docs: `https://your-project.vercel.app/api/swagger`
4. Test upload flow at `/paste`
5. Browse components at `/browse`

## Turborepo Configuration for Vercel

Vercel automatically detects Turborepo. Ensure your `turbo.json` is configured:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `shadcnforge.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_API_URL` to use your custom domain

## Monitoring & Logs

### View Logs
```bash
vercel logs
```

### View Deployments
```bash
vercel ls
```

### View Project Info
```bash
vercel inspect
```

## Database Management

### View Database in Drizzle Studio (Local)
```bash
bun run db:studio
```

### View Database in Neon Console
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Go to SQL Editor
4. Run queries:

```sql
-- View all components
SELECT * FROM components ORDER BY created_at DESC;

-- View component with files
SELECT c.name, f.path, f.file_type
FROM components c
JOIN files f ON f.component_id = c.id
WHERE c.name = 'your-component';

-- View install stats
SELECT name, install_count
FROM components
ORDER BY install_count DESC
LIMIT 10;
```

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'bun-types'`
**Solution**: Ensure `bun-types` is in devDependencies

**Error**: `DATABASE_URL not set`
**Solution**: Add environment variable in Vercel dashboard

### API Returns 500

**Check logs**:
```bash
vercel logs --follow
```

**Common issues**:
- DATABASE_URL incorrect format
- BLOB_READ_WRITE_TOKEN invalid
- Database schema not pushed

### Upload Fails

**Error**: `Blob upload failed`
**Solution**: Verify BLOB_READ_WRITE_TOKEN has write permissions

**Error**: `Dependency validation failed`
**Solution**: Ensure all imported files are uploaded together

## Performance Optimization

### Enable Edge Runtime (Optional)

For faster API responses, you can enable Edge Runtime:

```typescript
// apps/api/src/index.ts
export const config = {
  runtime: 'edge',
};
```

### Enable Caching

Add caching headers to registry endpoints:

```typescript
// apps/api/src/routes/registry.ts
.get('/:name', async ({ params, set }) => {
  set.headers['Cache-Control'] = 'public, max-age=3600';
  // ... rest of code
})
```

## Scaling Considerations

### Free Tier Limits
- **Neon**: 0.5GB storage, 100 hours compute/month
- **Vercel Blob**: 500MB storage, 100GB bandwidth/month
- **Vercel Hosting**: Unlimited deployments, 100GB bandwidth/month

### When to Upgrade
- **Neon Pro** ($19/month): 10GB storage, unlimited compute
- **Vercel Pro** ($20/month): 1TB bandwidth, advanced analytics
- **Vercel Blob Pro**: 100GB storage, 1TB bandwidth

### Horizontal Scaling
- Vercel automatically scales your API
- Neon automatically scales database connections
- No code changes needed

## Backup Strategy

### Database Backups

Neon provides automatic backups:
- Point-in-time recovery (7 days on free tier)
- Manual snapshots available

### Export Data

```bash
# Export all components
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`
   - Use Vercel environment variables

2. **Rotate tokens regularly**
   - Regenerate BLOB_READ_WRITE_TOKEN every 90 days
   - Update in Vercel dashboard

3. **Enable rate limiting** (future enhancement)
   ```typescript
   // Add to API routes
   .use(rateLimit({ max: 100, window: '15m' }))
   ```

4. **Monitor for abuse**
   - Check Vercel analytics
   - Review Neon query logs

## CI/CD Pipeline (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Support

- **Documentation**: [README.md](README.md)
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/shadcnforge/issues)

---

**Deployment Time**: ~10 minutes
**Cost**: $0/month (free tier)
**Maintenance**: Minimal (serverless)
