import React, { useState, useEffect } from "react";
import {
  User,
  Palette,
  Lock,
  Bell,
  Sliders,
  PlaySquare,
  Shield,
  Save,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../Context/UserContext";
import VideoLoader from "../Common/VideoLoader";
import "./Settings.css";

const THEMES = [
  { id: "dark", name: "Dark Cinematic", bg: "#0f0f0f", accent: "#e50914" },
  { id: "cinema", name: "Cinema Classic", bg: "#141414", accent: "#3498db" },
  { id: "midnight", name: "Midnight Blue", bg: "#0b0f19", accent: "#8e44ad" },
  { id: "amoled", name: "AMOLED Black", bg: "#000000", accent: "#10b981" },
];

const ACCENT_COLORS = [
  "#e50914", // Netflix Red
  "#2980b9", // Blue
  "#8e44ad", // Violet
  "#10b981", // Emerald
  "#f97316", // Orange
  "#eab308", // Gold
  "#46d1fd", // Cyan
];

export default function Settings() {
  const {
    getUserSettings,
    updateUserSettings,
    updateUserProfile,
    changePassword,
    logoutUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState("");
  const [errorToast, setErrorToast] = useState("");

  // Account State
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    youtube: "",
    discord: "",
    github: "",
  });
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [favoriteFranchises, setFavoriteFranchises] = useState([]);

  // Appearance State
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("#e50914");
  const [compactMode, setCompactMode] = useState(false);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showWatchlist, setShowWatchlist] = useState(true);
  const [showWatchActivity, setShowWatchActivity] = useState(true);
  const [showCollections, setShowCollections] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [showRatings, setShowRatings] = useState(true);
  const [showLikes, setShowLikes] = useState(true);
  const [showClubs, setShowClubs] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [clubInvites, setClubInvites] = useState(true);
  const [clubPosts, setClubPosts] = useState(true);
  const [reviewLikes, setReviewLikes] = useState(true);
  const [replies, setReplies] = useState(true);
  const [watchlistReleases, setWatchlistReleases] = useState(true);

  // Content State
  const [matureContent, setMatureContent] = useState(false);
  const [spoilerBlur, setSpoilerBlur] = useState(true);
  const [defaultHomeTab, setDefaultHomeTab] = useState("trending");

  // Playback State
  const [autoplayTrailers, setAutoplayTrailers] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState("auto");
  const [soundEffects, setSoundEffects] = useState(true);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await getUserSettings();
        if (data.profile) {
          setDisplayName(data.profile.displayName || "");
          setUsername(data.profile.username || "");
          setEmail(data.profile.email || "");
          setBio(data.profile.bio || "");
          setAvatar(data.profile.avatar || "");
          setBannerImage(data.profile.bannerImage || "");
          setLocation(data.profile.location || "");
          setWebsite(data.profile.website || "");
          setSocialLinks(data.profile.socialLinks || {});
          setFavoriteGenres(data.profile.favoriteGenres || []);
          setFavoriteFranchises(data.profile.favoriteFranchises || []);
        }

        if (data.settings) {
          if (data.settings.appearance) {
            setTheme(data.settings.appearance.theme || "dark");
            setAccentColor(data.settings.appearance.accentColor || "#e50914");
            setCompactMode(Boolean(data.settings.appearance.compactMode));
          }
          if (data.settings.notifications) {
            setEmailAlerts(data.settings.notifications.emailAlerts ?? true);
            setNewFollowers(data.settings.notifications.newFollowers ?? true);
            setClubInvites(data.settings.notifications.clubInvites ?? true);
            setClubPosts(data.settings.notifications.clubPosts ?? true);
            setReviewLikes(data.settings.notifications.reviewLikes ?? true);
            setReplies(data.settings.notifications.replies ?? true);
            setWatchlistReleases(data.settings.notifications.watchlistReleases ?? true);
          }
          if (data.settings.content) {
            setMatureContent(Boolean(data.settings.content.matureContent));
            setSpoilerBlur(data.settings.content.spoilerBlur ?? true);
            setDefaultHomeTab(data.settings.content.defaultHomeTab || "trending");
          }
          if (data.settings.playback) {
            setAutoplayTrailers(data.settings.playback.autoplayTrailers ?? true);
            setDefaultQuality(data.settings.playback.defaultQuality || "auto");
            setSoundEffects(data.settings.playback.soundEffects ?? true);
          }
        }

        if (data.privacy) {
          setProfileVisibility(data.privacy.profileVisibility || "public");
          setShowWatchlist(data.privacy.showWatchlist ?? true);
          setShowWatchActivity(data.privacy.showWatchActivity ?? true);
          setShowCollections(data.privacy.showCollections ?? true);
          setShowReviews(data.privacy.showReviews ?? true);
          setShowRatings(data.privacy.showRatings ?? true);
          setShowLikes(data.privacy.showLikes ?? true);
          setShowClubs(data.privacy.showClubs ?? true);
          setShowFollowers(data.privacy.showFollowers ?? true);
          setShowStats(data.privacy.showStats ?? true);
          setAllowDirectMessages(data.privacy.allowDirectMessages ?? true);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [getUserSettings]);

  const triggerToast = (msg, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(""), 3500);
    } else {
      setSaveToast(msg);
      setTimeout(() => setSaveToast(""), 3500);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setErrorToast("");

      // 1. Update Profile fields
      await updateUserProfile({
        displayName,
        username,
        bio,
        avatar,
        bannerImage,
        location,
        website,
        socialLinks,
        favoriteGenres,
        favoriteFranchises,
      });

      // 2. Update Settings & Privacy
      await updateUserSettings({
        settings: {
          appearance: { theme, accentColor, compactMode },
          notifications: {
            emailAlerts,
            newFollowers,
            clubInvites,
            clubPosts,
            reviewLikes,
            replies,
            watchlistReleases,
          },
          content: { matureContent, spoilerBlur, defaultHomeTab },
          playback: { autoplayTrailers, defaultQuality, soundEffects },
        },
        privacy: {
          profileVisibility,
          showWatchlist,
          showWatchActivity,
          showCollections,
          showReviews,
          showRatings,
          showLikes,
          showClubs,
          showFollowers,
          showStats,
          allowDirectMessages,
        },
      });

      triggerToast("Settings saved successfully!");
    } catch (err) {
      triggerToast(err.message || "Failed to save settings", true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast("New passwords do not match", true);
      return;
    }
    if (newPassword.length < 8) {
      triggerToast("Password must be at least 8 characters long", true);
      return;
    }

    try {
      setSaving(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      triggerToast("Password changed successfully!");
    } catch (err) {
      triggerToast(err.message || "Failed to change password", true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page-wrapper">
        <div style={{ padding: "80px 0" }}>
          <VideoLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page-wrapper">
      <div className="settings-container">
        <div className="settings-header-banner">
          <h1>Settings & Preferences</h1>
          <p>Manage your account, privacy, appearance, and experience on WatchHub</p>
        </div>

        <div className="settings-layout">
          {/* Navigation Sidebar */}
          <aside className="settings-sidebar">
            <button
              className={`settings-nav-btn ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              <User size={18} />
              <span>Account & Profile</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
            >
              <Palette size={18} />
              <span>Appearance</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === "privacy" ? "active" : ""}`}
              onClick={() => setActiveTab("privacy")}
            >
              <Lock size={18} />
              <span>Privacy & Visibility</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === "content" ? "active" : ""}`}
              onClick={() => setActiveTab("content")}
            >
              <Sliders size={18} />
              <span>Content & Filters</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === "playback" ? "active" : ""}`}
              onClick={() => setActiveTab("playback")}
            >
              <PlaySquare size={18} />
              <span>Playback & Player</span>
            </button>
            <button
              className={`settings-nav-btn ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={18} />
              <span>Security & Password</span>
            </button>
          </aside>

          {/* Settings Panel */}
          <main className="settings-panel">
            {/* Tab 1: Account & Profile */}
            {activeTab === "account" && (
              <div>
                <div className="settings-section-title">
                  <h2>Account & Profile Information</h2>
                  <p>Customize how you appear to others on WatchHub.</p>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-field-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Wick"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>

                  <div className="settings-field-group">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <span className="settings-field-hint">
                      Your unique WatchHub handle (@{username})
                    </span>
                  </div>
                </div>

                <div className="settings-field-group">
                  <label>Email Address</label>
                  <input type="email" disabled value={email} />
                  <span className="settings-field-hint">
                    Email address associated with your account
                  </span>
                </div>

                <div className="settings-field-group">
                  <label>Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell cinephiles about your taste in films and anime..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <span className="settings-field-hint">{bio.length}/500 characters</span>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-field-group">
                    <label>Avatar Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                  </div>

                  <div className="settings-field-group">
                    <label>Banner Cover URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-field-group">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Tokyo, Japan"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="settings-field-group">
                    <label>Personal Website</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div className="settings-section-title" style={{ marginTop: "24px" }}>
                  <h3 style={{ fontSize: "1.1rem" }}>Social Links</h3>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-field-group">
                    <label>Twitter / X Profile</label>
                    <input
                      type="text"
                      placeholder="https://x.com/username"
                      value={socialLinks.twitter || ""}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, twitter: e.target.value })
                      }
                    />
                  </div>
                  <div className="settings-field-group">
                    <label>Instagram</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/username"
                      value={socialLinks.instagram || ""}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, instagram: e.target.value })
                      }
                    />
                  </div>
                  <div className="settings-field-group">
                    <label>YouTube</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/@channel"
                      value={socialLinks.youtube || ""}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, youtube: e.target.value })
                      }
                    />
                  </div>
                  <div className="settings-field-group">
                    <label>Discord Username</label>
                    <input
                      type="text"
                      placeholder="username#0000"
                      value={socialLinks.discord || ""}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, discord: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Appearance */}
            {activeTab === "appearance" && (
              <div>
                <div className="settings-section-title">
                  <h2>Appearance & Themes</h2>
                  <p>Customize the look and feel of the WatchHub interface.</p>
                </div>

                <h4 style={{ marginBottom: "12px", fontSize: "0.95rem" }}>Theme Mode</h4>
                <div className="theme-options-grid">
                  {THEMES.map((t) => (
                    <div
                      key={t.id}
                      className={`theme-card ${theme === t.id ? "active" : ""}`}
                      onClick={() => setTheme(t.id)}
                    >
                      <div
                        className="theme-preview-box"
                        style={{ background: t.bg, border: `1px solid ${t.accent}` }}
                      >
                        <span style={{ color: t.accent }}>WatchHub</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ marginBottom: "8px", fontSize: "0.95rem" }}>Accent Color</h4>
                  <div className="accent-colors-row">
                    {ACCENT_COLORS.map((col) => (
                      <div
                        key={col}
                        className={`accent-color-circle ${accentColor === col ? "active" : ""}`}
                        style={{ background: col }}
                        onClick={() => setAccentColor(col)}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "32px" }}>
                  <div className="settings-toggle-row">
                    <div className="toggle-info">
                      <h4>Compact Mode</h4>
                      <p>Decrease card padding and layout spacing for denser browsing.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={compactMode}
                        onChange={(e) => setCompactMode(e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Privacy */}
            {activeTab === "privacy" && (
              <div>
                <div className="settings-section-title">
                  <h2>Privacy & Safety Controls</h2>
                  <p>Choose who can see your profile, watchlist, reviews, and activity.</p>
                </div>

                <div className="settings-field-group" style={{ marginBottom: "28px" }}>
                  <label>Profile Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                  >
                    <option value="public">Public (Anyone can view your profile)</option>
                    <option value="followers">Followers Only (Only approved followers)</option>
                    <option value="private">Private (Only you can see your data)</option>
                  </select>
                </div>

                <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Public Tabs & Content</h3>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Show Watchlist</h4>
                    <p>Display your watchlist tab and current watching items on your profile.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showWatchlist}
                      onChange={(e) => setShowWatchlist(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Show Watch Activity Feed</h4>
                    <p>Allow others to view your recent media watching timeline.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showWatchActivity}
                      onChange={(e) => setShowWatchActivity(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Show Public Collections</h4>
                    <p>Feature your curated collections on your profile page.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showCollections}
                      onChange={(e) => setShowCollections(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Show Written Reviews</h4>
                    <p>Let other members read reviews and critiques you write.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showReviews}
                      onChange={(e) => setShowReviews(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Show Personal Ratings</h4>
                    <p>Display your 1-10 scores on media cards.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showRatings}
                      onChange={(e) => setShowRatings(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Show Watch Statistics</h4>
                    <p>Display your total movies, anime, TV shows, and hours watched widget.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showStats}
                      onChange={(e) => setShowStats(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Show Joined Clubs</h4>
                    <p>Show which community clubs you are a part of.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showClubs}
                      onChange={(e) => setShowClubs(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Allow Direct Messaging / Interactions</h4>
                    <p>Permit other WatchHub cinephiles to send direct replies and messages.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={allowDirectMessages}
                      onChange={(e) => setAllowDirectMessages(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            )}

            {/* Tab 4: Notifications */}
            {activeTab === "notifications" && (
              <div>
                <div className="settings-section-title">
                  <h2>Notification Preferences</h2>
                  <p>Choose which alerts and notifications you receive in WatchHub.</p>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Email Alerts</h4>
                    <p>Receive weekly digest and critical account security notifications via email.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>New Followers</h4>
                    <p>Notify me whenever another member starts following my profile.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={newFollowers}
                      onChange={(e) => setNewFollowers(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Club Activity & Invites</h4>
                    <p>Notify me when members invite me to clubs or post in clubs I belong to.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={clubInvites}
                      onChange={(e) => setClubInvites(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Review Likes & Reactions</h4>
                    <p>Notify me when someone likes my reviews or collections.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={reviewLikes}
                      onChange={(e) => setReviewLikes(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Comments & Replies</h4>
                    <p>Notify me when someone replies to my reviews or club discussions.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={replies}
                      onChange={(e) => setReplies(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Watchlist New Releases</h4>
                    <p>Alert me when movies or series on my watchlist become available.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={watchlistReleases}
                      onChange={(e) => setWatchlistReleases(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            )}

            {/* Tab 5: Content & Filters */}
            {activeTab === "content" && (
              <div>
                <div className="settings-section-title">
                  <h2>Content & Filtering Controls</h2>
                  <p>Customize media ratings, spoiler filters, and default discover feeds.</p>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Mature / Adult Content (18+)</h4>
                    <p>Allow mature and rated R/NC-17 titles to appear in search and recommendations.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={matureContent}
                      onChange={(e) => setMatureContent(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Auto-blur Spoilers</h4>
                    <p>Automatically conceal community reviews and posts detected to contain plot spoilers.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={spoilerBlur}
                      onChange={(e) => setSpoilerBlur(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-field-group" style={{ marginTop: "24px" }}>
                  <label>Default Home Section</label>
                  <select
                    value={defaultHomeTab}
                    onChange={(e) => setDefaultHomeTab(e.target.value)}
                  >
                    <option value="trending">Trending Today</option>
                    <option value="popular">Popular Titles</option>
                    <option value="top_rated">Top Rated Media</option>
                    <option value="watchlist">My Watchlist</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab 6: Playback */}
            {activeTab === "playback" && (
              <div>
                <div className="settings-section-title">
                  <h2>Playback & Media Player</h2>
                  <p>Fine-tune trailer autoplay and video resolution settings.</p>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Autoplay Trailers</h4>
                    <p>Automatically start trailers when opening media detail views.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={autoplayTrailers}
                      onChange={(e) => setAutoplayTrailers(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-field-group" style={{ marginTop: "24px" }}>
                  <label>Default Trailer Resolution</label>
                  <select
                    value={defaultQuality}
                    onChange={(e) => setDefaultQuality(e.target.value)}
                  >
                    <option value="auto">Auto (Adaptive)</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p SD</option>
                  </select>
                </div>

                <div className="settings-toggle-row" style={{ marginTop: "16px" }}>
                  <div className="toggle-info">
                    <h4>Sound Effects</h4>
                    <p>Play subtle audio cues on interactions and reactions.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            )}

            {/* Tab 7: Security */}
            {activeTab === "security" && (
              <div>
                <div className="settings-section-title">
                  <h2>Security & Password</h2>
                  <p>Protect your WatchHub account and update your credentials.</p>
                </div>

                <form onSubmit={handleChangePasswordSubmit} style={{ maxWidth: "500px" }}>
                  <div className="settings-field-group">
                    <label>Current Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "var(--color-text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="settings-field-group">
                    <label>New Password</label>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="settings-field-group">
                    <label>Confirm New Password</label>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-save-settings"
                    disabled={saving}
                    style={{ marginTop: "12px" }}
                  >
                    {saving ? "Updating Password..." : "Change Password"}
                  </button>
                </form>

                <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--color-border)" }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Active Sessions</h3>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.88rem", marginBottom: "16px" }}>
                    You are currently logged in from this browser session.
                  </p>
                  <button
                    onClick={logoutUser}
                    className="btn-secondary-sm"
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      color: "#ef4444",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 600,
                    }}
                  >
                    <LogOut size={16} /> Logout from WatchHub
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Save Bar for tabs other than security */}
            {activeTab !== "security" && (
              <div className="settings-save-bar">
                {saveToast ? (
                  <div className="save-toast">
                    <Check size={18} />
                    <span>{saveToast}</span>
                  </div>
                ) : errorToast ? (
                  <div style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertCircle size={18} />
                    <span>{errorToast}</span>
                  </div>
                ) : (
                  <div />
                )}

                <button
                  className="btn-save-settings"
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  <Save size={18} />
                  <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
