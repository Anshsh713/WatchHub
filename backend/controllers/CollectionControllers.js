const mongoose = require("mongoose");
const WatchHub_Collection = require("../models/WatchHub_Collection_model");
const WatchHub_CollectionVote = require("../models/WatchHub_CollectionVote_model");
const WatchHub_CollectionRating = require("../models/WatchHub_CollectionRating_model");
const WatchHub_CollectionLike = require("../models/WatchHub_CollectionLike_model");
const WatchHub_CollectionFollow = require("../models/WatchHub_CollectionFollow_model");
const WatchHub_CollectionReview = require("../models/WatchHub_CollectionReview_model");
const WatchHub_CollectionActivity = require("../models/WatchHub_CollectionActivity_model");
const WatchHub_CollectionReport = require("../models/WatchHub_CollectionReport_model");
const WatchHub_Friendship = require("../models/WatchHub_Friendship_model");
const WatchHub_User = require("../models/WatchHub_User_model");

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

// Create clean, URL-safe slug with collision avoidance
const generateSlug = async (name) => {
  let baseSlug = name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  if (!baseSlug) {
    baseSlug = "collection";
  }

  let slug = baseSlug;
  let counter = 1;
  while (await WatchHub_Collection.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// Check if two users are confirmed friends
const areFriends = async (userId1, userId2) => {
  if (!userId1 || !userId2) return false;
  if (userId1.toString() === userId2.toString()) return true;

  const friendship = await WatchHub_Friendship.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: "accepted" },
      { requester: userId2, recipient: userId1, status: "accepted" },
    ],
  });

  return Boolean(friendship);
};

// Check if requester has view permission for a collection
const canUserViewCollection = async (collection, userId) => {
  if (collection.visibility === "public") return true;
  if (!userId) return false;

  const userIdStr = userId.toString();
  const ownerIdStr = (collection.owner._id || collection.owner).toString();

  // Owner can always view
  if (userIdStr === ownerIdStr) return true;

  // Collaborators can view
  const isCollaborator = collection.collaborators.some(
    (c) => (c.user._id || c.user).toString() === userIdStr
  );
  if (isCollaborator) return true;

  // Friends-only visibility check
  if (collection.visibility === "friends") {
    return await areFriends(ownerIdStr, userIdStr);
  }

  return false;
};

// Check if requester has edit permission
const canUserEditCollection = (collection, userId) => {
  if (!userId) return false;
  const userIdStr = userId.toString();
  const ownerIdStr = (collection.owner._id || collection.owner).toString();

  if (userIdStr === ownerIdStr) return "owner";

  const collab = collection.collaborators.find(
    (c) => (c.user._id || c.user).toString() === userIdStr
  );

  if (collab && collab.role === "editor") return "editor";
  if (collab && collab.role === "viewer") return "viewer";

  return false;
};

// Calculate trending score for public collections
// Formula incorporates engagement weights and time decay
const calculateTrendingScore = (collection, timeframeDays = 7) => {
  const likes = collection.engagement?.likes || 0;
  const followers = collection.engagement?.followers || 0;
  const upvotes = collection.engagement?.upvotes || 0;
  const downvotes = collection.engagement?.downvotes || 0;
  const reviews = collection.engagement?.reviews || 0;
  const copies = collection.engagement?.copies || 0;
  const avgRating = collection.averageRating || 0;

  const totalVotes = upvotes + downvotes;
  const voteScoreFactor = totalVotes > 0 ? upvotes / totalVotes : 0.5;

  const rawScore =
    likes * 2 +
    followers * 3 +
    upvotes * 2.5 -
    downvotes * 1.5 +
    reviews * 4 +
    copies * 5 +
    avgRating * 2 * voteScoreFactor;

  // Time decay calculation
  const ageInHours = Math.max(
    1,
    (Date.now() - new Date(collection.updatedAt).getTime()) / (1000 * 60 * 60)
  );
  const gravity = 1.6;
  const decayedScore = rawScore / Math.pow(ageInHours + 2, gravity);

  return decayedScore;
};

/*
|--------------------------------------------------------------------------
| 1. COLLECTION CRUD CONTROLLERS
|--------------------------------------------------------------------------
*/

