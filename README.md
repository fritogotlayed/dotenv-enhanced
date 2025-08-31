# dotenv-enhanced

[![JSR](https://jsr.io/badges/@fritogotlayed/dotenv-enhanced)](https://jsr.io/@fritogotlayed/dotenv-enhanced)
[![JSR Score](https://jsr.io/badges/@fritogotlayed/dotenv-enhanced/score)](https://jsr.io/@fritogotlayed/dotenv-enhanced)

A **drop-in replacement** for Deno's `@std/dotenv` with enhanced support for
multiple environment files. Perfect for developers working across multiple
environments (local, staging, production) without constantly modifying `.env`
files.

## Features

- 🔄 **Drop-in compatibility** - Works exactly like `@std/dotenv`
- 📁 **Multiple .env files** - Load `.env` + `.env.[NODE_ENV]` automatically
- 🎯 **Environment-specific overrides** - `.env.development` overrides `.env`
  values
- 🛡️ **System env protection** - Won't override existing environment variables
- 🚀 **Auto-loading** - Import once and forget
- 🔧 **Utility functions** - Built-in helpers for common environment variable
  patterns
- 📦 **Zero additional dependencies** - Just extends `@std/dotenv`

## Installation

```bash
# Import from JSR
deno add @fritogotlayed/dotenv-enhanced
```

## Quick Start

### Auto-loading (Recommended)

```typescript
// Load environment variables automatically on import
// This maintains the same API and functionality as @std/dotenv
// import "@fritogotlayed/dotenv-enhanced/load";
// OR
// Loads environment variables automatically on import using the .env then .env.[NODE_ENV] files as described below
import "@fritogotlayed/dotenv-enhanced/load-env";

// Environment variables are now available
console.log(Deno.env.get("DATABASE_URL"));
```

### Manual loading

```typescript
import { loadEnvSync } from "@fritogotlayed/dotenv-enhanced";

// Load base .env and environment-specific files
loadEnvSync();

console.log(Deno.env.get("DATABASE_URL"));
```

## How It Works

### File Loading Order

1. **Base file**: `.env` (always loaded if it exists)
2. **Environment file**: `.env.[NODE_ENV]` (loaded if `NODE_ENV` is set)

### Override Behavior

- Variables from `.env.[NODE_ENV]` **override** variables from `.env`
- System environment variables are **never overridden**
- Variables set by this package can be overridden by environment-specific files

### Example File Structure

```
your-project/
├── .env                 # Base configuration
├── .env.development     # Development overrides
├── .env.staging         # Staging overrides
├── .env.production      # Production overrides
└── app.ts
```

**`.env`**:

```env
DATABASE_URL=postgres://localhost/myapp
LOG_LEVEL=info
API_PORT=3000
```

**`.env.development`**:

```env
DATABASE_URL=postgres://localhost/myapp_dev
DEBUG=true
```

**`.env.production`**:

```env
DATABASE_URL=postgres://prod-server/myapp
LOG_LEVEL=error
CACHE_ENABLED=true
```

## Usage Examples

### Development Environment

```bash
export NODE_ENV=development
deno run --allow-env --allow-read app.ts
```

Loads: `.env` + `.env.development`

- `DATABASE_URL` = `postgres://localhost/myapp_dev` (overridden)
- `LOG_LEVEL` = `info` (from base)
- `DEBUG` = `true` (from development)

### Production Environment

```bash
export NODE_ENV=production
deno run --allow-env --allow-read app.ts
```

Loads: `.env` + `.env.production`

- `DATABASE_URL` = `postgres://prod-server/myapp` (overridden)
- `LOG_LEVEL` = `error` (overridden)
- `CACHE_ENABLED` = `true` (from production)

## API Reference

### Enhanced Functions (Unique to dotenv-enhanced)

#### `loadEnvSync()`

Synchronously load environment variables from multiple `.env` files.

```typescript
import { loadEnvSync } from "@fritogotlayed/dotenv-enhanced";

loadEnvSync();
```

#### `mod()`

Asynchronously load environment variables from multiple `.env` files.

```typescript
import { mod } from "@fritogotlayed/dotenv-enhanced";

await mod();
```

### Standard @std/dotenv Functions (Drop-in Compatibility)

#### `load(options?)`

```typescript
import { load } from "@fritogotlayed/dotenv-enhanced";

const config = await load({ envPath: ".env.custom", export: true });
```

#### `loadSync(options?)`

```typescript
import { loadSync } from "@fritogotlayed/dotenv-enhanced";

const config = loadSync({ envPath: ".env.custom", export: true });
```

All standard `@std/dotenv` functions and exports are available:

```typescript
// All of these work exactly like @std/dotenv
import { parse, stringify } from "@fritogotlayed/dotenv-enhanced";
```

### Utility Functions

#### `isTruthyString(value)`

Check if a string represents a "truthy" value using common conventions.

```typescript
import { isTruthyString } from "@fritogotlayed/dotenv-enhanced/utils";

isTruthyString("true"); // true
isTruthyString("yes"); // true
isTruthyString("1"); // true
isTruthyString("enabled"); // true
isTruthyString("false"); // false
isTruthyString("no"); // false
```

Recognizes: `'true'`, `'t'`, `'1'`, `'y'`, `'yes'`, `'on'`, `'enabled'`,
`'active'`

#### `isEnvVarTruthy(key)`

Check if an environment variable represents a "truthy" value.

Note: this helper reads from the environment at runtime and requires the Deno
`--allow-env` permission.

```typescript
import { isEnvVarTruthy } from "@fritogotlayed/dotenv-enhanced/utils";

// Assuming DEBUG=true in .env
isEnvVarTruthy("DEBUG"); // true
isEnvVarTruthy("NONEXISTENT"); // false (empty string is falsy)
```

## Use Cases

### Development Workflow

Perfect for developers who need to quickly switch between environments:

```typescript
// Auto-load based on NODE_ENV
import "@fritogotlayed/dotenv-enhanced/load";

// Works with any NODE_ENV value:
// NODE_ENV=local → loads .env + .env.local
// NODE_ENV=staging → loads .env + .env.staging
// NODE_ENV=integration → loads .env + .env.integration
```

### DevOps Deployment

Deploy environment-specific configs without changing base settings:

```dockerfile
# Dockerfile
COPY .env .env.production /app/
ENV NODE_ENV=production
# Your app will automatically load .env.production overrides
```

### Team Development

Share base config while allowing personal overrides:

```bash
# .gitignore
.env.local

# Team shares .env and .env.development
# Each developer can create .env.local for personal settings
```

## Migration from @std/dotenv

No changes needed! This is a drop-in replacement:

```typescript
// Before
import { load } from "@std/dotenv";

// After
import { load } from "@fritogotlayed/dotenv-enhanced";

// Everything works the same, plus you get enhanced functionality
```

## Permissions

Requires the same permissions as `@std/dotenv`:

```bash
deno run --allow-env --allow-read your-app.ts
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
