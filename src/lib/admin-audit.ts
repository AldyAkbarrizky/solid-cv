import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";

type WriteAdminAuditLogParams = {
  adminUserId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export async function writeAdminAuditLog({
  adminUserId,
  adminEmail,
  action,
  entityType,
  entityId,
  metadata,
}: WriteAdminAuditLogParams) {
  await db.insert(adminAuditLogs).values({
    adminUserId,
    adminEmail,
    action,
    entityType,
    entityId,
    metadata: metadata ?? null,
  });
}
