import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import bird1 from "../assets/Birds/Seagull Northern Ireland 2022.webp";
import rallySide2 from "../assets/Rally/Yellow Escort Pan Kirkistown 2023.webp";
import aachen from "../assets/Cities/Aachen Germany 2022.webp";
import koTao from "../assets/Landscapes/Koh Tao 2023.webp";
import SingleAlbumImage from "./SingleAlbumImage";

interface Props {
  title?: string;
}

const albums = [
  {
    imageSource: koTao,
    imageDescription: "Landscapes",
    albumName: "Landscapes",
    category: "nature",
  },
  {
    imageSource: aachen,
    imageDescription: "Cities Around the World",
    albumName: "Cities",
    category: "urban",
  },
  {
    imageSource: rallySide2,
    imageDescription: "Kirkistown Rally",
    albumName: "Rally",
    category: "automotive",
  },
  {
    imageSource: bird1,
    imageDescription: "Birds",
    albumName: "Birds",
    category: "nature",
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "nature", label: "Nature" },
  { id: "urban", label: "Urban" },
  { id: "automotive", label: "Automotive" },
];

const GalleryBanner = ({ title }: Props) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredAlbums =
    activeCategory === "all"
      ? albums
      : albums.filter((album) => album.category === activeCategory);

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

      <motion.p
        className="text-[clamp(1rem,2vw,1.25rem)] text-center mb-6 sm:mb-10 text-white/60 font-light"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Select an album to explore the collection
      </motion.p>

      {/* Category filters */}
      <motion.div
        className="flex justify-center gap-2 mb-6 sm:mb-12 flex-wrap"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-5 py-2 rounded-full text-sm tracking-wide transition-all duration-300 cursor-pointer ${
              activeCategory === category.id
                ? "bg-white text-black"
                : "bg-[#18181B] text-white/70 hover:bg-[#27272A] hover:text-white"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {category.label}
          </button>
        ))}
      </motion.div>

      {/* Album Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        layout
      >
        {filteredAlbums.map((album, index) => (
          <motion.div
            key={album.albumName}
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
              imageSource={album.imageSource}
              imageDescription={album.imageDescription}
              albumName={album.albumName}
              unitWidth={1}
              unitHeight={1}
              useUnitSizing={false}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default GalleryBanner;