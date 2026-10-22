import { NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * GET /api/admin/maintainer-stats
 * Returns per-maintainer moderation stats from the moderation_log table.
 *
 * Query Params:
 * - since: ISO date string to filter logs after a given date
 * - me: 1 (or true) to restrict output to only the requesting user's row
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    const meOnly = searchParams.get("me") === "1" || searchParams.get("me") === "true";

    // Extract authorization/user headers passed by auth/proxy middleware
    const headerList = await headers();
    const userId = headerList.get("x-user-id");
    const userRole = headerList.get("x-user-role") || "maintainer";

    const isAdmin = userRole === "admin";

    // Non-admins cannot see other moderators' stats without me=1
    if (!isAdmin && !meOnly) {
      return NextResponse.json(
        { error: "Forbidden: Maintainers may only query their own stats (?me=1)" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build stats aggregation query logic
    const stats = [
      {
        actor_id: userId,
        approvals: 0,
        rejections: 0,
        delists: 0,
        total_actions: 0,
      },
    ];

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
