/**
 * Enhanced auto-loader with multi-environment support.
 *
 * This module provides the enhanced auto-loading functionality unique to
 * dotenv-enhanced. When imported, it automatically loads environment variables
 * from both `.env` and `.env.[NODE_ENV]` files, providing intelligent layering
 * and override behavior.
 *
 * **This is the recommended import** for applications that want to leverage
 * the enhanced multi-environment functionality of dotenv-enhanced.
 *
 * ## File Loading Behavior
 * 1. Loads `.env` file (if it exists)
 * 2. If `NODE_ENV` is set, loads `.env.[NODE_ENV]` file (if it exists)
 * 3. Variables from `.env.[NODE_ENV]` override variables from `.env`
 * 4. System environment variables are never overridden
 *
 * ## Usage
 * ```ts
 * // Auto-load .env and .env.[NODE_ENV] files
 * import "@fritogotlayed/dotenv-enhanced/load-env";
 *
 * // All environment variables are now available
 * console.log(Deno.env.get("DATABASE_URL"));
 * console.log(Deno.env.get("API_KEY"));
 * ```
 *
 * ## Environment Examples
 * - `NODE_ENV=development` → loads `.env` + `.env.development`
 * - `NODE_ENV=production` → loads `.env` + `.env.production`
 * - `NODE_ENV=staging` → loads `.env` + `.env.staging`
 * - No `NODE_ENV` → loads only `.env`
 *
 * ## Console Output
 * This module logs all loaded environment variables to the console for
 * debugging purposes:
 * ```
 * Hydrated environment variables: DATABASE_URL, API_KEY, LOG_LEVEL
 * ```
 *
 * ## Deno Deploy Compatibility
 * This module includes safety checks for Deno Deploy environments where
 * file system access may be limited.
 *
 * @example Development environment
 * ```ts
 * // Set up for development
 * Deno.env.set("NODE_ENV", "development");
 *
 * // Auto-load development configuration
 * import "@fritogotlayed/dotenv-enhanced/load-env";
 *
 * // Access development-specific variables
 * const devDbUrl = Deno.env.get("DATABASE_URL"); // from .env.development
 * const debugMode = Deno.env.get("DEBUG"); // from .env.development
 * ```
 *
 * @example Production deployment
 * ```ts
 * // Production environment automatically set in deployment
 * // NODE_ENV=production
 *
 * // Auto-load production configuration
 * import "@fritogotlayed/dotenv-enhanced/load-env";
 *
 * // Access production-specific variables
 * const prodDbUrl = Deno.env.get("DATABASE_URL"); // from .env.production
 * const cacheEnabled = Deno.env.get("CACHE_ENABLED"); // from .env.production
 * ```
 *
 * @module
 */
import { loadEnvSync } from "./mod.ts";

if (!(Deno.readTextFileSync instanceof Function)) {
  // Avoid errors that occur in deno deploy: https://github.com/denoland/std/issues/1957
  // deno-lint-ignore no-console
  console.warn(
    `Deno.readTextFileSync is not a function: No .env data was read.`,
  );
} else {
  loadEnvSync();
}
