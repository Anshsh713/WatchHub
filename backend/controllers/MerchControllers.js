const WatchHub_MerchItem = require("../models/WatchHub_MerchItem_model");

// Curated generator for items based on movie/show name
const generateCuratedMovieMerch = (mediaId, mediaTitle) => {
  const title = mediaTitle || "Cinema";
  const encoded = encodeURIComponent(title);

  return [
    {
      id: `curated-${mediaId}-1`,
      title: `${title} Collector's Edition Action Figure (1/10 Scale)`,
      description: `Premium highly-detailed articulated figure with swappable hands, authentic screen-accurate sculpt, and themed display base.`,
      price: 2499,
      originalPrice: 3499,
      currency: "₹",
      imageUrl:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
      platform: "Amazon",
      buyUrl: `https://www.amazon.in/s?k=${encodeURIComponent(title + " action figure collectible")}`,
      mediaId: String(mediaId),
      mediaTitle: title,
      category: "Figures & Collectibles",
      condition: "Brand New",
      badge: "Bestseller",
      rating: 4.8,
      reviewsCount: 342,
      sellerName: "Amazon Official Store",
      inStock: true,
    },
    {
      id: `curated-${mediaId}-2`,
      title: `${title} Official Graphic Oversized Streetwear T-Shirt`,
      description: `100% combed cotton, 240 GSM heavy-duty fabric with fade-resistant screen printed artwork from the original cinematic poster.`,
      price: 799,
      originalPrice: 1299,
      currency: "₹",
      imageUrl:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
      platform: "Flipkart",
      buyUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(title + " t shirt apparel")}`,
      mediaId: String(mediaId),
      mediaTitle: title,
      category: "Apparel & Wearables",
      condition: "Brand New",
      badge: "Trending",
      rating: 4.6,
      reviewsCount: 819,
      sellerName: "Flipkart SuperCom",
      inStock: true,
    },
    {
      id: `curated-${mediaId}-3`,
      title: `${title} Framed Limited Edition Metallic Finish Poster`,
      description: `High-definition museum grade print mounted on sturdy matte black wooden frame (18x24 inches) with anti-glare protective acrylic.`,
      price: 1199,
      originalPrice: 1799,
      currency: "₹",
      imageUrl:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop",
      platform: "Amazon",
      buyUrl: `https://www.amazon.in/s?k=${encodeURIComponent(title + " framed poster wall art")}`,
      mediaId: String(mediaId),
      mediaTitle: title,
      category: "Posters & Art",
      condition: "Brand New",
      badge: "Amazon's Choice",
      rating: 4.9,
      reviewsCount: 154,
      sellerName: "Artisans Guild",
      inStock: true,
    },
    {
      id: `curated-${mediaId}-4`,
      title: `${title} Deluxe Bobblehead Vinyl Figure`,
      description: `Stylized vinyl desk figurine capturing the iconic character pose with vibrant detailing and premium window box packaging.`,
      price: 1399,
      originalPrice: 1899,
      currency: "₹",
      imageUrl:
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop",
      platform: "Amazon",
      buyUrl: `https://www.amazon.in/s?k=${encodeURIComponent(title + " bobblehead vinyl figure")}`,
      mediaId: String(mediaId),
      mediaTitle: title,
      category: "Figures & Collectibles",
      condition: "Brand New",
      badge: "Popular",
      rating: 4.7,
      reviewsCount: 228,
      sellerName: "Pop Collectibles India",
      inStock: true,
    },
    {
      id: `curated-${mediaId}-5`,
      title: `${title} Metal Keychain & Stainless Steel Pendant Prop`,
      description: `Durable die-cast zinc alloy insignia keychain with laser-etched movie emblem and reinforced carabiner hook.`,
      price: 349,
      originalPrice: 599,
      currency: "₹",
      imageUrl:
        "https://images.unsplash.com/photo-1614036417651-efe5912149d8?q=80&w=600&auto=format&fit=crop",
      platform: "Flipkart",
      buyUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(title + " keychain accessories")}`,
      mediaId: String(mediaId),
      mediaTitle: title,
      category: "Accessories",
      condition: "Brand New",
      badge: "Hot Deal",
      rating: 4.5,
      reviewsCount: 460,
      sellerName: "Flipkart Fashion",
      inStock: true,
    },
    {
      id: `curated-${mediaId}-6`,
      title: `${title} Embroidered Fleece Pullover Winter Hoodie`,
      description: `320 GSM heavy brushed fleece hoodie with embroidered chest insignia, kangaroo pocket, and double-layered warm hood.`,
      price: 1599,
      originalPrice: 2499,
      currency: "₹",
      imageUrl:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop",
      platform: "Amazon",
      buyUrl: `https://www.amazon.in/s?k=${encodeURIComponent(title + " hoodie sweatshirt")}`,
      mediaId: String(mediaId),
      mediaTitle: title,
      category: "Apparel & Wearables",
      condition: "Brand New",
      badge: "Winter Special",
      rating: 4.7,
      reviewsCount: 388,
      sellerName: "Prime Wear",
      inStock: true,
    },
  ];
};

