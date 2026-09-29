import React, { useState, useEffect } from "react";
import { X, Layers, Globe, Users, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useCollections } from "../../Context/CollectionContext";

export default function EditCollectionModal({ isOpen, collection, onClose, onSuccess }) {
  const { updateCollection, actionLoading } = useCollections();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("mixed");
  const [visibility, setVisibility] = useState("public");
  const [coverImage, setCoverImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [allowCopy, setAllowCopy] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (collection) {
      setName(collection.name || "");
      setDescription(collection.description || "");
      setType(collection.type || "mixed");
      setVisibility(collection.visibility || "public");
      setCoverImage(collection.coverImage || "");
      setTags(collection.tags || []);
      setAllowCopy(collection.allowCopy !== false);
      setAllowComments(collection.allowComments !== false);
    }
  }, [collection]);

  if (!isOpen || !collection) return null;

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a name for the collection");
      return;
    }

    try {
      const updated = await updateCollection(collection._id, {
        name: name.trim(),
        description: description.trim(),
        type,
        visibility,
        coverImage: coverImage.trim() || null,
        tags,
        allowCopy,
        allowComments,
      });

      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update collection");
    }
  };

  return (
    <div className="collection-modal-backdrop" onClick={onClose}>
      <motion.div
        className="collection-modal-container"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
      >
        <div className="collection-modal-header">
          <div className="modal-header-title">
            <Layers size={22} className="text-primary" />
            <h2>Edit Collection Settings</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="collection-form">
          {error && <div className="form-error-banner">{error}</div>}

          {/* Name & Type */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Collection Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="form-group">
              <label>Collection Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="mixed">Mixed Media</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
                <option value="anime">Anime</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1500}
            />
          </div>

          {/* Visibility */}
          <div className="form-group">
            <label>Visibility & Privacy</label>
            <div className="visibility-options-grid">
              <label
                className={`visibility-radio-card ${visibility === "public" ? "active" : ""}`}
                onClick={() => setVisibility("public")}
              >
                <div className="radio-card-header">
                  <Globe size={18} />
                  <span>Public</span>
                </div>
                <p>Visible to everyone. Appears in search and discovery.</p>
              </label>

              <label
                className={`visibility-radio-card ${visibility === "friends" ? "active" : ""}`}
                onClick={() => setVisibility("friends")}
              >
                <div className="radio-card-header">
                  <Users size={18} />
                  <span>Friends</span>
                </div>
                <p>Visible only to approved friends.</p>
              </label>

              <label
                className={`visibility-radio-card ${visibility === "private" ? "active" : ""}`}
                onClick={() => setVisibility("private")}
              >
                <div className="radio-card-header">
                  <Lock size={18} />
                  <span>Private</span>
                </div>
                <p>Only visible to you and your collaborators.</p>
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label>Cover Image URL (Optional)</label>
            <input
              type="url"
              placeholder="Leave empty for poster collage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags (Press Enter or Comma)</label>
            <div className="tags-display-wrap">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="form-toggles-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowCopy}
                onChange={(e) => setAllowCopy(e.target.checked)}
              />
              <span>Allow other users to Copy/Remix</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
              />
              <span>Allow reviews and comments</span>
            </label>
          </div>

          {/* Actions */}
          <div className="modal-actions-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
