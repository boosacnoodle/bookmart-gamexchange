import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { requireUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["ADMIN"], "/admin");
  return (
    <div className="management-shell">
      <aside className="management-nav admin-nav">
        <h2>Admin</h2>
        <p>{user.name}</p>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/settings">Settings</Link>
        <Link href="/admin/curated-shelves">Curated shelves</Link>
        <Link href="/admin/legal">Legal pages</Link>
        <Link href="/admin/ai-usage">AI usage</Link>
        <Link href="/admin/audit">Audit logs</Link>
        <Link href="/staff">Staff area</Link>
        <LogoutButton />
      </aside>
      <section className="management-main">{children}</section>
    </div>
  );
}
