"use client";

import { useActionState } from "react";
import { loginAction, requestPasswordReset, resetPassword, type AuthActionState } from "@/app/auth-actions";
import { StatusMessage, SubmitButton } from "./status-message";

const initial: AuthActionState = { ok: false, message: "" };

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="form-panel">
      <input type="hidden" name="next" value={next ?? ""} />
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <SubmitButton>Login</SubmitButton>
      <StatusMessage state={state} />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="form-panel">
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <SubmitButton>Send reset instructions</SubmitButton>
      <StatusMessage state={state} />
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPassword, initial);
  return (
    <form action={action} className="form-panel">
      <label>Email<input name="email" type="email" required /></label>
      <label>New password<input name="password" type="password" minLength={8} required /></label>
      <SubmitButton>Reset password</SubmitButton>
      <StatusMessage state={state} />
    </form>
  );
}
