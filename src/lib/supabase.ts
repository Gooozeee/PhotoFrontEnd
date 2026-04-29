import { createClient } from "@supabase/supabase-js";

function resolveRequiredClientEnv(name: string, value: string | undefined) {
  const configuredValue = value?.trim();

  if (configuredValue) {
    return configuredValue;
  }

  if (import.meta.env.PROD) {
    throw new Error(`${name} is required for production builds.`);
  }

  return "";
}

const supabaseUrl = resolveRequiredClientEnv("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = resolveRequiredClientEnv("VITE_SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);
let accessToken: string | null = null;

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function syncAccessToken() {
  const { data } = await supabase.auth.getSession();
  setAccessToken(data.session?.access_token ?? null);
  return data.session;
}

export async function signInWithGitHub() {
  const redirectTo = `${window.location.origin}/admin`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
  setAccessToken(null);
}
