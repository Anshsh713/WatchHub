const mongoose = require("mongoose");
const WatchHub_Club = require("../models/WatchHub_Club_model");
const WatchHub_ClubMember = require("../models/WatchHub_ClubMember_model");
const WatchHub_ClubPost = require("../models/WatchHub_ClubPost_model");
const WatchHub_User = require("../models/WatchHub_User_model");
const { sendNotification } = require("../ultils/NotificationHelper");

// Helper: Generate URL-safe slug for club
const generateClubSlug = async (name) => {
  let baseSlug = name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  if (!baseSlug) baseSlug = "club";

  let slug = baseSlug;
  let counter = 1;
  while (await WatchHub_Club.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

/*
|--------------------------------------------------------------------------
| 1. GET ALL CLUBS (Explore, Search, Filter)
|--------------------------------------------------------------------------
*/
exports.getClubs = async (req, res) => {
  try {
    const {
      category = "all",
      search = "",
      tab = "all", // "all" | "joined" | "popular" | "newest"
      page = 1,
      limit = 12,
    } = req.query;

    const viewerId = req.user ? req.user._id : null;
    const filter = {};

    if (category && category !== "all") {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    if (tab === "joined" && viewerId) {
      const memberships = await WatchHub_ClubMember.find({
        user: viewerId,
        status: "active",
      }).select("club");
      const clubIds = memberships.map((m) => m.club);
      filter._id = { $in: clubIds };
    }

    let sort = { membersCount: -1, createdAt: -1 };
    if (tab === "newest") {
      sort = { createdAt: -1 };
    } else if (tab === "popular") {
      sort = { membersCount: -1, postsCount: -1 };
    }

    // Auto-seed starter clubs if collection is empty
    const globalCount = await WatchHub_Club.countDocuments();
    if (globalCount === 0) {
      const firstUser = await WatchHub_User.findOne();
      const creatorId = firstUser ? firstUser._id : new mongoose.Types.ObjectId();

      const seedClubs = [
        {
          name: "Anime Enthusiasts Vault",
          slug: "anime-enthusiasts-vault",
          category: "Anime Enthusiasts",
          description: "The home for all anime discussions, seasonal reviews, tier lists, and recommendations from shonen to slice of life.",
          avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
          bannerImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
          creator: creatorId,
          tags: ["anime", "manga", "shonen", "jujutsu-kaisen", "ghibli"],
          membersCount: 124,
          postsCount: 38,
        },
        {
          name: "Sci-Fi & Cyberpunk Odyssey",
          slug: "sci-fi-cyberpunk-odyssey",
          category: "Sci-Fi & Fantasy",
          description: "Deep-dive discussions on futuristic worldbuilding, Blade Runner, Dune, interstellar travel, and dystopian cinema.",
          avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80",
          bannerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
          creator: creatorId,
          tags: ["sci-fi", "cyberpunk", "dune", "space", "interstellar"],
          membersCount: 89,
          postsCount: 22,
        },
        {
          name: "Cinema Classics & Golden Age",
          slug: "cinema-classics-golden-age",
          category: "Cinema Classics",
          description: "Celebrating historical masterpieces, auteur filmmaking, film noir, and timeless cinematic achievements.",
          avatar: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&auto=format&fit=crop&q=80",
          bannerImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
          creator: creatorId,
          tags: ["classic", "noir", "history", "directors", "vintage"],
          membersCount: 65,
          postsCount: 17,
        },
        {
          name: "Marvel & DC Multiverse Club",
          slug: "marvel-dc-multiverse-club",
          category: "Marvel & DC",
          description: "Comic book adaptations, MCU phases, DC Studios slate, easter eggs, and superhero theories.",
          avatar: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80",
          bannerImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
          creator: creatorId,
          tags: ["mcu", "dc", "superhero", "batman", "spiderman"],
          membersCount: 152,
          postsCount: 45,
        },
      ];

      for (const sc of seedClubs) {
        const createdClub = await WatchHub_Club.create(sc);
        if (firstUser) {
          await WatchHub_ClubMember.create({
            club: createdClub._id,
            user: firstUser._id,
            role: "owner",
            status: "active",
          });
        }
        // Seed a starter post
        await WatchHub_ClubPost.create({
          club: createdClub._id,
          author: creatorId,
          title: `Welcome to ${createdClub.name}!`,
          content: `Welcome to the official ${createdClub.name} on WatchHub. Introduce yourself and share what you've been watching lately!`,
          likes: [],
          comments: [],
          isPinned: true,
        });
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [clubs, total] = await Promise.all([
      WatchHub_Club.find(filter)
        .populate("creator", "User_Name displayName avatar")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      WatchHub_Club.countDocuments(filter),
    ]);

    // Check membership for viewer
    let joinedClubIds = new Set();
    if (viewerId) {
      const viewerMemberships = await WatchHub_ClubMember.find({
        user: viewerId,
        club: { $in: clubs.map((c) => c._id) },
        status: "active",
      }).select("club");
      joinedClubIds = new Set(viewerMemberships.map((m) => m.club.toString()));
    }

    const enrichedClubs = clubs.map((c) => ({
      ...c,
      isMember: joinedClubIds.has(c._id.toString()),
      isOwner: viewerId && c.creator?._id?.toString() === viewerId.toString(),
    }));

    return res.status(200).json({
      success: true,
      clubs: enrichedClubs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (error) {
    console.error("GET CLUBS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch clubs" });
  }
};

/*
|--------------------------------------------------------------------------
| 2. GET SINGLE CLUB BY SLUG OR ID
|--------------------------------------------------------------------------
*/
exports.getClubByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    const viewerId = req.user ? req.user._id : null;

    let club;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      club = await WatchHub_Club.findById(identifier)
        .populate("creator", "User_Name displayName avatar bio")
        .lean();
    }
    if (!club) {
      club = await WatchHub_Club.findOne({ slug: identifier.toLowerCase() })
        .populate("creator", "User_Name displayName avatar bio")
        .lean();
    }

    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    let membership = null;
    if (viewerId) {
      membership = await WatchHub_ClubMember.findOne({
        club: club._id,
        user: viewerId,
      }).lean();
    }

    // Recent members preview
    const members = await WatchHub_ClubMember.find({
      club: club._id,
      status: "active",
    })
      .populate("user", "User_Name displayName avatar")
      .limit(8)
      .lean();

    return res.status(200).json({
      success: true,
      club: {
        ...club,
        isMember: Boolean(membership && membership.status === "active"),
        memberRole: membership ? membership.role : null,
        isOwner: viewerId && club.creator?._id?.toString() === viewerId.toString(),
      },
      previewMembers: members.map((m) => ({
        role: m.role,
        user: m.user,
        joinedAt: m.joinedAt,
      })),
    });
  } catch (error) {
    console.error("GET CLUB ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch club" });
  }
};

/*
|--------------------------------------------------------------------------
| 3. CREATE CLUB
|--------------------------------------------------------------------------
*/
exports.createClub = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      category,
      description,
      avatar,
      bannerImage,
      privacy = "public",
      tags = [],
      rules = [],
      featuredMedia = [],
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Club name is required" });
    }

    const cleanName = name.trim();
    const existingName = await WatchHub_Club.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, "i") },
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "A club with this name already exists",
      });
    }

    const slug = await generateClubSlug(cleanName);

    const club = await WatchHub_Club.create({
      name: cleanName,
      slug,
      category: category || "General",
      description: description || "",
      avatar: avatar || "",
      bannerImage: bannerImage || "",
      creator: userId,
      privacy,
      tags: Array.isArray(tags) ? tags : [],
      rules:
        Array.isArray(rules) && rules.length > 0
          ? rules
          : [
              "Be respectful to all club members.",
              "Use spoiler tags when discussing plot points.",
              "Stay on topic with media discussions.",
            ],
      featuredMedia: Array.isArray(featuredMedia) ? featuredMedia : [],
      membersCount: 1,
      postsCount: 0,
    });

    // Add creator as owner member
    await WatchHub_ClubMember.create({
      club: club._id,
      user: userId,
      role: "owner",
      status: "active",
    });

    // Send confirmation notification
    await sendNotification({
      recipient: userId,
      type: "system",
      title: "Club Created!",
      message: `You created "${club.name}". Invite friends and start discussions!`,
      link: `/clubs/${club.slug}`,
    });

    return res.status(201).json({
      success: true,
      message: "Club created successfully",
      club,
    });
  } catch (error) {
    console.error("CREATE CLUB ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to create club" });
  }
};

