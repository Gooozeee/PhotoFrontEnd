import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { setAccessToken, signOutAdmin, supabase, syncAccessToken } from "../../lib/supabase";
import { getAdminRedirectMessage, verifyAdminSession } from "./api";

export default function RequireAdminSession() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
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
      .catch(() => {
        if (!active) return;
        setSignedIn(false);
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

  if (!signedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
