import React, { useState } from "react";
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Check, X, FolderTree } from "lucide-react";
import { motion } from "framer-motion";

export default function CollectionSections({
  sections = [],
  canEdit = false,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onReorderSections,
}) {
  const [newSectionName, setNewSectionName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    if (onCreateSection) {
      await onCreateSection(newSectionName.trim());
    }
    setNewSectionName("");
  };

  const startEdit = (sec) => {
    setEditingId(sec._id);
    setEditName(sec.name);
  };

  const handleSaveEdit = async (secId) => {
    if (editName.trim() && onUpdateSection) {
      await onUpdateSection(secId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleMove = async (index, direction) => {
    if (!onReorderSections) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const sectionOrders = newSections.map((s, idx) => ({
      sectionId: s._id,
      position: idx,
    }));

    await onReorderSections(sectionOrders);
  };

  if (!canEdit && sections.length === 0) return null;

  return (
    <div className="collection-sections-manager">
      <div className="sections-manager-header">
        <div className="header-left">
          <FolderTree size={18} />
          <h4>Collection Sections</h4>
          <span className="sections-count-pill">{sections.length}</span>
        </div>
      </div>

      {/* Sections List */}
      <div className="sections-pills-container">
        {sections.map((sec, idx) => (
          <div key={sec._id} className="section-manage-pill">
            {editingId === sec._id ? (
              <div className="section-inline-edit">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(sec._id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(sec._id)}
                  className="sec-action-icon save"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="sec-action-icon cancel"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <span className="sec-name">{sec.name}</span>
                {canEdit && (
                  <div className="sec-pill-actions">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        title="Move Left"
                        className="sec-action-icon"
                      >
                        <ChevronUp size={14} style={{ transform: "rotate(-90deg)" }} />
                      </button>
                    )}
                    {idx < sections.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        title="Move Right"
                        className="sec-action-icon"
                      >
                        <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(sec)}
                      title="Rename Section"
                      className="sec-action-icon edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSection && onDeleteSection(sec._id)}
                      title="Delete Section"
                      className="sec-action-icon delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add new section trigger */}
        {canEdit && (
          <form onSubmit={handleAdd} className="add-section-form">
            <input
              type="text"
              placeholder="+ New Section..."
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
            {newSectionName.trim() && (
              <button type="submit" className="add-section-submit">
                <Plus size={14} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
