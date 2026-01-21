# ShadcnForge Architecture

## Overview

ShadcnForge is a monorepo application that transforms TypeScript/TSX code into CLI-installable shadcn components. The architecture emphasizes **deterministic algorithms** over AI/ML approaches.

## Technology Stack

### Runtime & Build Tools
- **Bun**: JavaScript runtime and package manager
- **Turborepo**: Monorepo build system
- **TypeScript**: Type-safe development

### Backend (API)
- **ElysiaJS**: Fast, type-safe web framework for Bun
- **Neon Postgres**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe SQL query builder
- **Vercel Blob**: Object storage for registry files
- **Babel**: AST parser for code analysis

### Frontend (Web)
- **Next.js 15**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **Monaco Editor**: Code editor component
- **React 19**: UI library

### Validation & Types
- **Zod**: Runtime type validation
- **TypeScript**: Compile-time type checking

## Project Structure

```
shadcnforge/
├── apps/
│   ├── api/              # Backend API (ElysiaJS)
│   └── web/              # Frontend (Next.js)
├── packages/
│   ├── shared/           # Shared types & schemas
│   ├── db/               # Database schema & ORM
│   └── config/           # Shared configurations
└── scripts/              # Utility scripts
```

## Data Flow

### Upload Flow

```
User (Web) → Monaco Editor → Upload Form
    ↓
POST /upload (API)
    ↓
Zod Validation (UploadRequestSchema)
    ↓
AST Parser (Babel) → Extract imports/exports
    ↓
Registry Generator → Create registry JSON
    ↓
Vercel Blob → Upload files & registry JSON
    ↓
Neon Postgres → Save metadata
    ↓
Response → Registry URL
```

### Browse/Install Flow

```
User (CLI) → npx shadcn add component-name
    ↓
GET /registry/:name (API)
    ↓
Neon Postgres → Fetch component metadata
    ↓
Increment install count
    ↓
Response → Registry URL (Vercel Blob)
    ↓
shadcn CLI → Download & install component
```

## Core Algorithms (NO AI)

### 1. AST Parsing (Babel)

**Purpose**: Extract imports and exports from TypeScript/TSX files

**How it works**:
```typescript
// Input: TypeScript code
const code = `
  import { Button } from "@/components/ui/button";
  export function MyComponent() { ... }
`;

// Process: Parse to AST
const ast = parse(code, {
  sourceType: 'module',
  plugins: ['typescript', 'jsx']
});

// Output: Structured data
{
  imports: [
    { source: "@/components/ui/button", specifiers: ["Button"] }
  ],
  exports: ["MyComponent"]
}
```

**Algorithm**: Tree traversal (DFS) on Abstract Syntax Tree

### 2. Dependency Resolution

**Purpose**: Identify shadcn components and npm packages

**How it works**:
```typescript
// Pattern matching on import paths
if (importPath.startsWith('@/components/ui/')) {
  // It's a shadcn component
  registryDependencies.add(extractComponentName(importPath));
} else if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
  // It's an npm package
  dependencies.add(extractPackageName(importPath));
}
```

**Algorithm**: String pattern matching + Set data structure

### 3. Registry Generation

**Purpose**: Create shadcn-compatible registry JSON

**How it works**:
```typescript
// Input: Component data
{
  name: "amazing-card",
  files: [{ path: "...", content: "..." }]
}

// Process: Parse all files, extract dependencies
const registryDependencies = new Set();
const dependencies = new Set();

files.forEach(file => {
  const parsed = parseFile(file.content);
  parsed.imports.forEach(imp => {
    if (isShadcnComponent(imp.source)) {
      registryDependencies.add(extractComponentName(imp.source));
    } else if (isNpmPackage(imp.source)) {
      dependencies.add(extractPackageName(imp.source));
    }
  });
});

// Output: Registry JSON
{
  name: "amazing-card",
  type: "registry:ui",
  dependencies: ["lucide-react"],
  registryDependencies: ["button", "card"],
  files: [...]
}
```