// GET /api/merch/media/:mediaId?title=...
exports.getMerchByMediaId = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { title = "Movie" } = req.query;

    // Fetch user-listed items from database
    let dbItems = [];
    try {
      dbItems = await WatchHub_MerchItem.find({ mediaId: String(mediaId) }).sort({
        createdAt: -1,
      });
    } catch (dbErr) {
      console.warn("DB query warning for merch:", dbErr.message);
    }

    // Default curated items tailored for this movie
    const curatedItems = generateCuratedMovieMerch(mediaId, title);

    // Combine: user items first, then curated items
    const combined = [...dbItems, ...curatedItems];

    res.json({
      success: true,
      mediaId,
      mediaTitle: title,
      items: combined,
    });
  } catch (error) {
    console.error("GET MERCH ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch merchandise items" });
  }
};

// GET /api/merch (Marketplace all items)
exports.getAllMerch = async (req, res) => {
  try {
    const { category, platform, search, sort } = req.query;

    let query = {};
    if (category && category !== "All") query.category = category;
    if (platform && platform !== "All") query.platform = platform;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { mediaTitle: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const dbItems = await WatchHub_MerchItem.find(query).sort(sortOption).limit(50);

    // Provide default marketplace items if DB has few
    const defaultCatalog = [
      ...generateCuratedMovieMerch("550", "Fight Club"),
      ...generateCuratedMovieMerch("157336", "Interstellar"),
      ...generateCuratedMovieMerch("299536", "Avengers: Infinity War"),
      ...generateCuratedMovieMerch("27205", "Inception"),
    ];

    let combined = [...dbItems];
    if (combined.length < 8) {
      combined = [...combined, ...defaultCatalog];
    }

    res.json({
      success: true,
      items: combined,
    });
  } catch (error) {
    console.error("GET ALL MERCH ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch marketplace merchandise" });
  }
};

// POST /api/merch (Sell / List an Item)
exports.createMerchItem = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      imageUrl,
      platform = "Amazon",
      buyUrl,
      mediaId,
      mediaTitle,
      category = "Figures & Collectibles",
      condition = "Brand New",
      sellerName,
    } = req.body;

    if (!title || !price || !mediaId || !mediaTitle) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (title, price, mediaId, mediaTitle).",
      });
    }

    // Default image if omitted
    const finalImg =
      imageUrl && imageUrl.trim().startsWith("http")
        ? imageUrl
        : "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop";

    // Build URL if not full or empty (defaults to Amazon / Flipkart search if user just provided plain query)
    let finalBuyUrl = buyUrl;
    if (!finalBuyUrl || !finalBuyUrl.startsWith("http")) {
      if (platform === "Flipkart") {
        finalBuyUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(title)}`;
      } else {
        finalBuyUrl = `https://www.amazon.in/s?k=${encodeURIComponent(title)}`;
      }
    }

    const newItem = await WatchHub_MerchItem.create({
      title,
      description: description || `Authentic fan merchandise for ${mediaTitle}`,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.3),
      imageUrl: finalImg,
      platform,
      buyUrl: finalBuyUrl,
      mediaId: String(mediaId),
      mediaTitle,
      category,
      condition,
      badge: "Community Listed",
      rating: 5.0,
      reviewsCount: 1,
      seller: req.user ? req.user._id : null,
      sellerName: req.user?.displayName || req.user?.User_Name || sellerName || "WatchHub Seller",
      inStock: true,
    });

    res.status(201).json({
      success: true,
      message: "Merchandise item listed successfully!",
      item: newItem,
    });
  } catch (error) {
    console.error("CREATE MERCH ITEM ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to list item for sale.",
    });
  }
};

// DELETE /api/merch/:id
exports.deleteMerchItem = async (req, res) => {
  try {
    const { id } = req.params;
    await WatchHub_MerchItem.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Item removed successfully.",
    });
  } catch (error) {
    console.error("DELETE MERCH ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};
