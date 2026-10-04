import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Compass,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Flame,
  Shield,
  Film,
  Tv,
  Check,
  X,
} from "lucide-react";
import { useClubs } from "../../Context/ClubContext";
import VideoLoader from "../Common/VideoLoader";
import "./Clubs.css";

const CLUB_CATEGORIES = [
  "All",
  "Anime Enthusiasts",
  "Sci-Fi & Fantasy",
  "Horror Vault",
  "Cinema Classics",
  "Marvel & DC",
  "K-Drama",
  "Documentaries",
  "General Discussion",
];

export default function Clubs() {
  const navigate = useNavigate();
  const {
    clubs,
    totalClubs,
    loading,
    fetchClubs,
    createClub,
    joinClub,
    leaveClub,
  } = useClubs();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "joined" | "popular"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // New Club Form state
  const [newClubName, setNewClubName] = useState("");
  const [newClubCategory, setNewClubCategory] = useState("Anime Enthusiasts");
  const [newClubDesc, setNewClubDesc] = useState("");
  const [newClubAvatar, setNewClubAvatar] = useState("");
  const [newClubBanner, setNewClubBanner] = useState("");
  const [newClubTags, setNewClubTags] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const params = {
      tab: activeTab,
      category: selectedCategory === "All" ? undefined : selectedCategory,
      search: searchQuery || undefined,
    };
    fetchClubs(params);
  }, [activeTab, selectedCategory, searchQuery, fetchClubs]);

  const handleJoinToggle = async (e, club) => {
    e.stopPropagation();
    try {
      setActionLoadingId(club._id);
      if (club.isMember) {
        await leaveClub(club._id);
      } else {
        await joinClub(club._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newClubName.trim()) {
      setFormError("Club name is required");
      return;
    }

    try {
      setCreating(true);
      setFormError("");
      const tagsArray = newClubTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await createClub({
        name: newClubName.trim(),
        category: newClubCategory,
        description: newClubDesc.trim(),
        avatar: newClubAvatar.trim(),
        bannerImage: newClubBanner.trim(),
        tags: tagsArray,
      });

      setIsCreateModalOpen(false);
      setNewClubName("");
      setNewClubDesc("");
      setNewClubAvatar("");
      setNewClubBanner("");
      setNewClubTags("");
      navigate(`/clubs/${created.slug || created._id}`);
    } catch (err) {
      setFormError(err.message || "Failed to create club");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="clubs-page-wrapper">
      <div className="clubs-container">
        {/* Hero Banner */}
        <div className="clubs-hero-banner">
          <div className="clubs-hero-content">
            <h1>WatchHub Community Clubs</h1>
            <p>
              Connect with fellow cinephiles, join genre discussions, debate your
              favorite characters, and host watch parties.
            </p>
          </div>
          <button
            className="btn-create-club"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            <span>Create a Club</span>
          </button>
        </div>

        {/* Controls Bar */}
        <div className="clubs-controls-bar">
          <div className="clubs-tabs-row">
            <div className="clubs-main-tabs">
              <button
                className={`club-tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                <Compass size={18} />
                <span>Explore All</span>
              </button>
              <button
                className={`club-tab-btn ${activeTab === "joined" ? "active" : ""}`}
                onClick={() => setActiveTab("joined")}
              >
                <Users size={18} />
                <span>My Clubs</span>
              </button>
              <button
                className={`club-tab-btn ${activeTab === "popular" ? "active" : ""}`}
                onClick={() => setActiveTab("popular")}
              >
                <Flame size={18} />
                <span>Popular</span>
              </button>
            </div>

            <div className="clubs-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search clubs by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="clubs-categories-scroll">
            {CLUB_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div style={{ padding: "60px 0" }}>
            <VideoLoader />
          </div>
        ) : clubs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "70px 20px",
              background: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
            }}
          >
            <Users size={48} style={{ color: "var(--color-text-muted)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>
              {activeTab === "joined"
                ? "You haven't joined any clubs yet"
                : "No clubs found matching your criteria"}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px" }}>
              {activeTab === "joined"
                ? "Explore popular clubs or start your own community group!"
                : "Try adjusting your filters or be the first to create one!"}
            </p>
            <button
              className="btn-create-club"
              style={{ margin: "0 auto" }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} /> Create a Club
            </button>
          </div>
        ) : (
          <div className="clubs-grid">
            {clubs.map((club) => {
              const bannerBg = club.bannerImage
                ? `url(${club.bannerImage})`
                : "linear-gradient(135deg, #242424, #181818)";

              return (
                <div
                  key={club._id}
                  className="club-card"
                  onClick={() => navigate(`/clubs/${club.slug || club._id}`)}
                >
                  <div
                    className="club-card-banner"
                    style={{ backgroundImage: bannerBg }}
                  />
                  <div className="club-card-header">
                    <div className="club-card-avatar">
                      {club.avatar ? (
                        <img src={club.avatar} alt={club.name} />
                      ) : (
                        club.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="club-category-badge">{club.category}</span>
                  </div>

                  <div className="club-card-body">
                    <h3 className="club-card-title">{club.name}</h3>
                    <p className="club-card-desc">
                      {club.description || "A dedicated WatchHub community for media enthusiasts."}
                    </p>

                    <div className="club-card-stats">
                      <div className="club-stat-item">
                        <Users size={16} />
                        <span>
                          <strong>{club.membersCount || 1}</strong> members
                        </span>
                      </div>
                      <div className="club-stat-item">
                        <MessageSquare size={16} />
                        <span>
                          <strong>{club.postsCount || 0}</strong> posts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="club-card-footer">
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      by @{club.creator?.User_Name || club.creator?.username || "curator"}
                    </span>

                    <button
                      className={`btn-join-club ${club.isMember ? "joined" : ""}`}
                      onClick={(e) => handleJoinToggle(e, club)}
                      disabled={actionLoadingId === club._id}
                    >
                      {club.isMember ? (
                        <>
                          <Check size={14} /> Joined
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Join
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Club Modal */}
        {isCreateModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
            <div
              className="modal-content-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Create a WatchHub Club</h2>
                <button
                  className="btn-close-modal"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "0.9rem",
                  }}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit}>
                <div className="modal-form-group">
                  <label>Club Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Studio Ghibli Fanatics"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Category *</label>
                  <select
                    value={newClubCategory}
                    onChange={(e) => setNewClubCategory(e.target.value)}
                  >
                    {CLUB_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    placeholder="What is this club about? What media will you discuss?"
                    value={newClubDesc}
                    onChange={(e) => setNewClubDesc(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Avatar Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newClubAvatar}
                    onChange={(e) => setNewClubAvatar(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Cover Banner URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newClubBanner}
                    onChange={(e) => setNewClubBanner(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="anime, ghibli, fantasy, miyazaki"
                    value={newClubTags}
                    onChange={(e) => setNewClubTags(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary-sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-create-club"
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Launch Club"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
