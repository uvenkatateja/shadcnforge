# ⚡ Quick Deploy Commands

Copy and paste these commands to deploy in 5 minutes!

## 1️⃣ Initialize Git & Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ShadcnForge"

# Create GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/shadcnforge.git

# Push
git branch -M main
git push -u origin main
```

## 2️⃣ Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 3️⃣ Add Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables

Add these 3 variables:

```
DATABASE_URL = your-neon-database-url
BLOB_READ_WRITE_TOKEN = your-vercel-blob-token
NEXT_PUBLIC_API_URL = https://your-project.vercel.app
```

## 4️⃣ Redeploy

```bash
vercel --prod
```

## 5️⃣ Push Database Schema

```bash
bun run db:push
```

## ✅ Done!

Visit: `https://your-project.vercel.app`

---

## 🔍 Verify Deployment

```bash
# Check API
curl https://your-project.vercel.app/health

# View logs
vercel logs --follow
```

## 🔄 Future Updates

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel auto-deploys!
```

---

**Total Time**: ~5 minutes
**Cost**: $0/month
