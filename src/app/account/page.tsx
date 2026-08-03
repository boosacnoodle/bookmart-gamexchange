import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Customer Account" };

export default async function AccountPage() {
  const user = await requireUser(["CUSTOMER", "STAFF", "ADMIN"], "/account");
  return (
    <section className="page-hero">
      <div>
        <h1>Your account</h1>
        <p>Signed in as {user.name} ({user.role.toLowerCase()}). Customer order history, wanted requests and submissions attach to this account.</p>
        <div className="button-row">
          {user.role !== "CUSTOMER" ? <Link className="button button-primary" href={user.role === "ADMIN" ? "/admin" : "/staff"}>Open dashboard</Link> : null}
          <Link className="button button-secondary" href="/account/orders">Order tracking</Link>
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