/*
|--------------------------------------------------------------------------
| 4. UPDATE CLUB
|--------------------------------------------------------------------------
*/
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, category, avatar, bannerImage, tags, rules, featuredMedia, privacy } =
      req.body;

    const club = await WatchHub_Club.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    // Check ownership or admin
    const member = await WatchHub_ClubMember.findOne({
      club: id,
      user: userId,
      role: { $in: ["owner", "admin"] },
    });

    if (!member && req.user.Role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this club",
      });
    }

    if (description !== undefined) club.description = description.trim();
    if (category !== undefined) club.category = category.trim();
    if (avatar !== undefined) club.avatar = avatar;
    if (bannerImage !== undefined) club.bannerImage = bannerImage;
    if (tags !== undefined) club.tags = tags;
    if (rules !== undefined) club.rules = rules;
    if (featuredMedia !== undefined) club.featuredMedia = featuredMedia;
    if (privacy !== undefined) club.privacy = privacy;

    await club.save();

    return res.status(200).json({
      success: true,
      message: "Club updated successfully",
      club,
    });
  } catch (error) {
    console.error("UPDATE CLUB ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update club" });
  }
};

/*
|--------------------------------------------------------------------------
| 5. JOIN / LEAVE CLUB
|--------------------------------------------------------------------------
*/
exports.joinClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const club = await WatchHub_Club.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    const existingMember = await WatchHub_ClubMember.findOne({
      club: id,
      user: userId,
    });

    if (existingMember) {
      return res.status(200).json({
        success: true,
        message: "Already a member of this club",
        isMember: true,
      });
    }

    await WatchHub_ClubMember.create({
      club: id,
      user: userId,
      role: "member",
      status: "active",
    });

    club.membersCount = (club.membersCount || 0) + 1;
    await club.save();

    // Notify club creator
    if (club.creator.toString() !== userId.toString()) {
      await sendNotification({
        recipient: club.creator,
        sender: userId,
        type: "club_post",
        title: "New Club Member",
        message: `@${req.user.User_Name} joined your club "${club.name}"`,
        link: `/clubs/${club.slug}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Joined "${club.name}"`,
      isMember: true,
      membersCount: club.membersCount,
    });
  } catch (error) {
    console.error("JOIN CLUB ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to join club" });
  }
};

