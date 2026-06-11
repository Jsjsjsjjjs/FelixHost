// src/types/pterodactyl.ts

export interface PteroResponse<T> {
  object: string;
  data: T;
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export interface PteroAttributes<T> {
  object: string;
  attributes: T;
}

// ── Server (Application API) ─────────────────────────────────
export interface ServerAttributes {
  id: number;
  external_id: string | null;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  suspended: boolean;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads: string | null;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  user: number;
  node: number;
  allocation: number;
  nest: number;
  egg: number;
  container: {
    startup_command: string;
    image: string;
    installed: boolean;
    environment: Record<string, string | number | boolean>;
  };
  updated_at: string;
  created_at: string;
  status: "installing" | "install_failed" | "suspended" | "restoring_backup" | null;
}

// ── Server (Client API) ──────────────────────────────────────
export interface ClientServerAttributes {
  server_owner: boolean;
  identifier: string;
  internal_id: string;
  uuid: string;
  name: string;
  node: string;
  sftp_details: {
    ip: string;
    port: number;
  };
  description: string;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads: string | null;
    oom_disabled: boolean;
  };
  invocation: string;
  docker_image: string;
  egg_features: string[] | null;
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  status: string | null;
  is_suspended: boolean;
  is_installing: boolean;
  is_transferring: boolean;
}

// ── Resource Usage ───────────────────────────────────────────
export interface ServerResources {
  current_state: "running" | "offline" | "starting" | "stopping";
  is_suspended: boolean;
  resources: {
    memory_bytes: number;
    cpu_absolute: number;
    disk_bytes: number;
    network_rx_bytes: number;
    network_tx_bytes: number;
    uptime: number;
  };
}

// ── Files ────────────────────────────────────────────────────
export interface FileObject {
  name: string;
  mode: string;
  mode_bits: string;
  size: number;
  is_file: boolean;
  is_symlink: boolean;
  mimetype: string;
  created_at: string;
  modified_at: string;
}

// ── Backups ──────────────────────────────────────────────────
export interface BackupAttributes {
  uuid: string;
  is_successful: boolean;
  is_locked: boolean;
  name: string;
  ignored_files: string[];
  checksum: string | null;
  bytes: number;
  created_at: string;
  completed_at: string | null;
}

// ── Console Credentials ──────────────────────────────────────
export interface ConsoleCredentials {
  token: string;
  socket: string;
}

// ── Power Signal ─────────────────────────────────────────────
export type PowerSignal = "start" | "stop" | "restart" | "kill";

// ── Node ─────────────────────────────────────────────────────
export interface NodeAttributes {
  id: number;
  uuid: string;
  public: boolean;
  name: string;
  description: string;
  location_id: number;
  fqdn: string;
  scheme: string;
  behind_proxy: boolean;
  maintenance_mode: boolean;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  daemon_listen: number;
  daemon_sftp: number;
  daemon_base: string;
  created_at: string;
  updated_at: string;
}

// ── Allocation ───────────────────────────────────────────────
export interface AllocationAttributes {
  id: number;
  ip: string;
  alias: string | null;
  port: number;
  notes: string | null;
  is_default: boolean;
}