// POST /api/collections
exports.createCollection = async (req, res) => {
  try {
    const {
      name,
      description = "",
      type = "mixed",
      visibility = "public",
      coverImage = null,
      tags = [],
      allowCopy = true,
      allowComments = true,
      items = [],
      sections = [],
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    const slug = await generateSlug(name);

    const formattedItems = (items || []).map((item, idx) => ({
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath || null,
      backdropPath: item.backdropPath || null,
      releaseDate: item.releaseDate || null,
      voteAverage: item.voteAverage || 0,
      genres: Array.isArray(item.genres) ? item.genres : [],
      position: item.position !== undefined ? item.position : idx,
      sectionId: item.sectionId || null,
      note: item.note || "",
      noteIsPrivate: Boolean(item.noteIsPrivate),
      addedAt: new Date(),
    }));

    const formattedSections = (sections || []).map((s, idx) => ({
      name: s.name,
      position: s.position !== undefined ? s.position : idx,
    }));

    const newCollection = new WatchHub_Collection({
      owner: req.user._id,
      name: name.trim(),
      slug,
      description: description.trim(),
      type,
      visibility,
      coverImage,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      allowCopy: Boolean(allowCopy),
      allowComments: Boolean(allowComments),
      items: formattedItems,
      sections: formattedSections,
    });

    newCollection.recalculateStats();
    await newCollection.save();

    // Log Activity
    await WatchHub_CollectionActivity.create({
      collectionId: newCollection._id,
      user: req.user._id,
      activityType: "created",
      meta: { details: `Collection "${newCollection.name}" created` },
    });

    const populated = await WatchHub_Collection.findById(newCollection._id).populate(
      "owner",
      "User_Name User_Email"
    );

    return res.status(201).json({
      success: true,
      message: "Collection created successfully",
      collection: populated,
    });
  } catch (error) {
    console.error("Create collection error:", error);
    return res.status(500).json({ message: "Failed to create collection" });
  }
};

// GET /api/collections (My Collections)
exports.getMyCollections = async (req, res) => {
  try {
    const { type, visibility, sort = "updatedAt_desc", search = "", page = 1, limit = 24 } = req.query;

    const query = { owner: req.user._id };

    if (type && type !== "all") {
      query.type = type;
    }
    if (visibility && visibility !== "all") {
      query.visibility = visibility;
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { tags: { $regex: search.trim(), $options: "i" } },
      ];
    }

    let sortObj = { updatedAt: -1 };
    if (sort === "createdAt_desc") sortObj = { createdAt: -1 };
    if (sort === "name_asc") sortObj = { name: 1 };
    if (sort === "rating_desc") sortObj = { averageRating: -1 };
    if (sort === "items_desc") sortObj = { "stats.totalItems": -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [collections, total] = await Promise.all([
      WatchHub_Collection.find(query)
        .populate("owner", "User_Name User_Email")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      WatchHub_Collection.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      collections,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Get my collections error:", error);
    return res.status(500).json({ message: "Failed to fetch collections" });
  }
};

// GET /api/collections/following
exports.getFollowingCollections = async (req, res) => {
  try {
    const { page = 1, limit = 24 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const follows = await WatchHub_CollectionFollow.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const collectionIds = follows.map((f) => f.collectionId);

    const collections = await WatchHub_Collection.find({
      _id: { $in: collectionIds },
      visibility: { $in: ["public", "friends"] },
    }).populate("owner", "User_Name User_Email");

    const total = await WatchHub_CollectionFollow.countDocuments({ user: req.user._id });

    return res.status(200).json({
      success: true,
      collections,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Get following collections error:", error);
    return res.status(500).json({ message: "Failed to fetch following collections" });
  }
};

// GET /api/collections/shared
exports.getSharedCollections = async (req, res) => {
  try {
    const { page = 1, limit = 24 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { "collaborators.user": req.user._id };

    const [collections, total] = await Promise.all([
      WatchHub_Collection.find(query)
        .populate("owner", "User_Name User_Email")
        .populate("collaborators.user", "User_Name User_Email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WatchHub_Collection.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      collections,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Get shared collections error:", error);
    return res.status(500).json({ message: "Failed to fetch shared collections" });
  }
};

// GET /api/collections/:identifier (accepts either Mongo ObjectId or slug)
exports.getCollectionByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    let query;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { $or: [{ _id: identifier }, { slug: identifier }] };
    } else {
      query = { slug: identifier };
    }

    const collection = await WatchHub_Collection.findOne(query)
      .populate("owner", "User_Name User_Email")
      .populate("collaborators.user", "User_Name User_Email")
      .populate("copiedFromUser", "User_Name User_Email");

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const currentUserId = req.user ? req.user._id : null;
    const canView = await canUserViewCollection(collection, currentUserId);

    if (!canView) {
      return res.status(403).json({
        message: "This collection is private or restricted to friends.",
        visibility: collection.visibility,
      });
    }

    // Determine user interaction status if authenticated
    let userInteractions = {
      isOwner: false,
      userRole: null,
      hasLiked: false,
      voteType: null,
      personalRating: null,
      isFollowing: false,
    };

    if (currentUserId) {
      const editRole = canUserEditCollection(collection, currentUserId);
      userInteractions.isOwner = editRole === "owner";
      userInteractions.userRole = editRole || null;

      const [like, vote, rating, follow] = await Promise.all([
        WatchHub_CollectionLike.findOne({ user: currentUserId, collectionId: collection._id }),
        WatchHub_CollectionVote.findOne({ user: currentUserId, collectionId: collection._id }),
        WatchHub_CollectionRating.findOne({ user: currentUserId, collectionId: collection._id }),
        WatchHub_CollectionFollow.findOne({ user: currentUserId, collectionId: collection._id }),
      ]);

      userInteractions.hasLiked = Boolean(like);
      userInteractions.voteType = vote ? vote.voteType : null;
      userInteractions.personalRating = rating ? rating.rating : null;
      userInteractions.isFollowing = Boolean(follow);
    }

    // Filter private notes for non-owners/non-editors
    const isEditorOrOwner =
      userInteractions.isOwner || userInteractions.userRole === "editor";

    const sanitizedItems = collection.items.map((item) => {
      const plain = item.toObject ? item.toObject() : item;
      if (plain.noteIsPrivate && !isEditorOrOwner) {
        plain.note = "";
      }
      return plain;
    });

    const responseCollection = collection.toObject();
    responseCollection.items = sanitizedItems;

    return res.status(200).json({
      success: true,
      collection: responseCollection,
      userInteractions,
    });
  } catch (error) {
    console.error("Get collection details error:", error);
    return res.status(500).json({ message: "Failed to fetch collection details" });
  }
};

// PATCH /api/collections/:id
exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole) {
      return res.status(403).json({ message: "You do not have permission to edit this collection" });
    }

    const {
      name,
      description,
      type,
      visibility,
      coverImage,
      tags,
      allowCopy,
      allowComments,
    } = req.body;

    // Only owner can change visibility, allowCopy, or allowComments
    if (editRole === "owner") {
      if (visibility !== undefined) collection.visibility = visibility;
      if (allowCopy !== undefined) collection.allowCopy = Boolean(allowCopy);
      if (allowComments !== undefined) collection.allowComments = Boolean(allowComments);
    }

    if (name && name.trim() && name !== collection.name) {
      collection.name = name.trim();
      collection.slug = await generateSlug(name);
    }
    if (description !== undefined) collection.description = description.trim();
    if (type !== undefined) collection.type = type;
    if (coverImage !== undefined) collection.coverImage = coverImage;
    if (tags !== undefined && Array.isArray(tags)) {
      collection.tags = tags.map((t) => t.trim().toLowerCase());
    }

    collection.recalculateStats();
    await collection.save();

    const updated = await WatchHub_Collection.findById(collection._id).populate(
      "owner",
      "User_Name User_Email"
    );

    return res.status(200).json({
      success: true,
      message: "Collection updated successfully",
      collection: updated,
    });
  } catch (error) {
    console.error("Update collection error:", error);
    return res.status(500).json({ message: "Failed to update collection" });
  }
};

// DELETE /api/collections/:id
exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this collection" });
    }

    await Promise.all([
      WatchHub_Collection.deleteOne({ _id: id }),
      WatchHub_CollectionVote.deleteMany({ collectionId: id }),
      WatchHub_CollectionRating.deleteMany({ collectionId: id }),
      WatchHub_CollectionLike.deleteMany({ collectionId: id }),
      WatchHub_CollectionFollow.deleteMany({ collectionId: id }),
      WatchHub_CollectionReview.deleteMany({ collectionId: id }),
      WatchHub_CollectionActivity.deleteMany({ collectionId: id }),
      WatchHub_CollectionReport.deleteMany({ collectionId: id }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Delete collection error:", error);
    return res.status(500).json({ message: "Failed to delete collection" });
  }
};

/*
|--------------------------------------------------------------------------
| 2. MEDIA ITEMS MANAGEMENT
|--------------------------------------------------------------------------
*/

// POST /api/collections/:id/media
exports.addMediaItem = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    const {
      tmdbId,
      mediaType,
      title,
      posterPath,
      backdropPath,
      releaseDate,
      voteAverage = 0,
      genres = [],
      sectionId = null,
      note = "",
      noteIsPrivate = false,
    } = req.body;

    if (!tmdbId || !mediaType || !title) {
      return res.status(400).json({ message: "tmdbId, mediaType, and title are required" });
    }

    // Check duplicate
    const exists = collection.items.some(
      (item) => item.tmdbId === Number(tmdbId) && item.mediaType === mediaType
    );
    if (exists) {
      return res.status(409).json({ message: "Item is already in this collection" });
    }

    const nextPosition = collection.items.length;

    collection.items.push({
      tmdbId: Number(tmdbId),
      mediaType,
      title: title.trim(),
      posterPath: posterPath || null,
      backdropPath: backdropPath || null,
      releaseDate: releaseDate || null,
      voteAverage: Number(voteAverage) || 0,
      genres: Array.isArray(genres) ? genres : [],
      position: nextPosition,
      sectionId: sectionId || null,
      note: note ? note.trim() : "",
      noteIsPrivate: Boolean(noteIsPrivate),
      addedAt: new Date(),
    });

    collection.recalculateStats();
    await collection.save();

    // Log Activity
    await WatchHub_CollectionActivity.create({
      collectionId: collection._id,
      user: req.user._id,
      activityType: "media_added",
      meta: {
        mediaTitle: title,
        mediaType,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Media added to collection",
      collection,
    });
  } catch (error) {
    console.error("Add media error:", error);
    return res.status(500).json({ message: "Failed to add media item" });
  }
};

// DELETE /api/collections/:id/media/:mediaId
exports.removeMediaItem = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    const itemToRemove = collection.items.id(mediaId);
    if (!itemToRemove) {
      return res.status(404).json({ message: "Media item not found in collection" });
    }

    const removedTitle = itemToRemove.title;
    const removedType = itemToRemove.mediaType;

    collection.items.pull(mediaId);

    // Re-index remaining item positions
    collection.items.forEach((item, idx) => {
      item.position = idx;
    });

    collection.recalculateStats();
    await collection.save();

    // Log Activity
    await WatchHub_CollectionActivity.create({
      collectionId: collection._id,
      user: req.user._id,
      activityType: "media_removed",
      meta: {
        mediaTitle: removedTitle,
        mediaType: removedType,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Media removed from collection",
      collection,
    });
  } catch (error) {
    console.error("Remove media error:", error);
    return res.status(500).json({ message: "Failed to remove media item" });
  }
};

// PATCH /api/collections/:id/reorder
exports.reorderMediaItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemOrders } = req.body; // Array of { itemId, position, sectionId }

    if (!Array.isArray(itemOrders)) {
      return res.status(400).json({ message: "itemOrders must be an array" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    itemOrders.forEach(({ itemId, position, sectionId }) => {
      const item = collection.items.id(itemId);
      if (item) {
        if (position !== undefined) item.position = position;
        if (sectionId !== undefined) item.sectionId = sectionId || null;
      }
    });

    // Sort items array by position
    collection.items.sort((a, b) => a.position - b.position);

    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Media order updated",
      items: collection.items,
    });
  } catch (error) {
    console.error("Reorder media error:", error);
    return res.status(500).json({ message: "Failed to reorder items" });
  }
};

