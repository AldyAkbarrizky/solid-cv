const requiredServerEnv = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "APP_URL",
  "IP_HASH_SALT",
  "GROQ_API_KEY",
  "GROQ_BASE_URL",
  "GROQ_MODEL",
  "DUITKU_ENV",
  "DUITKU_MERCHANT_CODE",
  "DUITKU_API_KEY",
  "DUITKU_SANDBOX_BASE_URL",
  "DUITKU_PRODUCTION_BASE_URL",
] as const;

export function validateServerEnv() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = requiredServerEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required production env variables: ${missing.join(", ")}`,
    );
  }

  if (process.env.APP_URL?.startsWith("http://localhost")) {
    throw new Error("APP_URL must not be localhost in production.");
  }

  if (process.env.BETTER_AUTH_URL?.startsWith("http://localhost")) {
    throw new Error("BETTER_AUTH_URL must not be localhost in production.");
  }

  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.startsWith("http://localhost")) {
    throw new Error(
      "NEXT_PUBLIC_BETTER_AUTH_URL must not be localhost in production.",
    );
  }

  const forbiddenPublicEnv = [
    "NEXT_PUBLIC_GROQ_API_KEY",
    "NEXT_PUBLIC_DEEPSEEK_API_KEY",
    "NEXT_PUBLIC_DUITKU_API_KEY",
    "NEXT_PUBLIC_DATABASE_URL",
    "NEXT_PUBLIC_GOOGLE_CLIENT_SECRET",
  ];

  const leaked = forbiddenPublicEnv.filter((key) => Boolean(process.env[key]));

  if (leaked.length > 0) {
    throw new Error(
      `Potential secret exposure. Remove these public env vars: ${leaked.join(
        ", ",
      )}`,
    );
  }
}