**Algorithm**: Graph traversal + Set operations

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│ components  │
├─────────────┤
│ id (PK)     │
│ name        │◄──┐
│ type        │   │
│ registry_url│   │
│ blob_urls   │   │
│ ...         │   │
└─────────────┘   │
                  │
                  │ 1:N
                  │
┌─────────────┐   │
│ files       │   │
├─────────────┤   │
│ id (PK)     │   │
│ component_id├───┘
│ path        │◄──┐
│ content     │   │
│ file_type   │   │
│ ...         │   │
└─────────────┘   │
                  │
                  │ 1:N
                  │
┌─────────────┐   │
│dependencies │   │
├─────────────┤   │
│ id (PK)     │   │
│ file_id     ├───┘
│ import_path │
│ resolved    │
│ target_file │
│ ...         │
└─────────────┘
```

### Queries

**List all components**:
```sql
SELECT name, type, registry_url, install_count
FROM components
ORDER BY install_count DESC;
```

**Get component with files**:
```sql
SELECT c.*, f.*
FROM components c
LEFT JOIN files f ON f.component_id = c.id
WHERE c.name = 'button';
```

**Get component dependencies**:
```sql
SELECT d.import_path, d.resolved
FROM files f
JOIN dependencies d ON d.file_id = f.id
WHERE f.component_id = 'xxx';
```

## API Endpoints

### Registry Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/registry` | List all components |
| GET | `/registry/:name` | Get component registry URL |
| GET | `/registry/:name/files` | Get component files |

### Upload Endpoint

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Upload new component |

**Request Body**:
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

**Response**:
```json
{
  "success": true,
  "component": {
    "id": "uuid",
    "name": "my-button",
    "registryUrl": "https://blob.vercel-storage.com/..."
  }
}
```

## Security Considerations

### Input Validation
- Zod schemas validate all user input
- Component names restricted to `[a-z0-9-]`
- File paths sanitized to prevent directory traversal

### Database
- Parameterized queries (Drizzle ORM)
- Foreign key constraints
- Cascade deletes for data integrity

### Storage
- Public read access for registry files
- Write access restricted to API server
- Token-based authentication for Vercel Blob

## Performance Optimizations

### Backend
- Bun runtime (faster than Node.js)
- Connection pooling (Neon serverless)
- Efficient AST traversal (single pass)

### Frontend
- Next.js App Router (React Server Components)
- Code splitting (automatic)
- Image optimization (Next.js built-in)

### Database
- Indexes on frequently queried columns
- Efficient joins with proper relations
- Serverless scaling (Neon)

## Scalability

### Horizontal Scaling
- Stateless API servers (can run multiple instances)
- Serverless database (auto-scaling)
- CDN for static assets (Vercel Edge)

### Vertical Scaling
- Bun's efficient memory usage
- Streaming responses for large files
- Lazy loading in frontend

## Monitoring & Observability

### Logging
- Structured logs (JSON format)
- Error tracking (console.error)
- Request/response logging

### Metrics
- Install count per component
- Upload success/failure rate
- API response times

### Health Checks
- `/health` endpoint
- Database connection check
- Blob storage availability

## Deployment

### Development
```bash
bun run dev  # Starts all services locally
```

### Production
```bash
# Build all apps
bun run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables
- `DATABASE_URL`: Neon Postgres connection string
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob access token
- `NEXT_PUBLIC_API_URL`: API base URL

## Testing Strategy

### Unit Tests
- AST parser functions
- Registry generator logic
- Validation schemas

### Integration Tests
- API endpoints
- Database operations
- Blob storage uploads

### E2E Tests
- Upload flow
- Browse flow
- Install flow (with shadcn CLI)

## Future Enhancements

### Short Term
- Component search
- Filtering by type
- Pagination

### Medium Term
- User authentication
- Component versioning
- Preview/demo

### Long Term
- Component marketplace
- Analytics dashboard
- Community ratings

---

**Key Principle**: All code analysis uses deterministic algorithms (AST parsing, pattern matching, graph traversal) - NO AI/ML models involved in the core functionality.
