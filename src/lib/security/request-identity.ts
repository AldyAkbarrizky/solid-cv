import { createHash } from "node:crypto";

type HeadersLike = {
  get(name: string): string | null;
};

function isHeadersLike(value: unknown): value is HeadersLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "get" in value &&
    typeof (value as { get?: unknown }).get === "function"
  );
}

function getHeaders(input: Request | Headers) {
  if (isHeadersLike(input)) {
    return input;
  }

  if ("headers" in input && isHeadersLike(input.headers)) {
    return input.headers;
  }

  return new Headers();
}

function getClientIdentity(input: Request | Headers) {
  const headers = getHeaders(input);

  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const userAgent = headers.get("user-agent") || "unknown-user-agent";

  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown-ip";

  return `${ip}|${userAgent}`;
}

export function getRequestIdentityHash(input: Request | Headers) {
  const salt = process.env.IP_HASH_SALT;

  if (!salt && process.env.NODE_ENV === "production") {
    throw new Error("IP_HASH_SALT wajib diisi di production.");
  }

  return createHash("sha256")
    .update(`${salt || "local-dev-salt"}:${getClientIdentity(input)}`)
    .digest("hex");
}
