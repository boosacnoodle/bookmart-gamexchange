"use client";

import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/actions";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const status = useFormStatus();
  return (
    <button className="button button-primary" disabled={status.pending} type="submit">
      {status.pending ? "Sending..." : children}
    </button>
  );
}

export function StatusMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p className={state.ok ? "form-status success" : "form-status error"} role="status">
      {state.message}
    </p>
  );
}
