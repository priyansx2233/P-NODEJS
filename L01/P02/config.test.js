const assert = require("node:assert/strict");
const { buildConfig, mergeDefaults } = require("./config");

const DEFAULTS = {
  server: { host: "localhost", port: 3000 },
  db: { url: "mongodb://localhost:27017", poolSize: 5 },
  logging: { level: "info", pretty: false },
};

// Test 1: No argument returns complete defaults.
{
  assert.deepStrictEqual(buildConfig(), DEFAULTS);
}

// Test 2: Partial nested override.
{
  const result = buildConfig({
    server: { port: 8080 },
  });

  assert.deepStrictEqual(result.server, {
    host: "localhost",
    port: 8080,
  });

  assert.deepStrictEqual(result.db, DEFAULTS.db);
  assert.deepStrictEqual(result.logging, DEFAULTS.logging);
}

// Test 3: Preserve extra keys at both levels.
{
  const result = buildConfig({
    server: { timeout: 5000 },
    featureFlags: { beta: true },
  });

  assert.strictEqual(result.server.timeout, 5000);
  assert.deepStrictEqual(result.featureFlags, { beta: true });
}

// Test 4: Falsy values must survive.
{
  const result = buildConfig({
    server: { port: 0 },
    logging: { pretty: false },
  });

  assert.strictEqual(result.server.port, 0);
  assert.strictEqual(result.logging.pretty, false);
}

// Test 5: Undefined properties and sections use defaults.
{
  const result = buildConfig({
    server: undefined,
    db: { poolSize: undefined },
    logging: { level: undefined },
  });

  assert.deepStrictEqual(result, DEFAULTS);
}

// Test 6: Null sections use defaults.
{
  const result = buildConfig({
    server: null,
    db: null,
    logging: null,
  });

  assert.deepStrictEqual(result, DEFAULTS);
}

// Test 7: Invalid top-level inputs throw TypeError.
{
  for (const input of [null, [], 42, "invalid", true]) {
    assert.throws(() => buildConfig(input), TypeError);
  }
}

// Test 8: Invalid section types throw TypeError.
{
  for (const section of [[], 42, "invalid", true]) {
    assert.throws(
      () => buildConfig({ server: section }),
      TypeError
    );
  }
}

// Test 9: Input is not mutated.
{
  const input = {
    server: { port: 8080, timeout: 5000 },
    logging: { pretty: true },
  };

  const originalInput = structuredClone(input);

  buildConfig(input);

  assert.deepStrictEqual(input, originalInput);
}

// Test 10: Returned objects are independent of the input.
{
  const input = {
    server: { port: 8080 },
    featureFlags: { beta: true },
  };

  const result = buildConfig(input);

  result.server.port = 9000;
  result.featureFlags.beta = false;

  assert.strictEqual(input.server.port, 8080);
  assert.strictEqual(input.featureFlags.beta, true);
}

// Test 11: Returned objects do not share nested objects with defaults.
{
  const result = buildConfig();

  result.server.port = 9000;
  result.db.poolSize = 20;
  result.logging.pretty = true;

  assert.deepStrictEqual(DEFAULTS, {
    server: { host: "localhost", port: 3000 },
    db: { url: "mongodb://localhost:27017", poolSize: 5 },
    logging: { level: "info", pretty: false },
  });
}

// Test 12: Generic deep merge preserves nested defaults.
{
  const defaults = {
    server: { host: "localhost", port: 3000 },
    features: { beta: false, analytics: true },
  };

  const overrides = {
    server: { port: 8080 },
    features: { beta: true },
    custom: "enabled",
  };

  const result = mergeDefaults(defaults, overrides);

  assert.deepStrictEqual(result, {
    server: { host: "localhost", port: 8080 },
    features: { beta: true, analytics: true },
    custom: "enabled",
  });

  assert.deepStrictEqual(defaults.server, {
    host: "localhost",
    port: 3000,
  });
}

console.log("All 12 test cases passed.");