// PATCH /api/collections/:id/media/:mediaId/note
exports.updateMediaItemNote = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const { note, noteIsPrivate } = req.body;

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    const item = collection.items.id(mediaId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (note !== undefined) item.note = note.trim();
    if (noteIsPrivate !== undefined) item.noteIsPrivate = Boolean(noteIsPrivate);

    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Note updated",
      item,
    });
  } catch (error) {
    console.error("Update note error:", error);
    return res.status(500).json({ message: "Failed to update note" });
  }
};

/*
|--------------------------------------------------------------------------
| 3. SECTIONS MANAGEMENT
|--------------------------------------------------------------------------
*/

// POST /api/collections/:id/sections
exports.createSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Section name is required" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    const nextPosition = collection.sections.length;
    collection.sections.push({
      name: name.trim(),
      position: nextPosition,
    });

    await collection.save();

    // Log Activity
    await WatchHub_CollectionActivity.create({
      collectionId: collection._id,
      user: req.user._id,
      activityType: "section_created",
      meta: { sectionName: name.trim() },
    });

    return res.status(201).json({
      success: true,
      message: "Section created",
      sections: collection.sections,
    });
  } catch (error) {
    console.error("Create section error:", error);
    return res.status(500).json({ message: "Failed to create section" });
  }
};

