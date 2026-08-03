import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const [staff, customers, settings, shelves, audit] = await Promise.all([
    db.user.count({ where: { role: { in: ["STAFF", "ADMIN"] } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.siteSetting.count(),
    db.curatedShelf.count(),
    db.auditLog.count()
  ]);
  return (
    <>
      <div className="management-head"><h1>Admin dashboard</h1></div>
      <div className="metric-grid">
        <Link href="/admin/users" className="metric"><span>{staff}</span><strong>Staff/admin accounts</strong></Link>
        <Link href="/admin/users" className="metric"><span>{customers}</span><strong>Customer accounts</strong></Link>
        <Link href="/admin/settings" className="metric"><span>{settings}</span><strong>Configurable settings</strong></Link>
        <Link href="/admin/curated-shelves" className="metric"><span>{shelves}</span><strong>Curated shelves</strong></Link>
        <Link href="/admin/audit" className="metric"><span>{audit}</span><strong>Audit entries</strong></Link>
      </div>
    </>
  );
}
