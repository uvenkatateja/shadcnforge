# 🚀 GitHub & Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

Before pushing to GitHub, verify:

- [x] `.env` is in `.gitignore` ✅
- [x] `.env.example` exists with placeholder values ✅
- [x] All sensitive data is in `.env` (not committed) ✅
- [x] Code is working locally ✅

## Step 1: Initialize Git Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ShadcnForge component registry"
```

## Step 2: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not installed
# Windows: winget install GitHub.cli
# Mac: brew install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create shadcnforge --public --source=. --remote=origin

# Push code
git push -u origin main
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `shadcnforge`
3. Description: "Transform TSX code into CLI-installable shadcn components"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

Then push your code:

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/shadcnforge.git

# Push code
git branch -M main
git push -u origin main
```

## Step 3: Verify .env is NOT Pushed

```bash
# Check what's being tracked
git ls-files | grep -E "\.env$"

# Should return nothing (empty)
# If it shows .env, you need to remove it:
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: shadcnforge
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `bun run build`
   - **Output Directory**: (leave empty)
   - **Install Command**: `bun install`

5. Click "Deploy"

## Step 5: Configure Environment Variables in Vercel

### Via Vercel Dashboard

1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```env
DATABASE_URL
Value: postgresql://neondb_owner:npg_dOiIU7W4jrye@ep-aged-dawn-a1ctikl2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
Environment: Production, Preview, Development

BLOB_READ_WRITE_TOKEN
Value: (your Vercel Blob token)
Environment: Production, Preview, Development

NEXT_PUBLIC_API_URL
Value: https://your-project.vercel.app
Environment: Production, Preview, Development
```

### Via Vercel CLI

```bash
# Set environment variables
vercel env add DATABASE_URL production
# Paste your database URL when prompted

vercel env add BLOB_READ_WRITE_TOKEN production
# Paste your blob token when prompted

vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-project.vercel.app
```

## Step 6: Setup Vercel Blob Storage

1. Go to https://vercel.com/dashboard/stores
2. Click "Create Database" → "Blob"
3. Name: `shadcnforge-storage`
4. Click "Create"
5. Copy the `BLOB_READ_WRITE_TOKEN`
6. Add it to Vercel environment variables (see Step 5)

## Step 7: Push Database Schema

After deployment, push the database schema:

```bash
# Set DATABASE_URL locally (if not already set)
export DATABASE_URL="your-neon-url"

# Push schema
bun run db:push
```

Or use Vercel CLI:

```bash
# Run command in Vercel environment
vercel env pull .env.production
bun run db:push
```

## Step 8: Redeploy with Environment Variables

After adding environment variables:

```bash
# Trigger new deployment
vercel --prod

# Or via dashboard: Deployments → Redeploy
```

## Step 9: Verify Deployment

1. **Check API Health**:
   ```bash
   curl https://your-project.vercel.app/health
   ```

2. **Check Web App**:
   - Visit: https://your-project.vercel.app
   - Should see the home page

3. **Test Upload**:
   - Go to: https://your-project.vercel.app/paste
   - Upload a test component

4. **Check API Docs**:
   - Visit: https://your-project.vercel.app/swagger

## Step 10: Configure Custom Domain (Optional)

### Via Vercel Dashboard

1. Go to Settings → Domains
2. Add your domain (e.g., `shadcnforge.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_API_URL` to use your domain

### Via Vercel CLI

```bash
vercel domains add shadcnforge.com
```

## 🔒 Security Checklist

Before going live, verify:

- [ ] `.env` is NOT in GitHub ✅
- [ ] All secrets are in Vercel environment variables ✅
- [ ] Database URL uses SSL (`sslmode=require`) ✅
- [ ] Blob token has correct permissions ✅
- [ ] CORS is configured correctly ✅
- [ ] API endpoints are working ✅

## 📊 Post-Deployment Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### View Deployments

```bash
# List deployments
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>
```

### Monitor Performance

1. Go to Vercel Dashboard → Analytics
2. Check:
   - Response times
   - Error rates
   - Traffic patterns

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys!
```

### Branch Deployments

- `main` branch → Production
- Other branches → Preview deployments

## 🐛 Troubleshooting

### Deployment Failed

**Check build logs**:
```bash
vercel logs --follow
```

**Common issues**:
- Missing environment variables
- Build command incorrect
- Dependencies not installed

### API Returns 500

**Check function logs**:
1. Go to Vercel Dashboard → Functions
2. Click on failing function
3. View logs

**Common issues**:
- DATABASE_URL not set
- BLOB_READ_WRITE_TOKEN invalid
- Database schema not pushed

### Environment Variables Not Working

**Solution**:
1. Verify variables are set in Vercel dashboard
2. Redeploy: `vercel --prod`
3. Check variable names match exactly

## 📝 Git Workflow

### Daily Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# Vercel creates preview deployment automatically

# After review, merge to main
# Vercel deploys to production automatically
```

### Hotfix

```bash
# Create hotfix branch
git checkout -b hotfix/critical-fix

# Fix issue
git add .
git commit -m "Fix critical bug"

# Push and merge quickly
git push origin hotfix/critical-fix
# Merge to main immediately
```

## 🎯 Production URLs

After deployment, you'll have:

- **Production**: `https://shadcnforge.vercel.app`
- **API**: `https://shadcnforge.vercel.app/api`
- **Docs**: `https://shadcnforge.vercel.app/swagger`
- **Preview**: `https://shadcnforge-git-branch.vercel.app` (per branch)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Neon Documentation](https://neon.tech/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## ✅ Final Checklist

Before announcing your project:

- [ ] Code pushed to GitHub ✅
- [ ] Deployed to Vercel ✅
- [ ] Environment variables configured ✅
- [ ] Database schema pushed ✅
- [ ] API health check passing ✅
- [ ] Web app loading correctly ✅
- [ ] Upload functionality working ✅
- [ ] Browse page showing components ✅
- [ ] Custom domain configured (optional) ✅
- [ ] README updated with live URLs ✅

---

**Deployment Time**: ~10 minutes
**Cost**: $0/month (free tier)
**Maintenance**: Automatic (serverless)

🎉 Your ShadcnForge is now live!
