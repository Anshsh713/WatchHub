import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Compass,
  Bookmark,
  Users,
  Search,
  X,
  SlidersHorizontal,
  Flame,
  Star,
  ThumbsUp,
  Heart,
  MessageSquare,
  Copy,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useCollections } from "../../Context/CollectionContext";
import CollectionCard from "./CollectionCard";
import CollectionEmptyState from "./CollectionEmptyState";
import CreateCollectionModal from "./CreateCollectionModal";
import VideoLoader from "../Common/VideoLoader";
import "./Collections.css";

const DISCOVERY_TABS = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "most_voted", label: "Most Voted", icon: ThumbsUp },
  { id: "top_rated", label: "Highest Rated", icon: Star },
  { id: "most_liked", label: "Most Liked", icon: Heart },
  { id: "most_followed", label: "Most Followed", icon: Bookmark },
  { id: "most_reviewed", label: "Most Reviewed", icon: MessageSquare },
  { id: "most_copied", label: "Most Copied", icon: Copy },
  { id: "newest", label: "Newest", icon: Sparkles },
  { id: "updated", label: "Recently Updated", icon: Clock },
];

export default function Collections() {
  const { status: authStatus } = useSelector((state) => state.auth);

  const {
    myCollections,
    followingCollections,
    sharedCollections,
    discoverCollections,
    loading,
    discoverTotalPages,
    discoverTotal,
    fetchMyCollections,
    fetchFollowingCollections,
    fetchSharedCollections,
    fetchDiscoverCollections,
    searchCollections,
  } = useCollections();

  // Active View Tabs: 'my' | 'discover' | 'following' | 'shared'
  const [activeHubTab, setActiveHubTab] = useState(authStatus ? "my" : "discover");

  // Filters & State
  const [activeDiscoverTab, setActiveDiscoverTab] = useState("trending");
  const [trendingTimeframe, setTrendingTimeframe] = useState("week"); // 'day' | 'week' | 'month' | 'all'
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all"); // 'all' | 'small' | 'medium' | 'large'
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Debounce search query input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load collections based on active tab and filters
  const loadCollections = useCallback(() => {
    const params = {
      type: mediaTypeFilter,
      minRating: minRatingFilter || undefined,
      page,
      limit: 24,
    };

    if (sizeFilter === "small") {
      params.maxItems = 10;
    } else if (sizeFilter === "medium") {
      params.minItems = 10;
      params.maxItems = 30;
    } else if (sizeFilter === "large") {
      params.minItems = 30;
    }

    if (debouncedQuery.trim()) {
      params.search = debouncedQuery.trim();
    }

    if (activeHubTab === "my") {
      fetchMyCollections(params);
    } else if (activeHubTab === "following") {
      fetchFollowingCollections(params);
    } else if (activeHubTab === "shared") {
      fetchSharedCollections(params);
    } else if (activeHubTab === "discover") {
      params.sort = activeDiscoverTab;
      params.timeframe = trendingTimeframe;
      fetchDiscoverCollections(params);
    }
  }, [
    activeHubTab,
    activeDiscoverTab,
    trendingTimeframe,
    mediaTypeFilter,
    minRatingFilter,
    sizeFilter,
    debouncedQuery,
    page,
  ]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Determine current active list
  let currentList = [];
  if (activeHubTab === "my") currentList = myCollections;
  else if (activeHubTab === "following") currentList = followingCollections;
  else if (activeHubTab === "shared") currentList = sharedCollections;
  else if (activeHubTab === "discover") currentList = discoverCollections;

  const handleTabChange = (newTab) => {
    setActiveHubTab(newTab);
    setPage(1);
    setSearchQuery("");
  };

  return (
    <div className="collections-hub-page">
      <div className="collections-hub-container">
        {/* Hub Header */}
        <div className="collections-hub-header">
          <div className="hub-title-group">
            <h1>WatchHub Collections</h1>
            <p>Curate, organize, and discover media collections from the community.</p>
          </div>

          <button
            type="button"
            className="hub-create-btn"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus size={18} />
            <span>Create Collection</span>
          </button>
        </div>

        {/* Main Hub Tabs */}
        <div className="hub-main-tabs-row">
          {authStatus && (
            <button
              type="button"
              className={`hub-tab-btn ${activeHubTab === "my" ? "active" : ""}`}
              onClick={() => handleTabChange("my")}
            >
              <Layers size={16} />
              <span>My Collections</span>
            </button>
          )}

          <button
            type="button"
            className={`hub-tab-btn ${activeHubTab === "discover" ? "active" : ""}`}
            onClick={() => handleTabChange("discover")}
          >
            <Compass size={16} />
            <span>Discover Collections</span>
          </button>

          {authStatus && (
            <>
              <button
                type="button"
                className={`hub-tab-btn ${activeHubTab === "following" ? "active" : ""}`}
                onClick={() => handleTabChange("following")}
              >
                <Bookmark size={16} />
                <span>Following</span>
              </button>

              <button
                type="button"
                className={`hub-tab-btn ${activeHubTab === "shared" ? "active" : ""}`}
                onClick={() => handleTabChange("shared")}
              >
                <Users size={16} />
                <span>Shared With Me</span>
              </button>
            </>
          )}
        </div>

        {/* Toolbar: Search + Discovery Tabs + Filters */}
        <div className="hub-toolbar-container">
          <div className="hub-toolbar-top-row">
            {/* Search Box */}
            <div className="hub-search-box">
              <Search size={18} className="hub-search-icon" />
              <input
                type="text"
                className="hub-search-input"
                placeholder="Search collections by name, tag, curator, or movie title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="hub-filter-controls-row">
              {/* Media Type */}
              <select
                className="hub-select-filter"
                value={mediaTypeFilter}
                onChange={(e) => {
                  setMediaTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Media Types</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
                <option value="anime">Anime</option>
                <option value="mixed">Mixed</option>
              </select>

              {/* Minimum Rating */}
              <select
                className="hub-select-filter"
                value={minRatingFilter}
                onChange={(e) => {
                  setMinRatingFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>

              {/* Size */}
              <select
                className="hub-select-filter"
                value={sizeFilter}
                onChange={(e) => {
                  setSizeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Any Size</option>
                <option value="small">Compact (&le; 10 titles)</option>
                <option value="medium">Standard (10–30 titles)</option>
                <option value="large">Extensive (30+ titles)</option>
              </select>
            </div>
          </div>

          {/* Discovery Sub-Tabs (only when on Discover tab) */}
          {activeHubTab === "discover" && (
            <div className="discovery-subtabs-row">
              {DISCOVERY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDiscoverTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`discovery-pill-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setActiveDiscoverTab(tab.id);
                      setPage(1);
                    }}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              {/* Timeframe selector if Trending is selected */}
              {activeDiscoverTab === "trending" && (
                <select
                  className="hub-select-filter"
                  style={{ marginLeft: "auto", fontSize: "0.8rem", padding: "5px 10px" }}
                  value={trendingTimeframe}
                  onChange={(e) => setTrendingTimeframe(e.target.value)}
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              )}
            </div>
          )}
        </div>

        {/* Collections Display Grid */}
        {loading ? (
          <div style={{ padding: "60px 0" }}>
            <VideoLoader />
          </div>
        ) : currentList.length === 0 ? (
          <CollectionEmptyState
            type={
              debouncedQuery || mediaTypeFilter !== "all" || minRatingFilter
                ? "no_results"
                : activeHubTab === "my"
                ? "no_collections"
                : activeHubTab === "following"
                ? "no_following"
                : activeHubTab === "shared"
                ? "no_shared"
                : "no_results"
            }
            onAction={
              debouncedQuery || mediaTypeFilter !== "all" || minRatingFilter
                ? () => {
                    setSearchQuery("");
                    setMediaTypeFilter("all");
                    setMinRatingFilter("");
                    setSizeFilter("all");
                  }
                : activeHubTab === "my"
                ? () => setCreateModalOpen(true)
                : activeHubTab === "following"
                ? () => setActiveHubTab("discover")
                : null
            }
          />
        ) : (
          <motion.div
            className="collections-cards-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {currentList.map((collection) => (
              <CollectionCard key={collection._id} collection={collection} />
            ))}
          </motion.div>
        )}

        {/* Pagination Bar */}
        {discoverTotalPages > 1 && activeHubTab === "discover" && (
          <div className="hub-pagination-bar">
            <button
              type="button"
              className="hub-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="hub-page-indicator">
              Page {page} of {discoverTotalPages}
            </span>
            <button
              type="button"
              className="hub-page-btn"
              disabled={page >= discoverTotalPages}
              onClick={() => setPage((p) => Math.min(discoverTotalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newCol) => {
          setActiveHubTab("my");
          fetchMyCollections();
        }}
      />
    </div>
  );
}
