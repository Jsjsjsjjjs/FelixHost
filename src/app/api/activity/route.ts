// src/app/api/activity/route.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, error, withAuth } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const perPage = parseInt(searchParams.get("perPage") ?? "50", 10);
    const serverId = searchParams.get("serverId");

    try {
      const where = serverId ? { serverId } : {};
      const [total, items] = await Promise.all([
        db.activityLog.count({ where }),
        db.activityLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        }),
      ]);

      return ok({
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      });
    } catch (err) {
      console.error("[activity] list error:", err);
      return error("Failed to fetch activity logs");
    }
  });
}
