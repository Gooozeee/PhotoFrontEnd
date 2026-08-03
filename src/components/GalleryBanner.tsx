import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SingleAlbumImage from "./SingleAlbumImage";
import { useImageGallery } from "../hooks/useImageGallery";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";

interface Props {
  title?: string;
}

const GalleryBanner = ({ title }: Props) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeAlbumId, setActiveAlbumId] = useState<string>("");
  const { albums, loading, error } = useImageGallery({ includePhotos: false });

  const filteredAlbums = activeAlbumId
    ? albums.filter((album) => album.id === activeAlbumId)
    : albums;

  return (
    <div className="bg-[#09090B] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-[60px]">
      <motion.h1
        className="text-[clamp(2rem,5vw,3rem)] font-semibold text-center mb-3 tracking-tight text-white"
        style={{ fontFamily: "'Archivo', sans-serif" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h1>

      {(loading && albums.length === 0) || (error && albums.length === 0) ? (
        <div role="status" className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white shadow-2xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Waking up</p>
          <p className="mt-4 text-[clamp(1.25rem,3vw,1.75rem)] font-medium">Waiting for the images to wake up...</p>
          <p className="mt-3 text-sm text-white/60">The gallery runs on a free plan and can take a moment after inactivity.</p>
        </div>
      ) : (
        <>

          <motion.p
            className="text-[clamp(1rem,2vw,1.25rem)] text-center mb-6 sm:mb-10 text-white/60 font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Select an album to explore the collection
          </motion.p>

          <motion.div
            className="flex justify-center gap-2 mb-6 sm:mb-12 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <button
              onClick={() => setActiveAlbumId("")}
              className={`px-5 py-2 rounded-full text-sm tracking-wide transition-all duration-300 cursor-pointer ${
                activeAlbumId === ""
                  ? "bg-white text-black"
                  : "bg-[#18181B] text-white/70 hover:bg-[#27272A] hover:text-white"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              All albums
            </button>
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setActiveAlbumId(album.id)}
                className={`px-5 py-2 rounded-full text-sm tracking-wide transition-all duration-300 cursor-pointer ${
                  activeAlbumId === album.id
                    ? "bg-white text-black"
                    : "bg-[#18181B] text-white/70 hover:bg-[#27272A] hover:text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {album.name}
              </button>
            ))}
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2"
            layout
          >
            {filteredAlbums.map((album, index) => (
              <motion.div
                key={album.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.4,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                }}
                viewport={{ once: true }}
                className="aspect-[3/2] w-full"
              >
                <SingleAlbumImage
                  imageSource={getPreviewImageUrl(album.coverThumbnailUrl) ?? album.coverUrl ?? ""}
                  imageDescription={album.name}
                  albumName={album.name}
                  unitWidth={1}
                  unitHeight={1}
                  useUnitSizing={false}
                />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default GalleryBanner;
