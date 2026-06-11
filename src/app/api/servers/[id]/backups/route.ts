// src/app/api/servers/[id]/backups/route.ts

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  listBackups,
  createBackup,
  deleteBackup,
  getBackupDownloadUrl,
} from "@/lib/pterodactyl/servers";
import { ok, error, withAuth, withRole, badRequest, logActivity, getClientIp } from "@/lib/utils/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const uuid = searchParams.get("uuid");

    try {
      if (action === "download" && uuid) {
        const url = await getBackupDownloadUrl(id, uuid);
        return ok({ url });
      }
      const backups = await listBackups(id);
      return ok(backups);
    } catch (err) {
      console.error(`[backups:${id}] list error:`, err);
      return error("Failed to fetch backups");
    }
  });
}

const createSchema = z.object({ name: z.string().optional() });
const deleteSchema = z.object({ uuid: z.string().uuid() });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, "MODERATOR", async (user) => {
    const { id } = await params;
    let body: unknown;
    try { body = await req.json(); } catch { body = {}; }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request");

    try {
      const backup = await createBackup(id, parsed.data.name);
      await logActivity("BACKUP_CREATE", user.id, {
        serverId: id,
        extra: { backupName: backup.name },
        ipAddress: getClientIp(req),
      });
      return ok(backup);
    } catch (err) {
      console.error(`[backups:${id}] create error:`, err);
      return error("Failed to create backup");
    }
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, "ADMIN", async (user) => {
    const { id } = await params;
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) return badRequest("uuid required");

    try {
      await deleteBackup(id, parsed.data.uuid);
      await logActivity("BACKUP_DELETE", user.id, {
        serverId: id,
        extra: { uuid: parsed.data.uuid },
        ipAddress: getClientIp(req),
      });
      return ok({ deleted: true });
    } catch (err) {
      console.error(`[backups:${id}] delete error:`, err);
      return error("Failed to delete backup");
    }
  });
}
