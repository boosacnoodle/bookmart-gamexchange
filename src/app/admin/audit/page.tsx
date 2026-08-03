import { db } from "@/lib/db";

export const metadata = { title: "Audit Logs" };

export default async function AuditPage() {
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { user: true } });
  return (
    <>
      <div className="management-head"><h1>Audit logs</h1></div>
      <div className="data-table">
        {logs.map((log) => (
          <article className="data-row" key={log.id}>
            <div><strong>{log.action}</strong><p>{log.entity} / {log.entityId}</p><p>{log.user?.email ?? "System"} / {log.createdAt.toLocaleString("en-IE")}</p></div>
          </article>
        ))}
      </div>
    </>
  );
}
