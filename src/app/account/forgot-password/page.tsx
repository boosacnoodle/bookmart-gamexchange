import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return <section className="section"><div className="login-panel"><h1>Password reset</h1><p>Request a secure reset flow through the configured email provider.</p><ForgotPasswordForm /></div></section>;
}
