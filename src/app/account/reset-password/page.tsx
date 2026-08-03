import { ResetPasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return <section className="section"><div className="login-panel"><h1>Set a new password</h1><p>Demo reset updates the account password after validating the email.</p><ResetPasswordForm /></div></section>;
}
