const isProd = process.env.NODE_ENV === "production";

const log = (...args: unknown[]) => {
  if (!isProd) {
    console.log("[INFO]", ...args);
  }
};

const warn = (...args: unknown[]) => {
  console.warn("[WARN]", ...args);
};

const error = (message: string, error?: unknown) => {
  console.error("[ERROR]", message);
  if (error) {
    console.error(error);
  }
};

export const logger = {
  log,
  warn,
  error,
};
