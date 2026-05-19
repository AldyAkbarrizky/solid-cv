import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { validateServerEnv } from "@/lib/config/env";

validateServerEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const ws = typeof WebSocket === "undefined" ? undefined : WebSocket;

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  ws,
});