// PATCH /api/collections/:id/sections/:sectionId
exports.updateSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const { name, position } = req.body;

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    const section = collection.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (name && name.trim()) section.name = name.trim();
    if (position !== undefined) section.position = Number(position);

    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Section updated",
      sections: collection.sections,
    });
  } catch (error) {
    console.error("Update section error:", error);
    return res.status(500).json({ message: "Failed to update section" });
  }
};

// DELETE /api/collections/:id/sections/:sectionId
exports.deleteSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    const section = collection.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Unassign section from items inside it
    collection.items.forEach((item) => {
      if (item.sectionId && item.sectionId.toString() === sectionId.toString()) {
        item.sectionId = null;
      }
    });

    collection.sections.pull(sectionId);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Section deleted",
      sections: collection.sections,
      items: collection.items,
    });
  } catch (error) {
    console.error("Delete section error:", error);
    return res.status(500).json({ message: "Failed to delete section" });
  }
};

// PATCH /api/collections/:id/sections/reorder
exports.reorderSections = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionOrders } = req.body; // Array of { sectionId, position }

    if (!Array.isArray(sectionOrders)) {
      return res.status(400).json({ message: "sectionOrders must be an array" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const editRole = canUserEditCollection(collection, req.user._id);
    if (!editRole || editRole === "viewer") {
      return res.status(403).json({ message: "Permission denied" });
    }

    sectionOrders.forEach(({ sectionId, position }) => {
      const section = collection.sections.id(sectionId);
      if (section && position !== undefined) {
        section.position = position;
      }
    });

    collection.sections.sort((a, b) => a.position - b.position);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Sections reordered",
      sections: collection.sections,
    });
  } catch (error) {
    console.error("Reorder sections error:", error);
    return res.status(500).json({ message: "Failed to reorder sections" });
  }
};

/*
|--------------------------------------------------------------------------
| 4. SOCIAL ACTIONS: LIKES, VOTES, RATINGS, FOLLOWS, COPY/REMIX
|--------------------------------------------------------------------------
*/

// POST /api/collections/:id/like
exports.likeCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const existingLike = await WatchHub_CollectionLike.findOne({
      user: req.user._id,
      collectionId: id,
    });

    if (existingLike) {
      return res.status(200).json({
        success: true,
        message: "Already liked",
        likes: collection.engagement.likes,
      });
    }

    await WatchHub_CollectionLike.create({
      user: req.user._id,
      collectionId: id,
    });

    collection.engagement.likes = (collection.engagement.likes || 0) + 1;
    collection.trendingScore = calculateTrendingScore(collection);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Collection liked",
      likes: collection.engagement.likes,
    });
  } catch (error) {
    console.error("Like error:", error);
    return res.status(500).json({ message: "Failed to like collection" });
  }
};

// DELETE /api/collections/:id/like
exports.unlikeCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const deleted = await WatchHub_CollectionLike.findOneAndDelete({
      user: req.user._id,
      collectionId: id,
    });

    if (deleted) {
      collection.engagement.likes = Math.max(0, (collection.engagement.likes || 1) - 1);
      collection.trendingScore = calculateTrendingScore(collection);
      await collection.save();
    }

    return res.status(200).json({
      success: true,
      message: "Collection unliked",
      likes: collection.engagement.likes,
    });
  } catch (error) {
    console.error("Unlike error:", error);
    return res.status(500).json({ message: "Failed to unlike collection" });
  }
};

