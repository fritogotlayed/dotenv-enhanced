/**
 * Auto-loader for standard @std/dotenv compatibility.
 *
 * This module provides auto-loading functionality that matches the behavior
 * of `@std/dotenv/load`. It automatically loads only the base `.env` file
 * when imported, maintaining exact compatibility with the standard library.
 *
 * **Note**: This module loads only `.env` and does not include the enhanced
 * multi-environment functionality. For enhanced behavior that loads both
 * `.env` and `.env.[NODE_ENV]`, use `@fritogotlayed/dotenv-enhanced/load-env` instead.
 *
 * ## Usage
 * ```ts
 * // Auto-load .env file (standard @std/dotenv behavior)
 * import "@fritogotlayed/dotenv-enhanced/load";
 *
 * // Environment variables from .env are now available
 * console.log(Deno.env.get("DATABASE_URL"));
 * ```
 *
 * ## Compatibility
 * This module is a drop-in replacement for:
 * ```ts
 * // Standard library equivalent
 * import "@std/dotenv/load";
 * ```
 *
 * ## Deno Deploy Compatibility
 * This module includes safety checks for Deno Deploy environments where
 * file system access may be limited.
 *
 * @example Basic auto-loading
 * ```ts
 * // Simply import to auto-load .env
 * import "@fritogotlayed/dotenv-enhanced/load";
 *
 * // Variables are immediately available
 * const apiKey = Deno.env.get("API_KEY");
 * const dbUrl = Deno.env.get("DATABASE_URL");
 * ```
 *
 * @module
 */
import { loadSync } from "./mod.ts";

if (!(Deno.readTextFileSync instanceof Function)) {
  // Avoid errors that occur in deno deploy: https://github.com/denoland/std/issues/1957
  // deno-lint-ignore no-console
  console.warn(
    `Deno.readTextFileSync is not a function: No .env data was read.`,
  );
} else {
  loadSync();
}
