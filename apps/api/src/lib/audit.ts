import { prisma } from "./db.js";

export interface AuditEntry {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}

export function writeAuditLog(entry: AuditEntry): Promise<unknown> {
  return prisma.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      ...(entry.before !== undefined ? { before: entry.before as object } : {}),
      ...(entry.after !== undefined ? { after: entry.after as object } : {}),
      ip: entry.ip ?? null,
    },
  });
}
