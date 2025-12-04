import "../styles/GalleryBannerStyles.css";
import { motion } from "framer-motion";
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
  },
  {
    imageSource: aachen,
    imageDescription: "Cities Around the World",
    albumName: "Cities",
  },
  {
    imageSource: rallySide2,
    imageDescription: "Kirkistown Rally",
    albumName: "Rally",
  },
  {
    imageSource: bird1,
    imageDescription: "Birds",
    albumName: "Birds",
  },
];

const GalleryBanner = ({ title }: Props) => {
  return (
    <div className="gallery-banner-container">
      <h1 className="title-text">{title}</h1>
      <h2 className="subheading">Choose a photo below to see the album</h2>
      <div className="masonry-grid">
        {albums.map((album) => (
          <motion.div
            key={album.albumName}
            className="gallery-item-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: albums.indexOf(album) * 0.08,
            }}
            viewport={{ once: true, amount: 0.3 }}
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
      </div>
    </div>
  );
};

export default GalleryBanner;
