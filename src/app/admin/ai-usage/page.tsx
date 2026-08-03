import { db } from "@/lib/db";

export const metadata = { title: "AI Usage" };

export default async function AiUsagePage() {
  const rows = await db.aiExtraction.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <>
      <div className="management-head"><h1>AI usage</h1></div>
      <p className="management-card">Restricted admin view. OpenAI is {process.env.OPENAI_API_KEY ? "configured" : "not configured"} and AI photo identification is {process.env.AI_PHOTO_IDENTIFICATION_ENABLED === "true" ? "enabled" : "disabled"}.</p>
      <div className="data-table">
        {rows.length ? rows.map((row) => (
          <article className="data-row" key={row.id}>
            <div><strong>{row.provider}</strong><p>{row.model} / {row.promptVersion} / {row.errorMessage ?? "validated"}</p></div>
            <span>{row.inputTokens ?? 0} in / {row.outputTokens ?? 0} out</span>
          </article>
        )) : <div className="empty-state"><h2>No AI usage recorded</h2><p>The disabled AI path does not make live API requests.</p></div>}
      </div>
    </>
  );
}
