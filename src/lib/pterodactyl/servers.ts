// src/lib/pterodactyl/servers.ts

import { appApi, clientApi } from "./client";
import type {
  PteroResponse,
  PteroAttributes,
  ServerAttributes,
  ClientServerAttributes,
  ServerResources,
  ConsoleCredentials,
  PowerSignal,
  FileObject,
  BackupAttributes,
} from "@/types/pterodactyl";

// ── Application API: Server list ─────────────────────────────

export async function listServers() {
  const res = await appApi.get<PteroResponse<PteroAttributes<ServerAttributes>[]>>(
    "servers?include=node,allocations&per_page=100"
  );
  return res.data.map((item) => item.attributes);
}

export async function getServer(id: number) {
  const res = await appApi.get<PteroAttributes<ServerAttributes>>(
    `servers/${id}?include=node,allocations`
  );
  return res.attributes;
}

// ── Client API: Resources ────────────────────────────────────

export async function getServerResources(identifier: string): Promise<ServerResources> {
  const res = await clientApi.get<{ attributes: ServerResources }>(
    `servers/${identifier}/resources`
  );
  return res.attributes;
}

// ── Client API: Power ────────────────────────────────────────

export async function sendPowerSignal(identifier: string, signal: PowerSignal) {
  await clientApi.post(`servers/${identifier}/power`, { signal });
}

// ── Client API: Console WebSocket credentials ─────────────────

export async function getConsoleCredentials(identifier: string): Promise<ConsoleCredentials> {
  const res = await clientApi.get<{ data: ConsoleCredentials }>(
    `servers/${identifier}/websocket`
  );
  return res.data;
}

// ── Client API: Files ────────────────────────────────────────

export async function listFiles(identifier: string, directory = "/") {
  const res = await clientApi.get<PteroResponse<PteroAttributes<FileObject>[]>>(
    `servers/${identifier}/files/list?directory=${encodeURIComponent(directory)}`
  );
  return res.data.map((item) => item.attributes);
}

export async function getFileContents(identifier: string, file: string) {
  // Returns raw text
  const url = `${process.env.PTERODACTYL_URL}/api/client/servers/${identifier}/files/contents?file=${encodeURIComponent(file)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.PTERODACTYL_CLIENT_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to read file: ${res.statusText}`);
  return res.text();
}

export async function writeFileContents(identifier: string, file: string, content: string) {
  const url = `${process.env.PTERODACTYL_URL}/api/client/servers/${identifier}/files/write?file=${encodeURIComponent(file)}`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PTERODACTYL_CLIENT_KEY}`,
      "Content-Type": "text/plain",
    },
    body: content,
  });
}

export async function renameFile(identifier: string, root: string, from: string, to: string) {
  await clientApi.put(`servers/${identifier}/files/rename`, {
    root,
    files: [{ from, to }],
  });
}

export async function deleteFiles(identifier: string, root: string, files: string[]) {
  await clientApi.post(`servers/${identifier}/files/delete`, { root, files });
}

export async function createFolder(identifier: string, root: string, name: string) {
  await clientApi.post(`servers/${identifier}/files/create-folder`, { root, name });
}

export async function getFileDownloadUrl(identifier: string, file: string) {
  const res = await clientApi.get<{ attributes: { url: string } }>(
    `servers/${identifier}/files/download?file=${encodeURIComponent(file)}`
  );
  return res.attributes.url;
}

export async function getFileUploadUrl(identifier: string) {
  const res = await clientApi.get<{ attributes: { url: string } }>(
    `servers/${identifier}/files/upload`
  );
  return res.attributes.url;
}

// ── Client API: Backups ──────────────────────────────────────

export async function listBackups(identifier: string) {
  const res = await clientApi.get<PteroResponse<PteroAttributes<BackupAttributes>[]>>(
    `servers/${identifier}/backups`
  );
  return res.data.map((item) => item.attributes);
}

export async function createBackup(identifier: string, name?: string) {
  const res = await clientApi.post<PteroAttributes<BackupAttributes>>(
    `servers/${identifier}/backups`,
    name ? { name } : {}
  );
  return res.attributes;
}

export async function deleteBackup(identifier: string, backupUuid: string) {
  await clientApi.delete(`servers/${identifier}/backups/${backupUuid}`);
}

export async function getBackupDownloadUrl(identifier: string, backupUuid: string) {
  const res = await clientApi.get<{ attributes: { url: string } }>(
    `servers/${identifier}/backups/${backupUuid}/download`
  );
  return res.attributes.url;
}
