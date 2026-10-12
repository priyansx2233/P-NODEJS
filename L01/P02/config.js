
const DEFAULTS = {
  server: { host: "localhost", port: 3000 },
  db: { url: "mongodb://localhost:27017", poolSize: 5 },
  logging: { level: "info", pretty: false },
};

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function mergeDefaults(defaults, overrides) {
  const result = { ...defaults };

  for (const key of Object.keys(overrides)) {
    const overrideValue = overrides[key];
    const defaultValue = defaults[key];

    if (overrideValue === undefined) {
      continue;
    }

    if (isPlainObject(overrideValue)) {
      const base = isPlainObject(defaultValue) ? defaultValue : {};

      result[key] = mergeDefaults(base, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  }

  return result;
}
function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        cloneValue(val),
      ])
    );
  }

  return value;
}
function buildConfig(userConfig = {}) {
  if (!isPlainObject(userConfig)) {
    throw new TypeError("userConfig must be a plain object");
  }
  const {
    server: userServer = {},
    db: userDb = {},
    logging: userLogging = {},
    ...extraConfig
  } = userConfig;
  const serverOverrides = userServer === null ? {} : userServer;
  const dbOverrides = userDb === null ? {} : userDb;
  const loggingOverrides = userLogging === null ? {} : userLogging;

  for (const [name, section] of Object.entries({
    server: serverOverrides,
    db: dbOverrides,
    logging: loggingOverrides,
  })) {
    if (!isPlainObject(section)) {
      throw new TypeError(
        `${name} must be a plain object, null, or undefined`
      );
    }
  }

  const {
    host = "localhost",
    port = 3000,
    ...extraServer
  } = serverOverrides;

  const {
    url = "mongodb://localhost:27017",
    poolSize = 5,
    ...extraDb
  } = dbOverrides;

  const {
    level = "info",
    pretty = false,
    ...extraLogging
  } = loggingOverrides;

  return {
    ...cloneValue(extraConfig),

    server: {
      host,
      port,
      ...extraServer,
    },

    db: {
      url,
      poolSize,
      ...extraDb,
    },

    logging: {
      level,
      pretty,
      ...extraLogging,
    },
  };
}

module.exports = { buildConfig, mergeDefaults };
