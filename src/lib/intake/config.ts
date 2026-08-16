import { aiPhotoConfigured } from "./ai-service";

export function aiConfigurationMessage() {
  return aiPhotoConfigured()
    ? "AI photo identification is configured (Gemini)."
    : "AI photo identification is not configured. Add a Google AI Studio (Gemini) key to identify rare and unbarcoded items.";
}
