/**
 * Environment variable parsing utilities.
 *
 * This module re-exports all parsing functionality from `@std/dotenv/parse`,
 * providing a convenient way to access parsing functions without directly
 * importing from the standard library.
 *
 * This maintains full compatibility with `@std/dotenv` while allowing users
 * to import all dotenv functionality from a single package.
 *
 * ## Available Functions
 * - `parse(text: string): Record<string, string>` - Parse dotenv format text
 *
 * ## Usage
 * ```ts
 * import { parse } from "@fritogotlayed/dotenv-enhanced/parse";
 *
 * const envText = `
 * DATABASE_URL=postgres://localhost/myapp
 * API_KEY=secret123
 * DEBUG=true
 * `;
 *
 * const parsed = parse(envText);
 * console.log(parsed.DATABASE_URL); // "postgres://localhost/myapp"
 * console.log(parsed.API_KEY);      // "secret123"
 * console.log(parsed.DEBUG);        // "true"
 * ```
 *
 * ## Compatibility
 * This module is functionally identical to:
 * ```ts
 * import { parse } from "@std/dotenv/parse";
 * ```
 *
 * @example Parse environment file content
 * ```ts
 * import { parse } from "@fritogotlayed/dotenv-enhanced/parse";
 *
 * // Read and parse a .env file manually
 * const envContent = await Deno.readTextFile(".env.custom");
 * const config = parse(envContent);
 *
 * // Use the parsed configuration
 * console.log(config.DATABASE_URL);
 * ```
 *
 * @example Parse inline environment configuration
 * ```ts
 * import { parse } from "@fritogotlayed/dotenv-enhanced/parse";
 *
 * const config = parse(`
 * # Database configuration
 * DB_HOST=localhost
 * DB_PORT=5432
 * DB_NAME=myapp
 *
 * # API configuration
 * API_URL=https://api.example.com
 * API_TIMEOUT=5000
 * `);
 *
 * console.log(config.DB_HOST);    // "localhost"
 * console.log(config.API_URL);    // "https://api.example.com"
 * ```
 *
 * @module
 */

export * from "@std/dotenv/parse";
