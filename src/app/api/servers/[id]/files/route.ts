// src/app/api/servers/[id]/files/route.ts

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  listFiles,
  getFileContents,
  writeFileContents,
  renameFile,
  deleteFiles,
  createFolder,
  getFileDownloadUrl,
  getFileUploadUrl,
} from "@/lib/pterodactyl/servers";
import { ok, error, withAuth, withRole, badRequest, logActivity, getClientIp } from "@/lib/utils/api";

// GET  /api/servers/[id]/files?dir=/path
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (user) => {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const dir = searchParams.get("dir") ?? "/";
    const action = searchParams.get("action");

    try {
      if (action === "download") {
        const file = searchParams.get("file");
        if (!file) return badRequest("file param required");
        const url = await getFileDownloadUrl(id, file);
        return ok({ url });
      }
      if (action === "contents") {
        const file = searchParams.get("file");
        if (!file) return badRequest("file param required");
        const content = await getFileContents(id, file);
        await logActivity("FILE_VIEW", user.id, { serverId: id, ipAddress: getClientIp(req) });
        return ok({ content });
      }
      if (action === "upload_url") {
        const url = await getFileUploadUrl(id);
        return ok({ url });
      }

      const files = await listFiles(id, dir);
      await logActivity("FILE_VIEW", user.id, { serverId: id, ipAddress: getClientIp(req) });
      return ok(files);
    } catch (err) {
      console.error(`[files:${id}] error:`, err);
      return error("Failed to perform file operation");
    }
  });
}

// POST /api/servers/[id]/files
const writeSchema = z.object({
  action: z.enum(["write", "rename", "delete", "mkdir"]),
  file: z.string().optional(),
  content: z.string().optional(),
  root: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  files: z.array(z.string()).optional(),
  name: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, "MODERATOR", async (user) => {
    const { id } = await params;
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

    const parsed = writeSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request body");

    const data = parsed.data;
    const ip = getClientIp(req);

    try {
      switch (data.action) {
        case "write":
          if (!data.file || data.content === undefined) return badRequest("file and content required");
          await writeFileContents(id, data.file, data.content);
          break;
        case "rename":
          if (!data.root || !data.from || !data.to) return badRequest("root, from, to required");
          await renameFile(id, data.root, data.from, data.to);
          await logActivity("FILE_RENAME", user.id, { serverId: id, ipAddress: ip });
          break;
        case "delete":
          if (!data.root || !data.files?.length) return badRequest("root and files required");
          await deleteFiles(id, data.root, data.files);
          await logActivity("FILE_DELETE", user.id, { serverId: id, ipAddress: ip });
          break;
        case "mkdir":
          if (!data.root || !data.name) return badRequest("root and name required");
          await createFolder(id, data.root, data.name);
          break;
      }
      return ok({ action: data.action });
    } catch (err) {
      console.error(`[files:${id}] ${data.action} error:`, err);
      return error("File operation failed");
    }
  });
}
