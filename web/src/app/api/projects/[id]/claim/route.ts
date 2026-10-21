import { projectsCol } from "@/lib/db";
import { getAuthUser, hasMinRole } from "@/lib/auth";
export const dynamic = "force-dynamic";

// A claim older than this is considered abandoned and can be taken over.
const CLAIM_TTL_MS = 30 * 60 * 1000;

function isClaimExpired(claimedAt: unknown): boolean {
  if (!claimedAt) return true;
  const claimedTime = new Date(String(claimedAt)).getTime();
  if (Number.isNaN(claimedTime)) return true;
  return Date.now() - claimedTime >= CLAIM_TTL_MS;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUser(request);
  if (!auth || !hasMinRole(auth.role, "maintainer")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const ref = projectsCol.ref.doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const project = doc.data()!;
  const claimedBy = project.claimed_by ?? null;

  // Already claimed by someone else and that claim has not gone stale.
  if (
    claimedBy !== null &&
    Number(claimedBy) !== auth.userId &&
    !isClaimExpired(project.claimed_at)
  ) {
    return Response.json(
      { error: "Project is already claimed by another maintainer" },
      { status: 409 }
    );
  }

  try {
    await ref.update({
      claimed_by: auth.userId,
      claimed_at: new Date().toISOString(),
    });
    const updated = await ref.get();
    const projectData = updated.data()!;
    return Response.json({ project: { ...projectData, id: projectData.numericId } });
  } catch (err) {
    console.error("Claim error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUser(request);
  if (!auth || !hasMinRole(auth.role, "maintainer")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const ref = projectsCol.ref.doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const project = doc.data()!;
  const claimedBy = project.claimed_by ?? null;

  if (claimedBy === null) {
    return Response.json({ error: "Project is not claimed" }, { status: 409 });
  }

  const isAdmin = auth.role === "admin";
  const isClaimer = Number(claimedBy) === auth.userId;

  if (!isAdmin && !isClaimer) {
    return Response.json(
      { error: "Only the maintainer who claimed this project or an admin can release it" },
      { status: 403 }
    );
  }

  try {
    await ref.update({ claimed_by: null, claimed_at: null });
    const updated = await ref.get();
    const projectData = updated.data()!;
    return Response.json({ project: { ...projectData, id: projectData.numericId } });
  } catch (err) {
    console.error("Release claim error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