// POST /api/collections/:id/vote
exports.voteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up' | 'down'

    if (!["up", "down"].includes(voteType)) {
      return res.status(400).json({ message: "voteType must be 'up' or 'down'" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const existingVote = await WatchHub_CollectionVote.findOne({
      user: req.user._id,
      collectionId: id,
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        return res.status(200).json({
          success: true,
          voteType: existingVote.voteType,
          upvotes: collection.engagement.upvotes,
          downvotes: collection.engagement.downvotes,
          voteScore: collection.voteScore,
        });
      }

      // Changed vote
      if (existingVote.voteType === "up" && voteType === "down") {
        collection.engagement.upvotes = Math.max(0, (collection.engagement.upvotes || 1) - 1);
        collection.engagement.downvotes = (collection.engagement.downvotes || 0) + 1;
      } else if (existingVote.voteType === "down" && voteType === "up") {
        collection.engagement.downvotes = Math.max(0, (collection.engagement.downvotes || 1) - 1);
        collection.engagement.upvotes = (collection.engagement.upvotes || 0) + 1;
      }

      existingVote.voteType = voteType;
      await existingVote.save();
    } else {
      await WatchHub_CollectionVote.create({
        user: req.user._id,
        collectionId: id,
        voteType,
      });

      if (voteType === "up") {
        collection.engagement.upvotes = (collection.engagement.upvotes || 0) + 1;
      } else {
        collection.engagement.downvotes = (collection.engagement.downvotes || 0) + 1;
      }
    }

    const totalVotes = (collection.engagement.upvotes || 0) + (collection.engagement.downvotes || 0);
    collection.voteScore =
      totalVotes > 0
        ? Number((((collection.engagement.upvotes || 0) / totalVotes) * 100).toFixed(1))
        : 0;

    collection.trendingScore = calculateTrendingScore(collection);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Vote recorded",
      voteType,
      upvotes: collection.engagement.upvotes,
      downvotes: collection.engagement.downvotes,
      voteScore: collection.voteScore,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return res.status(500).json({ message: "Failed to record vote" });
  }
};

// DELETE /api/collections/:id/vote
exports.removeVote = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const existingVote = await WatchHub_CollectionVote.findOneAndDelete({
      user: req.user._id,
      collectionId: id,
    });

    if (existingVote) {
      if (existingVote.voteType === "up") {
        collection.engagement.upvotes = Math.max(0, (collection.engagement.upvotes || 1) - 1);
      } else {
        collection.engagement.downvotes = Math.max(0, (collection.engagement.downvotes || 1) - 1);
      }

      const totalVotes = (collection.engagement.upvotes || 0) + (collection.engagement.downvotes || 0);
      collection.voteScore =
        totalVotes > 0
          ? Number((((collection.engagement.upvotes || 0) / totalVotes) * 100).toFixed(1))
          : 0;

      collection.trendingScore = calculateTrendingScore(collection);
      await collection.save();
    }

    return res.status(200).json({
      success: true,
      message: "Vote removed",
      voteType: null,
      upvotes: collection.engagement.upvotes,
      downvotes: collection.engagement.downvotes,
      voteScore: collection.voteScore,
    });
  } catch (error) {
    console.error("Remove vote error:", error);
    return res.status(500).json({ message: "Failed to remove vote" });
  }
};

// POST /api/collections/:id/rating
exports.rateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    await WatchHub_CollectionRating.findOneAndUpdate(
      { user: req.user._id, collectionId: id },
      { rating: numRating },
      { upsert: true, new: true }
    );

    // Recalculate average rating
    const allRatings = await WatchHub_CollectionRating.find({ collectionId: id });
    const count = allRatings.length;
    const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);

    collection.ratingCount = count;
    collection.averageRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    collection.trendingScore = calculateTrendingScore(collection);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Rating saved",
      personalRating: numRating,
      averageRating: collection.averageRating,
      ratingCount: collection.ratingCount,
    });
  } catch (error) {
    console.error("Rate collection error:", error);
    return res.status(500).json({ message: "Failed to rate collection" });
  }
};

// DELETE /api/collections/:id/rating
exports.removeRating = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    await WatchHub_CollectionRating.findOneAndDelete({
      user: req.user._id,
      collectionId: id,
    });

    const allRatings = await WatchHub_CollectionRating.find({ collectionId: id });
    const count = allRatings.length;
    const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);

    collection.ratingCount = count;
    collection.averageRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    collection.trendingScore = calculateTrendingScore(collection);
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Rating removed",
      personalRating: null,
      averageRating: collection.averageRating,
      ratingCount: collection.ratingCount,
    });
  } catch (error) {
    console.error("Remove rating error:", error);
    return res.status(500).json({ message: "Failed to remove rating" });
  }
};

// POST /api/collections/:id/follow
exports.followCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const existingFollow = await WatchHub_CollectionFollow.findOne({
      user: req.user._id,
      collectionId: id,
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: "Already following",
        followers: collection.engagement.followers,
      });
    }

    await WatchHub_CollectionFollow.create({
      user: req.user._id,
      collectionId: id,
    });

    collection.engagement.followers = (collection.engagement.followers || 0) + 1;
    collection.trendingScore = calculateTrendingScore(collection);
    await collection.save();

    // Activity
    await WatchHub_CollectionActivity.create({
      collectionId: collection._id,
      user: req.user._id,
      activityType: "followed",
    });

    return res.status(200).json({
      success: true,
      message: "Following collection",
      followers: collection.engagement.followers,
    });
  } catch (error) {
    console.error("Follow error:", error);
    return res.status(500).json({ message: "Failed to follow collection" });
  }
};

// DELETE /api/collections/:id/follow
exports.unfollowCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const deleted = await WatchHub_CollectionFollow.findOneAndDelete({
      user: req.user._id,
      collectionId: id,
    });

    if (deleted) {
      collection.engagement.followers = Math.max(0, (collection.engagement.followers || 1) - 1);
      collection.trendingScore = calculateTrendingScore(collection);
      await collection.save();
    }

    return res.status(200).json({
      success: true,
      message: "Unfollowed collection",
      followers: collection.engagement.followers,
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    return res.status(500).json({ message: "Failed to unfollow collection" });
  }
};

