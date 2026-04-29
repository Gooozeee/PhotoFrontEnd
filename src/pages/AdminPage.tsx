import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { setAccessToken, signInWithGitHub, signOutAdmin, supabase, syncAccessToken } from "../lib/supabase";
import { getAdminRedirectMessage, verifyAdminSession } from "./admin/api";

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectHomeMessage, setRedirectHomeMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function applySession(session: Awaited<ReturnType<typeof syncAccessToken>>) {
      if (!session) {
        if (!active) return;
        setSignedIn(false);
        setReady(true);
        return;
      }

      try {
        await verifyAdminSession();
        if (!active) return;
        setSignedIn(true);
        setError(null);
        setReady(true);
      } catch (err) {
        await signOutAdmin().catch(() => undefined);
        if (!active) return;
        setSignedIn(false);
        setReady(true);
        setRedirectHomeMessage(getAdminRedirectMessage(err));
      }
    }

    void syncAccessToken()
      .then(applySession)
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to initialize admin session");
        setReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAccessToken(session?.access_token ?? null);
      void applySession(session);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (redirectHomeMessage) {
    return <Navigate to="/" replace state={{ adminMessage: redirectHomeMessage }} />;
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#09090B] text-white pt-[140px] px-4 text-center">Checking admin session...</div>;
  }

  if (signedIn) {
    return <Navigate to="/admin/upload" replace />;
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white pt-[140px] px-4">
      <div className="max-w-xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-8 text-center space-y-4">
        <p className="uppercase tracking-[0.25em] text-xs text-white/40">Admin</p>
        <h1 className="text-3xl font-semibold">Sign in with GitHub</h1>
        <p className="text-white/60">Use the configured Supabase GitHub provider to access the asset manager.</p>
        {error ? <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
        <button
          onClick={() => void signInWithGitHub().catch((err) => setError(err instanceof Error ? err.message : "GitHub sign-in failed"))}
          className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-white/90"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
