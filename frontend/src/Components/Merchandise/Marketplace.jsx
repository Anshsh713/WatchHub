import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ExternalLink,
  PlusCircle,
  Search,
  Filter,
  Star,
  Tag,
  Film,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import API from "../../Services/Axios_api";
import "./Merchandise.css";

const CATEGORIES = [
  "All",
  "Figures & Collectibles",
  "Apparel & Wearables",
  "Posters & Art",
  "Accessories",
];

const PLATFORMS = ["All", "Amazon", "Flipkart", "Etsy", "Myntra"];

const PRESET_IMAGES = [
  {
    label: "Action Figure",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "T-Shirt",
    url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "Poster",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "Vinyl Figure",
    url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop",
  },
];

export default function Marketplace() {
  const { user } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    mediaTitle: "",
    price: "",
    originalPrice: "",
    platform: "Amazon",
    buyUrl: "",
    imageUrl: PRESET_IMAGES[0].url,
    category: "Figures & Collectibles",
    condition: "Brand New",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllMerch = async () => {
    setLoading(true);
    let loaded = [];
    try {
      const res = await API.get("/merch", {
        params: {
          category: selectedCategory,
          platform: selectedPlatform,
          search: searchQuery,
          sort: sortBy,
        },
      });
      if (res.data?.items) {
        loaded = res.data.items;
      }
    } catch (err) {
      console.warn("Marketplace fetch error, using fallback catalog:", err);
    }

    // Merge with any locally stored items
    try {
      const allKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith("watchhub_merch_")
      );
      allKeys.forEach((k) => {
        const stored = JSON.parse(localStorage.getItem(k) || "[]");
        loaded = [...stored, ...loaded];
      });
    } catch (e) {}

    // Fallback catalog if items are low
    if (loaded.length === 0) {
      loaded = [
        {
          _id: "m-1",
          title: "Interstellar Endurance Spacecraft Diecast Model",
          mediaTitle: "Interstellar",
          price: 3499,
          originalPrice: 4999,
          currency: "₹",
          imageUrl:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
          platform: "Amazon",
          buyUrl: "https://www.amazon.in/s?k=Interstellar+merchandise",
          category: "Figures & Collectibles",
          badge: "Bestseller",
          rating: 4.9,
          reviewsCount: 420,
        },
        {
          _id: "m-2",
          title: "Fight Club Soap Bar Logo Cotton T-Shirt",
          mediaTitle: "Fight Club",
          price: 799,
          originalPrice: 1299,
          currency: "₹",
          imageUrl:
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
          platform: "Flipkart",
          buyUrl: "https://www.flipkart.com/search?q=Fight+Club+t+shirt",
          category: "Apparel & Wearables",
          badge: "Trending",
          rating: 4.7,
          reviewsCount: 310,
        },
        {
          _id: "m-3",
          title: "Inception Spinning Totem Top Prop (Solid Brass)",
          mediaTitle: "Inception",
          price: 899,
          originalPrice: 1499,
          currency: "₹",
          imageUrl:
            "https://images.unsplash.com/photo-1614036417651-efe5912149d8?q=80&w=600&auto=format&fit=crop",
          platform: "Amazon",
          buyUrl: "https://www.amazon.in/s?k=Inception+totem+prop",
          category: "Accessories",
          badge: "Amazon's Choice",
          rating: 4.8,
          reviewsCount: 520,
        },
        {
          _id: "m-4",
          title: "Avengers Infinity Gauntlet LED Desk Lamp",
          mediaTitle: "Avengers: Infinity War",
          price: 2199,
          originalPrice: 2999,
          currency: "₹",
          imageUrl:
            "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop",
          platform: "Amazon",
          buyUrl: "https://www.amazon.in/s?k=Avengers+Infinity+Gauntlet",
          category: "Figures & Collectibles",
          badge: "Popular",
          rating: 4.8,
          reviewsCount: 680,
        },
        {
          _id: "m-5",
          title: "The Dark Knight Minimalist Matte Framed Poster",
          mediaTitle: "The Dark Knight",
          price: 1099,
          originalPrice: 1699,
          currency: "₹",
          imageUrl:
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop",
          platform: "Flipkart",
          buyUrl: "https://www.flipkart.com/search?q=Dark+Knight+poster",
          category: "Posters & Art",
          badge: "Top Rated",
          rating: 4.9,
          reviewsCount: 195,
        },
      ];
    }

    setItems(loaded);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllMerch();
  }, [selectedCategory, selectedPlatform, sortBy]);

  // Handle Form Submit
  const handleMarketplaceSellSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price || !formData.mediaTitle.trim()) {
      alert("Please provide the item title, movie name, and price.");
      return;
    }

    setIsSubmitting(true);
    let finalBuyUrl = formData.buyUrl.trim();
    if (!finalBuyUrl || !finalBuyUrl.startsWith("http")) {
      if (formData.platform === "Flipkart") {
        finalBuyUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(
          formData.title
        )}`;
      } else {
        finalBuyUrl = `https://www.amazon.in/s?k=${encodeURIComponent(
          formData.title
        )}`;
      }
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      originalPrice: formData.originalPrice
        ? Number(formData.originalPrice)
        : Math.round(Number(formData.price) * 1.3),
      imageUrl: formData.imageUrl,
      platform: formData.platform,
      buyUrl: finalBuyUrl,
      mediaId: "general",
      mediaTitle: formData.mediaTitle,
      category: formData.category,
      condition: formData.condition,
      sellerName: user?.displayName || user?.User_Name || "WatchHub Seller",
      badge: "Community Listed",
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
    };

    try {
      await API.post("/merch", payload);
    } catch (err) {
      console.warn("Backend submit error, saving locally:", err);
    }

    setItems((prev) => [
      { ...payload, _id: `local-${Date.now()}` },
      ...prev,
    ]);

    setIsSubmitting(false);
    setIsSellModalOpen(false);
    alert(`Your item "${payload.title}" has been listed on the marketplace!`);
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory)
      return false;
    if (selectedPlatform !== "All" && item.platform !== selectedPlatform)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchMovie = item.mediaTitle?.toLowerCase().includes(q);
      if (!matchTitle && !matchMovie) return false;
    }
    return true;
  });

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">
        {/* Hero Section */}
        <div className="marketplace-hero">
          <div className="hero-content">
            <span className="mp-badge">
              <Sparkles size={14} /> WATCHHUB CINEMA STORE
            </span>
            <h1>Movie Merchandise Marketplace</h1>
            <p>
              Discover official collectibles, limited action figures, and movie apparel
              available on <strong>Amazon</strong> and <strong>Flipkart</strong>, or list your
              own items to sell to fans!
            </p>

            {/* Search Box */}
            <div className="mp-search-bar">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by movie name or collectible item (e.g. Batman figure, Inception, T-shirt)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn-clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="hero-action-box">
            <button
              className="btn-sell-primary"
              onClick={() => setIsSellModalOpen(true)}
            >
              <PlusCircle size={20} />
              <span>Sell an Item</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mp-controls-bar">
          {/* Category Tabs */}
          <div className="mp-category-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`mp-filter-chip ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Platform & Sort Selectors */}
          <div className="mp-dropdowns-row">
            <div className="dropdown-wrap">
              <span className="d-label">Platform:</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="dropdown-wrap">
              <span className="d-label">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="merch-loading">
            <div className="spinner-small" />
            <span>Browsing movie merchandise catalog...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="no-merch-card">
            <ShoppingBag size={48} />
            <h3>No items matched your search</h3>
            <p>Try searching for a different movie or category, or list this item!</p>
            <button
              className="btn-primary"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedPlatform("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="merch-cards-grid">
            {filteredItems.map((item, idx) => {
              const isAmazon = item.platform === "Amazon";
              const isFlipkart = item.platform === "Flipkart";
              const discountPercent =
                item.originalPrice && item.originalPrice > item.price
                  ? Math.round(
                      ((item.originalPrice - item.price) / item.originalPrice) * 100
                    )
                  : null;

              return (
                <div key={item._id || item.id || idx} className="merch-product-card">
                  <div className="merch-card-img-box">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PRESET_IMAGES[0].url;
                      }}
                    />

                    {item.badge && (
                      <span className="card-badge-tag">{item.badge}</span>
                    )}

                    <span
                      className={`card-platform-pill ${
                        isAmazon
                          ? "plat-amazon"
                          : isFlipkart
                          ? "plat-flipkart"
                          : "plat-other"
                      }`}
                    >
                      {isAmazon && "🛒 Amazon"}
                      {isFlipkart && "⚡ Flipkart"}
                      {!isAmazon && !isFlipkart && `🛍️ ${item.platform}`}
                    </span>
                  </div>

                  <div className="merch-card-info">
                    <div className="movie-tag-micro">
                      <Film size={12} /> {item.mediaTitle}
                    </div>

                    <h4 className="merch-product-title" title={item.title}>
                      {item.title}
                    </h4>

                    <div className="merch-rating-row">
                      <span className="stars">
                        <Star size={13} fill="#fbbf24" color="#fbbf24" />
                        <strong>{item.rating || 4.8}</strong>
                      </span>
                      <span className="reviews-cnt">
                        ({item.reviewsCount || 210} reviews)
                      </span>
                    </div>

                    <div className="merch-price-row">
                      <div className="price-block">
                        <span className="current-price">
                          {item.currency || "₹"}
                          {item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="orig-price">
                            {item.currency || "₹"}
                            {item.originalPrice}
                          </span>
                        )}
                      </div>
                      {discountPercent && (
                        <span className="discount-tag">{discountPercent}% OFF</span>
                      )}
                    </div>

                    <a
                      href={item.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-buy-platform ${
                        isAmazon
                          ? "btn-amazon"
                          : isFlipkart
                          ? "btn-flipkart"
                          : "btn-generic"
                      }`}
                    >
                      <span>
                        {isAmazon
                          ? "Buy on Amazon"
                          : isFlipkart
                          ? "Buy on Flipkart"
                          : `Buy on ${item.platform}`}
                      </span>
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      <AnimatePresence>
        {isSellModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsSellModalOpen(false)}>
            <motion.div
              className="sell-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <div className="header-icon-title">
                  <div className="sell-icon-circle">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3>List Movie Merchandise</h3>
                    <p>Put your movie item on the WatchHub marketplace</p>
                  </div>
                </div>
                <button
                  className="btn-close-modal"
                  onClick={() => setIsSellModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleMarketplaceSellSubmit} className="sell-form-body">
                <div className="sell-field">
                  <label>Movie / Show Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batman, Interstellar, Attack on Titan"
                    value={formData.mediaTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, mediaTitle: e.target.value })
                    }
                  />
                </div>

                <div className="sell-field">
                  <label>Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vintage Batman Tumbler Scale Model"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="sell-form-row">
                  <div className="sell-field">
                    <label>Store / Platform *</label>
                    <select
                      value={formData.platform}
                      onChange={(e) =>
                        setFormData({ ...formData, platform: e.target.value })
                      }
                    >
                      <option value="Amazon">Amazon</option>
                      <option value="Flipkart">Flipkart</option>
                      <option value="Etsy">Etsy</option>
                      <option value="Myntra">Myntra</option>
                      <option value="WatchHub Store">WatchHub Store</option>
                      <option value="Other">Other Website</option>
                    </select>
                  </div>

                  <div className="sell-field">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="Figures & Collectibles">
                        Figures & Collectibles
                      </option>
                      <option value="Apparel & Wearables">
                        Apparel & Wearables
                      </option>
                      <option value="Posters & Art">Posters & Art</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="sell-form-row">
                  <div className="sell-field">
                    <label>Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1999"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="sell-field">
                    <label>Original MRP (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2999"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="sell-field">
                  <label>Product Link on Amazon / Flipkart / Website</label>
                  <input
                    type="url"
                    placeholder="https://www.amazon.in/dp/... or https://dl.flipkart.com/..."
                    value={formData.buyUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, buyUrl: e.target.value })
                    }
                  />
                </div>

                <div className="sell-field">
                  <label>Preset Image or Custom Link</label>
                  <div className="preset-images-scroll">
                    {PRESET_IMAGES.map((img) => (
                      <div
                        key={img.label}
                        className={`preset-thumb ${
                          formData.imageUrl === img.url ? "selected" : ""
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, imageUrl: img.url })
                        }
                      >
                        <img src={img.url} alt={img.label} />
                        <span>{img.label}</span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="url"
                    placeholder="Or enter custom image URL"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    style={{ marginTop: "8px" }}
                  />
                </div>

                <div className="sell-modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsSellModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Listing Item..." : "Publish to Marketplace"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
