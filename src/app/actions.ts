"use server";

import { z } from "zod";

const email = z.string().email("Enter a valid email address.");

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email,
  message: z.string().min(10, "Tell us a little more.")
});

const wantedSchema = z.object({
  title: z.string().min(2, "Enter what you are looking for."),
  email,
  notes: z.string().max(1000).optional()
});

const sellTradeSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email,
  preference: z.enum(["cash", "store-credit", "either"]),
  notes: z.string().min(10, "Describe the items you would like to bring in.")
});

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function submitContact(_: ActionState, formData: FormData): Promise<ActionState> {
  const result = contactSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { ok: false, message: result.error.issues[0]?.message ?? "Check the form." };
  return { ok: true, message: "Message received. In production this sends through the configured email provider." };
}

export async function submitWanted(_: ActionState, formData: FormData): Promise<ActionState> {
  const result = wantedSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { ok: false, message: result.error.issues[0]?.message ?? "Check the request." };
  return { ok: true, message: "Wanted request saved. Staff will review matches before any alert is sent." };
}

export async function submitSellTrade(_: ActionState, formData: FormData): Promise<ActionState> {
  const result = sellTradeSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { ok: false, message: result.error.issues[0]?.message ?? "Check the submission." };
  return { ok: true, message: "Submission received. Estimates are subject to physical inspection in the Talbot Street shop." };
}
