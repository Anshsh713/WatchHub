import "./Home.css";
import Movies_Section from "./Movies_Section";
import HeroCarousel from "./HeroCarousel";
import { useMedia } from "../../Context/MediaContext";
import VideoLoader from "../Common/VideoLoader";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const { loading } = useMedia();

  return (
    <div className="Main-contain">
      <AnimatePresence>
        {loading && <VideoLoader />}
      </AnimatePresence>
      <HeroCarousel />
      <div className="Movie-Section">
        <Movies_Section />
      </div>
    </div>
  );
}
