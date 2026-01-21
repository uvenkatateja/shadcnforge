# ShadcnForge Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Neon Postgres (FREE tier - Sign up at https://neon.tech)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/shadcnforge

# Vercel Blob (FREE tier - Sign up at https://vercel.com)
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

## Project Structure

```
shadcnforge/
├── apps/
│   ├── api/                    # ElysiaJS backend (Bun)
│   │   ├── src/
│   │   │   ├── index.ts       # Main API entry
│   │   │   ├── routes/
│   │   │   │   ├── registry.ts # Registry endpoints
│   │   │   │   └── upload.ts   # Upload endpoints
│   │   │   ├── services/
│   │   │   │   ├── ast/        # Babel AST parser
│   │   │   │   └── registry/   # Registry generator
│   │   │   └── lib/
│   │   │       └── db.ts       # Database connection
│   │   └── package.json
│   └── web/                    # Next.js 15 frontend
│       ├── app/
│       │   ├── page.tsx        # Home page
│       │   ├── browse/         # Browse components
│       │   └── paste/          # Upload component
│       └── package.json
├── packages/
│   ├── shared/                 # Shared types & schemas
│   │   └── src/
│   │       ├── types/          # TypeScript types
│   │       └── schemas/        # Zod schemas
│   ├── db/                     # Drizzle ORM
│   │   └── src/
│   │       └── schema.ts       # Database schema
│   └── config/                 # Shared configs
│       ├── tsconfig/
│       └── eslint-config/
└── turbo.json
```

## API Endpoints

### Registry Endpoints

- `GET /registry` - List all components
- `GET /registry/:name` - Get component registry URL
- `GET /registry/:name/files` - Get component files

### Upload Endpoint

- `POST /upload` - Upload a new component
  ```json
  {
    "name": "my-button",
    "type": "registry:ui",
    "files": [
      {
        "path": "components/ui/button.tsx",
        "content": "..."
      }
    ]
  }
  ```

## Database Schema

### Components Table
- `id` - UUID primary key
- `name` - Unique component name
- `type` - Component type (registry:ui, registry:block, registry:hook)
- `registry_url` - URL to registry JSON on Vercel Blob
- `blob_urls` - Array of file URLs
- `install_count` - Number of installs
- `created_at`, `updated_at` - Timestamps

### Files Table
- `id` - UUID primary key
- `component_id` - Foreign key to components
- `path` - File path
- `content` - File content
- `file_type` - File type (tsx, ts, css, json)
- `order` - Display order
- `created_at` - Timestamp

### Dependencies Table
- `id` - UUID primary key
- `file_id` - Foreign key to files
- `import_path` - Import statement path
- `resolved` - Whether dependency is resolved
- `target_file_id` - Foreign key to target file
- `created_at` - Timestamp

## Available Scripts

```bash
# Development
bun run dev          # Start all dev servers
bun run build        # Build all apps
bun run lint         # Lint all packages

# Database
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio

# Cleanup
bun run clean        # Remove node_modules and build artifacts
```

## How It Works

ShadcnForge uses **deterministic algorithms** (NOT AI):

1. **Babel AST Parser** - Parses TypeScript/TSX files to extract imports/exports
2. **Dependency Resolution** - Identifies shadcn components and npm packages
3. **Registry Generation** - Creates shadcn-compatible registry JSON
4. **Blob Storage** - Uploads files to Vercel Blob
5. **Database Storage** - Stores metadata in Neon Postgres

## Troubleshooting

### API won't start
- Check if port 3001 is available
- Verify DATABASE_URL is set correctly
- Run `bun install` in apps/api

### Web app won't start
- Check if port 3000 is available
- Verify NEXT_PUBLIC_API_URL is set
- Run `bun install` in apps/web

### Database errors
- Verify DATABASE_URL format
- Run `bun run db:push` to sync schema
- Check Neon dashboard for connection issues

### Blob upload errors
- Verify BLOB_READ_WRITE_TOKEN is set
- Check Vercel dashboard for token validity
- Ensure token has read/write permissions

## Free Tier Limits

- **Neon Postgres**: 0.5GB storage (~10,000+ components)
- **Vercel Blob**: 500MB storage (~5,000+ registry JSONs)
- **Vercel Hosting**: Unlimited deployments (hobby plan)

## Next Steps

1. Test the upload flow at http://localhost:3000/paste
2. Browse components at http://localhost:3000/browse
3. Check API docs at http://localhost:3001/swagger
4. Deploy to Vercel with `vercel`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