exports.leaveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const club = await WatchHub_Club.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    const member = await WatchHub_ClubMember.findOne({
      club: id,
      user: userId,
    });

    if (!member) {
      return res.status(400).json({ success: false, message: "You are not a member of this club" });
    }

    if (member.role === "owner" && club.membersCount > 1) {
      return res.status(400).json({
        success: false,
        message: "Club owners cannot leave without transferring ownership",
      });
    }

    await WatchHub_ClubMember.findByIdAndDelete(member._id);

    club.membersCount = Math.max(0, (club.membersCount || 1) - 1);
    await club.save();

    return res.status(200).json({
      success: true,
      message: `Left "${club.name}"`,
      isMember: false,
      membersCount: club.membersCount,
    });
  } catch (error) {
    console.error("LEAVE CLUB ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to leave club" });
  }
};

/*
|--------------------------------------------------------------------------
| 6. GET CLUB MEMBERS
|--------------------------------------------------------------------------
*/
exports.getClubMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await WatchHub_ClubMember.find({ club: id, status: "active" })
      .populate("user", "User_Name displayName avatar bio")
      .sort({ role: 1, joinedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      members: members.map((m) => ({
        id: m._id,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
      total: members.length,
    });
  } catch (error) {
    console.error("GET CLUB MEMBERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch club members" });
  }
};

/*
|--------------------------------------------------------------------------
| 7. CLUB POSTS & DISCUSSIONS
|--------------------------------------------------------------------------
*/
exports.getClubPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user ? req.user._id : null;

    const posts = await WatchHub_ClubPost.find({ club: id })
      .populate("author", "User_Name displayName avatar")
      .populate("comments.author", "User_Name displayName avatar")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    const formattedPosts = posts.map((post) => ({
      ...post,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      hasLiked: viewerId
        ? post.likes?.some((like) => like.toString() === viewerId.toString())
        : false,
    }));

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
      total: formattedPosts.length,
    });
  } catch (error) {
    console.error("GET CLUB POSTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch club posts" });
  }
};

