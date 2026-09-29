import React, { useState } from "react";
import { Layers, Plus } from "lucide-react";
import AddToCollectionModal from "./AddToCollectionModal";

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
        <button
          type="button"
          className={`btn-add-collection-icon ${className}`}
          style={style}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setModalOpen(true);
          }}
          title="Add to Collection"
        >
          <Layers size={16} />
        </button>

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
      <button
        type="button"
        className={`btn-add-to-collection ${className}`}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setModalOpen(true);
        }}
      >
        <Layers size={16} />
        <span>Add to Collection</span>
      </button>

      <AddToCollectionModal
        isOpen={modalOpen}
        mediaItems={[mediaItem]}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
