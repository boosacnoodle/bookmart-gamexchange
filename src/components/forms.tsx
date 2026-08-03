"use client";

import { useActionState } from "react";
import { submitContact, submitSellTrade, submitWanted, type ActionState } from "@/app/actions";
import { StatusMessage, SubmitButton } from "./status-message";

const initialState: ActionState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action] = useActionState(submitContact, initialState);
  return (
    <form action={action} className="form-panel">
      <label>Name<input name="name" required /></label>
      <label>Email<input name="email" required type="email" /></label>
      <label>Message<textarea name="message" required rows={5} /></label>
      <SubmitButton>Send message</SubmitButton>
      <StatusMessage state={state} />
    </form>
  );
}

export function WantedForm() {
  const [state, action] = useActionState(submitWanted, initialState);
  return (
    <form action={action} className="form-panel">
      <label>What are you looking for?<input name="title" required /></label>
      <label>Email<input name="email" required type="email" /></label>
      <label>Notes<textarea name="notes" rows={5} /></label>
      <SubmitButton>Submit request</SubmitButton>
      <StatusMessage state={state} />
    </form>
  );
}

export function SellTradeForm() {
  const [state, action] = useActionState(submitSellTrade, initialState);
  return (
    <form action={action} className="form-panel">
      <label>Name<input name="name" required /></label>
      <label>Email<input name="email" required type="email" /></label>
      <label>
        Preference
        <select name="preference" required defaultValue="either">
          <option value="either">Cash or store credit</option>
          <option value="cash">Cash</option>
          <option value="store-credit">Store credit</option>
        </select>
      </label>
      <label>Describe your items<textarea name="notes" required rows={6} /></label>
      <SubmitButton>Submit for review</SubmitButton>
      <StatusMessage state={state} />
    </form>
  );
}
