/**
 * Environment variable stringification utilities.
 *
 * This module re-exports all stringification functionality from `@std/dotenv/stringify`,
 * providing a convenient way to access stringify functions without directly
 * importing from the standard library.
 *
 * This maintains full compatibility with `@std/dotenv` while allowing users
 * to import all dotenv functionality from a single package.
 *
 * ## Available Functions
 * - `stringify(object: Record<string, string>): string` - Convert object to dotenv format
 *
 * ## Usage
 * ```ts
 * import { stringify } from "@fritogotlayed/dotenv-enhanced/stringify";
 *
 * const config = {
 *   DATABASE_URL: "postgres://localhost/myapp",
 *   API_KEY: "secret123",
 *   DEBUG: "true",
 * };
 *
 * const envText = stringify(config);
 * console.log(envText);
 * // DATABASE_URL=postgres://localhost/myapp
 * // API_KEY=secret123
 * // DEBUG=true
 * ```
 *
 * ## Compatibility
 * This module is functionally identical to:
 * ```ts
 * import { stringify } from "@std/dotenv/stringify";
 * ```
 *
 * @example Generate .env file content
 * ```ts
 * import { stringify } from "@fritogotlayed/dotenv-enhanced/stringify";
 *
 * const config = {
 *   DATABASE_URL: "postgres://localhost/myapp",
 *   LOG_LEVEL: "info",
 *   PORT: "3000",
 * };
 *
 * const envContent = stringify(config);
 * await Deno.writeTextFile(".env", envContent);
 * ```
 *
 * @example Create environment-specific configuration
 * ```ts
 * import { stringify } from "@fritogotlayed/dotenv-enhanced/stringify";
 *
 * const developmentConfig = {
 *   DATABASE_URL: "postgres://localhost/myapp_dev",
 *   DEBUG: "true",
 *   LOG_LEVEL: "debug",
 * };
 *
 * const prodConfig = {
 *   DATABASE_URL: "postgres://prod-server/myapp",
 *   DEBUG: "false",
 *   LOG_LEVEL: "error",
 *   CACHE_ENABLED: "true",
 * };
 *
 * // Generate environment-specific files
 * await Deno.writeTextFile(".env.development", stringify(developmentConfig));
 * await Deno.writeTextFile(".env.production", stringify(prodConfig));
 * ```
 *
 * @module
 */

export * from "@std/dotenv/stringify";
