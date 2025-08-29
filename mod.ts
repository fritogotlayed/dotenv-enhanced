/**
 * Parses and loads environment variables from a `.env` file into the current
 * process, with enhanced support for multiple .env files (.env + .env.[NODE_ENV]).
 *
 * This is an enhanced version of @std/dotenv that provides 1:1 compatibility
 * while adding support for environment-specific configuration files.
 */
import { parse } from "@std/dotenv";

// Re-export standard dotenv functionality for compatibility
export * from "@std/dotenv/parse";
export * from "@std/dotenv/stringify";

const SET_VARIABLES = new Set<string>();

/** Options for {@linkcode load} and {@linkcode loadSync}. */
export interface LoadOptions {
  /**
   * Optional path to `.env` file. To prevent the default value from being
   * used, set to `null`.
   *
   * @default {"./.env"}
   */
  envPath?: string | URL | null;

  /**
   * Set to `true` to export all `.env` variables to the current processes
   * environment. Variables are then accessible via `Deno.env.get(<key>)`.
   *
   * @default {false}
   */
  export?: boolean;
}

function parseFileSync(
  filepath: string | URL,
): Record<string, string> {
  try {
    return parse(Deno.readTextFileSync(filepath));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {};
    throw e;
  }
}

async function parseFile(
  filepath: string | URL,
): Promise<Record<string, string>> {
  try {
    return parse(await Deno.readTextFile(filepath));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {};
    throw e;
  }
}

/**
 * Works identically to {@linkcode load}, but synchronously.
 *
 * @example Usage
 * ```ts ignore
 * import { loadSync } from "@fritogotlayed/dotenv-enhanced";
 *
 * const conf = loadSync();
 * ```
 *
 * @param options Options for loading the environment variables.
 * @returns The parsed environment variables.
 */
export function loadSync(
  options: LoadOptions = {},
): Record<string, string> {
  const {
    envPath = ".env",
    export: _export = false,
  } = options;
  const conf = envPath ? parseFileSync(envPath) : {};

  if (_export) {
    for (const [key, value] of Object.entries(conf)) {
      if (Deno.env.get(key) !== undefined) continue;
      Deno.env.set(key, value);
    }
  }

  return conf;
}

/**
 * Load environment variables from a `.env` file. This function is fully
 * compatible with @std/dotenv while providing enhanced functionality.
 *
 * @example Basic usage
 * ```ts ignore
 * import { load } from "@fritogotlayed/dotenv-enhanced";
 *
 * console.log(await load({ export: true })); // { GREETING: "hello world" }
 * console.log(Deno.env.get("GREETING")); // hello world
 * ```
 *
 * @param options The options
 * @returns The parsed environment variables
 */
export async function load(
  options: LoadOptions = {},
): Promise<Record<string, string>> {
  const {
    envPath = ".env",
    export: _export = false,
  } = options;
  const conf = envPath ? await parseFile(envPath) : {};

  if (_export) {
    for (const [key, value] of Object.entries(conf)) {
      if (Deno.env.get(key) !== undefined) continue;
      Deno.env.set(key, value);
    }
  }

  return conf;
}

