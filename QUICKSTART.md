# 🚀 ShadcnForge Quick Start

Get up and running in 5 minutes!

## Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Neon](https://neon.tech) account (free)
- [Vercel](https://vercel.com) account (free)

## 1. Clone & Install (1 min)

```bash
git clone https://github.com/yourusername/shadcnforge.git
cd shadcnforge
bun install
```

## 2. Setup Environment (2 min)

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Get from https://neon.tech
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/shadcnforge

# Get from https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# Local development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 3. Setup Database (1 min)

```bash
bun run db:push
```

## 4. Start Development (1 min)

```bash
bun run dev
```

## 5. Open Browser

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:3001/swagger

## 🎉 You're Ready!

### Try It Out

1. Go to http://localhost:3000/paste
2. Paste this example component:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MyCard() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

3. Set component name: `my-card`
4. Click "Generate Registry"
5. See automatic dependency detection:
   - shadcn: `button`, `card`
   - npm: (none in this example)

### What Just Happened?

ShadcnForge:
1. ✅ Parsed your TSX code using Babel AST
2. ✅ Detected shadcn component imports
3. ✅ Generated registry JSON
4. ✅ Uploaded to Vercel Blob
5. ✅ Saved to Neon database
6. ✅ Made it installable via CLI

### Install Your Component

```bash
npx shadcn@latest add <your-registry-url>
```

## Common Commands

```bash
# Development
bun run dev          # Start all servers
bun run build        # Build for production
bun run lint         # Lint code

# Database
bun run db:push      # Push schema changes
bun run db:studio    # Open database GUI

# Testing
./scripts/test-api.sh      # Test API (Linux/Mac)
.\scripts\test-api.ps1     # Test API (Windows)
```

## Project Structure

```
shadcnforge/
├── apps/
│   ├── api/         # Backend (ElysiaJS)
│   └── web/         # Frontend (Next.js)
├── packages/
│   ├── shared/      # Types & schemas
│   ├── db/          # Database schema
│   └── config/      # Shared configs
└── scripts/         # Utility scripts
```

## Next Steps

- 📖 Read [SETUP.md](SETUP.md) for detailed setup
- 🏗️ Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- 🚀 Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production
- ✅ Check [CHECKLIST.md](CHECKLIST.md) for feature list

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error

- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection string
- Ensure database is not paused (free tier auto-pauses)

### Blob Upload Error

- Verify `BLOB_READ_WRITE_TOKEN` is correct
- Check Vercel dashboard for token
- Ensure token has write permissions

### Build Errors

```bash
# Clean and reinstall
bun run clean
bun install
```

## Getting Help

- 📚 [Documentation](README.md)
- 🐛 [Report Issues](https://github.com/yourusername/shadcnforge/issues)
- 💬 [Discussions](https://github.com/yourusername/shadcnforge/discussions)

## What Makes ShadcnForge Special?

✨ **No AI** - Uses deterministic algorithms (Babel AST, pattern matching)
🚀 **Fast** - Bun runtime, serverless architecture
💰 **Free** - All services have generous free tiers
🔒 **Type-Safe** - Full TypeScript coverage
📦 **Monorepo** - Clean, organized codebase
🎨 **Modern** - Next.js 15, React 19, Tailwind CSS

---

**Time to first component**: ~5 minutes
**Cost**: $0/month (free tier)
**Lines of code**: ~2,000
**Dependencies**: Minimal, all open-source

Happy coding! 🎉
