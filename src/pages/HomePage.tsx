import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LightTablePoc from "./poc/LightTablePoc";
import { clearAdminRedirectMessage, peekAdminRedirectMessage } from "../lib/adminRedirectMessage";

const HomePage = () => {
  const location = useLocation();
  const persistedAdminMessage = peekAdminRedirectMessage();
  const adminMessage = (location.state as { adminMessage?: string } | null)?.adminMessage ?? persistedAdminMessage;

  useEffect(() => {
    if (persistedAdminMessage && !((location.state as { adminMessage?: string } | null)?.adminMessage)) {
      clearAdminRedirectMessage();
    }
  }, [location.state, persistedAdminMessage]);

  return (
    <>
      {adminMessage ? (
        <div className="relative z-40 px-4 pb-4 pt-[110px] sm:pt-[120px]">
          <div role="alert" className="mx-auto max-w-3xl border border-[#D9482B]/40 bg-[#D9482B]/10 p-4 text-sm text-[#F0D9D2]">
            {adminMessage}
          </div>
        </div>
      ) : null}
      <LightTablePoc standalone={false} />
    </>
  );
};

export default HomePage;
