# 🔧 ShadcnForge Troubleshooting Guide

## TypeScript Errors

### "Cannot use JSX unless the '--jsx' flag is provided"

**Cause**: TypeScript language server needs to reload after tsconfig changes

**Solution**:
1. In VS Code: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

**Alternative**:
```bash
# Close and reopen VS Code
# Or reload window: Ctrl+Shift+P -> "Developer: Reload Window"
```

### "Cannot find module '@shadcnforge/...'"

**Cause**: Workspace packages not linked

**Solution**:
```bash
# Reinstall dependencies
bun install

# If still failing, clean and reinstall
bun run clean
bun install
```

### "File '...json' not found"

**Cause**: Missing tsconfig file

**Solution**: Ensure these files exist:
- `packages/config/tsconfig/base.json` ✅
- `packages/config/tsconfig/elysia.json` ✅
- `packages/config/tsconfig/nextjs.json` ✅

## Build Errors

### "Cannot find module 'bun-types'"

**Solution**:
```bash
cd apps/api
bun add -d bun-types
```

### "Build failed: Module not found"

**Solution**:
```bash
# Clean build artifacts
bun run clean

# Reinstall
bun install

# Try building again
bun run build
```

## Runtime Errors

### API: "DATABASE_URL not set"

**Solution**:
```bash
# Check .env file exists
cat .env

# Verify DATABASE_URL is set
echo $DATABASE_URL

# If missing, copy from .env.example
cp .env.example .env
# Then edit .env with your credentials
```

### API: "Connection refused"

**Cause**: Database not accessible

**Solution**:
1. Check Neon dashboard: https://console.neon.tech
2. Verify database is not paused (free tier auto-pauses)
3. Click "Resume" if paused
4. Test connection:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

### API: "Blob upload failed"

**Cause**: Invalid or missing BLOB_READ_WRITE_TOKEN

**Solution**:
1. Go to Vercel dashboard: https://vercel.com/dashboard/stores
2. Create or select Blob store
3. Copy token
4. Update `.env`:
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
```

### Web: "Failed to fetch"

**Cause**: API not running or wrong URL

**Solution**:
```bash
# Check if API is running
curl http://localhost:3001/health

# If not running, start it
cd apps/api
bun run dev

# Verify NEXT_PUBLIC_API_URL in .env
echo $NEXT_PUBLIC_API_URL
# Should be: http://localhost:3001
```

## Development Issues

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution (Windows)**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Solution (Linux/Mac)**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Hot Reload Not Working

**Solution**:
```bash
# Stop dev server (Ctrl+C)
# Clear cache
rm -rf .next .turbo node_modules/.cache

# Restart
bun run dev
```

### Monaco Editor Not Loading

**Cause**: Missing dependency or build issue

**Solution**:
```bash
cd apps/web
bun install @monaco-editor/react
bun run dev
```

## Database Issues

### "Schema out of sync"

**Solution**:
```bash
# Push schema changes
bun run db:push

# If that fails, generate migration
cd packages/db
bun run db:generate
bun run db:push
```

### "Table does not exist"

**Cause**: Database schema not pushed

**Solution**:
```bash
# Push schema
bun run db:push

# Verify tables exist
psql $DATABASE_URL -c "\dt"
```

### "Cannot connect to database"

**Solution**:
1. Check DATABASE_URL format:
```
postgresql://user:password@host.neon.tech/database?sslmode=require
```

2. Test connection:
```bash
psql $DATABASE_URL -c "SELECT version()"
```

3. Check Neon dashboard for connection string

## Deployment Issues

### Vercel: "Build failed"

**Common causes**:
1. Missing environment variables
2. Build command incorrect
3. Dependencies not installed

**Solution**:
```bash
# Test build locally first
bun run build

# Check Vercel logs
vercel logs

# Verify environment variables in Vercel dashboard
```

### Vercel: "Function timeout"

**Cause**: API function taking too long

**Solution**:
1. Check function logs in Vercel dashboard
2. Optimize slow queries
3. Add indexes to database
4. Consider upgrading Vercel plan for longer timeouts

### Vercel: "Module not found in production"

**Cause**: Dependency in devDependencies instead of dependencies

**Solution**:
```bash
# Move dependency to dependencies
cd apps/api
bun remove -d <package>
bun add <package>

# Commit and redeploy
git add package.json
git commit -m "Fix dependency"
git push
```

## Performance Issues

### Slow API Response

**Solution**:
1. Check database query performance:
```sql
EXPLAIN ANALYZE SELECT * FROM components;
```

2. Add indexes:
```sql
CREATE INDEX idx_components_name ON components(name);
CREATE INDEX idx_files_component_id ON files(component_id);
```

3. Enable caching (future enhancement)

### Large Bundle Size

**Solution**:
```bash
# Analyze bundle
cd apps/web
bun run build
# Check .next/analyze

# Consider code splitting
# Use dynamic imports for large components
```

## Common Mistakes

### 1. Forgetting to Push Database Schema

**Symptom**: "Table does not exist" errors

**Fix**:
```bash
bun run db:push
```

### 2. Wrong API URL in Frontend

**Symptom**: "Failed to fetch" in browser console

**Fix**: Check `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Not Restarting After .env Changes

**Symptom**: Environment variables not updating

**Fix**: Restart dev servers (Ctrl+C, then `bun run dev`)

### 4. Using npm/yarn Instead of Bun

**Symptom**: Dependency resolution issues

**Fix**: Always use `bun`:
```bash
# Wrong
npm install

# Correct
bun install
```

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Read error message carefully
3. ✅ Check browser console (F12)
4. ✅ Check API logs
5. ✅ Try restarting dev servers
6. ✅ Try clean install: `bun run clean && bun install`

### Where to Get Help

- 📚 Documentation: See `/docs` folder
- 🐛 Bug Reports: GitHub Issues
- 💬 Questions: GitHub Discussions
- 📖 Guides: README.md, SETUP.md, ARCHITECTURE.md

### Providing Information

When asking for help, include:
1. Error message (full text)
2. Steps to reproduce
3. Your environment:
   - OS (Windows/Mac/Linux)
   - Bun version: `bun --version`
   - Node version: `node --version`
4. Relevant logs
5. What you've already tried

## Quick Fixes

### Reset Everything

```bash
# Nuclear option - reset everything
bun run clean
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
bun install
bun run db:push
bun run dev
```

### Verify Installation

```bash
# Check all dependencies installed
bun install

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check API health
curl http://localhost:3001/health

# Check web app
curl http://localhost:3000
```

### Test Everything

```bash
# Run all tests
./scripts/test-api.sh  # or .ps1 on Windows

# Test build
bun run build

# Test database
bun run db:studio
```

## Still Having Issues?

If none of these solutions work:

1. Create a GitHub issue with:
   - Detailed error message
   - Steps to reproduce
   - Your environment info
   - What you've tried

2. Check existing issues: https://github.com/yourusername/shadcnforge/issues

3. Join discussions: https://github.com/yourusername/shadcnforge/discussions

---

**Most Common Fix**: Restart TypeScript server in VS Code! 🔄