/**
 * **Enhanced function unique to dotenv-enhanced**: Load environment variables from multiple
 * `.env` files with intelligent layering and override capabilities.
 *
 * This function provides enhanced functionality beyond the standard `@std/dotenv` library by
 * supporting environment-specific configuration files. It loads variables from `.env` and
 * optionally from `.env.[NODE_ENV]` files, where environment-specific values can override
 * base configuration values.
 *
 * ## File Loading Order
 * 1. **Base file**: `.env` (always loaded if it exists)
 * 2. **Environment-specific file**: `.env.[NODE_ENV]` (loaded if `NODE_ENV` is set)
 *
 * ## Override Behavior
 * - Variables from `.env.[NODE_ENV]` **will override** variables from `.env`
 * - Variables already set in the process environment **will not be overridden**
 * - The function tracks which variables it sets to enable intelligent override logic
 *
 * ## Environment Detection
 * The environment is determined by the `NODE_ENV` environment variable:
 * - If `NODE_ENV` is not set: only `.env` is loaded
 * - If `NODE_ENV="development"`: loads `.env` then `.env.development`
 * - If `NODE_ENV="production"`: loads `.env` then `.env.production`
 *
 * ## Console Output
 * The function logs all hydrated environment variables to the console for debugging.
 *
 * ## Security Note
 * All loaded variables are automatically exported to `Deno.env` and accessible via
 * `Deno.env.get()`. Ensure your `.env` files don't contain sensitive data in
 * development environments where console output might be visible.
 *
 * @example Basic usage with NODE_ENV
 * ```ts
 * // Set environment
 * Deno.env.set("NODE_ENV", "development");
 *
 * // Create .env file
 * // .env:
 * // DATABASE_URL=postgres://localhost/myapp
 * // LOG_LEVEL=info
 *
 * // Create environment-specific file
 * // .env.development:
 * // DATABASE_URL=postgres://localhost/myapp_dev
 * // DEBUG=true
 *
 * import { loadEnvSync } from "@fritogotlayed/dotenv-enhanced";
 *
 * loadEnvSync();
 * // Console output: "Hydrated environment variables: DATABASE_URL, LOG_LEVEL, DEBUG"
 *
 * console.log(Deno.env.get("DATABASE_URL")); // "postgres://localhost/myapp_dev"
 * console.log(Deno.env.get("LOG_LEVEL"));    // "info"
 * console.log(Deno.env.get("DEBUG"));        // "true"
 * ```
 *
 * @example Usage without NODE_ENV
 * ```ts
 * // No NODE_ENV set - only .env is loaded
 * import { loadEnvSync } from "@fritogotlayed/dotenv-enhanced";
 *
 * loadEnvSync();
 * // Only loads .env file
 * ```
 *
 * @example Auto-loading on import
 * ```ts
 * // Auto-load on import (recommended pattern)
 * import "@fritogotlayed/dotenv-enhanced/load";
 *
 * // Environment variables are now available
 * console.log(Deno.env.get("DATABASE_URL"));
 * ```
 */
export const loadEnvSync = (): void => {
  const nodeEnv = Deno.env.get("NODE_ENV");

  // Load base .env file
  const baseConfig = loadSync({ export: true });
  for (const key of Object.keys(baseConfig)) {
    SET_VARIABLES.add(key);
  }

  // Load environment-specific file if NODE_ENV is set
  // This should override base values for enhanced behavior
  if (nodeEnv) {
    const envConfig = loadSync({ envPath: `.env.${nodeEnv}` });
    for (const [key, value] of Object.entries(envConfig)) {
      // Enhanced behavior: Allow environment-specific files to override
      if (SET_VARIABLES.has(key) || !Deno.env.get(key)) {
        Deno.env.set(key, value);
        SET_VARIABLES.add(key);
      }
    }
  }

  console.log(
    `Hydrated environment variables: ${Array.from(SET_VARIABLES).join(", ")}`,
  );
};

