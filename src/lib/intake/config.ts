import { aiPhotoConfigured } from "./ai-service";

export function aiConfigurationMessage() {
  return aiPhotoConfigured()
    ? "AI photo identification is configured for server-side draft creation."
    : "AI photo identification is not currently configured. Add an OpenAI API key in Admin Settings to enable identification for rare and unbarcoded items.";
}