// POST /api/collections/:id/copy
exports.copyCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const sourceCollection = await WatchHub_Collection.findById(id);

    if (!sourceCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (!sourceCollection.allowCopy) {
      return res.status(403).json({ message: "The owner does not allow copying this collection" });
    }

    if (sourceCollection.visibility === "private") {
      return res.status(403).json({ message: "Private collections cannot be copied" });
    }

    const newName = `${sourceCollection.name} (Copy)`;
    const newSlug = await generateSlug(newName);

    // Deep copy sections and items
    const copiedSections = (sourceCollection.sections || []).map((s) => ({
      name: s.name,
      position: s.position,
    }));

    const copiedItems = (sourceCollection.items || []).map((item) => ({
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      backdropPath: item.backdropPath,
      releaseDate: item.releaseDate,
      voteAverage: item.voteAverage,
      genres: item.genres,
      position: item.position,
      sectionId: null, // Reset section mapping or map cleanly
      note: item.noteIsPrivate ? "" : item.note,
      noteIsPrivate: false,
      addedAt: new Date(),
    }));

    const newCollection = new WatchHub_Collection({
      owner: req.user._id,
      name: newName,
      slug: newSlug,
      description: sourceCollection.description,
      type: sourceCollection.type,
      visibility: "public",
      coverImage: sourceCollection.coverImage,
      items: copiedItems,
      sections: copiedSections,
      tags: sourceCollection.tags,
      allowCopy: true,
      allowComments: true,
      originalCollectionId: sourceCollection._id,
      copiedFromUser: sourceCollection.owner,
    });

    newCollection.recalculateStats();
    await newCollection.save();

    // Increment source copy counter
    sourceCollection.engagement.copies = (sourceCollection.engagement.copies || 0) + 1;
    sourceCollection.trendingScore = calculateTrendingScore(sourceCollection);
    await sourceCollection.save();

    // Activity
    await WatchHub_CollectionActivity.create({
      collectionId: sourceCollection._id,
      user: req.user._id,
      activityType: "copied",
    });

    return res.status(201).json({
      success: true,
      message: "Collection copied to your account",
      collection: newCollection,
    });
  } catch (error) {
    console.error("Copy collection error:", error);
    return res.status(500).json({ message: "Failed to copy collection" });
  }
};

/*
|--------------------------------------------------------------------------
| 5. REVIEWS & COMMENTS
|--------------------------------------------------------------------------
*/

// GET /api/collections/:id/reviews
exports.getCollectionReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { sort = "top", page = 1, limit = 10 } = req.query;

    const query = { collectionId: id };

    let sortObj = { createdAt: -1 };
    if (sort === "top") sortObj = { rating: -1, helpfulVotes: -1 };
    if (sort === "newest") sortObj = { createdAt: -1 };
    if (sort === "oldest") sortObj = { createdAt: 1 };
    if (sort === "most_helpful") sortObj = { helpfulVotes: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      WatchHub_CollectionReview.find(query)
        .populate("user", "User_Name User_Email")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      WatchHub_CollectionReview.countDocuments(query),
    ]);

    // Attach user helpful vote state
    const currentUserId = req.user ? req.user._id.toString() : null;
    const formattedReviews = reviews.map((r) => {
      const plain = r.toObject();
      plain.helpfulCount = plain.helpfulVotes ? plain.helpfulVotes.length : 0;
      plain.unhelpfulCount = plain.unhelpfulVotes ? plain.unhelpfulVotes.length : 0;
      plain.userVotedHelpful = currentUserId
        ? plain.helpfulVotes?.some((uid) => uid.toString() === currentUserId)
        : false;
      plain.userVotedUnhelpful = currentUserId
        ? plain.unhelpfulVotes?.some((uid) => uid.toString() === currentUserId)
        : false;
      return plain;
    });

    return res.status(200).json({
      success: true,
      reviews: formattedReviews,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// POST /api/collections/:id/reviews
exports.addCollectionReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    if (!rating || !reviewText || !reviewText.trim()) {
      return res.status(400).json({ message: "Rating and review text are required" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (!collection.allowComments) {
      return res.status(403).json({ message: "Comments and reviews are disabled for this collection" });
    }

    const existingReview = await WatchHub_CollectionReview.findOne({
      user: req.user._id,
      collectionId: id,
    });

    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this collection. You can edit your existing review." });
    }

    const newReview = await WatchHub_CollectionReview.create({
      user: req.user._id,
      collectionId: id,
      rating: Number(rating),
      reviewText: reviewText.trim(),
    });

    collection.engagement.reviews = (collection.engagement.reviews || 0) + 1;
    collection.trendingScore = calculateTrendingScore(collection);
    await collection.save();

    // Also update/sync personal rating
    await WatchHub_CollectionRating.findOneAndUpdate(
      { user: req.user._id, collectionId: id },
      { rating: Number(rating) },
      { upsert: true }
    );

    // Recalculate average rating
    const allRatings = await WatchHub_CollectionRating.find({ collectionId: id });
    const count = allRatings.length;
    const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
    collection.ratingCount = count;
    collection.averageRating = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    await collection.save();

    // Activity
    await WatchHub_CollectionActivity.create({
      collectionId: collection._id,
      user: req.user._id,
      activityType: "reviewed",
      meta: { rating: Number(rating) },
    });

    const populated = await WatchHub_CollectionReview.findById(newReview._id).populate(
      "user",
      "User_Name User_Email"
    );

    return res.status(201).json({
      success: true,
      message: "Review added",
      review: populated,
    });
  } catch (error) {
    console.error("Add review error:", error);
    return res.status(500).json({ message: "Failed to add review" });
  }
};

// PATCH /api/collections/:id/reviews/:reviewId
exports.updateCollectionReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;

    const review = await WatchHub_CollectionReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own review" });
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (reviewText !== undefined) review.reviewText = reviewText.trim();
    review.isEdited = true;

    await review.save();

    // Re-sync rating
    if (rating !== undefined) {
      await WatchHub_CollectionRating.findOneAndUpdate(
        { user: req.user._id, collectionId: review.collectionId },
        { rating: Number(rating) },
        { upsert: true }
      );
      const allRatings = await WatchHub_CollectionRating.find({
        collectionId: review.collectionId,
      });
      const count = allRatings.length;
      const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
      await WatchHub_Collection.findByIdAndUpdate(review.collectionId, {
        ratingCount: count,
        averageRating: count > 0 ? Number((sum / count).toFixed(1)) : 0,
      });
    }

    const populated = await WatchHub_CollectionReview.findById(review._id).populate(
      "user",
      "User_Name User_Email"
    );

    return res.status(200).json({
      success: true,
      message: "Review updated",
      review: populated,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({ message: "Failed to update review" });
  }
};

// DELETE /api/collections/:id/reviews/:reviewId
exports.deleteCollectionReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const review = await WatchHub_CollectionReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Do not allow collection owner to arbitrarily delete other users' reviews; only the review author can delete
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own review. For inappropriate reviews, please report them.",
      });
    }

    await WatchHub_CollectionReview.deleteOne({ _id: reviewId });

    const collection = await WatchHub_Collection.findById(id);
    if (collection) {
      collection.engagement.reviews = Math.max(0, (collection.engagement.reviews || 1) - 1);
      await collection.save();
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({ message: "Failed to delete review" });
  }
};

