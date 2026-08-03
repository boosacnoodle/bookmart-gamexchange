import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export const metadata = { title: "Staff Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="section">
      <div className="login-panel">
        <h1>Staff login</h1>
        <p>Sign in to scan, list and manage shop inventory.</p>
        <LoginForm next={next} />
        <p><Link href="/account/forgot-password">Forgot password?</Link></p>
      </div>
    </section>
  );
}
