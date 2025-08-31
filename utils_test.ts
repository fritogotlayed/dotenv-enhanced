import { assertEquals } from "@std/assert";
import { isEnvVarTruthy, isTruthyString } from "./utils.ts";

Deno.test("isTruthyString() returns true for truthy string values", () => {
  const truthyValues = [
    "true",
    "t",
    "1",
    "y",
    "yes",
    "on",
    "enabled",
    "active",
  ];

  truthyValues.forEach((value) => {
    assertEquals(
      isTruthyString(value),
      true,
      `Expected '${value}' to be truthy`,
    );
  });
});

Deno.test("isTruthyString() returns false for falsy string values", () => {
  const falsyValues = [
    "false",
    "f",
    "0",
    "n",
    "no",
    "off",
    "disabled",
    "inactive",
    "",
    "random",
  ];

  falsyValues.forEach((value) => {
    assertEquals(
      isTruthyString(value),
      false,
      `Expected '${value}' to be falsy`,
    );
  });
});

Deno.test("isTruthyString() is case insensitive", () => {
  assertEquals(isTruthyString("TRUE"), true);
  assertEquals(isTruthyString("True"), true);
  assertEquals(isTruthyString("YES"), true);
  assertEquals(isTruthyString("Yes"), true);
});

Deno.test("isEnvVarTruthy() returns true when environment variable has truthy value", () => {
  const testKey = "TEST_TRUTHY_VAR";

  try {
    // Test lowercase truthy values
    Deno.env.set(testKey, "true");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "yes");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "1");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "on");
    assertEquals(isEnvVarTruthy(testKey), true);
  } finally {
    Deno.env.delete(testKey);
  }
});

Deno.test("isEnvVarTruthy() returns true when environment variable has uppercase truthy value (converts to lowercase)", () => {
  const testKey = "TEST_TRUTHY_UPPER_VAR";

  try {
    Deno.env.set(testKey, "TRUE");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "YES");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "ON");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "ENABLED");
    assertEquals(isEnvVarTruthy(testKey), true);
  } finally {
    Deno.env.delete(testKey);
  }
});

Deno.test("isEnvVarTruthy() returns false when environment variable has falsy value", () => {
  const testKey = "TEST_FALSY_VAR";

  try {
    Deno.env.set(testKey, "false");
    assertEquals(isEnvVarTruthy(testKey), false);

    Deno.env.set(testKey, "no");
    assertEquals(isEnvVarTruthy(testKey), false);

    Deno.env.set(testKey, "0");
    assertEquals(isEnvVarTruthy(testKey), false);

    Deno.env.set(testKey, "off");
    assertEquals(isEnvVarTruthy(testKey), false);

    Deno.env.set(testKey, "random_value");
    assertEquals(isEnvVarTruthy(testKey), false);
  } finally {
    Deno.env.delete(testKey);
  }
});

Deno.test("isEnvVarTruthy() returns false when environment variable is empty", () => {
  const testKey = "TEST_EMPTY_VAR";

  try {
    Deno.env.set(testKey, "");
    assertEquals(isEnvVarTruthy(testKey), false);
  } finally {
    Deno.env.delete(testKey);
  }
});

Deno.test("isEnvVarTruthy() returns false when environment variable doesn't exist", () => {
  assertEquals(isEnvVarTruthy("NONEXISTENT_VAR"), false);
});

Deno.test("isEnvVarTruthy() handles mixed case values correctly", () => {
  const testKey = "TEST_MIXED_CASE_VAR";

  try {
    Deno.env.set(testKey, "True");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "YeS");
    assertEquals(isEnvVarTruthy(testKey), true);

    Deno.env.set(testKey, "EnAbLeD");
    assertEquals(isEnvVarTruthy(testKey), true);
  } finally {
    Deno.env.delete(testKey);
  }
});
