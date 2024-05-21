import NavBar from "../components/NavBar";
import "../styles/SingleAlbumPageStyles.css";

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(window.location.search);

  const albumName = queryParameters.get("album")

  return (
    <body className="album-page-container">
      <NavBar />
      <h1>Album: {albumName}</h1>
    </body>
  );
};

export default SingleAlbumPage;
