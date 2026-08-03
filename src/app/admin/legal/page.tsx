import { saveLegalPage } from "@/app/management-actions";
import { db } from "@/lib/db";

export const metadata = { title: "Legal Pages" };

export default async function LegalAdminPage() {
  const pages = await db.legalPage.findMany({ orderBy: { slug: "asc" } });
  return (
    <>
      <div className="management-head"><h1>Legal pages</h1></div>
      <div className="data-table">
        {pages.map((page) => (
          <form action={saveLegalPage} className="management-form" key={page.slug}>
            <input type="hidden" name="slug" value={page.slug} />
            <label>Title<input name="title" defaultValue={page.title} /></label>
            <label>Body<textarea name="body" rows={5} defaultValue={page.body} /></label>
            <button className="button button-secondary" type="submit">Save {page.slug}</button>
          </form>
        ))}
      </div>
    </>
  );
}
