import React, { useState } from "react";
import { Flag, X, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useCollections } from "../../Context/CollectionContext";

const REASONS = [
  "Spam",
  "Harassment",
  "Copyright Abuse",
  "Sexual Content",
  "Hateful Content",
  "Misleading Content",
  "Other",
];

export default function CollectionReportModal({
  isOpen,
  collectionId,
  reviewId = null,
  onClose,
}) {
  const { reportCollection, reportReview } = useCollections();

  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (reviewId) {
        await reportReview(collectionId, reviewId, selectedReason, details);
      } else {
        await reportCollection(collectionId, selectedReason, details);
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collection-modal-backdrop" onClick={onClose}>
      <motion.div
        className="collection-report-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="report-modal-header">
          <div className="modal-title-row">
            <ShieldAlert size={20} className="text-red" />
            <h3>Report {reviewId ? "Review" : "Collection"}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="report-success-state">
            <h4>Thank You</h4>
            <p>Your report has been submitted to WatchHub moderation for review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-form">
            {error && <div className="form-error-banner">{error}</div>}

            <p className="report-description-text">
              Please choose a reason for reporting this {reviewId ? "review" : "collection"}. Our moderation team evaluates reports against community guidelines.
            </p>

            <div className="form-group">
              <label>Reason *</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Additional Information (Optional)</label>
              <textarea
                rows={3}
                placeholder="Provide any context that will help our moderators understand the issue..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={1000}
              />
            </div>

            <div className="modal-actions-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-danger-submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
