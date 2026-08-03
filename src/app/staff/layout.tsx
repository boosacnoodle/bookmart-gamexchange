import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { requireUser } from "@/lib/auth";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["STAFF", "ADMIN"]);
  return (
    <div className="management-shell">
      <aside className="management-nav">
        <h2>Staff</h2>
        <p>{user.name}</p>
        <Link href="/staff">Dashboard</Link>
        <Link href="/staff/intake">Intake</Link>
        <Link href="/staff/inventory">Inventory</Link>
        <Link href="/staff/inventory/new">Create product</Link>
        <Link href="/staff/orders">Orders</Link>
        <Link href="/staff/locations">Locations</Link>
        {user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
        <LogoutButton />
      </aside>
      <section className="management-main">{children}</section>
    </div>
  );
}