/**
 * **Enhanced function unique to dotenv-enhanced**: Asynchronously load environment variables
 * from multiple `.env` files with intelligent layering and override capabilities.
 *
 * This is the asynchronous version of {@linkcode loadEnvSync}. It provides the same enhanced
 * functionality as `loadEnvSync()` but uses async file I/O operations, making it suitable
 * for use in async contexts and potentially better performance for large configuration files.
 *
 * ## File Loading Order
 * 1. **Base file**: `.env` (always loaded if it exists)
 * 2. **Environment-specific file**: `.env.[NODE_ENV]` (loaded if `NODE_ENV` is set)
 *
 * ## Override Behavior
 * - Variables from `.env.[NODE_ENV]` **will override** variables from `.env`
 * - Variables already set in the process environment **will not be overridden**
 * - The function tracks which variables it sets to enable intelligent override logic
 *
 * ## Environment Detection
 * The environment is determined by the `NODE_ENV` environment variable:
 * - If `NODE_ENV` is not set: only `.env` is loaded
 * - If `NODE_ENV="development"`: loads `.env` then `.env.development`
 * - If `NODE_ENV="production"`: loads `.env` then `.env.production`
 *
 * ## Console Output
 * The function logs all hydrated environment variables to the console for debugging.
 *
 * ## When to Use
 * - **Use `mod()`** when you need async loading (e.g., in async initialization functions)
 * - **Use `loadEnvSync()`** for simpler synchronous loading or in auto-load scenarios
 *
 * ## Security Note
 * All loaded variables are automatically exported to `Deno.env` and accessible via
 * `Deno.env.get()`. Ensure your `.env` files don't contain sensitive data in
 * development environments where console output might be visible.
 *
 * @example Basic async usage
 * ```ts
 * // Set environment
 * Deno.env.set("NODE_ENV", "production");
 *
 * // Create .env file
 * // .env:
 * // DATABASE_URL=postgres://localhost/myapp
 * // LOG_LEVEL=info
 *
 * // Create environment-specific file
 * // .env.production:
 * // DATABASE_URL=postgres://prod-server/myapp
 * // LOG_LEVEL=warn
 * // CACHE_ENABLED=true
 *
 * import { mod } from "@fritogotlayed/dotenv-enhanced";
 *
 * await mod();
 * // Console output: "Hydrated environment variables: DATABASE_URL, LOG_LEVEL, CACHE_ENABLED"
 *
 * console.log(Deno.env.get("DATABASE_URL"));   // "postgres://prod-server/myapp"
 * console.log(Deno.env.get("LOG_LEVEL"));      // "warn"
 * console.log(Deno.env.get("CACHE_ENABLED"));  // "true"
 * ```
 *
 * @example Usage in async initialization
 * ```ts
 * import { mod } from "@fritogotlayed/dotenv-enhanced";
 *
 * async function initializeApp() {
 *   // Load configuration first
 *   await mod();
 *
 *   // Now use environment variables
 *   const dbUrl = Deno.env.get("DATABASE_URL");
 *   const port = Deno.env.get("PORT") || "3000";
 *
 *   // Start your app with loaded configuration
 *   startServer(dbUrl, parseInt(port));
 * }
 *
 * initializeApp();
 * ```
 *
 * @example Integration with application lifecycle
 * ```ts
 * import { mod } from "@fritogotlayed/dotenv-enhanced";
 *
 * class Application {
 *   async initialize() {
 *     await mod(); // Load all environment configuration
 *     this.setupDatabase();
 *     this.setupLogging();
 *   }
 *
 *   private setupDatabase() {
 *     const url = Deno.env.get("DATABASE_URL");
 *     // Initialize database with loaded URL
 *   }
 * }
 * ```
 *
 * @returns A Promise that resolves when all environment files have been loaded
 */
export const mod = async (): Promise<void> => {
  const nodeEnv = Deno.env.get("NODE_ENV");

  // Load base .env file
  const baseConfig = await load({ export: true });
  for (const key of Object.keys(baseConfig)) {
    SET_VARIABLES.add(key);
  }

  // Load environment-specific file if NODE_ENV is set
  // This should override base values for enhanced behavior
  if (nodeEnv) {
    const envConfig = await load({ envPath: `.env.${nodeEnv}` });
    for (const [key, value] of Object.entries(envConfig)) {
      // Enhanced behavior: Allow environment-specific files to override
      if (SET_VARIABLES.has(key) || !Deno.env.get(key)) {
        Deno.env.set(key, value);
        SET_VARIABLES.add(key);
      }
    }
  }

  console.log(
    `Hydrated environment variables: ${Array.from(SET_VARIABLES).join(", ")}`,
  );
};