exports.createClubPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title = "", content, mediaAttachment } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Post content is required" });
    }

    const club = await WatchHub_Club.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    // Auto-join if public
    let member = await WatchHub_ClubMember.findOne({ club: id, user: userId });
    if (!member) {
      if (club.privacy === "public") {
        member = await WatchHub_ClubMember.create({
          club: id,
          user: userId,
          role: "member",
        });
        club.membersCount = (club.membersCount || 0) + 1;
      } else {
        return res.status(403).json({
          success: false,
          message: "You must be a member of this club to post",
        });
      }
    }

    const post = await WatchHub_ClubPost.create({
      club: id,
      author: userId,
      title: title.trim(),
      content: content.trim(),
      mediaAttachment: mediaAttachment || null,
      likes: [],
      comments: [],
      commentsCount: 0,
    });

    club.postsCount = (club.postsCount || 0) + 1;
    await club.save();

    await post.populate("author", "User_Name displayName avatar");

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: {
        ...post.toObject(),
        likesCount: 0,
        commentsCount: 0,
        hasLiked: false,
      },
    });
  } catch (error) {
    console.error("CREATE CLUB POST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to create post" });
  }
};

exports.deleteClubPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await WatchHub_ClubPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isAuthor = post.author.toString() === userId.toString();
    const isClubAdmin = await WatchHub_ClubMember.exists({
      club: post.club,
      user: userId,
      role: { $in: ["owner", "admin"] },
    });

    if (!isAuthor && !isClubAdmin && req.user.Role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }

    await WatchHub_ClubPost.findByIdAndDelete(postId);
    await WatchHub_Club.findByIdAndUpdate(post.club, {
      $inc: { postsCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CLUB POST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

exports.toggleLikeClubPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await WatchHub_ClubPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const likedIndex = post.likes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    let hasLiked = false;
    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
    } else {
      post.likes.push(userId);
      hasLiked = true;

      // Notify post author
      if (post.author.toString() !== userId.toString()) {
        const club = await WatchHub_Club.findById(post.club).select("slug name");
        await sendNotification({
          recipient: post.author,
          sender: userId,
          type: "club_post",
          title: "Post Liked",
          message: `@${req.user.User_Name} liked your post in "${club?.name || "a club"}"`,
          link: `/clubs/${club?.slug}`,
        });
      }
    }

    await post.save();

    return res.status(200).json({
      success: true,
      hasLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("TOGGLE LIKE POST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to toggle like" });
  }
};

exports.addClubPostComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const post = await WatchHub_ClubPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const newComment = {
      author: userId,
      content: content.trim(),
      createdAt: new Date(),
      likes: [],
    };

    post.comments.push(newComment);
    post.commentsCount = post.comments.length;
    await post.save();

    // Populate the newly created comment author
    const updatedPost = await WatchHub_ClubPost.findById(postId)
      .populate("comments.author", "User_Name displayName avatar")
      .lean();

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    // Send notification to post author
    if (post.author.toString() !== userId.toString()) {
      const club = await WatchHub_Club.findById(post.club).select("slug name");
      await sendNotification({
        recipient: post.author,
        sender: userId,
        type: "club_comment",
        title: "New Club Comment",
        message: `@${req.user.User_Name} commented on your post: "${content.trim().slice(0, 50)}..."`,
        link: `/clubs/${club?.slug}`,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Comment added",
      comment: addedComment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error("ADD POST COMMENT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

/*
|--------------------------------------------------------------------------
| 8. GET CLUBS JOINED BY A SPECIFIC USER (For Profile Overview & Clubs Tab)
|--------------------------------------------------------------------------
*/
exports.getUserClubs = async (req, res) => {
  try {
    const { identifier } = req.params;
    let targetUser;

    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      targetUser = await WatchHub_User.findById(identifier);
    }
    if (!targetUser) {
      targetUser = await WatchHub_User.findOne({
        User_Name: { $regex: new RegExp(`^${identifier.trim()}$`, "i") },
      });
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const memberships = await WatchHub_ClubMember.find({
      user: targetUser._id,
      status: "active",
    })
      .populate("club")
      .sort({ joinedAt: -1 })
      .lean();

    const clubs = memberships
      .filter((m) => m.club)
      .map((m) => ({
        ...m.club,
        userRole: m.role,
        joinedAt: m.joinedAt,
      }));

    return res.status(200).json({
      success: true,
      clubs,
      total: clubs.length,
    });
  } catch (error) {
    console.error("GET USER CLUBS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user clubs" });
  }
};
