import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  User,
  Settings as SettingsIcon,
  Share2,
  MoreVertical,
  Calendar,
  MapPin,
  Globe,
  Film,
  Tv,
  Sparkles,
  Clock,
  Star,
  CheckCircle2,
  Eye,
  MessageSquare,
  Layers,
  Heart,
  Users,
  Compass,
  Lock,
  Edit3,
  X,
  Check,
  ChevronRight,
  TrendingUp,
  Activity,
  Award,
  Send,
  ExternalLink,
  Flame,
} from "lucide-react";
import {
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaDiscord,
  FaGithub,
} from "react-icons/fa";

import { useAuth } from "../../Context/UserContext";
import { useClubs } from "../../Context/ClubContext";
import CollectionCard from "../Collections/CollectionCard";
import VideoLoader from "../Common/VideoLoader";
import "./Profile.css";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
];

const ALL_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export default function Profile() {
  const { username: paramUsername, userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);

  const {
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    getUserFollowers,
    getUserFollowing,
    getUserWatchlist,
    getUserReviews,
    getUserRatings,
    getUserActivity,
    getUserLikes,
  } = useAuth();

  const { fetchUserClubs } = useClubs();

  // Identifier can be username or userId from route, or "me"
  const identifier = paramUsername || paramUserId || "me";

  // Profile data state
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Tab specific datasets
  const [tabData, setTabData] = useState({
    watchlist: [],
    reviews: [],
    ratings: [],
    activity: [],
    likes: { reviews: [], collections: [] },
    clubs: [],
    followers: [],
    following: [],
  });
  const [tabLoading, setTabLoading] = useState(false);

  // Watchlist tab filters
  const [wlFilterType, setWlFilterType] = useState("all");
  const [wlFilterStatus, setWlFilterStatus] = useState("all");

  // Social & action states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Edit Modal form state
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editBanner, setEditBanner] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editSocials, setEditSocials] = useState({});
  const [editGenres, setEditGenres] = useState([]);
  const [editFranchises, setEditFranchises] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");

  const moreMenuRef = useRef(null);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Load User Profile & Dashboard Overview
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(identifier);
        setProfileData(data);
        setIsFollowing(Boolean(data.user?.isFollowing));
        setFollowersCount(data.user?.followersCount || 0);

        // Prepopulate edit modal state
        if (data.user?.isSelf) {
          setEditDisplayName(data.user.displayName || "");
          setEditUsername(data.user.username || "");
          setEditBio(data.user.bio || "");
          setEditAvatar(data.user.avatar || "");
          setEditBanner(data.user.bannerImage || "");
          setEditLocation(data.user.location || "");
          setEditWebsite(data.user.website || "");
          setEditSocials(data.user.socialLinks || {});
          setEditGenres(data.user.favoriteGenres || []);
          setEditFranchises(data.user.favoriteFranchises || []);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [identifier, getUserProfile]);

  // 2. Fetch specific tab contents when clicked
  useEffect(() => {
    if (!profileData?.user?.username || profileData.isPrivate) return;
    const userTarget = profileData.user.username;

    const loadTabContent = async () => {
      try {
        setTabLoading(true);
        if (activeTab === "watchlist") {
          const res = await getUserWatchlist(userTarget, {
            mediaType: wlFilterType,
            status: wlFilterStatus,
          });
          setTabData((prev) => ({ ...prev, watchlist: res.results || [] }));
        } else if (activeTab === "reviews") {
          const res = await getUserReviews(userTarget);
          setTabData((prev) => ({ ...prev, reviews: res.results || [] }));
        } else if (activeTab === "ratings") {
          const res = await getUserRatings(userTarget);
          setTabData((prev) => ({ ...prev, ratings: res.results || [] }));
        } else if (activeTab === "activity") {
          const res = await getUserActivity(userTarget);
          setTabData((prev) => ({ ...prev, activity: res.results || [] }));
        } else if (activeTab === "likes") {
          const res = await getUserLikes(userTarget);
          setTabData((prev) => ({ ...prev, likes: res.results || { reviews: [], collections: [] } }));
        } else if (activeTab === "clubs") {
          const clubs = await fetchUserClubs(userTarget);
          setTabData((prev) => ({ ...prev, clubs: clubs || [] }));
        } else if (activeTab === "followers") {
          const res = await getUserFollowers(userTarget);
          setTabData((prev) => ({ ...prev, followers: res.followers || [] }));
        } else if (activeTab === "following") {
          const res = await getUserFollowing(userTarget);
          setTabData((prev) => ({ ...prev, following: res.following || [] }));
        }
      } catch (err) {
        console.error("Tab content load error:", err);
      } finally {
        setTabLoading(false);
      }
    };

    if (activeTab !== "overview" && activeTab !== "collections" && activeTab !== "statistics") {
      loadTabContent();
    }
  }, [activeTab, profileData, wlFilterType, wlFilterStatus]);

  // Follow / Unfollow Handler
  const handleFollowToggle = async () => {
    if (!profileData?.user?._id) return;
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await unfollowUser(profileData.user._id);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await followUser(profileData.user._id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      alert(err.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  // Copy Profile Link
  const handleCopyProfile = () => {
    const url = `${window.location.origin}/profile/${profileData?.user?.username}`;
    navigator.clipboard.writeText(url);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Edit Profile Save Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setEditError("");

      const res = await updateUserProfile({
        displayName: editDisplayName,
        username: editUsername,
        bio: editBio,
        avatar: editAvatar,
        bannerImage: editBanner,
        location: editLocation,
        website: editWebsite,
        socialLinks: editSocials,
        favoriteGenres: editGenres,
        favoriteFranchises: editFranchises,
      });

      setIsEditModalOpen(false);
      // Reload profile
      const updated = await getUserProfile(res.user?.User_Name || "me");
      setProfileData(updated);

      if (res.user?.User_Name && res.user.User_Name !== paramUsername) {
        navigate(`/profile/${res.user.User_Name}`, { replace: true });
      }
    } catch (err) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleGenreSelection = (genre) => {
    if (editGenres.includes(genre)) {
      setEditGenres(editGenres.filter((g) => g !== genre));
    } else {
      if (editGenres.length < 5) {
        setEditGenres([...editGenres, genre]);
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-page-wrapper">
        <div style={{ padding: "120px 0" }}>
          <VideoLoader />
        </div>
      </div>
    );
  }

  if (!profileData?.user) {
    return (
      <div className="profile-page-wrapper">
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h2>User profile not found</h2>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "8px" }}>
            The cinephile you are looking for does not exist or has changed handles.
          </p>
          <Link
            to="/discover"
            className="btn-profile-follow"
            style={{ display: "inline-flex", marginTop: "20px" }}
          >
            Explore WatchHub
          </Link>
        </div>
      </div>
    );
  }

  const { user, isPrivate, overview } = profileData;
  const isOwner = user.isSelf;

  const bannerBackground = user.bannerImage
    ? `url(${user.bannerImage})`
    : "linear-gradient(135deg, #1f1f1f 0%, #111111 100%)";

  return (
    <div className="profile-page-wrapper">
      {/* 1. Profile Banner / Cover */}
      <div
        className="profile-banner-container"
        style={{ backgroundImage: bannerBackground }}
      >
        <div className="profile-banner-overlay" />
        {isOwner && (
          <button
            className="btn-edit-banner"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit3 size={16} />
            <span>Customize Banner</span>
          </button>
        )}
      </div>

      <div className="profile-main-container">
        {/* 2. Header Card */}
        <div className="profile-header-card">
          <div className="profile-identity-group">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-image">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} />
                ) : (
                  (user.displayName || user.username || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="profile-avatar-badge">
                <Star size={16} fill="white" />
              </div>
            </div>

            <div className="profile-names">
              <div className="profile-display-name-row">
                <h1 className="profile-display-name">{user.displayName || user.username}</h1>
                <Award size={22} className="profile-verified-badge" />
              </div>
              <span className="profile-handle">@{user.username}</span>

              {/* Bio snippet under name */}
              {user.bio && (
                <div style={{ marginTop: "6px", maxWidth: "600px" }}>
                  <p className="profile-bio-text">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions-group">
            {isOwner ? (
              <>
                <button
                  className="btn-profile-edit"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
                <Link to="/settings" className="btn-profile-secondary">
                  <SettingsIcon size={18} />
                </Link>
              </>
            ) : (
              <>
                <button
                  className={`btn-profile-follow ${isFollowing ? "following" : ""}`}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {isFollowing ? (
                    <>
                      <Check size={16} /> Following
                    </>
                  ) : (
                    <>
                      <Users size={16} /> Follow
                    </>
                  )}
                </button>
                <button
                  className="btn-profile-secondary"
                  onClick={() => {
                    alert(`Message feature: Direct messaging with @${user.username} is enabled in their settings!`);
                  }}
                  title="Message"
                >
                  <Send size={18} />
                </button>
              </>
            )}

            <button
              className="btn-profile-secondary"
              onClick={handleCopyProfile}
              title="Share Profile"
            >
              <Share2 size={18} />
            </button>

            {/* More Menu */}
            <div ref={moreMenuRef} style={{ position: "relative" }}>
              <button
                className="btn-profile-secondary"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              >
                <MoreVertical size={18} />
              </button>

              {isMoreMenuOpen && (
                <div className="profile-more-menu">
                  <button onClick={handleCopyProfile}>
                    <Share2 size={16} /> Copy Profile Link
                  </button>
                  {isOwner && (
                    <Link to="/settings">
                      <SettingsIcon size={16} /> Account Settings
                    </Link>
                  )}
                  {!isOwner && (
                    <button
                      onClick={() => {
                        alert(`Reported @${user.username} for review by WatchHub moderation.`);
                        setIsMoreMenuOpen(false);
                      }}
                      style={{ color: "#ef4444" }}
                    >
                      Report Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Metadata Bar (Join date, location, website, social links) */}
        <div className="profile-bio-box">
          <div className="profile-meta-row">
            <div className="profile-meta-item">
              <Calendar size={16} />
              <span>
                Joined{" "}
                {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {user.location && (
              <div className="profile-meta-item">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
            )}

            {user.website && (
              <div className="profile-meta-item">
                <Globe size={16} />
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {/* Social Links */}
            {user.socialLinks && (
              <div className="profile-socials-row">
                {user.socialLinks.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-social-link"
                  >
                    <FaTwitter size={16} />
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-social-link"
                  >
                    <FaInstagram size={16} />
                  </a>
                )}
                {user.socialLinks.youtube && (
                  <a
                    href={user.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-social-link"
                  >
                    <FaYoutube size={16} />
                  </a>
                )}
                {user.socialLinks.discord && (
                  <span className="profile-social-link" title={`Discord: ${user.socialLinks.discord}`}>
                    <FaDiscord size={16} />
                  </span>
                )}
                {user.socialLinks.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-social-link"
                  >
                    <FaGithub size={16} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Favorite Genres Chips */}
          {user.favoriteGenres && user.favoriteGenres.length > 0 && (
            <div className="profile-genres-row">
              {user.favoriteGenres.map((g) => (
                <span key={g} className="profile-genre-tag">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. Stats Row Bar */}
        <div className="profile-stats-bar">
          <div
            className="profile-stat-box"
            onClick={() => setActiveTab("followers")}
          >
            <strong>{followersCount}</strong>
            <span>Followers</span>
          </div>

          <div
            className="profile-stat-box"
            onClick={() => setActiveTab("following")}
          >
            <strong>{user.followingCount || 0}</strong>
            <span>Following</span>
          </div>

          <div
            className="profile-stat-box"
            onClick={() => setActiveTab("clubs")}
          >
            <strong>{user.clubsCount || 0}</strong>
            <span>Clubs Joined</span>
          </div>

          <div
            className="profile-stat-box"
            onClick={() => setActiveTab("collections")}
          >
            <strong>{user.collectionsCount || 0}</strong>
            <span>Collections</span>
          </div>
        </div>

        {/* Copied toast indicator */}
        {copiedToast && (
          <div
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              background: "#22c55e",
              color: "white",
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: 600,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Check size={18} /> Link copied to clipboard!
          </div>
        )}

        {/* 5. Private Profile Guard */}
        {isPrivate ? (
          <div className="profile-private-card">
            <Lock size={48} />
            <h2>This Profile is Private</h2>
            <p>
              Only approved followers can view @{user.username}'s watchlist, activity,
              reviews, and statistics.
            </p>
            {!isFollowing && (
              <button
                className="btn-profile-follow"
                style={{ margin: "20px auto 0" }}
                onClick={handleFollowToggle}
              >
                <Users size={16} /> Follow to View
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 6. Navigation Tabs */}
            <div className="profile-tabs-scroll">
              <button
                className={`profile-tab-button ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <Compass size={18} />
                <span>Overview</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "activity" ? "active" : ""}`}
                onClick={() => setActiveTab("activity")}
              >
                <Activity size={18} />
                <span>Watch Activity</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "watchlist" ? "active" : ""}`}
                onClick={() => setActiveTab("watchlist")}
              >
                <Clock size={18} />
                <span>WatchList</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "collections" ? "active" : ""}`}
                onClick={() => setActiveTab("collections")}
              >
                <Layers size={18} />
                <span>Collections</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                <MessageSquare size={18} />
                <span>Reviews</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "ratings" ? "active" : ""}`}
                onClick={() => setActiveTab("ratings")}
              >
                <Star size={18} />
                <span>Ratings</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "likes" ? "active" : ""}`}
                onClick={() => setActiveTab("likes")}
              >
                <Heart size={18} />
                <span>Likes</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "clubs" ? "active" : ""}`}
                onClick={() => setActiveTab("clubs")}
              >
                <Users size={18} />
                <span>Clubs</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "followers" ? "active" : ""}`}
                onClick={() => setActiveTab("followers")}
              >
                <Users size={18} />
                <span>Followers</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "following" ? "active" : ""}`}
                onClick={() => setActiveTab("following")}
              >
                <Users size={18} />
                <span>Following</span>
              </button>
              <button
                className={`profile-tab-button ${activeTab === "statistics" ? "active" : ""}`}
                onClick={() => setActiveTab("statistics")}
              >
                <TrendingUp size={18} />
                <span>Statistics</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. OVERVIEW DASHBOARD */}
            {activeTab === "overview" && overview && (
              <div>
                {/* Watch Statistics Highlight Widget */}
                {overview.watchStatistics && (
                  <div className="overview-stats-banner">
                    <div className="overview-stats-header">
                      <h3>
                        <TrendingUp size={20} style={{ color: "var(--color-primary)" }} />
                        <span>Watch Statistics</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => setActiveTab("statistics")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        Detailed Analytics <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="overview-metrics-grid">
                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Film size={16} style={{ color: "#38bdf8" }} />
                          <span>Movies</span>
                        </div>
                        <div className="metric-number">
                          {overview.watchStatistics.movies || 0}
                        </div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Tv size={16} style={{ color: "#a855f7" }} />
                          <span>TV Shows</span>
                        </div>
                        <div className="metric-number">
                          {overview.watchStatistics.tvShows || 0}
                        </div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Sparkles size={16} style={{ color: "#f97316" }} />
                          <span>Anime</span>
                        </div>
                        <div className="metric-number">
                          {overview.watchStatistics.anime || 0}
                        </div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Clock size={16} style={{ color: "#22c55e" }} />
                          <span>Hours Watched</span>
                        </div>
                        <div className="metric-number">
                          {overview.watchStatistics.hoursWatched || 0}
                        </div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Star size={16} style={{ color: "#facc15" }} />
                          <span>Avg Rating</span>
                        </div>
                        <div className="metric-number">
                          {overview.watchStatistics.averageRating || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: Currently Watching */}
                {overview.currentlyWatching && overview.currentlyWatching.length > 0 && (
                  <div style={{ marginBottom: "36px" }}>
                    <div className="overview-section-header">
                      <h3>
                        <Eye size={20} style={{ color: "#f59e0b" }} />
                        <span>Currently Watching</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => {
                          setWlFilterStatus("watching");
                          setActiveTab("watchlist");
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        View All <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="overview-media-grid">
                      {overview.currentlyWatching.map((item) => (
                        <div
                          key={`cw-${item._id || item.tmdbId}`}
                          className="media-overview-card"
                          onClick={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                        >
                          <div className="media-card-poster">
                            {item.posterPath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                                alt={item.title}
                              />
                            ) : (
                              <div style={{ padding: "20px", textAlign: "center" }}>🎬</div>
                            )}
                            <span
                              className="media-card-status-badge"
                              style={{ background: "#f59e0b", color: "#000" }}
                            >
                              Watching
                            </span>
                          </div>
                          <div className="media-card-body">
                            <h4 className="media-card-title">{item.title}</h4>
                            <span className="media-card-sub">
                              {item.mediaType.toUpperCase()}
                              {item.progress?.episode ? ` • Ep ${item.progress.episode}` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Recently Watched */}
                {overview.recentlyWatched && overview.recentlyWatched.length > 0 && (
                  <div style={{ marginBottom: "36px" }}>
                    <div className="overview-section-header">
                      <h3>
                        <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
                        <span>Recently Watched</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => {
                          setWlFilterStatus("completed");
                          setActiveTab("watchlist");
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        View All <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="overview-media-grid">
                      {overview.recentlyWatched.map((item) => (
                        <div
                          key={`rw-${item._id || item.tmdbId}`}
                          className="media-overview-card"
                          onClick={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                        >
                          <div className="media-card-poster">
                            {item.posterPath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                                alt={item.title}
                              />
                            ) : (
                              <div style={{ padding: "20px", textAlign: "center" }}>🎬</div>
                            )}
                            {item.personalRating && (
                              <span className="media-card-badge">
                                <Star size={12} fill="#facc15" /> {item.personalRating}
                              </span>
                            )}
                          </div>
                          <div className="media-card-body">
                            <h4 className="media-card-title">{item.title}</h4>
                            <span className="media-card-sub">
                              {item.mediaType.toUpperCase()}
                              {item.releaseDate ? ` • ${item.releaseDate.split("-")[0]}` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Favorite Media */}
                {overview.favoriteMedia && overview.favoriteMedia.length > 0 && (
                  <div style={{ marginBottom: "36px" }}>
                    <div className="overview-section-header">
                      <h3>
                        <Flame size={20} style={{ color: "var(--color-primary)" }} />
                        <span>Favorite Media Showcase</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => setActiveTab("ratings")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        View Ratings <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="overview-media-grid">
                      {overview.favoriteMedia.map((fav, idx) => (
                        <div
                          key={`fav-${fav.tmdbId || idx}`}
                          className="media-overview-card"
                          onClick={() => navigate(`/media/${fav.mediaType}/${fav.tmdbId}`)}
                        >
                          <div className="media-card-poster">
                            {fav.posterPath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${fav.posterPath}`}
                                alt={fav.title}
                              />
                            ) : (
                              <div style={{ padding: "20px", textAlign: "center" }}>⭐</div>
                            )}
                            {fav.voteAverage && (
                              <span className="media-card-badge">
                                <Star size={12} fill="#facc15" /> {fav.voteAverage}
                              </span>
                            )}
                          </div>
                          <div className="media-card-body">
                            <h4 className="media-card-title">{fav.title}</h4>
                            <span className="media-card-sub">{fav.mediaType?.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: My Collections */}
                {overview.recentCollections && overview.recentCollections.length > 0 && (
                  <div style={{ marginBottom: "36px" }}>
                    <div className="overview-section-header">
                      <h3>
                        <Layers size={20} style={{ color: "#38bdf8" }} />
                        <span>Curated Collections</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => setActiveTab("collections")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        All Collections <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="collections-cards-grid">
                      {overview.recentCollections.map((col) => (
                        <CollectionCard key={col._id} collection={col} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Recent Reviews */}
                {overview.recentReviews && overview.recentReviews.length > 0 && (
                  <div style={{ marginBottom: "36px" }}>
                    <div className="overview-section-header">
                      <h3>
                        <MessageSquare size={20} style={{ color: "#ec4899" }} />
                        <span>Recent Reviews & Critiques</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => setActiveTab("reviews")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        All Reviews <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="overview-reviews-grid">
                      {overview.recentReviews.map((rev) => (
                        <div
                          key={rev._id}
                          className="overview-review-card"
                          onClick={() => navigate(`/media/${rev.MediaType}/${rev.MediaID}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="review-card-header">
                            <span className="review-rating-badge">{rev.rating}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                              {rev.MediaType.toUpperCase()} #{rev.MediaID}
                            </span>
                          </div>

                          <p className="review-comment-snippet">
                            {rev.isSpoiler ? (
                              <span style={{ color: "#f59e0b" }}>⚠️ [Spoiler Hidden] {rev.comment}</span>
                            ) : (
                              rev.comment
                            )}
                          </p>

                          <div className="review-card-footer">
                            <span>
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <span>❤️ {rev.likes?.length || 0}</span>
                              <span>💬 {rev.replies?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Joined Clubs */}
                {overview.joinedClubs && overview.joinedClubs.length > 0 && (
                  <div style={{ marginBottom: "36px" }}>
                    <div className="overview-section-header">
                      <h3>
                        <Users size={20} style={{ color: "#8b5cf6" }} />
                        <span>Joined Clubs</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => setActiveTab("clubs")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        All Clubs <ChevronRight size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {overview.joinedClubs.map((club) => (
                        <div
                          key={club._id}
                          style={{
                            background: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "14px",
                            padding: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/clubs/${club.slug || club._id}`)}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "12px",
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
                            {club.avatar ? (
                              <img
                                src={club.avatar}
                                alt={club.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              club.name.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <h4
                              style={{
                                fontSize: "1rem",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {club.name}
                            </h4>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                              {club.membersCount || 1} members • {club.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Recent Activity Timeline */}
                {overview.recentActivity && overview.recentActivity.length > 0 && (
                  <div>
                    <div className="overview-section-header">
                      <h3>
                        <Activity size={20} style={{ color: "#10b981" }} />
                        <span>Recent Activity</span>
                      </h3>
                      <button
                        className="overview-section-link"
                        onClick={() => setActiveTab("activity")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        Full Activity Feed <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="overview-activity-timeline">
                      {overview.recentActivity.map((act) => (
                        <div key={act.id} className="activity-feed-item">
                          <div className="activity-icon-box">
                            {act.type === "completed" ? (
                              <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
                            ) : act.type === "watching" ? (
                              <Eye size={20} style={{ color: "#f59e0b" }} />
                            ) : act.type === "review" ? (
                              <MessageSquare size={20} style={{ color: "#ec4899" }} />
                            ) : act.type === "collection" ? (
                              <Layers size={20} style={{ color: "#38bdf8" }} />
                            ) : (
                              <Film size={20} />
                            )}
                          </div>

                          <div className="activity-content">
                            <div className="activity-title">{act.title}</div>
                            <div className="activity-details">{act.details}</div>
                          </div>

                          <span className="activity-date">
                            {new Date(act.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. WATCH ACTIVITY */}
            {activeTab === "activity" && (
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Watch Activity Timeline</h3>
                {tabLoading ? (
                  <VideoLoader />
                ) : tabData.activity.length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>No recent activity to display.</p>
                ) : (
                  <div className="overview-activity-timeline">
                    {tabData.activity.map((act) => (
                      <div key={act.id} className="activity-feed-item">
                        <div className="activity-icon-box">
                          {act.type === "completed" ? (
                            <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
                          ) : act.type === "watching" ? (
                            <Eye size={20} style={{ color: "#f59e0b" }} />
                          ) : act.type === "review" ? (
                            <MessageSquare size={20} style={{ color: "#ec4899" }} />
                          ) : (
                            <Film size={20} />
                          )}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{act.title}</div>
                          <div className="activity-details">{act.details}</div>
                        </div>
                        <span className="activity-date">
                          {new Date(act.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. WATCHLIST */}
            {activeTab === "watchlist" && (
              <div>
                {/* Watchlist Filter controls */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                  <select
                    value={wlFilterType}
                    onChange={(e) => setWlFilterType(e.target.value)}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="all">All Media</option>
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                    <option value="anime">Anime</option>
                  </select>

                  <select
                    value={wlFilterStatus}
                    onChange={(e) => setWlFilterStatus(e.target.value)}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="watching">Currently Watching</option>
                    <option value="completed">Completed</option>
                    <option value="want_to_watch">Want to Watch</option>
                    <option value="on_hold">On Hold</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                {tabLoading ? (
                  <VideoLoader />
                ) : tabData.watchlist.length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    No media items found in watchlist for this filter.
                  </p>
                ) : (
                  <div className="overview-media-grid">
                    {tabData.watchlist.map((item) => (
                      <div
                        key={item._id}
                        className="media-overview-card"
                        onClick={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                      >
                        <div className="media-card-poster">
                          {item.posterPath ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                              alt={item.title}
                            />
                          ) : (
                            <div style={{ padding: "20px", textAlign: "center" }}>🎬</div>
                          )}
                          <span
                            className="media-card-status-badge"
                            style={{
                              background:
                                item.status === "completed"
                                  ? "#22c55e"
                                  : item.status === "watching"
                                  ? "#f59e0b"
                                  : "rgba(0,0,0,0.7)",
                              color: item.status === "watching" ? "#000" : "#fff",
                            }}
                          >
                            {item.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="media-card-body">
                          <h4 className="media-card-title">{item.title}</h4>
                          <span className="media-card-sub">
                            {item.mediaType.toUpperCase()}
                            {item.personalRating ? ` • ${item.personalRating}/10 ★` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. COLLECTIONS */}
            {activeTab === "collections" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "1.3rem" }}>Collections by @{user.username}</h3>
                  {isOwner && (
                    <Link to="/collections" className="btn-profile-follow" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                      Manage Collections
                    </Link>
                  )}
                </div>

                {overview?.recentCollections && overview.recentCollections.length > 0 ? (
                  <div className="collections-cards-grid">
                    {overview.recentCollections.map((col) => (
                      <CollectionCard key={col._id} collection={col} />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    No collections created yet.
                  </p>
                )}
              </div>
            )}

            {/* TAB CONTENT: 5. REVIEWS */}
            {activeTab === "reviews" && (
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Reviews by @{user.username}</h3>
                {tabLoading ? (
                  <VideoLoader />
                ) : tabData.reviews.length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>No reviews published yet.</p>
                ) : (
                  <div className="overview-reviews-grid">
                    {tabData.reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="overview-review-card"
                        onClick={() => navigate(`/media/${rev.MediaType}/${rev.MediaID}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="review-card-header">
                          <span className="review-rating-badge">{rev.rating}</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{rev.mediaTitle}</span>
                        </div>

                        <p className="review-comment-snippet">
                          {rev.isSpoiler ? (
                            <span style={{ color: "#f59e0b" }}>⚠️ [Spoiler Alert] {rev.comment}</span>
                          ) : (
                            rev.comment
                          )}
                        </p>

                        <div className="review-card-footer">
                          <span>
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <div style={{ display: "flex", gap: "12px" }}>
                            <span>❤️ {rev.likesCount || 0}</span>
                            <span>💬 {rev.repliesCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 6. RATINGS */}
            {activeTab === "ratings" && (
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Ratings by @{user.username}</h3>
                {tabLoading ? (
                  <VideoLoader />
                ) : tabData.ratings.length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>No ratings given yet.</p>
                ) : (
                  <div className="overview-media-grid">
                    {tabData.ratings.map((item) => (
                      <div
                        key={item._id}
                        className="media-overview-card"
                        onClick={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                      >
                        <div className="media-card-poster">
                          {item.posterPath ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                              alt={item.title}
                            />
                          ) : (
                            <div style={{ padding: "20px", textAlign: "center" }}>⭐</div>
                          )}
                          <span className="media-card-badge">
                            <Star size={12} fill="#facc15" /> {item.personalRating}/10
                          </span>
                        </div>
                        <div className="media-card-body">
                          <h4 className="media-card-title">{item.title}</h4>
                          <span className="media-card-sub">{item.mediaType.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 7. LIKES */}
            {activeTab === "likes" && (
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Liked Content</h3>
                {tabLoading ? (
                  <VideoLoader />
                ) : (
                  <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Liked Collections</h4>
                    {tabData.likes.collections?.length > 0 ? (
                      <div className="collections-cards-grid" style={{ marginBottom: "32px" }}>
                        {tabData.likes.collections.map((col) => (
                          <CollectionCard key={col._id} collection={col} />
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px" }}>
                        No liked collections.
                      </p>
                    )}

                    <h4 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Liked Reviews</h4>
                    {tabData.likes.reviews?.length > 0 ? (
                      <div className="overview-reviews-grid">
                        {tabData.likes.reviews.map((rev) => (
                          <div
                            key={rev._id}
                            className="overview-review-card"
                            onClick={() => navigate(`/media/${rev.MediaType}/${rev.MediaID}`)}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="review-rating-badge">{rev.rating}</span>
                            <p className="review-comment-snippet">{rev.comment}</p>
                            <div className="review-card-footer">
                              <span>by @{rev.User?.User_Name || "curator"}</span>
                              <span>❤️ {rev.likes?.length || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--color-text-secondary)" }}>No liked reviews.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 8. CLUBS */}
            {activeTab === "clubs" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "1.3rem" }}>Clubs ({tabData.clubs.length})</h3>
                  <Link to="/clubs" className="btn-profile-follow" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                    Explore All Clubs
                  </Link>
                </div>

                {tabLoading ? (
                  <VideoLoader />
                ) : tabData.clubs.length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    Not a member of any clubs yet.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {tabData.clubs.map((club) => (
                      <div
                        key={club._id}
                        className="club-card"
                        onClick={() => navigate(`/clubs/${club.slug || club._id}`)}
                      >
                        <div
                          className="club-card-banner"
                          style={{
                            backgroundImage: club.bannerImage
                              ? `url(${club.bannerImage})`
                              : "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
                          }}
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
                          <h4 className="club-card-title">{club.name}</h4>
                          <p className="club-card-desc">{club.description}</p>
                          <div className="club-card-stats">
                            <span>👥 {club.membersCount || 1} members</span>
                            <span style={{ textTransform: "capitalize", marginLeft: "auto", color: "var(--color-primary)" }}>
                              {club.userRole || "Member"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 9. FOLLOWERS */}
            {activeTab === "followers" && (
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Followers ({followersCount})</h3>
                {tabLoading ? (
                  <VideoLoader />
                ) : tabData.followers.length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>No followers yet.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {tabData.followers.map((f) => (
                      <div
                        key={f.id || f._id}
                        style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "14px",
                          padding: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <Link
                          to={`/profile/${f.username}`}
                          style={{
                            width: "48px",
                            height: "48px",
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
                          {f.avatar ? (
                            <img src={f.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            f.username.charAt(0).toUpperCase()
                          )}
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link
                            to={`/profile/${f.username}`}
                            style={{
                              fontWeight: 600,
                              color: "white",
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {f.displayName || f.username}
                          </Link>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                            @{f.username}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 10. FOLLOWING */}
            {activeTab === "following" && (
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Following ({user.followingCount || 0})</h3>
                {tabLoading ? (
                  <VideoLoader />
                ) : tabData.following.length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>Not following anyone yet.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {tabData.following.map((f) => (
                      <div
                        key={f.id || f._id}
                        style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "14px",
                          padding: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <Link
                          to={`/profile/${f.username}`}
                          style={{
                            width: "48px",
                            height: "48px",
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
                          {f.avatar ? (
                            <img src={f.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            f.username.charAt(0).toUpperCase()
                          )}
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link
                            to={`/profile/${f.username}`}
                            style={{
                              fontWeight: 600,
                              color: "white",
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {f.displayName || f.username}
                          </Link>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                            @{f.username}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 11. STATISTICS */}
            {activeTab === "statistics" && (
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "24px" }}>Media Consumption Analytics</h3>

                {overview?.watchStatistics ? (
                  <div>
                    <div className="overview-metrics-grid" style={{ marginBottom: "32px" }}>
                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Film size={16} style={{ color: "#38bdf8" }} />
                          <span>Total Movies</span>
                        </div>
                        <div className="metric-number">{overview.watchStatistics.movies}</div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Tv size={16} style={{ color: "#a855f7" }} />
                          <span>Total TV Shows</span>
                        </div>
                        <div className="metric-number">{overview.watchStatistics.tvShows}</div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Sparkles size={16} style={{ color: "#f97316" }} />
                          <span>Total Anime</span>
                        </div>
                        <div className="metric-number">{overview.watchStatistics.anime}</div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Clock size={16} style={{ color: "#22c55e" }} />
                          <span>Hours Watched</span>
                        </div>
                        <div className="metric-number">{overview.watchStatistics.hoursWatched}</div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                          <span>Completion Rate</span>
                        </div>
                        <div className="metric-number">{overview.watchStatistics.completionRate}%</div>
                      </div>

                      <div className="overview-metric-card">
                        <div className="metric-label-row">
                          <Star size={16} style={{ color: "#facc15" }} />
                          <span>Average Rating</span>
                        </div>
                        <div className="metric-number">{overview.watchStatistics.averageRating} ★</div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "16px",
                        padding: "24px",
                        maxWidth: "600px",
                      }}
                    >
                      <h4 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Watch Status Distribution</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Completed</span>
                          <strong>{overview.watchStatistics.completedTitles}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Currently Watching</span>
                          <strong>{overview.watchStatistics.watchingTitles}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Plan to Watch</span>
                          <strong>{overview.watchStatistics.wantToWatchTitles}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Titles Rated</span>
                          <strong>{overview.watchStatistics.ratedTitles}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    No statistics available yet. Add items to your watchlist to see watch analytics!
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* 7. EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Customize Your Profile</h2>
                <button
                  className="btn-close-modal"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {editError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="modal-form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>

                {/* Avatar Presets & Custom URL */}
                <div className="modal-form-group">
                  <label>Avatar URL</label>
                  <input
                    type="url"
                    value={editAvatar}
                    placeholder="https://..."
                    onChange={(e) => setEditAvatar(e.target.value)}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "block", marginTop: "4px" }}>
                    Or select an avatar preset:
                  </span>
                  <div className="avatar-preset-grid">
                    {AVATAR_PRESETS.map((p, idx) => (
                      <div
                        key={idx}
                        className={`avatar-preset-item ${editAvatar === p ? "active" : ""}`}
                        onClick={() => setEditAvatar(p)}
                      >
                        <img src={p} alt={`preset ${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banner Presets & Custom URL */}
                <div className="modal-form-group">
                  <label>Cover Banner URL</label>
                  <input
                    type="url"
                    value={editBanner}
                    placeholder="https://..."
                    onChange={(e) => setEditBanner(e.target.value)}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "block", marginTop: "4px" }}>
                    Or select a banner preset:
                  </span>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    {BANNER_PRESETS.map((b, idx) => (
                      <div
                        key={idx}
                        onClick={() => setEditBanner(b)}
                        style={{
                          flex: 1,
                          height: "36px",
                          borderRadius: "8px",
                          backgroundImage: `url(${b})`,
                          backgroundSize: "cover",
                          cursor: "pointer",
                          border: editBanner === b ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="modal-form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Website</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                    />
                  </div>
                </div>

                {/* Favorite Genres Selectors */}
                <div className="modal-form-group">
                  <label>Favorite Genres (Select up to 5)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {ALL_GENRES.map((g) => {
                      const isSel = editGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenreSelection(g)}
                          style={{
                            background: isSel ? "var(--color-primary)" : "var(--color-surface)",
                            color: isSel ? "white" : "var(--color-text-secondary)",
                            border: "1px solid var(--color-border)",
                            padding: "6px 12px",
                            borderRadius: "16px",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                          }}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
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
                    className="btn-profile-follow"
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Saving..." : "Save Profile"}
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
