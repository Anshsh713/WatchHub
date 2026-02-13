import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VideoLoader = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="video-loader-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        src="/Watchhub.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "40%",
          height: "40%",
          objectFit: "cover",
        }}
      />
    </motion.div>
  );
};

export default VideoLoader;
