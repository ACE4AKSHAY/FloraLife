export type GeminiApiKeySource = "personal" | "developer" | "missing";

const GEMINI_API_KEY_STORAGE_KEY = "floralife_gemini_api_key";

export const MISSING_GEMINI_API_KEY_MESSAGE =
  "Online AI needs a Gemini API key. Add your own personal key on this device, or build the app with VITE_GEMINI_API_KEY in .env.local.";

const normalizeGeminiApiKey = (value?: string | null) => value?.trim() ?? "";

export const getStoredGeminiApiKey = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return normalizeGeminiApiKey(window.localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY));
};

export const getDeveloperGeminiApiKey = () => normalizeGeminiApiKey(import.meta.env.VITE_GEMINI_API_KEY);

export const getActiveGeminiApiKey = () => getStoredGeminiApiKey() || getDeveloperGeminiApiKey();

export const getGeminiApiKeySource = (): GeminiApiKeySource => {
  if (getStoredGeminiApiKey()) {
    return "personal";
  }

  if (getDeveloperGeminiApiKey()) {
    return "developer";
  }

  return "missing";
};

export const hasGeminiApiKey = () => Boolean(getActiveGeminiApiKey());

export const saveStoredGeminiApiKey = (apiKey: string) => {
  const normalizedApiKey = normalizeGeminiApiKey(apiKey);

  if (typeof window === "undefined") {
    return;
  }

  if (!normalizedApiKey) {
    window.localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, normalizedApiKey);
};

export const clearStoredGeminiApiKey = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
};
