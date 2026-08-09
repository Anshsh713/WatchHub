import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Search as SearchIcon,
  Heart,
  Plus,
  Layers,
  Building,
  Key,
  Film,
  Sparkles,
  Flame,
  CheckCircle,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFranchise } from "../../../Context/FranchiseContext";
import { useSelector } from "react-redux";
import CreateFranchiseModal from "./CreateFranchiseModal";
import VideoLoader from "../../Common/VideoLoader";
import "./Franchise.css";

// Default preset franchises to offer quick seed if server has none yet
const DEFAULT_PRESET_FRANCHISES = [
  {
    name: "Marvel Cinematic Universe",
    slug: "marvel-cinematic-universe",
    description: "The epic superhero franchise encompassing Earth's mightiest heroes, cosmic defenders, and the multiverse.",
    banner: "https://image.tmdb.org/t/p/original/muth4OYamXf41G2evdrLEg8d3om.jpg",
    sourceType: "collection",
    tmdbCollectionId: 86311,
    followers: 1250,
  },
  {
    name: "Star Wars Saga",
    slug: "star-wars-saga",
    description: "In a galaxy far, far away... The legendary saga of Jedi, Sith, galactic empires and rebels.",
    banner: "https://image.tmdb.org/t/p/original/5iwx1ScqU220uHw7tB62qmoqL4r.jpg",
    sourceType: "collection",
    tmdbCollectionId: 10,
    followers: 980,
  },
  {
    name: "Harry Potter Wizarding World",
    slug: "harry-potter",
    description: "Step into Hogwarts and experience the magic, spells, and battles against the Dark Arts.",
    banner: "https://image.tmdb.org/t/p/original/5NYvVP2YexOQ8UKwFzToL4z8IGa.jpg",
    sourceType: "collection",
    tmdbCollectionId: 1241,
    followers: 1120,
  },
  {
    name: "Studio Ghibli Classics",
    slug: "studio-ghibli",
    description: "Enchanting animated masterpieces produced by Japan's legendary Studio Ghibli.",
    banner: "https://image.tmdb.org/t/p/original/706awcxVJ6V4txw3Z9W6d328H8L.jpg",
    sourceType: "company",
    tmdbCompanyId: 10342,
    followers: 850,
  },
  {
    name: "The Lord of the Rings",
    slug: "lord-of-the-rings",
    description: "The timeless epic journey through Middle-earth to destroy the One Ring.",
    banner: "https://image.tmdb.org/t/p/original/vL5LR6WvyjPZ1JvYi2zLSpMEvjM.jpg",
    sourceType: "collection",
    tmdbCollectionId: 119,
    followers: 1430,
  },
  {
    name: "Batman Universe",
    slug: "batman-universe",
    description: "Gotham City's Dark Knight fighting crime, villains, and corruption across films and series.",
    banner: "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJm2n.jpg",
    sourceType: "keyword",
    keywords: ["Batman", "Dark Knight"],
    followers: 910,
  },
];

