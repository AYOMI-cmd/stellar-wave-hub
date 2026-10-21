import { usersCol } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getSupabase } from "@/lib/firebase";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const roleNames = Object.keys(ROLES);

// GET /api/users/list — Search and paginate users for admin management.
export async function GET(request: Request) {
  const auth = getAuthUser(request);
  if (!auth || auth.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const search = (params.get("search") ?? "").trim().slice(0, 100).toLowerCase();
  const roleFilter = params.get("role") ?? "all";
  const requestedPage = Number(params.get("page") ?? "1");

  if (
    roleFilter !== "all" &&
    !Object.prototype.hasOwnProperty.call(ROLES, roleFilter)
  ) {
    return Response.json({ error: "Invalid role filter" }, { status: 400 });
  }
  if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) {
    return Response.json({ error: "Page must be a positive integer" }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabase()
      .from("users")
      .select("numericId, username, email, role, created_at")
      .order("numericId", { ascending: true });
    if (error) throw error;

    const matchingUsers = (data ?? [])
      .map((user) => {
        return {
          id: Number(user.numericId),
          username: String(user.username ?? ""),
          email: typeof user.email === "string" ? user.email : null,
          role: String(user.role ?? ""),
          created_at:
            typeof user.created_at === "string" ? user.created_at : null,
        };
      })
      .filter(
        (user) =>
          (roleFilter === "all" || user.role === roleFilter) &&
          (!search ||
            user.username.toLowerCase().includes(search) ||
            (user.email?.toLowerCase().includes(search) ?? false)),
      )
      .sort((a, b) => a.id - b.id);

    const total = matchingUsers.length;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(requestedPage, pageCount);
    const start = (page - 1) * PAGE_SIZE;

    return Response.json({
      users: matchingUsers.slice(start, start + PAGE_SIZE),
      total,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    console.error("List users error:", err);
    return Response.json({ error: "Failed to load users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = getAuthUser(request);
  if (!auth || auth.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { userId?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userId = Number(body?.userId);
  const role = body?.role;
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return Response.json({ error: "A valid user ID is required" }, { status: 400 });
  }
  if (typeof role !== "string" || !roleNames.includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }
  if (userId === auth.userId) {
    return Response.json(
      { error: "You cannot change your own role" },
      { status: 400 },
    );
  }

  try {
    const userRef = usersCol.ref.doc(String(userId));
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = userDoc.data()!;
    if (currentUser.role === role) {
      return Response.json({ success: true });
    }

    if (currentUser.role === "admin" && role !== "admin") {
      const admins = await usersCol.ref.where("role", "==", "admin").get();
      if (admins.docs.length <= 1) {
        return Response.json(
          { error: "The last administrator cannot be demoted" },
          { status: 409 },
        );
      }
    }

    await userRef.update({ role });
    return Response.json({ success: true });
  } catch (err) {
    console.error("Update user role error:", err);
    return Response.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
