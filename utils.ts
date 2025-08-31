/**
 * @fileoverview Environment variable utility functions for common boolean patterns.
 * 
 * This module provides helper functions for working with environment variables that
 * represent boolean values using common string conventions.
 * 
 * @module utils
 * @version 0.1.1
 */

const TRUTHY_VALUES = ['true', 't', '1', 'y', 'yes', 'on', 'enabled', 'active'];

/**
 * Check if a string represents a "truthy" value using common conventions.
 * 
 * Recognizes the following truthy values (case-insensitive):
 * - `'true'`, `'t'`, `'1'`, `'y'`, `'yes'`, `'on'`, `'enabled'`, `'active'`
 * 
 * @param value - The string value to check
 * @returns `true` if the value represents a truthy value, `false` otherwise
 * 
 * @example
 * ```typescript
 * import { isTruthyString } from "@fritogotlayed/dotenv-enhanced/utils";
 * 
 * isTruthyString("true");    // true
 * isTruthyString("yes");     // true
 * isTruthyString("1");       // true
 * isTruthyString("enabled"); // true
 * isTruthyString("false");   // false
 * isTruthyString("no");      // false
 * ```
 */
export function isTruthyString(value: string): boolean {
  return TRUTHY_VALUES.includes(value.toLowerCase());
}

/**
 * Check if an environment variable represents a "truthy" value.
 * 
 * Gets the environment variable value and checks if it matches common
 * truthy string representations. If the environment variable doesn't exist,
 * it's treated as an empty string (falsy).
 * 
 * @param key - The name of the environment variable to check
 * @returns `true` if the environment variable represents a truthy value, `false` otherwise
 * 
 * @example
 * ```typescript
 * import { isEnvVarTruthy } from "@fritogotlayed/dotenv-enhanced/utils";
 * 
 * // Assuming DEBUG=true in .env
 * isEnvVarTruthy("DEBUG");        // true
 * isEnvVarTruthy("NONEXISTENT");  // false (empty string is falsy)
 * ```
 */
export function isEnvVarTruthy(key: string): boolean {
  const value = (Deno.env.get(key) ?? '').toLowerCase();
  return isTruthyString(value);
}
