function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

export function resolveApiBaseUrl(envValue = import.meta.env.VITE_API_BASE_URL as string | undefined) {
  const configuredValue = envValue?.trim();

  if (configuredValue) {
    return normalizeBaseUrl(configuredValue);
  }

  if (import.meta.env.PROD) {
    throw new Error("VITE_API_BASE_URL is required for production builds.");
  }

  return "http://localhost:5000";
}