// POST /api/collections/:id/reviews/:reviewId/vote
exports.voteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { type } = req.body; // 'helpful' | 'unhelpful'

    const review = await WatchHub_CollectionReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const userId = req.user._id;

    if (type === "helpful") {
      const alreadyHelpful = review.helpfulVotes.some((u) => u.equals(userId));
      if (alreadyHelpful) {
        review.helpfulVotes.pull(userId);
      } else {
        review.helpfulVotes.push(userId);
        review.unhelpfulVotes.pull(userId);
      }
    } else if (type === "unhelpful") {
      const alreadyUnhelpful = review.unhelpfulVotes.some((u) => u.equals(userId));
      if (alreadyUnhelpful) {
        review.unhelpfulVotes.pull(userId);
      } else {
        review.unhelpfulVotes.push(userId);
        review.helpfulVotes.pull(userId);
      }
    }

    await review.save();

    return res.status(200).json({
      success: true,
      helpfulCount: review.helpfulVotes.length,
      unhelpfulCount: review.unhelpfulVotes.length,
    });
  } catch (error) {
    console.error("Vote review error:", error);
    return res.status(500).json({ message: "Failed to vote on review" });
  }
};

/*
|--------------------------------------------------------------------------
| 6. COLLABORATORS
|--------------------------------------------------------------------------
*/

// POST /api/collections/:id/collaborators
exports.addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { usernameOrEmail, role = "editor" } = req.body;

    if (!usernameOrEmail) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can add collaborators" });
    }

    const targetUser = await WatchHub_User.findOne({
      $or: [
        { User_Name: usernameOrEmail.trim() },
        { User_Email: usernameOrEmail.trim().toLowerCase() },
      ],
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser._id.toString() === collection.owner.toString()) {
      return res.status(400).json({ message: "Owner cannot be added as a collaborator" });
    }

    const alreadyCollaborator = collection.collaborators.some(
      (c) => c.user.toString() === targetUser._id.toString()
    );

    if (alreadyCollaborator) {
      return res.status(409).json({ message: "User is already a collaborator" });
    }

    collection.collaborators.push({
      user: targetUser._id,
      role: role === "viewer" ? "viewer" : "editor",
      addedAt: new Date(),
    });

    await collection.save();

    const populated = await WatchHub_Collection.findById(id).populate(
      "collaborators.user",
      "User_Name User_Email"
    );

    return res.status(200).json({
      success: true,
      message: "Collaborator added",
      collaborators: populated.collaborators,
    });
  } catch (error) {
    console.error("Add collaborator error:", error);
    return res.status(500).json({ message: "Failed to add collaborator" });
  }
};

// PATCH /api/collections/:id/collaborators/:userId
exports.updateCollaboratorRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'editor' or 'viewer'" });
    }

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can update collaborator roles" });
    }

    const collab = collection.collaborators.find(
      (c) => c.user.toString() === userId.toString()
    );

    if (!collab) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    collab.role = role;
    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Collaborator role updated",
      collaborators: collection.collaborators,
    });
  } catch (error) {
    console.error("Update collaborator error:", error);
    return res.status(500).json({ message: "Failed to update collaborator" });
  }
};

// DELETE /api/collections/:id/collaborators/:userId
exports.removeCollaborator = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const collection = await WatchHub_Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const isOwner = collection.owner.toString() === req.user._id.toString();
    const isSelf = userId.toString() === req.user._id.toString();

    if (!isOwner && !isSelf) {
      return res.status(403).json({ message: "Permission denied" });
    }

    collection.collaborators = collection.collaborators.filter(
      (c) => c.user.toString() !== userId.toString()
    );

    await collection.save();

    return res.status(200).json({
      success: true,
      message: "Collaborator removed",
      collaborators: collection.collaborators,
    });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    return res.status(500).json({ message: "Failed to remove collaborator" });
  }
};

/*
|--------------------------------------------------------------------------
| 7. DISCOVERY, TRENDING, RANKINGS & SEARCH
|--------------------------------------------------------------------------
*/

