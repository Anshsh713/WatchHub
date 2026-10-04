import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  Shield,
  Heart,
  Send,
  Trash2,
  Share2,
  ChevronLeft,
  Check,
  Plus,
  Film,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useClubs } from "../../Context/ClubContext";
import VideoLoader from "../Common/VideoLoader";
import "./Clubs.css";

export default function ClubDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    currentClub,
    clubPosts,
    clubMembers,
    loading,
    loadingPosts,
    fetchClubDetails,
    fetchClubPosts,
    fetchClubMembers,
    joinClub,
    leaveClub,
    createClubPost,
    deleteClubPost,
    toggleLikePost,
    addPostComment,
  } = useClubs();

  const [activeTab, setActiveTab] = useState("discussions"); // "discussions" | "members" | "about"
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchClubDetails(slug).then((res) => {
        if (res?.club?._id) {
          fetchClubPosts(res.club._id);
          fetchClubMembers(res.club._id);
        }
      });
    }
  }, [slug, fetchClubDetails, fetchClubPosts, fetchClubMembers]);

  const handleJoinToggle = async () => {
    if (!currentClub) return;
    try {
      setActionLoading(true);
      if (currentClub.isMember) {
        await leaveClub(currentClub._id);
      } else {
        await joinClub(currentClub._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || !currentClub) return;
    try {
      setSubmittingPost(true);
      await createClubPost(currentClub._id, {
        title: postTitle.trim(),
        content: postContent.trim(),
      });
      setPostTitle("");
      setPostContent("");
    } catch (err) {
      alert(err.message || "Failed to create post");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await toggleLikePost(postId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      await addPostComment(postId, text.trim());
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      alert(err.message || "Failed to add comment");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading && !currentClub) {
    return (
      <div className="club-details-wrapper">
        <div style={{ padding: "80px 0" }}>
          <VideoLoader />
        </div>
      </div>
    );
  }

  if (!currentClub) {
    return (
      <div className="club-details-wrapper">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Club not found</h2>
          <Link to="/clubs" className="btn-join-club" style={{ display: "inline-flex", marginTop: "16px" }}>
            Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  const bannerStyle = currentClub.bannerImage
    ? { backgroundImage: `url(${currentClub.bannerImage})` }
    : { background: "linear-gradient(135deg, #1e1e1e, #121212)" };

  return (
    <div className="club-details-wrapper">
      <div className="club-details-container">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/clubs")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "16px",
            fontSize: "0.95rem",
          }}
        >
          <ChevronLeft size={18} />
          <span>Back to All Clubs</span>
        </button>

        {/* Club Hero Card */}
        <div className="club-details-hero">
          <div className="club-details-banner" style={bannerStyle}>
            <div className="club-details-banner-overlay" />
          </div>

          <div className="club-details-header-content">
            <div className="club-details-main-info">
              <div className="club-details-avatar">
                {currentClub.avatar ? (
                  <img src={currentClub.avatar} alt={currentClub.name} />
                ) : (
                  currentClub.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="club-details-titles">
                <h1>{currentClub.name}</h1>
                <div className="club-details-meta">
                  <span className="club-category-badge">{currentClub.category}</span>
                  <span>•</span>
                  <span>{currentClub.membersCount || 1} members</span>
                  <span>•</span>
                  <span>{currentClub.postsCount || 0} discussions</span>
                </div>
              </div>
            </div>

            <div className="club-details-actions">
              <button
                className="btn-secondary-sm"
                onClick={handleShare}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-main)",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                }}
              >
                <Share2 size={16} />
                <span>{copiedLink ? "Copied!" : "Share"}</span>
              </button>

              <button
                className={`btn-join-club ${currentClub.isMember ? "joined" : ""}`}
                onClick={handleJoinToggle}
                disabled={actionLoading}
                style={{ padding: "10px 22px", fontSize: "0.95rem" }}
              >
                {currentClub.isMember ? (
                  <>
                    <Check size={16} /> Joined
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Join Club
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="club-nav-tabs">
          <button
            className={`club-nav-tab ${activeTab === "discussions" ? "active" : ""}`}
            onClick={() => setActiveTab("discussions")}
          >
            <MessageSquare size={18} />
            <span>Discussions ({clubPosts.length})</span>
          </button>
          <button
            className={`club-nav-tab ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <Users size={18} />
            <span>Members ({clubMembers.length})</span>
          </button>
          <button
            className={`club-nav-tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            <BookOpen size={18} />
            <span>About & Rules</span>
          </button>
        </div>

        {/* Tab 1: Discussions Feed */}
        {activeTab === "discussions" && (
          <div className="club-feed-grid">
            <div className="club-feed-main">
              {/* Create Post */}
              <div className="create-post-card">
                <h3>
                  <Sparkles size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Start a Discussion in {currentClub.name}</span>
                </h3>
                <form onSubmit={handleCreatePost}>
                  <input
                    type="text"
                    placeholder="Topic or Title (Optional)"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="What are your thoughts, theories, or questions? Remember to mark spoilers!"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                  <div className="create-post-actions">
                    <button
                      type="submit"
                      className="btn-create-club"
                      disabled={submittingPost}
                      style={{ padding: "10px 22px" }}
                    >
                      <Send size={16} />
                      <span>{submittingPost ? "Posting..." : "Post Discussion"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Posts List */}
              {loadingPosts ? (
                <div style={{ padding: "40px 0" }}>
                  <VideoLoader />
                </div>
              ) : clubPosts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 20px",
                    background: "var(--color-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <MessageSquare
                    size={36}
                    style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}
                  />
                  <h4 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>
                    No discussions yet
                  </h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                    Be the first to post a review, discussion, or question in this club!
                  </p>
                </div>
              ) : (
                clubPosts.map((post) => (
                  <div key={post._id} className="club-post-card">
                    <div className="club-post-header">
                      <div className="club-post-author">
                        <Link
                          to={`/profile/${post.author?.User_Name || post.author?.username}`}
                          className="club-post-avatar"
                        >
                          {post.author?.avatar ? (
                            <img src={post.author.avatar} alt="avatar" />
                          ) : (
                            (post.author?.User_Name || "U").charAt(0).toUpperCase()
                          )}
                        </Link>
                        <div>
                          <Link
                            to={`/profile/${post.author?.User_Name || post.author?.username}`}
                            className="post-author-name"
                          >
                            {post.author?.displayName || post.author?.User_Name || "User"}
                            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
                              @{post.author?.User_Name}
                            </span>
                          </Link>
                          <span className="post-time">
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {post.isPinned && (
                        <span
                          style={{
                            background: "rgba(245, 158, 11, 0.2)",
                            color: "#f59e0b",
                            padding: "3px 10px",
                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          Pinned
                        </span>
                      )}
                    </div>

                    {post.title && <h4 className="club-post-title">{post.title}</h4>}
                    <div className="club-post-content">{post.content}</div>

                    <div className="club-post-footer">
                      <button
                        className={`post-action-btn ${post.hasLiked ? "liked" : ""}`}
                        onClick={() => handleLike(post._id)}
                      >
                        <Heart
                          size={18}
                          fill={post.hasLiked ? "var(--color-primary)" : "none"}
                        />
                        <span>{post.likesCount || 0} Likes</span>
                      </button>

                      <button
                        className="post-action-btn"
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post._id]: !prev[post._id],
                          }))
                        }
                      >
                        <MessageSquare size={18} />
                        <span>{post.commentsCount || 0} Comments</span>
                      </button>

                      {(currentClub.isOwner || post.author?._id === currentClub.creator) && (
                        <button
                          className="post-action-btn"
                          style={{ marginLeft: "auto", color: "var(--color-text-muted)" }}
                          onClick={() => deleteClubPost(post._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Comments Dropdown */}
                    {expandedComments[post._id] && (
                      <div className="post-comments-section">
                        <div className="comment-input-row">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={commentInputs[post._id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post._id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCommentSubmit(post._id);
                            }}
                          />
                          <button onClick={() => handleCommentSubmit(post._id)}>
                            Reply
                          </button>
                        </div>

                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((c, i) => (
                            <div key={c._id || i} className="single-comment">
                              <div className="comment-content-box">
                                <div className="comment-author-name">
                                  @{c.author?.User_Name || "curator"}
                                </div>
                                <div className="comment-text">{c.content}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", padding: "8px 0" }}>
                            No comments yet. Start the conversation!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Sidebar info */}
            <div className="club-feed-sidebar">
              <div className="club-sidebar-widget">
                <h3>
                  <BookOpen size={18} style={{ color: "var(--color-primary)" }} />
                  <span>About this Club</span>
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "16px" }}>
                  {currentClub.description || "A dedicated group for film & TV discussion."}
                </p>

                {currentClub.tags && currentClub.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                    {currentClub.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "var(--color-surface-hover)",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.78rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "14px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Created by{" "}
                  <Link
                    to={`/profile/${currentClub.creator?.User_Name || currentClub.creator?.username}`}
                    style={{ color: "var(--color-primary)", fontWeight: 600 }}
                  >
                    @{currentClub.creator?.User_Name || "founder"}
                  </Link>
                </div>
              </div>

              <div className="club-sidebar-widget">
                <h3>
                  <Shield size={18} style={{ color: "#22c55e" }} />
                  <span>Club Rules</span>
                </h3>
                {currentClub.rules && currentClub.rules.length > 0 ? (
                  currentClub.rules.map((rule, idx) => (
                    <div key={idx} className="club-rule-item">
                      <span className="rule-num">{idx + 1}.</span>
                      <span>{rule}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>
                    Follow standard WatchHub community guidelines.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Members Tab */}
        {activeTab === "members" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {clubMembers.map((m) => (
              <div
                key={m.id || m.user?._id}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <Link
                  to={`/profile/${m.user?.User_Name || m.user?.username}`}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "var(--color-surface-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "white",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {m.user?.avatar ? (
                    <img src={m.user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (m.user?.User_Name || "U").charAt(0).toUpperCase()
                  )}
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/profile/${m.user?.User_Name || m.user?.username}`}
                    style={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: "var(--color-text-main)",
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.user?.displayName || m.user?.User_Name}
                  </Link>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    @{m.user?.User_Name}
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background:
                        m.role === "owner"
                          ? "rgba(229, 9, 20, 0.2)"
                          : m.role === "admin"
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(255, 255, 255, 0.08)",
                      color:
                        m.role === "owner"
                          ? "var(--color-primary)"
                          : m.role === "admin"
                          ? "#60a5fa"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: About & Rules */}
        {activeTab === "about" && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "800px",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>About {currentClub.name}</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "28px" }}>
              {currentClub.description || "Welcome to the club! A place to connect and discuss film, television, and anime."}
            </p>

            <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={20} style={{ color: "#22c55e" }} /> Club Guidelines & Code of Conduct
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {currentClub.rules && currentClub.rules.length > 0 ? (
                currentClub.rules.map((rule, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", fontSize: "0.95rem", color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{idx + 1}.</span>
                    <span>{rule}</span>
                  </div>
                ))
              ) : (
                <p>Standard WatchHub community rules apply.</p>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
              <h4 style={{ fontSize: "1rem", marginBottom: "8px" }}>Community Category</h4>
              <span className="club-category-badge">{currentClub.category}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
