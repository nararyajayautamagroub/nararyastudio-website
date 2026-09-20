import { db } from "@/lib/db";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  ipHash?: string | null;
};

export async function writeAudit(input: AuditInput) {
  try {
    await db.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action.slice(0, 80),
        entity: input.entity.slice(0, 80),
        entityId: input.entityId ?? null,
        metadata: input.metadata as object | undefined,
        ipHash: input.ipHash ?? null
      }
    });
  } catch {
    // Audit failures must never break the primary business action.
  }
}
