import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Share2,
  Copy,
  Edit,
  Trash2,
  Users,
  Flag,
  Star,
  Film,
  Tv,
  Sparkles,
  Layers,
  Lock,
  Globe,
  PieChart,
  MessageSquare,
  Activity,
  ArrowLeft,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useCollections } from "../../Context/CollectionContext";
import VideoLoader from "../Common/VideoLoader";

import CollectionVoting from "./CollectionVoting";
import CollectionMediaGrid from "./CollectionMediaGrid";
import CollectionSections from "./CollectionSections";
import CollectionReviews from "./CollectionReviews";
import CollectionStats from "./CollectionStats";
import CollectionShare from "./CollectionShare";
import CollectionCollaborators from "./CollectionCollaborators";
import CollectionActivity from "./CollectionActivity";
import CollectionReportModal from "./CollectionReportModal";
import EditCollectionModal from "./EditCollectionModal";

import "./CollectionDetails.css";
import "./Collections.css";

export default function CollectionDetails() {
  const { identifier, slug: routeSlug } = useParams();
  const lookupIdentifier = identifier || routeSlug;
  const navigate = useNavigate();

  const { status: authStatus, user: currentUser } = useSelector((state) => state.auth);

  const {
    selectedCollection,
    userInteractions,
    loading,
    error,
    fetchCollectionDetails,
    toggleLike,
    submitVote,
    submitRating,
    removeRating,
    toggleFollow,
    copyCollection,
    deleteCollection,
    removeMediaFromCollection,
    reorderMedia,
    updateMediaNote,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    fetchReviews,
    collectionReviews,
    reviewsTotal,
    addReview,
    updateReview,
    deleteReview,
    voteReview,
  } = useCollections();

  const [activeTab, setActiveTab] = useState("items"); // 'items' | 'reviews' | 'stats' | 'activity'
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);

  // Modals state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState(null);

  useEffect(() => {
    if (lookupIdentifier) {
      fetchCollectionDetails(lookupIdentifier).catch((err) => {
        console.error("Could not fetch collection:", err);
      });
      window.scrollTo(0, 0);
    }
  }, [lookupIdentifier]);

  useEffect(() => {
    if (selectedCollection?._id && activeTab === "reviews") {
      fetchReviews(selectedCollection._id);
    }
  }, [selectedCollection?._id, activeTab]);

  if (loading && !selectedCollection) {
    return (
      <div className="collection-loading-page">
        <VideoLoader />
      </div>
    );
  }

  if (error || !selectedCollection) {
    return (
      <div className="collection-error-page">
        <div className="error-box-card">
          <Lock size={48} className="text-red" />
          <h2>Collection Unavailable</h2>
          <p>{error || "The collection you are looking for does not exist or is private."}</p>
          <button className="btn-primary" onClick={() => navigate("/collections")}>
            <ArrowLeft size={16} /> Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const {
    _id,
    name,
    description,
    type = "mixed",
    visibility = "public",
    coverImage,
    items = [],
    sections = [],
    stats = {},
    engagement = {},
    averageRating = 0,
    voteScore = 0,
    owner = {},
    tags = [],
    allowCopy = true,
    allowComments = true,
    copiedFromUser,
  } = selectedCollection;

  const canEdit = userInteractions.isOwner || userInteractions.userRole === "editor";
  const isOwner = userInteractions.isOwner;

  // Backdrop: either custom cover, or backdropPath of first item with a backdrop
  const backdropItem = items.find((i) => i.backdropPath);
  const backdropUrl = backdropItem
    ? `https://image.tmdb.org/t/p/original${backdropItem.backdropPath}`
    : coverImage;

  // Collage Posters
  const collagePosters = items
    .filter((i) => i.posterPath)
    .slice(0, 4)
    .map((i) => `https://image.tmdb.org/t/p/w500${i.posterPath}`);

  // Handlers
  const handleLike = async () => {
    if (!authStatus) return navigate("/authpage");
    await toggleLike(_id);
  };

  const handleVote = async (voteType) => {
    if (!authStatus) return navigate("/authpage");
    await submitVote(_id, voteType);
  };

  const handleRatingPick = async (stars) => {
    if (!authStatus) return navigate("/authpage");
    await submitRating(_id, stars);
    setShowRatingModal(false);
  };

  const handleFollow = async () => {
    if (!authStatus) return navigate("/authpage");
    await toggleFollow(_id);
  };

  const handleCopy = async () => {
    if (!authStatus) return navigate("/authpage");
    try {
      const cloned = await copyCollection(_id);
      navigate(`/collections/${cloned.slug || cloned._id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this collection?")) {
      await deleteCollection(_id);
      navigate("/collections");
    }
  };

  return (
    <div className="collection-details-page">
      {/* Hero Header Banner */}
      <section className="collection-hero-banner">
        {backdropUrl && (
          <img src={backdropUrl} alt="Backdrop" className="hero-backdrop-image" />
        )}
        <div className="hero-backdrop-gradient" />

        <div className="collection-hero-content">
          {/* Cover / Poster Collage */}
          <div className="hero-cover-container">
            {coverImage ? (
              <img src={coverImage} alt={name} className="hero-single-cover-img" />
            ) : collagePosters.length >= 2 ? (
              <div className="hero-poster-collage">
                {collagePosters.map((url, i) => (
                  <div key={i} className="hero-collage-cell">
                    <img src={url} alt={`Collage ${i}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="hero-cover-placeholder">
                <Layers size={48} />
                <span>{name}</span>
              </div>
            )}
          </div>

          {/* Meta & Info */}
          <div className="hero-meta-container">
            <div className="hero-badges-row">
              <span className={`collection-type-pill ${type}`}>{type}</span>

              <span className="collection-visibility-pill">
                {visibility === "private" && (
                  <>
                    <Lock size={12} /> Private
                  </>
                )}
                {visibility === "friends" && (
                  <>
                    <Users size={12} /> Friends Only
                  </>
                )}
                {visibility === "public" && (
                  <>
                    <Globe size={12} /> Public
                  </>
                )}
              </span>

              {copiedFromUser && (
                <span className="remix-attribution-pill">
                  <Copy size={12} /> Remixed from @{copiedFromUser.User_Name || "curator"}
                </span>
              )}
            </div>

            <h1 className="hero-title">{name}</h1>

            <div className="hero-creator-row">
              <span>Curated by</span>
              <span className="creator-link">@{owner?.User_Name || "Curator"}</span>
              <span>•</span>
              <span>{stats.totalItems || items.length} titles</span>
            </div>

            {description && <p className="hero-description">{description}</p>}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="hero-tags-row">
                {tags.map((tag) => (
                  <span key={tag} className="hero-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Overview Pill Bar */}
            <div className="hero-stats-overview">
              <div className="stat-chip">
                <Film size={15} />
                <span>{stats.movieCount || 0} Movies</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-chip">
                <Tv size={15} />
                <span>{stats.tvCount || 0} TV</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-chip">
                <Sparkles size={15} />
                <span>{stats.animeCount || 0} Anime</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-chip rating" title="WatchHub 1-5 Star Community Rating">
                <Star size={15} fill="#facc15" color="#facc15" />
                <span>{averageRating > 0 ? averageRating.toFixed(1) : "—"} / 5</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-chip votes" title="Good/Bad Community Vote Ratio">
                <span>
                  {(engagement.upvotes || 0) + (engagement.downvotes || 0) > 0
                    ? `${voteScore}% Good`
                    : "No votes yet"}
                </span>
              </div>
            </div>

            {/* Interactive Actions Bar */}
            <div className="hero-actions-bar">
              {/* Like */}
              <button
                type="button"
                className={`action-btn-secondary ${userInteractions.hasLiked ? "active" : ""}`}
                onClick={handleLike}
                title={userInteractions.hasLiked ? "Liked" : "Like this collection"}
              >
                <Heart size={16} fill={userInteractions.hasLiked ? "#f43f5e" : "none"} />
                <span>{engagement.likes || 0}</span>
              </button>

              {/* Follow */}
              <button
                type="button"
                className={`action-btn-secondary ${
                  userInteractions.isFollowing ? "following" : ""
                }`}
                onClick={handleFollow}
              >
                <Bookmark
                  size={16}
                  fill={userInteractions.isFollowing ? "#22c55e" : "none"}
                />
                <span>{userInteractions.isFollowing ? "Following" : "Follow"}</span>
              </button>

              {/* Star Rating Trigger */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className={`action-btn-secondary ${
                    userInteractions.personalRating ? "active" : ""
                  }`}
                  onClick={() => setShowRatingModal(!showRatingModal)}
                >
                  <Star
                    size={16}
                    fill={userInteractions.personalRating ? "#facc15" : "none"}
                    color="#facc15"
                  />
                  <span>
                    {userInteractions.personalRating
                      ? `Rated ${userInteractions.personalRating}★`
                      : "Rate"}
                  </span>
                </button>

                {/* Rating Popover */}
                <AnimatePresence>
                  {showRatingModal && (
                    <motion.div
                      className="rating-popover-box"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                    >
                      <span className="popover-title">Rate this collection</span>
                      <div className="popover-stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={22}
                            fill={
                              star <= (ratingHover || userInteractions.personalRating || 0)
                                ? "#facc15"
                                : "none"
                            }
                            color="#facc15"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() => setRatingHover(star)}
                            onMouseLeave={() => setRatingHover(0)}
                            onClick={() => handleRatingPick(star)}
                          />
                        ))}
                      </div>
                      {userInteractions.personalRating && (
                        <button
                          type="button"
                          className="btn-clear-rating"
                          onClick={() => {
                            removeRating(_id);
                            setShowRatingModal(false);
                          }}
                        >
                          Clear Rating
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Copy / Remix */}
              {allowCopy && (
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={handleCopy}
                  title="Copy this collection into your account"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
              )}

              {/* Share */}
              <button
                type="button"
                className="action-btn-secondary"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>

              {/* Owner / Editor Controls */}
              <div className="owner-actions-cluster">
                {isOwner && (
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => setCollabModalOpen(true)}
                    title="Manage collaborators"
                  >
                    <Users size={16} />
                    <span>Collaborators</span>
                  </button>
                )}

                {canEdit && (
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => setEditModalOpen(true)}
                    title="Edit collection settings"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                )}

                {isOwner && (
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={handleDelete}
                    style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                    title="Delete collection"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {!isOwner && (
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => {
                      setReportReviewId(null);
                      setReportModalOpen(true);
                    }}
                    title="Report collection"
                  >
                    <Flag size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Voting Bar Component */}
            <div style={{ maxWidth: "420px", marginTop: "8px" }}>
              <CollectionVoting
                upvotes={engagement.upvotes || 0}
                downvotes={engagement.downvotes || 0}
                voteScore={voteScore}
                currentVote={userInteractions.voteType}
                onVote={handleVote}
              />
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="collection-tabs-bar">
          <button
            type="button"
            className={`collection-tab-btn ${activeTab === "items" ? "active" : ""}`}
            onClick={() => setActiveTab("items")}
          >
            <Film size={16} />
            <span>Media Items ({items.length})</span>
          </button>

          <button
            type="button"
            className={`collection-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            <MessageSquare size={16} />
            <span>Reviews ({engagement.reviews || reviewsTotal})</span>
          </button>

          <button
            type="button"
            className={`collection-tab-btn ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <PieChart size={16} />
            <span>Insights & Stats</span>
          </button>

          <button
            type="button"
            className={`collection-tab-btn ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            <Activity size={16} />
            <span>Activity</span>
          </button>
        </div>
      </section>

      {/* Main Tab Viewport */}
      <main className="collection-tab-viewport">
        {activeTab === "items" && (
          <div>
            {/* Sections Manager */}
            <CollectionSections
              sections={sections}
              canEdit={canEdit}
              onCreateSection={(name) => createSection(_id, name)}
              onUpdateSection={(secId, data) => updateSection(_id, secId, data)}
              onDeleteSection={(secId) => deleteSection(_id, secId)}
              onReorderSections={(orders) => reorderSections(_id, orders)}
            />

            {/* Media Items Grid */}
            <CollectionMediaGrid
              items={items}
              sections={sections}
              canEdit={canEdit}
              onRemoveMedia={(mediaId) => removeMediaFromCollection(_id, mediaId)}
              onReorderMedia={(orders) => reorderMedia(_id, orders)}
              onUpdateNote={(mediaId, note, isPriv) =>
                updateMediaNote(_id, mediaId, note, isPriv)
              }
            />
          </div>
        )}

        {activeTab === "reviews" && (
          <CollectionReviews
            collectionId={_id}
            reviews={collectionReviews}
            totalReviews={engagement.reviews || reviewsTotal}
            averageRating={averageRating}
            allowComments={allowComments}
            onAddReview={(rating, text) => addReview(_id, rating, text)}
            onUpdateReview={(revId, rating, text) =>
              updateReview(_id, revId, rating, text)
            }
            onDeleteReview={(revId) => deleteReview(_id, revId)}
            onVoteHelpful={(revId, type) => voteReview(_id, revId, type)}
            onReportReview={(revId) => {
              setReportReviewId(revId);
              setReportModalOpen(true);
            }}
          />
        )}

        {activeTab === "stats" && <CollectionStats collection={selectedCollection} />}

        {activeTab === "activity" && <CollectionActivity collectionId={_id} />}
      </main>

      {/* Modals */}
      <CollectionShare
        isOpen={shareModalOpen}
        collection={selectedCollection}
        onClose={() => setShareModalOpen(false)}
      />

      <EditCollectionModal
        isOpen={editModalOpen}
        collection={selectedCollection}
        onClose={() => setEditModalOpen(false)}
      />

      <CollectionCollaborators
        isOpen={collabModalOpen}
        collection={selectedCollection}
        isOwner={isOwner}
        onClose={() => setCollabModalOpen(false)}
      />

      <CollectionReportModal
        isOpen={reportModalOpen}
        collectionId={_id}
        reviewId={reportReviewId}
        onClose={() => {
          setReportModalOpen(false);
          setReportReviewId(null);
        }}
      />
    </div>
  );
}
