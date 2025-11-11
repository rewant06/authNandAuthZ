const isProd = process.env.NODE_ENV === "production";

const log = (...args: any[]) => {
  if (!isProd) {
    console.log("[INFO]", ...args);
  }
};

const warn = (...args: any[]) => {
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
