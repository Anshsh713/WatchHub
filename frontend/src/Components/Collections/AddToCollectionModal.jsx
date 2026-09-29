import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Check,
  X,
  Lock,
  Globe,
  Users,
  FolderTree,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCollections } from "../../Context/CollectionContext";

export default function AddToCollectionModal({
  isOpen,
  mediaItems = [], // Array of { tmdbId, mediaType, title, posterPath, backdropPath, releaseDate, voteAverage, genres }
  onClose,
  onSuccess,
}) {
  const { status: authStatus } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const {
    myCollections,
    fetchMyCollections,
    addMediaToCollection,
    createCollection,
    actionLoading,
  } = useCollections();

  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notePrivate, setNotePrivate] = useState(false);

  // New collection inline creation toggle
  const [showCreateInline, setShowCreateInline] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionType, setNewCollectionType] = useState("mixed");
  const [newCollectionVisibility, setNewCollectionVisibility] = useState("public");

  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isOpen && authStatus) {
      fetchMyCollections({ limit: 100 });
    }
  }, [isOpen, authStatus]);

  useEffect(() => {
    if (myCollections.length > 0 && !selectedCollectionId) {
      setSelectedCollectionId(myCollections[0]._id);
    }
  }, [myCollections, selectedCollectionId]);

  if (!isOpen) return null;

  if (!authStatus) {
    return (
      <div className="collection-modal-backdrop" onClick={onClose}>
        <div className="collection-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="collection-modal-header">
            <h3>Login Required</h3>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <p style={{ color: "#aaa", margin: "16px 0" }}>
            You need to be signed in to add titles to your collections.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/authpage")}
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const selectedCol = myCollections.find((c) => c._id === selectedCollectionId);
  const sections = selectedCol?.sections || [];

  const handleCreateNewInline = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const created = await createCollection({
        name: newCollectionName.trim(),
        type: newCollectionType,
        visibility: newCollectionVisibility,
      });
      setSelectedCollectionId(created._id);
      setShowCreateInline(false);
      setNewCollectionName("");
    } catch (err) {
      setErrorMessage(err.message || "Failed to create collection");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!selectedCollectionId) {
      setErrorMessage("Please select a collection or create a new one");
      return;
    }

    try {
      const targetItems = Array.isArray(mediaItems) ? mediaItems : [mediaItems];
      let addedCount = 0;
      let alreadyInCount = 0;

      for (const item of targetItems) {
        try {
          await addMediaToCollection(selectedCollectionId, {
            tmdbId: item.tmdbId || item.id,
            mediaType: item.mediaType || item.media_type || "movie",
            title: item.title || item.name,
            posterPath: item.posterPath || item.poster_path || null,
            backdropPath: item.backdropPath || item.backdrop_path || null,
            releaseDate: item.releaseDate || item.release_date || item.first_air_date || null,
            voteAverage: item.voteAverage || item.vote_average || 0,
            genres: item.genres || [],
            sectionId: selectedSectionId || null,
            note: noteText.trim(),
            noteIsPrivate: notePrivate,
          });
          addedCount++;
        } catch (itemErr) {
          if (itemErr.message?.includes("already in this collection")) {
            alreadyInCount++;
          } else {
            throw itemErr;
          }
        }
      }

      if (addedCount > 0) {
        setStatusMessage(
          `Successfully added ${addedCount} title${addedCount > 1 ? "s" : ""} to collection!`
        );
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else if (alreadyInCount > 0) {
        setErrorMessage("All selected titles are already in this collection.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to add to collection");
    }
  };

  return (
    <div className="collection-modal-backdrop" onClick={onClose}>
      <motion.div
        className="collection-modal-container"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="collection-modal-header">
          <div className="modal-header-title">
            <Layers size={20} className="text-primary" />
            <h2>
              Add {mediaItems.length > 1 ? `${mediaItems.length} Titles` : "to Collection"}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorMessage && <div className="form-error-banner">{errorMessage}</div>}
        {statusMessage && <div className="form-success-banner">{statusMessage}</div>}

        {/* Selected Media Preview snippet */}
        {mediaItems.length === 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px",
              background: "#1c1c1c",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {(mediaItems[0].posterPath || mediaItems[0].poster_path) && (
              <img
                src={`https://image.tmdb.org/t/p/w185${
                  mediaItems[0].posterPath || mediaItems[0].poster_path
                }`}
                alt="Poster"
                style={{ width: "40px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
              />
            )}
            <div>
              <strong style={{ color: "#fff", fontSize: "0.95rem" }}>
                {mediaItems[0].title || mediaItems[0].name}
              </strong>
              <div style={{ color: "#888", fontSize: "0.8rem", textTransform: "capitalize" }}>
                {mediaItems[0].mediaType || mediaItems[0].media_type || "Movie"}
              </div>
            </div>
          </div>
        )}

        {/* Existing Collections Picker */}
        {!showCreateInline ? (
          <form onSubmit={handleAddSubmit} className="collection-form">
            <div className="form-group">
              <label>Select Target Collection</label>
              {myCollections.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
                  You don't have any collections yet. Create your first one below!
                </p>
              ) : (
                <select
                  value={selectedCollectionId}
                  onChange={(e) => {
                    setSelectedCollectionId(e.target.value);
                    setSelectedSectionId("");
                  }}
                  required
                >
                  {myCollections.map((col) => (
                    <option key={col._id} value={col._id}>
                      {col.name} ({col.type} • {col.stats?.totalItems || col.items?.length || 0} items)
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                className="btn-secondary-sm"
                style={{ marginTop: "8px", alignSelf: "flex-start" }}
                onClick={() => setShowCreateInline(true)}
              >
                <Plus size={14} /> Create New Collection
              </button>
            </div>

            {/* Optional Section Selector */}
            {sections.length > 0 && (
              <div className="form-group">
                <label>
                  <FolderTree size={14} /> Select Section (Optional)
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                >
                  <option value="">No Section (General / Unassigned)</option>
                  {sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Curator Note Input */}
            <div className="form-group">
              <label>
                <FileText size={14} /> Curator Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Watch this first in the saga, or notes for your viewers..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                maxLength={400}
              />
              <label className="checkbox-label" style={{ marginTop: "4px" }}>
                <input
                  type="checkbox"
                  checked={notePrivate}
                  onChange={(e) => setNotePrivate(e.target.checked)}
                />
                <span>Keep this note private (visible only to you and editors)</span>
              </label>
            </div>

            <div className="modal-actions-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={actionLoading || myCollections.length === 0}
              >
                {actionLoading ? "Adding..." : "Add to Collection"}
              </button>
            </div>
          </form>
        ) : (
          /* Inline New Collection Creation */
          <form onSubmit={handleCreateNewInline} className="collection-form">
            <h4>Quick Create Collection</h4>

            <div className="form-group">
              <label>Collection Name *</label>
              <input
                type="text"
                placeholder="e.g. Sci-Fi Favorites"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newCollectionType}
                  onChange={(e) => setNewCollectionType(e.target.value)}
                >
                  <option value="mixed">Mixed</option>
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                  <option value="anime">Anime</option>
                </select>
              </div>

              <div className="form-group">
                <label>Visibility</label>
                <select
                  value={newCollectionVisibility}
                  onChange={(e) => setNewCollectionVisibility(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowCreateInline(false)}
              >
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={actionLoading}>
                {actionLoading ? "Creating..." : "Create & Select"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
