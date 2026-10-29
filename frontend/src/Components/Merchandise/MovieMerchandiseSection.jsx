import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ExternalLink,
  PlusCircle,
  Tag,
  Star,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
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
  {
    label: "Hoodie",
    url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop",
  },
  {
    label: "Accessories / Keychain",
    url: "https://images.unsplash.com/photo-1614036417651-efe5912149d8?q=80&w=600&auto=format&fit=crop",
  },
];

export default function MovieMerchandiseSection({ mediaId, mediaTitle }) {
  const { user } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Sell Item Form State
  const [formData, setFormData] = useState({
    title: "",
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

  // Fetch Items for this Movie
  useEffect(() => {
    const fetchMerch = async () => {
      setLoading(true);
      let loaded = [];
      try {
        const res = await API.get(`/merch/media/${mediaId}`, {
          params: { title: mediaTitle },
        });
        if (res.data?.items) {
          loaded = res.data.items;
        }
      } catch (err) {
        console.warn("Merch backend fetch fallback:", err.message);
      }

      // Check local storage for user added items
      try {
        const local = JSON.parse(
          localStorage.getItem(`watchhub_merch_${mediaId}`) || "[]"
        );
        loaded = [...local, ...loaded];
      } catch (e) {}

      // Fallback if empty
      if (loaded.length === 0) {
        const encoded = encodeURIComponent(mediaTitle || "Cinema");
        loaded = [
          {
            _id: `f-${mediaId}-1`,
            title: `${mediaTitle} Collector's Edition Action Figure`,
            price: 2499,
            originalPrice: 3499,
            currency: "₹",
            imageUrl: PRESET_IMAGES[0].url,
            platform: "Amazon",
            buyUrl: `https://www.amazon.in/s?k=${encoded}+action+figure`,
            category: "Figures & Collectibles",
            badge: "Amazon's Choice",
            rating: 4.8,
            reviewsCount: 290,
            sellerName: "Amazon Official",
            inStock: true,
          },
          {
            _id: `f-${mediaId}-2`,
            title: `${mediaTitle} Graphic Vintage Washed Cotton T-Shirt`,
            price: 799,
            originalPrice: 1299,
            currency: "₹",
            imageUrl: PRESET_IMAGES[1].url,
            platform: "Flipkart",
            buyUrl: `https://www.flipkart.com/search?q=${encoded}+t+shirt`,
            category: "Apparel & Wearables",
            badge: "Trending",
            rating: 4.6,
            reviewsCount: 512,
            sellerName: "Flipkart Fashion",
            inStock: true,
          },
          {
            _id: `f-${mediaId}-3`,
            title: `${mediaTitle} Limited Metallic Framed Cinema Poster`,
            price: 1199,
            originalPrice: 1799,
            currency: "₹",
            imageUrl: PRESET_IMAGES[2].url,
            platform: "Amazon",
            buyUrl: `https://www.amazon.in/s?k=${encoded}+framed+poster`,
            category: "Posters & Art",
            badge: "Bestseller",
            rating: 4.9,
            reviewsCount: 140,
            sellerName: "Pop Decor",
            inStock: true,
          },
          {
            _id: `f-${mediaId}-4`,
            title: `${mediaTitle} Character Bobblehead Desk Figurine`,
            price: 1399,
            originalPrice: 1899,
            currency: "₹",
            imageUrl: PRESET_IMAGES[3].url,
            platform: "Amazon",
            buyUrl: `https://www.amazon.in/s?k=${encoded}+bobblehead+figure`,
            category: "Figures & Collectibles",
            badge: "Popular",
            rating: 4.7,
            reviewsCount: 220,
            sellerName: "Collector Zone",
            inStock: true,
          },
        ];
      }

      setItems(loaded);
      setLoading(false);
    };

    if (mediaId) {
      fetchMerch();
    }
  }, [mediaId, mediaTitle]);

  // Handle Sell Submission
  const handleSellSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price) {
      alert("Please provide an item title and price.");
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
      mediaId: String(mediaId),
      mediaTitle: mediaTitle || "Movie",
      category: formData.category,
      condition: formData.condition,
      sellerName: user?.displayName || user?.User_Name || "WatchHub Seller",
      badge: "Community Listed",
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
    };

    let createdItem = null;
    try {
      const res = await API.post("/merch", payload);
      if (res.data?.item) {
        createdItem = res.data.item;
      }
    } catch (apiErr) {
      console.warn("Backend create merch error, saving locally:", apiErr);
    }

    if (!createdItem) {
      createdItem = {
        ...payload,
        _id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }

    // Save locally
    try {
      const existing = JSON.parse(
        localStorage.getItem(`watchhub_merch_${mediaId}`) || "[]"
      );
      localStorage.setItem(
        `watchhub_merch_${mediaId}`,
        JSON.stringify([createdItem, ...existing])
      );
    } catch (e) {}

    setItems((prev) => [createdItem, ...prev]);
    setIsSubmitting(false);
    setIsSellModalOpen(false);
    setFormData({
      title: "",
      price: "",
      originalPrice: "",
      platform: "Amazon",
      buyUrl: "",
      imageUrl: PRESET_IMAGES[0].url,
      category: "Figures & Collectibles",
      condition: "Brand New",
      description: "",
    });
    alert(`Your item "${payload.title}" has been listed successfully!`);
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="movie-merchandise-section">
      {/* Section Header */}
      <div className="merch-header-row">
        <div className="merch-title-wrap">
          <div className="merch-badge-pill">
            <ShoppingBag size={14} /> MOVIE MERCH & STORE
          </div>
          <h2>Official & Fan Collectibles</h2>
          <p>
            Buy verified merchandise for <strong>{mediaTitle}</strong> on Amazon,
            Flipkart, or list your own collectible to sell!
          </p>
        </div>

        <button
          className="btn-sell-item"
          onClick={() => setIsSellModalOpen(true)}
        >
          <PlusCircle size={18} />
          <span>Sell an Item</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="merch-category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`merch-cat-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="merch-loading">
          <div className="spinner-small" />
          <span>Loading movie merchandise...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="no-merch-card">
          <ShoppingBag size={36} />
          <h4>No items in this category yet</h4>
          <p>Be the first fan to list an item for {mediaTitle}!</p>
          <button
            className="btn-primary"
            onClick={() => setIsSellModalOpen(true)}
          >
            List an Item Now
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
                {/* Image Container with Badges */}
                <div className="merch-card-img-box">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop";
                    }}
                  />

                  {item.badge && (
                    <span className="card-badge-tag">{item.badge}</span>
                  )}

                  {/* Store Platform Badge */}
                  <span
                    className={`card-platform-pill ${
                      isAmazon ? "plat-amazon" : isFlipkart ? "plat-flipkart" : "plat-other"
                    }`}
                  >
                    {isAmazon && "🛒 Amazon"}
                    {isFlipkart && "⚡ Flipkart"}
                    {!isAmazon && !isFlipkart && `🛍️ ${item.platform}`}
                  </span>
                </div>

                {/* Content */}
                <div className="merch-card-info">
                  <span className="merch-cat-label">{item.category}</span>
                  <h4 className="merch-product-title" title={item.title}>
                    {item.title}
                  </h4>

                  {/* Rating */}
                  <div className="merch-rating-row">
                    <span className="stars">
                      <Star size={13} fill="#fbbf24" color="#fbbf24" />
                      <strong>{item.rating || 4.7}</strong>
                    </span>
                    <span className="reviews-cnt">
                      ({item.reviewsCount || 180} reviews)
                    </span>
                  </div>

                  {/* Price */}
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

                  {/* Buy Outbound Button */}
                  <a
                    href={item.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-buy-platform ${
                      isAmazon ? "btn-amazon" : isFlipkart ? "btn-flipkart" : "btn-generic"
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

      {/* ===================== SELL ITEM MODAL ===================== */}
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
                    <h3>List Movie Merchandise to Sell</h3>
                    <p>Sell items related to "{mediaTitle}" on Amazon, Flipkart, or your store</p>
                  </div>
                </div>
                <button
                  className="btn-close-modal"
                  onClick={() => setIsSellModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSellSubmit} className="sell-form-body">
                {/* Title */}
                <div className="sell-field">
                  <label>Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batman 1/10 Scale Resin Action Figure"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                {/* Platform & Category Row */}
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
                      <option value="Props & Replicas">Props & Replicas</option>
                      <option value="Books & Manga">Books & Manga</option>
                    </select>
                  </div>
                </div>

                {/* Price & Original Price */}
                <div className="sell-form-row">
                  <div className="sell-field">
                    <label>Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1499"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="sell-field">
                    <label>Original MRP (₹) [Optional]</label>
                    <input
                      type="number"
                      placeholder="e.g. 2199"
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

                {/* Direct Product Link */}
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
                  <span className="field-hint">
                    (If left blank, it will automatically link to search results on {formData.platform})
                  </span>
                </div>

                {/* Image Selection Presets */}
                <div className="sell-field">
                  <label>Select Item Image or Enter Custom URL</label>
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
                    placeholder="Or paste custom image link (https://...)"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    style={{ marginTop: "8px" }}
                  />
                </div>

                {/* Description */}
                <div className="sell-field">
                  <label>Item Description / Condition Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the condition, size, authenticity, or packaging..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Submit */}
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
                    {isSubmitting ? "Listing Item..." : "Publish Item for Sale"}
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
