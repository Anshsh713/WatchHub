import React, { useState } from "react";
import { Share2, Copy, Check, X, Twitter, MessageCircle, Link2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CollectionShare({ isOpen, collection, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !collection) return null;

  const slug = collection.slug || collection._id;
  const shareUrl = `${window.location.origin}/collections/${slug}`;
  const shareTitle = `${collection.name} – WatchHub Collection`;
  const shareText = `Check out this media collection "${collection.name}" curated on WatchHub!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Web share failed:", err);
        }
      }
    } else {
      handleCopy();
    }
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  const redditShareUrl = `https://reddit.com/submit?url=${encodeURIComponent(
    shareUrl
  )}&title=${encodeURIComponent(shareTitle)}`;

  return (
    <div className="collection-modal-backdrop" onClick={onClose}>
      <motion.div
        className="collection-share-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="share-modal-header">
          <div className="share-title-wrap">
            <Share2 size={20} className="text-primary" />
            <h3>Share Collection</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="share-modal-content">
          <p className="share-collection-subtitle">
            Share <strong>"{collection.name}"</strong> with friends or across social media using a clean, human-readable link.
          </p>

          {/* Copy Link Input Bar */}
          <div className="share-link-bar">
            <Link2 size={16} className="share-link-icon" />
            <input type="text" readOnly value={shareUrl} />
            <button
              type="button"
              className={`btn-copy-link ${copied ? "copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Link
                </>
              )}
            </button>
          </div>

          {/* Share Shortcuts */}
          <div className="social-share-buttons-row">
            {navigator.share && (
              <button
                type="button"
                className="social-btn web-share"
                onClick={handleNativeShare}
              >
                <Share2 size={16} /> Device Share
              </button>
            )}

            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn twitter"
            >
              Share on X
            </a>

            <a
              href={redditShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn reddit"
            >
              Share on Reddit
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
