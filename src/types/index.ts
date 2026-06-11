// src/types/index.ts

export * from "./pterodactyl";

export type { Role } from "@prisma/client";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface UserSession {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface DashboardStats {
  total: number;
  running: number;
  stopped: number;
  suspended: number;
  totalCpu: number;
  totalMemory: number;
  totalDisk: number;
}

export interface EnrichedServer {
  id: number;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  node: string;
  status: string;
  suspended: boolean;
  limits: {
    memory: number;
    cpu: number;
    disk: number;
  };
  resources?: {
    cpu: number;
    memory: number;
    disk: number;
    networkRx: number;
    networkTx: number;
    uptime: number;
    state: string;
  };
}

export interface ActivityEntry {
  id: string;
  action: string;
  serverId?: string;
  serverName?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}
