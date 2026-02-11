import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Scroll() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX: scaleX,
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 100,
        height: 6,
        background: "linear-gradient(90deg, #0b090a, #e50914)",
        transformOrigin: "0%",
        zIndex: 9999,
      }}
    />
  );
}
