import React, { useState } from "react";
import { Users, UserPlus, Shield, Trash2, X, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCollections } from "../../Context/CollectionContext";

export default function CollectionCollaborators({
  isOpen,
  collection,
  isOwner = false,
  onClose,
}) {
  const {
    addCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    actionLoading,
  } = useCollections();

  const [usernameInput, setUsernameInput] = useState("");
  const [roleInput, setRoleInput] = useState("editor");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen || !collection) return null;

  const collaborators = collection.collaborators || [];
  const owner = collection.owner;

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!usernameInput.trim()) {
      setError("Please enter a username or email");
      return;
    }

    try {
      await addCollaborator(collection._id, usernameInput.trim(), roleInput);
      setUsernameInput("");
      setSuccessMsg("Collaborator added successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to add collaborator");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateCollaboratorRole(collection._id, userId, newRole);
    } catch (err) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleRemove = async (userId) => {
    try {
      await removeCollaborator(collection._id, userId);
    } catch (err) {
      setError(err.message || "Failed to remove collaborator");
    }
  };

  return (
    <div className="collection-modal-backdrop" onClick={onClose}>
      <motion.div
        className="collection-collaborators-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="collaborators-modal-header">
          <div className="modal-title-row">
            <Users size={20} className="text-primary" />
            <h3>Manage Collaborators</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}
        {successMsg && <div className="form-success-banner">{successMsg}</div>}

        {/* Invite Form (only owner) */}
        {isOwner && (
          <form onSubmit={handleAdd} className="invite-collaborator-form">
            <label>Invite Friend as Collaborator</label>
            <div className="invite-inputs-row">
              <input
                type="text"
                placeholder="Username or email address..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
              >
                <option value="editor">Editor (Can edit items & sections)</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>
              <button
                type="submit"
                className="btn-primary-sm"
                disabled={actionLoading}
              >
                <UserPlus size={14} /> Invite
              </button>
            </div>
          </form>
        )}

        {/* Collaborators List */}
        <div className="collaborators-list-wrap">
          <h4>Current Team & Permissions</h4>

          {/* Owner row */}
          <div className="collaborator-item-row owner">
            <div className="collab-user-info">
              <div className="collab-avatar">
                {owner?.User_Name ? owner.User_Name.charAt(0).toUpperCase() : "O"}
              </div>
              <div className="collab-name-details">
                <span className="collab-name">@{owner?.User_Name || "Owner"}</span>
                <span className="collab-subtext">Collection Creator</span>
              </div>
            </div>
            <span className="role-pill owner">Owner</span>
          </div>

          {/* Collaborators */}
          {collaborators.length === 0 ? (
            <p className="empty-collaborators-text">
              No additional collaborators added yet.
            </p>
          ) : (
            collaborators.map((c) => {
              const u = c.user;
              const userId = u?._id || u;
              const username = u?.User_Name || "User";

              return (
                <div key={userId} className="collaborator-item-row">
                  <div className="collab-user-info">
                    <div className="collab-avatar">{username.charAt(0).toUpperCase()}</div>
                    <div className="collab-name-details">
                      <span className="collab-name">@{username}</span>
                      <span className="collab-subtext">{c.role}</span>
                    </div>
                  </div>

                  <div className="collab-actions-group">
                    {isOwner ? (
                      <>
                        <select
                          className="role-selector"
                          value={c.role}
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          type="button"
                          className="btn-remove-collab"
                          onClick={() => handleRemove(userId)}
                          title="Remove collaborator"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="role-pill">{c.role}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
