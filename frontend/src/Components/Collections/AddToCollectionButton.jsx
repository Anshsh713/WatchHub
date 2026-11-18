import React, { useState } from "react";
import { Layers, Plus } from "lucide-react";
import { motion } from "framer-motion";
import AddToCollectionModal from "./AddToCollectionModal";

const MotionButton = motion.button;

export default function AddToCollectionButton({
  mediaItem, // { tmdbId, mediaType, title, posterPath, backdropPath, releaseDate, voteAverage, genres }
  variant = "button", // 'button' | 'icon' | 'compact'
  className = "",
  style = {},
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!mediaItem) return null;

  if (variant === "icon") {
    return (
      <>
        <MotionButton
          type="button"
          className={`btn-add-collection-icon ${className}`}
          style={style}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setModalOpen(true);
          }}
          title="Add to Collection"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Layers size={16} />
        </MotionButton>

        <AddToCollectionModal
          isOpen={modalOpen}
          mediaItems={[mediaItem]}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <MotionButton
        type="button"
        className={`btn-add-to-collection ${className}`}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setModalOpen(true);
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Layers size={16} />
        <span>Add to Collection</span>
      </MotionButton>

      <AddToCollectionModal
        isOpen={modalOpen}
        mediaItems={[mediaItem]}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
