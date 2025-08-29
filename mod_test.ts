import { assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
import { load, loadEnvSync, loadSync, mod } from "./mod.ts";

// Test data
const testEnvContent = `# This is a comment
TEST_VAR=test_value
ANOTHER_VAR=another_value
QUOTED_VAR="quoted value"
EMPTY_VAR=
MULTILINE_VAR="line1
line2"`;

// Add tests for the new standard library compatible functions
Deno.test("loadSync() loads .env file successfully (std/dotenv compatibility)", () => {
  const testFile = ".env.test.loadsync";

  try {
    // Write test .env file
    Deno.writeTextFileSync(testFile, testEnvContent);

    // Test loading without export
    const config = loadSync({ envPath: testFile });

    // Check that config contains the expected variables
    assertEquals(config.TEST_VAR, "test_value");
    assertEquals(config.ANOTHER_VAR, "another_value");
    assertEquals(config.QUOTED_VAR, "quoted value");
    assertEquals(config.EMPTY_VAR, "");

    // Variables should not be in Deno.env yet
    assertEquals(Deno.env.get("TEST_VAR"), undefined);
  } finally {
    cleanup([testFile]);
  }
});

Deno.test("loadSync() exports variables when export=true (std/dotenv compatibility)", () => {
  const testFile = ".env.test.loadsync.export";

  try {
    // Write test .env file
    Deno.writeTextFileSync(testFile, testEnvContent);

    // Test loading with export
    const config = loadSync({ envPath: testFile, export: true });

    // Check that config contains the expected variables
    assertEquals(config.TEST_VAR, "test_value");
    assertEquals(config.ANOTHER_VAR, "another_value");
    assertEquals(config.QUOTED_VAR, "quoted value");
    assertEquals(config.EMPTY_VAR, "");

    // Variables should be in Deno.env
    assertEquals(Deno.env.get("TEST_VAR"), "test_value");
    assertEquals(Deno.env.get("ANOTHER_VAR"), "another_value");
    assertEquals(Deno.env.get("QUOTED_VAR"), "quoted value");
    assertEquals(Deno.env.get("EMPTY_VAR"), "");
  } finally {
    cleanup([testFile], [
      "TEST_VAR",
      "ANOTHER_VAR",
      "QUOTED_VAR",
      "EMPTY_VAR",
      "MULTILINE_VAR",
    ]);
  }
});

Deno.test("loadSync() doesn't override existing env vars (std/dotenv behavior)", () => {
  const testFile = ".env.test.loadsync.nooverride";
  const testVarName = "LOADSYNC_EXTERNAL_TEST_VAR";

  try {
    // Ensure clean state
    Deno.env.delete(testVarName);

    // Set an existing environment variable externally
    Deno.env.set(testVarName, "existing_value");

    // Write test .env file with conflicting variable
    Deno.writeTextFileSync(testFile, `${testVarName}=new_value`);

    // Load with export - should not override existing env var (std/dotenv behavior)
    const config = loadSync({ envPath: testFile, export: true });

    // Config should contain the value from the file
    assertEquals(config[testVarName], "new_value");

    // But env var should keep the original value (std/dotenv behavior)
    assertEquals(Deno.env.get(testVarName), "existing_value");
  } finally {
    cleanup([testFile], [testVarName]);
  }
});

Deno.test("loadSync() handles non-existent files gracefully", () => {
  // Should not throw for non-existent file and should return empty object
  const config1 = loadSync({ envPath: ".env.nonexistent" });
  assertEquals(config1, {});

  const config2 = loadSync({
    envPath: ".env.nonexistent",
    export: true,
  });
  assertEquals(config2, {});
});

Deno.test("load() loads .env file asynchronously (std/dotenv compatibility)", async () => {
  const testFile = ".env.test.load.async";

  try {
    // Write test .env file
    await Deno.writeTextFile(testFile, testEnvContent);

    // Test loading without export
    const config = await load({ envPath: testFile });

    // Check that config contains the expected variables
    assertEquals(config.TEST_VAR, "test_value");
    assertEquals(config.ANOTHER_VAR, "another_value");
    assertEquals(config.QUOTED_VAR, "quoted value");
    assertEquals(config.EMPTY_VAR, "");

    // Variables should not be in Deno.env yet
    assertEquals(Deno.env.get("TEST_VAR"), undefined);
  } finally {
    cleanup([testFile]);
  }
});

Deno.test("load() exports variables when export=true (std/dotenv compatibility)", async () => {
  const testFile = ".env.test.load.export";

  try {
    // Write test .env file
    await Deno.writeTextFile(testFile, testEnvContent);

    // Test loading with export
    const config = await load({ envPath: testFile, export: true });

    // Check that config contains the expected variables
    assertEquals(config.TEST_VAR, "test_value");
    assertEquals(config.ANOTHER_VAR, "another_value");
    assertEquals(config.QUOTED_VAR, "quoted value");
    assertEquals(config.EMPTY_VAR, "");

    // Variables should be in Deno.env
    assertEquals(Deno.env.get("TEST_VAR"), "test_value");
    assertEquals(Deno.env.get("ANOTHER_VAR"), "another_value");
    assertEquals(Deno.env.get("QUOTED_VAR"), "quoted value");
    assertEquals(Deno.env.get("EMPTY_VAR"), "");
  } finally {
    cleanup([testFile], [
      "TEST_VAR",
      "ANOTHER_VAR",
      "QUOTED_VAR",
      "EMPTY_VAR",
      "MULTILINE_VAR",
    ]);
  }
});

Deno.test("load() handles non-existent files gracefully", async () => {
  // Should not throw for non-existent file and should return empty object
  const config1 = await load({ envPath: ".env.nonexistent" });
  assertEquals(config1, {});

  const config2 = await load({
    envPath: ".env.nonexistent",
    export: true,
  });
  assertEquals(config2, {});
});

Deno.test("load() handles absolute file paths", async () => {
  const testFile = ".env.test.load.absolute";

  try {
    // Write test .env file
    await Deno.writeTextFile(
      testFile,
      "ABSOLUTE_ASYNC_VAR=absolute_async_value",
    );

    // Create absolute path
    const absolutePath = `${Deno.cwd()}/${testFile}`;

    // Load using absolute path
    const config = await load({ envPath: absolutePath, export: true });

    // Check that config contains the variable
    assertEquals(config.ABSOLUTE_ASYNC_VAR, "absolute_async_value");

    // Check that variable was loaded into environment
    assertEquals(Deno.env.get("ABSOLUTE_ASYNC_VAR"), "absolute_async_value");
  } finally {
    cleanup([testFile], ["ABSOLUTE_ASYNC_VAR"]);
  }
});

Deno.test("loadSync() handles absolute file paths", () => {
  const testFile = ".env.test.loadsync.absolute";

  try {
    // Write test .env file
    Deno.writeTextFileSync(testFile, "ABSOLUTE_VAR=absolute_value");

    // Create absolute path
    const absolutePath = `${Deno.cwd()}/${testFile}`;

    // Load using absolute path
    const config = loadSync({ envPath: absolutePath, export: true });

    // Check that config contains the variable
    assertEquals(config.ABSOLUTE_VAR, "absolute_value");

    // Check that variable was loaded into environment
    assertEquals(Deno.env.get("ABSOLUTE_VAR"), "absolute_value");
  } finally {
    cleanup([testFile], ["ABSOLUTE_VAR"]);
  }
});

Deno.test("loadSync() rethrows non-NotFound errors", () => {
  // Try to load a directory instead of a file to cause an error
  assertThrows(
    () => loadSync({ envPath: "." }),
    Error,
  );
});

Deno.test("load() rethrows non-NotFound errors", async () => {
  // Try to load a directory instead of a file to cause an error
  let errorThrown = false;
  try {
    await load({ envPath: "." });
  } catch (_error) {
    errorThrown = true;
    // Should be some kind of error (not NotFound)
  }
  assertEquals(errorThrown, true, "Should throw error for invalid file path");
});

Deno.test("loadEnvSync() loads .env and NODE_ENV specific files", () => {
  const envFile = ".env";
  const nodeEnvFile = ".env.development";

  // Mock console.log to capture output
  const originalLog = console.log;
  const logMessages: string[] = [];
  console.log = (message: string) => {
    logMessages.push(message);
  };

  try {
    // Set NODE_ENV
    Deno.env.set("NODE_ENV", "development");

    // Write test files
    Deno.writeTextFileSync(
      envFile,
      "BASE_VAR=base_value\nSHARED_VAR=base_shared",
    );
    Deno.writeTextFileSync(
      nodeEnvFile,
      "ENV_VAR=env_value\nSHARED_VAR=env_shared",
    );

    // Load environment
    loadEnvSync();

    // Check that variables were loaded
    assertEquals(Deno.env.get("BASE_VAR"), "base_value");
    assertEquals(Deno.env.get("ENV_VAR"), "env_value");
    // NODE_ENV file should override base .env
    assertEquals(Deno.env.get("SHARED_VAR"), "env_shared");

    // Check that hydration message was logged
    const hydratedMessage = logMessages.find((msg) =>
      msg.includes("Hydrated environment variables:")
    );
    assertStringIncludes(hydratedMessage || "", "BASE_VAR");
    assertStringIncludes(hydratedMessage || "", "ENV_VAR");
    assertStringIncludes(hydratedMessage || "", "SHARED_VAR");
  } finally {
    console.log = originalLog;
    Deno.env.delete("NODE_ENV");
    cleanup([envFile, nodeEnvFile], ["BASE_VAR", "ENV_VAR", "SHARED_VAR"]);
  }
});

Deno.test("loadEnvSync() loads only .env when NODE_ENV not set", () => {
  const envFile = ".env";

  // Mock console.log to capture output
  const originalLog = console.log;
  const logMessages: string[] = [];
  console.log = (message: string) => {
    logMessages.push(message);
  };

  try {
    // Ensure NODE_ENV is not set
    Deno.env.delete("NODE_ENV");

    // Write base .env file
    Deno.writeTextFileSync(envFile, "BASE_ONLY=base_only_value");

    // Load environment
    loadEnvSync();

    // Check that variable was loaded
    assertEquals(Deno.env.get("BASE_ONLY"), "base_only_value");

    // Check logging
    const hydratedMessage = logMessages.find((msg) =>
      msg.includes("Hydrated environment variables:")
    );
    assertStringIncludes(hydratedMessage || "", "BASE_ONLY");
  } finally {
    console.log = originalLog;
    cleanup([envFile], ["BASE_ONLY"]);
  }
});

Deno.test("mod() loads .env and NODE_ENV specific files asynchronously", async () => {
  const envFile = ".env";
  const nodeEnvFile = ".env.production";

  // Mock console.log to capture output
  const originalLog = console.log;
  const logMessages: string[] = [];
  console.log = (message: string) => {
    logMessages.push(message);
  };

  try {
    // Set NODE_ENV
    Deno.env.set("NODE_ENV", "production");

    // Write test files
    await Deno.writeTextFile(
      envFile,
      "ASYNC_BASE=async_base\nASYNC_SHARED=base_shared",
    );
    await Deno.writeTextFile(
      nodeEnvFile,
      "ASYNC_PROD=async_prod\nASYNC_SHARED=prod_shared",
    );

    // Load environment asynchronously
    await mod();

    // Check that variables were loaded
    assertEquals(Deno.env.get("ASYNC_BASE"), "async_base");
    assertEquals(Deno.env.get("ASYNC_PROD"), "async_prod");
    assertEquals(Deno.env.get("ASYNC_SHARED"), "prod_shared");

    // Check logging
    const hydratedMessage = logMessages.find((msg) =>
      msg.includes("Hydrated environment variables:")
    );
    assertStringIncludes(hydratedMessage || "", "ASYNC_BASE");
    assertStringIncludes(hydratedMessage || "", "ASYNC_PROD");
    assertStringIncludes(hydratedMessage || "", "ASYNC_SHARED");
  } finally {
    console.log = originalLog;
    Deno.env.delete("NODE_ENV");
    cleanup([envFile, nodeEnvFile], [
      "ASYNC_BASE",
      "ASYNC_PROD",
      "ASYNC_SHARED",
    ]);
  }
});

// Helper function to clean up test files and environment variables
function cleanup(files: string[] = [], envVars: string[] = []) {
  // Clean up test files
  for (const file of files) {
    try {
      Deno.removeSync(file);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  // Clean up environment variables
  for (const varName of envVars) {
    Deno.env.delete(varName);
  }
}

// Helper to clear the internal SET_VARIABLES tracking
// We need to force the module to "forget" about variables it set previously
function _clearSetVariables() {
  // The only way to clear the internal SET_VARIABLES is to reload the module
  // But since we can't do that easily in Deno tests, we'll work around it
  // by ensuring we don't have conflicting state between tests
}
