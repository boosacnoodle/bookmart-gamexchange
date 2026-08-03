import Link from "next/link";

export const metadata = { title: "Unauthorized" };

export default function UnauthorizedPage() {
  return <section className="page-hero"><div><h1>Access denied</h1><p>Your account does not have permission to view that area.</p><Link className="button button-primary" href="/">Return home</Link></div></section>;
}