// GET /api/collections/public (with filters)
exports.getPublicCollections = async (req, res) => {
  try {
    const {
      type,
      tag,
      minRating,
      minItems,
      maxItems,
      sort = "trending",
      timeframe = "all",
      search = "",
      page = 1,
      limit = 24,
    } = req.query;

    const query = { visibility: "public" };

    if (type && type !== "all") {
      query.type = type;
    }
    if (tag && tag.trim()) {
      query.tags = tag.trim().toLowerCase();
    }
    if (minRating && Number(minRating) > 0) {
      query.averageRating = { $gte: Number(minRating) };
    }
    if (minItems && Number(minItems) > 0) {
      query["stats.totalItems"] = { $gte: Number(minItems) };
    }
    if (maxItems && Number(maxItems) > 0) {
      query["stats.totalItems"] = {
        ...(query["stats.totalItems"] || {}),
        $lte: Number(maxItems),
      };
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { tags: { $regex: search.trim(), $options: "i" } },
        { "items.title": { $regex: search.trim(), $options: "i" } },
      ];
    }

    let sortObj = { trendingScore: -1, updatedAt: -1 };
    if (sort === "trending") sortObj = { trendingScore: -1 };
    if (sort === "most_voted") sortObj = { voteScore: -1, "engagement.upvotes": -1 };
    if (sort === "top_rated") sortObj = { averageRating: -1, ratingCount: -1 };
    if (sort === "most_liked") sortObj = { "engagement.likes": -1 };
    if (sort === "most_followed") sortObj = { "engagement.followers": -1 };
    if (sort === "most_reviewed") sortObj = { "engagement.reviews": -1 };
    if (sort === "most_copied") sortObj = { "engagement.copies": -1 };
    if (sort === "newest") sortObj = { createdAt: -1 };
    if (sort === "updated") sortObj = { updatedAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [collections, total] = await Promise.all([
      WatchHub_Collection.find(query)
        .populate("owner", "User_Name User_Email")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      WatchHub_Collection.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      collections,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Get public collections error:", error);
    return res.status(500).json({ message: "Failed to fetch collections" });
  }
};

// GET /api/collections/trending
exports.getTrendingCollections = async (req, res) => {
  try {
    const { timeframe = "week", page = 1, limit = 24 } = req.query;
    const query = { visibility: "public" };

    if (timeframe === "day") {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: yesterday };
    } else if (timeframe === "week") {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: lastWeek };
    } else if (timeframe === "month") {
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: lastMonth };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [collections, total] = await Promise.all([
      WatchHub_Collection.find(query)
        .populate("owner", "User_Name User_Email")
        .sort({ trendingScore: -1, "engagement.likes": -1 })
        .skip(skip)
        .limit(Number(limit)),
      WatchHub_Collection.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      collections,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Get trending error:", error);
    return res.status(500).json({ message: "Failed to fetch trending collections" });
  }
};

// GET /api/collections/search?q=
exports.searchCollections = async (req, res) => {
  try {
    const { q = "", type, tag, page = 1, limit = 20 } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ collections: [], total: 0 });
    }

    const regex = new RegExp(q.trim(), "i");
    const query = {
      visibility: "public",
      $or: [
        { name: regex },
        { description: regex },
        { tags: regex },
        { "items.title": regex },
      ],
    };

    if (type && type !== "all") query.type = type;
    if (tag) query.tags = tag.toLowerCase();

    const skip = (Number(page) - 1) * Number(limit);
    const [collections, total] = await Promise.all([
      WatchHub_Collection.find(query)
        .populate("owner", "User_Name User_Email")
        .sort({ trendingScore: -1, voteScore: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WatchHub_Collection.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      collections,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("Search collections error:", error);
    return res.status(500).json({ message: "Search failed" });
  }
};

// GET /api/collections/user/:userId
exports.getUserCollections = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user._id : null;

    let allowedVisibilities = ["public"];

    if (currentUserId && currentUserId.toString() === userId.toString()) {
      allowedVisibilities = ["public", "friends", "private"];
    } else if (currentUserId && (await areFriends(currentUserId, userId))) {
      allowedVisibilities = ["public", "friends"];
    }

    const collections = await WatchHub_Collection.find({
      owner: userId,
      visibility: { $in: allowedVisibilities },
    })
      .populate("owner", "User_Name User_Email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error("Get user collections error:", error);
    return res.status(500).json({ message: "Failed to fetch user collections" });
  }
};

/*
|--------------------------------------------------------------------------
| 8. ACTIVITY & REPORTING
|--------------------------------------------------------------------------
*/

// GET /api/collections/:id/activity
exports.getCollectionActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await WatchHub_Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const canView = await canUserViewCollection(collection, req.user?._id);
    if (!canView) {
      return res.status(403).json({ message: "Access denied" });
    }

    const activity = await WatchHub_CollectionActivity.find({ collectionId: id })
      .populate("user", "User_Name User_Email")
      .sort({ createdAt: -1 })
      .limit(25);

    return res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("Get activity error:", error);
    return res.status(500).json({ message: "Failed to fetch activity" });
  }
};

// POST /api/collections/:id/report
exports.reportCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details = "" } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Report reason is required" });
    }

    const report = await WatchHub_CollectionReport.create({
      reporter: req.user._id,
      collectionId: id,
      reason,
      details: details.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted for moderation review",
      reportId: report._id,
    });
  } catch (error) {
    console.error("Report collection error:", error);
    return res.status(500).json({ message: "Failed to submit report" });
  }
};

// POST /api/collections/:id/reviews/:reviewId/report
exports.reportReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { reason, details = "" } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Report reason is required" });
    }

    const report = await WatchHub_CollectionReport.create({
      reporter: req.user._id,
      collectionId: id,
      reviewId,
      reason,
      details: details.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Review reported for moderation review",
      reportId: report._id,
    });
  } catch (error) {
    console.error("Report review error:", error);
    return res.status(500).json({ message: "Failed to submit report" });
  }
};
