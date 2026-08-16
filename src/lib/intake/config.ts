import { aiPhotoConfigured, aiPhotoProviderName } from "./ai-service";

export function aiConfigurationMessage() {
  if (!aiPhotoConfigured()) {
    return "AI photo identification is not configured. Add an OpenAI (OPENAI_API_KEY) or Google AI Studio (GEMINI_API_KEY) key to identify rare and unbarcoded items.";
  }
  return `AI photo identification is configured (${aiPhotoProviderName()}).`;
}
