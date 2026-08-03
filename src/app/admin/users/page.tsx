import { saveUserRole } from "@/app/management-actions";
import { db } from "@/lib/db";

export const metadata = { title: "Manage Users" };

export default async function UsersPage() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <div className="management-head"><h1>Users</h1></div>
      <div className="data-table">
        {users.map((user) => (
          <article className="data-row" key={user.id}>
            <div><strong>{user.name}</strong><p>{user.email}</p></div>
            <form action={saveUserRole} className="inline-form">
              <input type="hidden" name="id" value={user.id} />
              <select name="role" defaultValue={user.role}>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button className="button button-secondary" type="submit">Save role</button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
