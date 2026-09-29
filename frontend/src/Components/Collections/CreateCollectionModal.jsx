import React, { useState } from "react";
import {
  X,
  Sparkles,
  Lock,
  Users,
  Globe,
  Film,
  Tv,
  HelpCircle,
  Plus,
  Layers,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollections } from "../../Context/CollectionContext";

const TEMPLATES = [
  {
    id: "blank",
    name: "Blank Collection",
    description: "Start completely from scratch with a custom setup.",
    type: "mixed",
    sections: [],
    tags: [],
  },
  {
    id: "marathon",
    name: "Movie Marathon",
    description: "Perfect for weekend binges or movie night schedules.",
    type: "movie",
    sections: ["Night 1", "Night 2", "Grand Finale"],
    tags: ["marathon", "weekend-watch", "movie-night"],
  },
  {
    id: "anime_order",
    name: "Anime Watch Order",
    description: "Organize series chronologically by seasons and movies.",
    type: "anime",
    sections: ["Season 1", "OVAs / Specials", "Season 2", "Canon Movies"],
    tags: ["anime", "watch-order", "chronology"],
  },
  {
    id: "tv_binge",
    name: "TV Series Watch Order",
    description: "Track interconnected series and universes.",
    type: "tv",
    sections: ["Main Series", "Spinoffs", "Prequels"],
    tags: ["tv", "binge", "series"],
  },
  {
    id: "franchise",
    name: "Franchise Collection",
    description: "Curate a cinematic universe like MCU, Star Wars, or DC.",
    type: "mixed",
    sections: ["Phase 1 / Era 1", "Phase 2 / Era 2", "Phase 3 / Modern"],
    tags: ["franchise", "cinematic-universe"],
  },
  {
    id: "best_of",
    name: "Best Of Collection",
    description: "Curate the all-time masterpieces in a genre or theme.",
    type: "mixed",
    sections: ["Tier 1: Masterpieces", "Tier 2: Essential Classics", "Honorable Mentions"],
    tags: ["best-of", "top-tier", "masterpiece"],
  },
  {
    id: "friends",
    name: "Watch With Friends",
    description: "A shared queue to watch together on movie nights.",
    type: "mixed",
    sections: ["Up Next", "Vote To Watch", "Already Watched"],
    tags: ["friends", "group-watch", "hangout"],
  },
  {
    id: "upcoming",
    name: "Upcoming Releases",
    description: "Keep track of anticipated movies and seasons.",
    type: "mixed",
    sections: ["High Priority", "Anticipated", "Rumored"],
    tags: ["upcoming", "releases", "watchlist"],
  },
  {
    id: "awards",
    name: "Award Winners",
    description: "Oscar, Emmy, or film festival winners.",
    type: "mixed",
    sections: ["Best Picture / Top Prize", "Best Director / Visuals", "Fan Favorites"],
    tags: ["awards", "oscar-winners", "critics-choice"],
  },
];

export default function CreateCollectionModal({ isOpen, onClose, onSuccess }) {
  const { createCollection, actionLoading } = useCollections();

  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("mixed");
  const [visibility, setVisibility] = useState("public");
  const [coverImage, setCoverImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [allowCopy, setAllowCopy] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [error, setError] = useState(null);

  const applyTemplate = (templateId) => {
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    setSelectedTemplate(templateId);
    if (tmpl.id !== "blank") {
      setName(tmpl.name);
      setDescription(tmpl.description);
    }
    setType(tmpl.type);
    setTags([...tmpl.tags]);
    setSections(tmpl.sections.map((secName, idx) => ({ name: secName, position: idx })));
  };

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

  const handleAddSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    setSections([
      ...sections,
      { name: newSectionName.trim(), position: sections.length },
    ]);
    setNewSectionName("");
  };

  const handleRemoveSection = (idx) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a name for the collection");
      return;
    }

    try {
      const created = await createCollection({
        name: name.trim(),
        description: description.trim(),
        type,
        visibility,
        coverImage: coverImage.trim() || null,
        tags,
        sections,
        allowCopy,
        allowComments,
      });

      if (onSuccess) {
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create collection");
    }
  };

  if (!isOpen) return null;

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
            <h2>Create New Collection</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Template Selector Carousel */}
        <div className="template-picker-section">
          <label className="input-section-label">
            <Sparkles size={14} /> Optional Template
          </label>
          <div className="template-pills-row">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                className={`template-pill ${selectedTemplate === tmpl.id ? "active" : ""}`}
                onClick={() => applyTemplate(tmpl.id)}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="collection-form">
          {error && <div className="form-error-banner">{error}</div>}

          {/* Name & Type */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Collection Name *</label>
              <input
                type="text"
                placeholder="e.g. Marvel MCU Chronological Order"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="form-group">
              <label>Collection Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="mixed">Mixed Media (Movies + TV + Anime)</option>
                <option value="movie">Movies Only</option>
                <option value="tv">TV Shows Only</option>
                <option value="anime">Anime Only</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Tell others what this collection is about, why it was created, or how to watch..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1500}
            />
          </div>

          {/* Visibility Selection */}
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
                <p>Discoverable in search, community rankings, and shareable via clean slug.</p>
              </label>

              <label
                className={`visibility-radio-card ${visibility === "friends" ? "active" : ""}`}
                onClick={() => setVisibility("friends")}
              >
                <div className="radio-card-header">
                  <Users size={18} />
                  <span>Friends Only</span>
                </div>
                <p>Visible exclusively to approved friends and invited collaborators.</p>
              </label>

              <label
                className={`visibility-radio-card ${visibility === "private" ? "active" : ""}`}
                onClick={() => setVisibility("private")}
              >
                <div className="radio-card-header">
                  <Lock size={18} />
                  <span>Private</span>
                </div>
                <p>Visible only to you and collaborators. Never appears in public discovery.</p>
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label>Cover Image URL (Optional)</label>
            <input
              type="url"
              placeholder="Leave empty to auto-generate a collage from collection posters"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
            <span className="input-hint">
              Tip: If left blank, a dynamic 4-poster collage is generated automatically!
            </span>
          </div>

          {/* Sections Config */}
          <div className="form-group">
            <label>Initial Sections (Optional)</label>
            <div className="sections-tag-list">
              {sections.map((sec, idx) => (
                <div key={idx} className="section-pill">
                  <span>{sec.name}</span>
                  <button type="button" onClick={() => handleRemoveSection(idx)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-section-inline">
              <input
                type="text"
                placeholder="e.g. Phase 1 or Season 1"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddSection(e);
                  }
                }}
              />
              <button type="button" onClick={handleAddSection} className="btn-secondary-sm">
                <Plus size={14} /> Add Section
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags (Press Enter or Comma to add)</label>
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
                placeholder="Add tags like marvel, horror, 2026..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {/* Permission Toggles */}
          <div className="form-toggles-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowCopy}
                onChange={(e) => setAllowCopy(e.target.checked)}
              />
              <span>Allow other users to Copy/Remix this collection</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
              />
              <span>Allow community reviews and discussions</span>
            </label>
          </div>

          {/* Actions */}
          <div className="modal-actions-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create Collection"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