export default function FranchiseList() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const {
    franchises,
    myFollowing,
    followingIds,
    loading,
    fetchFranchises,
    fetchMyFollowing,
    followFranchise,
    unfollowFranchise,
    seedFranchises,
    createFranchise,
  } = useFranchise();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'following', 'collection', 'company', 'keyword'
  const [sortBy, setSortBy] = useState("followers"); // 'followers', 'new', 'old'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchFranchises(sortBy);
    fetchMyFollowing();
  }, [sortBy]);

  // Handle Quick Seed when no franchises exist in backend database
  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      if (seedFranchises) {
        await seedFranchises();
      } else {
        for (const item of DEFAULT_PRESET_FRANCHISES) {
          await createFranchise(item);
        }
      }
      await fetchFranchises(sortBy);
    } catch (err) {
      console.error("Seeding error:", err);
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleFollow = async (e, franchiseId) => {
    e.preventDefault();
    e.stopPropagation();
    const isFollowing = followingIds.includes(franchiseId);
    try {
      if (isFollowing) {
        await unfollowFranchise(franchiseId);
      } else {
        await followFranchise(franchiseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic
  const filteredFranchises = franchises.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "following") {
      return followingIds.includes(item._id || item.id);
    }
    if (activeTab === "collection") return item.sourceType === "collection";
    if (activeTab === "company") return item.sourceType === "company";
    if (activeTab === "keyword") return item.sourceType === "keyword";

    return true;
  });

  const getSourceBadge = (type) => {
    switch (type) {
      case "collection":
        return (
          <span className="type-badge collection">
            <Layers size={12} /> Collection
          </span>
        );
      case "company":
        return (
          <span className="type-badge company">
            <Building size={12} /> Studio / Company
          </span>
        );
      case "keyword":
        return (
          <span className="type-badge keyword">
            <Key size={12} /> Keyword
          </span>
        );
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  if (loading && franchises.length === 0) {
    return (
      <div className="FranchiseSection">
        <VideoLoader />
      </div>
    );
  }

  return (
    <div className="FranchiseSection">
      {/* Top Banner Header */}
      <div className="franchise-hero">
        <div className="hero-content">
          <button className="back-btn" onClick={() => navigate("/interface")}>
            <ChevronLeft size={24} /> Explore
          </button>
          <div className="hero-title-group flex items-center gap-md">
            <div className="hero-icon-box">
              <Film size={32} />
            </div>
            <div>
              <h1 className="hero-title">Franchise Universe</h1>
              <p className="hero-subtitle">
                Explore iconic movie sagas, superhero universes, film collections, and studio catalogues.
              </p>
            </div>
          </div>
        </div>

        <div className="hero-actions flex gap-md">
          {user?.role === "admin" && (
            <button className="btn-primary flex items-center gap-sm" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Franchise
            </button>
          )}
          {franchises.length === 0 && (
            <button className="btn-secondary flex items-center gap-sm" onClick={handleSeedDefaults} disabled={seeding}>
              <Sparkles size={18} /> {seeding ? "Populating..." : "Seed Default Franchises"}
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search, Filters & Sorting */}
      <div className="franchise-controls glass-panel">
        <div className="search-box">
          <SearchIcon size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search franchises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              &times;
            </button>
          )}
        </div>

        <div className="filter-tabs flex gap-sm">
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({franchises.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "following" ? "active" : ""}`}
            onClick={() => setActiveTab("following")}
          >
            Following ({myFollowing.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "collection" ? "active" : ""}`}
            onClick={() => setActiveTab("collection")}
          >
            Collections
          </button>
          <button
            className={`tab-btn ${activeTab === "company" ? "active" : ""}`}
            onClick={() => setActiveTab("company")}
          >
            Studios
          </button>
          <button
            className={`tab-btn ${activeTab === "keyword" ? "active" : ""}`}
            onClick={() => setActiveTab("keyword")}
          >
            Keywords
          </button>
        </div>

        <div className="sort-selector flex items-center gap-sm">
          <Filter size={16} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="followers">Most Followed</option>
            <option value="new">Newest First</option>
            <option value="old">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Franchise Cards Grid */}
      {filteredFranchises.length === 0 ? (
        <div className="empty-franchises glass-panel">
          <Film size={48} className="empty-icon" />
          <h3>No Franchises Found</h3>
          <p>
            {activeTab === "following"
              ? "You haven't followed any franchises yet. Explore the catalog and hit Follow!"
              : "No franchises match your search query or filter."}
          </p>
          {franchises.length === 0 && (
            <button className="btn-primary mt-md" onClick={handleSeedDefaults} disabled={seeding}>
              <Sparkles size={18} /> {seeding ? "Creating..." : "Load Popular Franchises"}
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className="franchise-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredFranchises.map((item) => {
            const isFollowing = followingIds.includes(item._id || item.id);
            return (
              <motion.div key={item._id || item.slug} variants={cardVariants}>
                <Link to={`/explore/franchise/${item.slug}`} className="franchise-card glass-panel">
                  {/* Banner Image Container */}
                  <div className="card-banner-wrapper">
                    {item.banner ? (
                      <img src={item.banner} alt={item.name} className="card-banner" loading="lazy" />
                    ) : (
                      <div className="card-banner-placeholder flex items-center justify-center">
                        <Flame size={40} />
                      </div>
                    )}
                    <div className="banner-overlay" />
                    {getSourceBadge(item.sourceType)}
                    <button
                      className={`follow-toggle-btn ${isFollowing ? "following" : ""}`}
                      onClick={(e) => handleToggleFollow(e, item._id || item.id)}
                      title={isFollowing ? "Unfollow" : "Follow Franchise"}
                    >
                      <Heart size={16} fill={isFollowing ? "#e50914" : "none"} color={isFollowing ? "#e50914" : "#fff"} />
                      <span>{isFollowing ? "Following" : "Follow"}</span>
                    </button>
                  </div>

                  {/* Content Info */}
                  <div className="card-body">
                    <div className="card-header flex items-center justify-between">
                      <h3 className="franchise-name">{item.name}</h3>
                      {item.logo && (
                        <img src={item.logo} alt="" className="franchise-logo-thumb" />
                      )}
                    </div>
                    <p className="franchise-desc">
                      {item.description
                        ? item.description.length > 110
                          ? item.description.substring(0, 110) + "..."
                          : item.description
                        : "Discover movies and shows inside this franchise universe."}
                    </p>

                    <div className="card-footer flex items-center justify-between">
                      <span className="followers-count flex items-center gap-xs">
                        <Flame size={14} className="flame-icon" />
                        {item.followers || 0} Followers
                      </span>
                      <span className="explore-link flex items-center gap-xs">
                        Explore Universe &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal to create franchise */}
      <CreateFranchiseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
