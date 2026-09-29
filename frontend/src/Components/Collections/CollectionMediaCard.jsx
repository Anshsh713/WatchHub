import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Film,
  Tv,
  Sparkles,
  Star,
  Trash2,
  Edit3,
  Lock,
  ChevronUp,
  ChevronDown,
  FileText,
  GripVertical,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CollectionMediaCard({
  item,
  index,
  totalItems,
  sections = [],
  canEdit = false,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdateNote,
  onChangeSection,
}) {
  const [imageError, setImageError] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.note || "");
  const [notePrivate, setNotePrivate] = useState(item.noteIsPrivate || false);

  const {
    _id,
    tmdbId,
    mediaType = "movie",
    title,
    posterPath,
    releaseDate,
    voteAverage = 0,
    note,
    noteIsPrivate,
    sectionId,
  } = item;

  const year = releaseDate ? releaseDate.split("-")[0] : null;

  const handleSaveNote = async () => {
    if (onUpdateNote) {
      await onUpdateNote(_id, noteText, notePrivate);
    }
    setIsEditingNote(false);
  };

  const handleSectionSelect = (e) => {
    const newSecId = e.target.value === "none" ? null : e.target.value;
    if (onChangeSection) {
      onChangeSection(_id, newSecId);
    }
  };

  return (
    <div className="collection-media-item-card">
      <div className="item-poster-wrapper">
        <Link to={`/media/${mediaType}/${tmdbId}`}>
          {!imageError && posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w300${posterPath}`}
              alt={title}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="item-poster-fallback">
              <Film size={28} />
              <span>{title}</span>
            </div>
          )}
        </Link>

        {/* Media Type Badge */}
        <span className={`media-type-tag ${mediaType}`}>
          {mediaType === "movie" ? "Movie" : mediaType === "tv" ? "TV" : "Anime"}
        </span>

        {/* Rating if available */}
        {voteAverage > 0 && (
          <span className="media-tmdb-rating">
            <Star size={11} fill="#facc15" color="#facc15" />
            {voteAverage.toFixed(1)}
          </span>
        )}

        {/* Owner/Editor Controls Overlay */}
        {canEdit && (
          <div className="item-reorder-actions">
            {index > 0 && (
              <button
                type="button"
                className="reorder-btn"
                title="Move item up"
                onClick={() => onMoveUp && onMoveUp(index)}
              >
                <ChevronUp size={16} />
              </button>
            )}
            {index < totalItems - 1 && (
              <button
                type="button"
                className="reorder-btn"
                title="Move item down"
                onClick={() => onMoveDown && onMoveDown(index)}
              >
                <ChevronDown size={16} />
              </button>
            )}
            <button
              type="button"
              className="remove-item-btn"
              title="Remove from collection"
              onClick={() => onRemove && onRemove(_id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Info & Note */}
      <div className="item-details-body">
        <Link to={`/media/${mediaType}/${tmdbId}`} className="item-title-link">
          <h4>{title}</h4>
        </Link>

        <div className="item-meta-row">
          {year && <span className="item-year">{year}</span>}
          {canEdit && sections.length > 0 && (
            <select
              className="section-picker-select"
              value={sectionId || "none"}
              onChange={handleSectionSelect}
              title="Assign Section"
            >
              <option value="none">No Section</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Item Note Section */}
        {isEditingNote ? (
          <div className="item-note-edit-box">
            <textarea
              rows={2}
              placeholder="e.g. Watch before Endgame..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              maxLength={400}
            />
            <div className="note-edit-actions">
              <label className="note-private-toggle">
                <input
                  type="checkbox"
                  checked={notePrivate}
                  onChange={(e) => setNotePrivate(e.target.checked)}
                />
                <Lock size={12} />
                <span>Private Note</span>
              </label>
              <div className="note-btn-group">
                <button
                  type="button"
                  className="note-cancel-btn"
                  onClick={() => setIsEditingNote(false)}
                >
                  <X size={13} />
                </button>
                <button
                  type="button"
                  className="note-save-btn"
                  onClick={handleSaveNote}
                >
                  <Check size={13} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="item-note-display">
            {note ? (
              <div className="note-bubble">
                <FileText size={12} className="note-icon" />
                <span className="note-text">{note}</span>
                {noteIsPrivate && <Lock size={10} title="Private note visible only to editors" />}
                {canEdit && (
                  <button
                    type="button"
                    className="note-edit-icon"
                    onClick={() => setIsEditingNote(true)}
                    title="Edit Note"
                  >
                    <Edit3 size={11} />
                  </button>
                )}
              </div>
            ) : canEdit ? (
              <button
                type="button"
                className="add-note-btn"
                onClick={() => setIsEditingNote(true)}
              >
                + Add Curator Note
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
