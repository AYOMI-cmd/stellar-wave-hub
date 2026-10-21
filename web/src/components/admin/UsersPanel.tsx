"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ManagedUser } from "@/lib/admin-users";
import { roleChangeError } from "@/lib/admin-users";

type UserPage = { users: ManagedUser[]; pagination: { page: number; pages: number; total: number } };
export default function UsersPanel({ token, actorId }: { token: string; actorId: number }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<number, ManagedUser["role"]>>({});
  const qc = useQueryClient();
  const users = useQuery<UserPage>({
    queryKey: ["admin-users", actorId, search, role, page],
    gcTime: 0,
    queryFn: async () => {
      const params = new URLSearchParams({ search, role, page: String(page) });
      const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load users");
      return data;
    },
  });
  const change = useMutation({
    mutationFn: async ({ user, next }: { user: ManagedUser; next: ManagedUser["role"] }) => {
      const res = await fetch(`/api/admin/users/${user.id}/role`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ role: next }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to change role");
      return data.user as ManagedUser;
    },
    onSuccess: async (updated) => {
      setSelected((previous) => { const next = { ...previous }; delete next[updated.id]; return next; });
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
  return <section className="glass rounded-2xl p-6 mb-8" aria-labelledby="users-heading">
    <h2 id="users-heading" className="font-display font-semibold text-xl text-starlight mb-2">Users</h2>
    <p className="text-ash text-sm mb-4">Promote contributors to maintainers or return them to contributor access.</p>
    <div className="flex flex-wrap gap-3 mb-4">
      <label className="text-sm text-ash">Search users<input aria-label="Search users" className="block bg-stardust rounded-lg p-2 text-moonlight" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Username or email" /></label>
      <label className="text-sm text-ash">Role<select className="block bg-stardust rounded-lg p-2 text-moonlight" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}><option value="">All roles</option>{["contributor", "maintainer", "admin"].map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    {users.isPending ? <p role="status">Loading users…</p> : users.isError ? <div role="alert"><p>{users.error.message}</p><button className="btn-ghost mt-2" onClick={() => users.refetch()}>Retry</button></div> : <>
      {!users.data.users.length ? <p className="text-ash">No users match these filters.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-ash"><th scope="col" className="p-2">User</th><th scope="col" className="p-2">Role</th><th scope="col" className="p-2">Action</th></tr></thead><tbody>{users.data.users.map((user) => {
        const next = selected[user.id] ?? user.role;
        const blocked = roleChangeError(actorId, user, next, Number.MAX_SAFE_INTEGER);
        return <tr key={user.id} className="border-t border-dust/30"><td className="p-2"><p className="text-starlight">{user.username}</p><p className="text-ash">{user.email || "No email"}</p></td><td className="p-2"><select aria-label={`Role for ${user.username}`} disabled={change.isPending} className="bg-stardust rounded-lg p-2" value={next} onChange={(e) => setSelected({ ...selected, [user.id]: e.target.value as ManagedUser["role"] })}>{["contributor", "maintainer", "admin"].map((value) => <option key={value}>{value}</option>)}</select></td><td className="p-2"><button className="btn-ghost text-sm" disabled={change.isPending || next === user.role || !!blocked} title={blocked ?? undefined} onClick={() => change.mutate({ user, next })}>{change.isPending && change.variables.user.id === user.id ? "Saving…" : "Save role"}</button>{blocked && <p className="text-ash text-xs mt-1">{blocked}</p>}</td></tr>;
      })}</tbody></table></div>}
      <div className="flex items-center gap-3 mt-4"><button className="btn-ghost text-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-ash text-sm">Page {page} of {Math.max(1, users.data.pagination.pages)} · {users.data.pagination.total} users</span><button className="btn-ghost text-sm" disabled={page >= users.data.pagination.pages} onClick={() => setPage(page + 1)}>Next</button></div>
    </>}
    {change.isError && <p role="alert" className="text-supernova mt-3">{change.error.message}</p>}
    {change.isSuccess && <p role="status" className="text-ash mt-3">Role updated.</p>}
  </section>;
}
