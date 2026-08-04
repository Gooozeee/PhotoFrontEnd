import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import WelcomeImage from "../components/WelcomeImage";
import GalleryBanner from "../components/GalleryBanner";
import HighlightsStrip from "../components/HighlightsStrip";
import PhotoSearch from "../components/PhotoSearch";
import Footer from "../components/Footer";
import { clearAdminRedirectMessage, peekAdminRedirectMessage } from "../lib/adminRedirectMessage";

const HomePage = () => {
  const galleryBannerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const persistedAdminMessage = peekAdminRedirectMessage();
  const adminMessage = (location.state as { adminMessage?: string } | null)?.adminMessage ?? persistedAdminMessage;

  useEffect(() => {
    if (persistedAdminMessage && !((location.state as { adminMessage?: string } | null)?.adminMessage)) {
      clearAdminRedirectMessage();
    }
  }, [location.state, persistedAdminMessage]);

  useEffect(() => {
    if (!new URLSearchParams(location.search).get("q")) return;
    const frame = window.requestAnimationFrame(() => document.getElementById("collection-search")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [location.search]);

  const scrollToGallery = () => {
    galleryBannerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {adminMessage ? (
        <div className="relative z-10 px-4 pt-[110px] pb-4 sm:pt-[120px]">
          <div role="alert" className="mx-auto max-w-3xl rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            {adminMessage}
          </div>
        </div>
      ) : null}
      <WelcomeImage
        heading="Michal Guzy"
        subHeadingOne="Photographer, Software Engineer"
        onScrollIndicatorClick={scrollToGallery}
      />
      <HighlightsStrip />
      <PhotoSearch />
      <div ref={galleryBannerRef}>
        <GalleryBanner title="Image Gallery" />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
