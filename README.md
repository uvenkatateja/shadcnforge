# 🔨 ShadcnForge

Transform TSX/MD code into CLI-installable shadcn components. An open-source tool for creating and sharing custom shadcn/ui components.

## 🚀 Tech Stack (100% FREE & Open Source)

- **Monorepo**: Turborepo
- **Language**: TypeScript (strict mode)
- **Backend**: ElysiaJS (Bun runtime)
- **Frontend**: Next.js 15 (App Router)
- **Database**: Neon Postgres (FREE tier: 0.5GB)
- **Storage**: Vercel Blob (FREE tier: 500MB)
- **ORM**: Drizzle ORM
- **Package Manager**: Bun

## 📁 Project Structure

```
shadcnforge/
├── apps/
│   ├── api/              # ElysiaJS backend (port 3001)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   │   ├── ast/        # Babel AST parser (NOT AI)
│   │   │   │   ├── registry/   # Registry JSON generator
│   │   │   │   └── storage/    # Vercel Blob integration
│   │   │   └── lib/
│   │   └── package.json
│   └── web/              # Next.js 15 frontend (port 3000)
│       ├── app/
│       ├── components/
│       └── package.json
├── packages/
│   ├── shared/           # Shared TypeScript types & Zod schemas
│   ├── db/               # Drizzle ORM schema
│   └── config/           # Shared configs (tsconfig, eslint)
├── turbo.json
├── package.json
└── .env.example
```

## 🛠️ Setup Instructions

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [Node.js](https://nodejs.org) >= 18.0.0

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Neon Postgres (FREE tier)
# Sign up: https://neon.tech
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/shadcnforge

# Vercel Blob (FREE tier)
# Sign up: https://vercel.com
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# API URL (local dev)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Push Database Schema

```bash
bun run db:push
```

### 4. Start Development Servers

```bash
bun run dev
```

This starts:
- **API**: http://localhost:3001
- **Web**: http://localhost:3000
- **API Docs**: http://localhost:3001/swagger

## 📦 Available Scripts

```bash
# Development
bun run dev          # Start all dev servers (Turborepo parallel)
bun run build        # Build all apps
bun run lint         # Lint all packages

# Database
bun run db:push      # Push schema to Neon Postgres
bun run db:studio    # Open Drizzle Studio (database GUI)

# Cleanup
bun run clean        # Remove node_modules and build artifacts
```

## 🧪 Verification Commands

```bash
# Check if everything compiles
bun run build

# Verify API is running
curl http://localhost:3001/health

# Open web app
open http://localhost:3000
```

## 🎯 How It Works (NO AI INVOLVED)

ShadcnForge uses **deterministic algorithms**, not AI:

1. **Babel AST Parser** - Compiler-based code parsing
   - Parses JavaScript/TypeScript syntax tree
   - Detects imports/exports using AST traversal
   - Example: `import { Button } from "@/components/ui/button"`

2. **String Pattern Matching** - Regex for import paths
   - Identifies shadcn components: `@/components/ui/*`
   - Extracts npm dependencies
   - Example: `lucide-react`, `class-variance-authority`

3. **Dependency Graph** - Graph algorithms
   - Builds component dependency tree
   - Resolves internal component references
   - Example: `amazing-card.tsx` → `user-avatar.tsx`

4. **JSON Schema Validation** - Zod validation
   - Ensures registry.json matches shadcn spec
   - Validates component metadata
   - Example: Type must be `registry:ui`, `registry:block`, or `registry:hook`

## 🆓 Free Tier Limits

All services work indefinitely on free tier:

- **Neon Postgres**: 0.5GB storage (~10,000+ components)
- **Vercel Blob**: 500MB storage (~5,000+ registry JSONs)
- **Vercel Hosting**: Unlimited deployments (hobby plan)
- **No credit card required**

## 🚢 Deployment

### Deploy to Vercel (FREE)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

## 📚 Database Schema

```typescript
// components table
{
  id: uuid,
  name: string,
  type: 'registry:ui' | 'registry:block' | 'registry:hook',
  registry_url: string,
  blob_urls: string[],
  install_count: number,
  created_at: timestamp,
  updated_at: timestamp
}

// files table
{
  id: uuid,
  component_id: uuid (FK),
  path: string,
  content: string,
  file_type: 'tsx' | 'ts' | 'css' | 'json',
  order: number,
  created_at: timestamp
}

// dependencies table
{
  id: uuid,
  file_id: uuid (FK),
  import_path: string,
  resolved: boolean,
  target_file_id: uuid (FK),
  created_at: timestamp
}
```

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://shadcnforge.dev/docs)
- [GitHub](https://github.com/yourusername/shadcnforge)
- [Discord](https://discord.gg/shadcnforge)

---

Built with ❤️ by the open-source community
