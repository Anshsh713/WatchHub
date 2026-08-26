const WatchHubAnnouncement = require("../../models/WatchHub_Announcement_model");

const SEED_ANNOUNCEMENTS = [
  {
    mediaId: 1022789,
    mediaType: "movie",
    title: "Avengers: Doomsday",
    posterPath: "/1Q5b7g47t8lQpUeU6qV74wRj1lF.jpg",
    bannerPath: "/yF1FAMmL2DB9DEyStfVJzotTYEO.jpg",
    announcementType: "casting",
    titleText: "Robert Downey Jr. Confirmed as Doctor Doom in Avengers: Doomsday",
    description:
      "Marvel Studios stunned fans at San Diego Comic-Con revealing Robert Downey Jr. will return to the MCU to play Victor Von Doom (Doctor Doom), directed by the Russo Brothers.",
    trailerKey: null,
    releaseDate: new Date("2026-05-01"),
    previousReleaseDate: new Date("2025-05-02"),
    changeStatus: "Delayed",
    isSpoiler: false,
    franchiseSlug: "marvel-cinematic-universe",
    publishedAt: new Date("2026-08-20T10:00:00Z"),
  },
  {
    mediaId: 1022796,
    mediaType: "movie",
    title: "Spider-Man 4",
    posterPath: "/8Y43POKjjKDGI9z89v0efz1uWz8.jpg",
    bannerPath: "/8Y43POKjjKDGI9z89v0efz1uWz8.jpg",
    announcementType: "production_started",
    titleText: "Tom Holland's Spider-Man 4 Officially Enters Pre-Production",
    description:
      "Sony Pictures and Marvel Studios have locked the director and shooting schedule for the next Spider-Man chapter following No Way Home.",
    trailerKey: null,
    releaseDate: new Date("2026-07-24"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: false,
    franchiseSlug: "spiderman-universe",
    publishedAt: new Date("2026-08-18T14:30:00Z"),
  },
  {
    mediaId: 1064028,
    mediaType: "movie",
    title: "The Batman: Part II",
    posterPath: "/b0PlSFdDwbyK0cf5RxwDpaOJm2n.jpg",
    bannerPath: "/b0PlSFdDwbyK0cf5RxwDpaOJm2n.jpg",
    announcementType: "release_date_changed",
    titleText: "The Batman: Part II Release Date Shifted to October 2026",
    description:
      "Matt Reeves and Warner Bros. have adjusted the release date for Robert Pattinson's return as The Dark Knight to allow full polish for visual effects and script.",
    trailerKey: null,
    releaseDate: new Date("2026-10-02"),
    previousReleaseDate: new Date("2025-10-03"),
    changeStatus: "Delayed",
    isSpoiler: false,
    franchiseSlug: "batman-universe",
    publishedAt: new Date("2026-08-15T09:00:00Z"),
  },
  {
    mediaId: 1125510,
    mediaType: "movie",
    title: "Dune: Part Three (Dune Messiah)",
    posterPath: "/czembW0Rk1Ke7des6MmFRumKdYp.jpg",
    bannerPath: "/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg",
    announcementType: "movie_announced",
    titleText: "Denis Villeneuve Officially Directing Dune Messiah for Legendary",
    description:
      "Following the global triumph of Dune: Part Two, Warner Bros. and Legendary have greenlit Dune: Messiah with Timothée Chalamet and Zendaya returning.",
    trailerKey: null,
    releaseDate: new Date("2026-12-18"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-08-12T16:00:00Z"),
  },
  {
    mediaId: 66732,
    mediaType: "tv",
    title: "Stranger Things (Season 5)",
    posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    bannerPath: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    announcementType: "first_look",
    titleText: "First Look Behind the Scenes: Stranger Things The Final Season",
    description:
      "Netflix drops an exclusive behind-the-scenes look at the massive Hawkins set as production enters its final stretch for the series finale.",
    trailerKey: "d2k4c_g7uU8",
    releaseDate: new Date("2026-10-31"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-08-10T12:00:00Z"),
  },
  {
    mediaId: 95479,
    mediaType: "anime",
    title: "Jujutsu Kaisen: Culling Game",
    posterPath: "/hD75j3z9a1M29y0Z1p2d8X.jpg",
    bannerPath: "/gmECX1DvY9VoXqsaoe5wogVjIkh.jpg",
    announcementType: "teaser",
    titleText: "MAPPA Releases First Teaser Visual for Culling Game Arc",
    description:
      "Studio MAPPA reveals the intense first visual and teaser for the upcoming season of Jujutsu Kaisen adapting the pivotal Culling Game.",
    trailerKey: "8y3jHqFwLGs",
    releaseDate: new Date("2026-10-01"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: true,
    franchiseSlug: null,
    publishedAt: new Date("2026-08-08T08:00:00Z"),
  },
  {
    mediaId: 1084225,
    mediaType: "movie",
    title: "Toy Story 5",
    posterPath: "/2yA3Vb2U1L1T3Q0q7L4K.jpg",
    bannerPath: "/uF14B3Zz7B4m8w2X.jpg",
    announcementType: "poster",
    titleText: "Official Concept Poster Revealed for Disney Pixar's Toy Story 5",
    description:
      "Disney and Pixar showcase the new concept poster featuring Woody, Buzz, and the toys facing the age of high-tech electronics.",
    trailerKey: null,
    releaseDate: new Date("2026-06-19"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-08-05T11:00:00Z"),
  },
  {
    mediaId: 1011985,
    mediaType: "anime",
    title: "Chainsaw Man – The Movie: Reze Arc",
    posterPath: "/kXfq3nuL279XZtp0z71bE.jpg",
    bannerPath: "/5l1t0CjZ8gYQ7Zf.jpg",
    announcementType: "trailer",
    titleText: "Official Main Trailer Drops for Chainsaw Man Movie: Reze Arc",
    description:
      "The official explosive trailer introduces Reze and the high stakes confrontation coming to theatres worldwide.",
    trailerKey: "vG1zJ6_B1h8",
    releaseDate: new Date("2026-09-20"),
    previousReleaseDate: new Date("2026-11-15"),
    changeStatus: "Moved Earlier",
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-08-01T15:00:00Z"),
  },
  {
    mediaId: 1111873,
    mediaType: "movie",
    title: "Zootopia 2",
    posterPath: "/8Gxhx7k1m0pQ8zVb3bL2.jpg",
    bannerPath: "/3i81E83aElnc7zS6aD2N5qKqP7w.jpg",
    announcementType: "casting",
    titleText: "Ke Huy Quan Joins Voice Cast of Zootopia 2 as Gary the Snake",
    description:
      "Academy Award winner Ke Huy Quan officially boards the sequel alongside Ginnifer Goodwin and Jason Bateman.",
    trailerKey: null,
    releaseDate: new Date("2026-11-26"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-07-28T13:00:00Z"),
  },
  {
    mediaId: 93405,
    mediaType: "tv",
    title: "Squid Game (Season 3)",
    posterPath: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    bannerPath: "/2meX1nMdScFOoV4370rqHWFDxSu.jpg",
    announcementType: "renewed",
    titleText: "Netflix Confirms Squid Game Season 3 Will Conclude the Global Phenomenon",
    description:
      "Director Hwang Dong-hyuk delivers a personal letter to global fans confirming the final season is in production.",
    trailerKey: null,
    releaseDate: new Date("2026-12-01"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-07-20T10:00:00Z"),
  },
  {
    mediaId: 1051025,
    mediaType: "movie",
    title: "Tron: Ares",
    posterPath: "/t9XkeE7vFJm12TknT1g6pPh36mE.jpg",
    bannerPath: "/muth4OYamXf41G2evdrLEg8d3om.jpg",
    announcementType: "production_wrapped",
    titleText: "Filming Officially Wraps on Tron: Ares Starring Jared Leto and Evan Peters",
    description:
      "Director Joachim Rønning celebrates the completion of principal photography for Disney's high-tech sci-fi return to the Grid.",
    trailerKey: null,
    releaseDate: new Date("2026-10-10"),
    previousReleaseDate: null,
    changeStatus: null,
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-07-15T18:00:00Z"),
  },
  {
    mediaId: 1094556,
    mediaType: "movie",
    title: "Super Mario Galaxy Movie",
    posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    bannerPath: "/9n2tTRNVflmKDaqnfrGVx3s80gB.jpg",
    announcementType: "release_date_changed",
    titleText: "Nintendo & Illumination Lock April 2027 Release for New Mario Adventure",
    description:
      "Shigeru Miyamoto and Chris Meledandri announce the official premiere target for the next animated Mario adventure.",
    trailerKey: null,
    releaseDate: new Date("2027-04-03"),
    previousReleaseDate: new Date("2026-12-25"),
    changeStatus: "Delayed",
    isSpoiler: false,
    franchiseSlug: null,
    publishedAt: new Date("2026-07-10T14:00:00Z"),
  },
];

const mongoose = require("mongoose");

const ensureSeeded = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const count = await WatchHubAnnouncement.countDocuments();
      if (count === 0) {
        await WatchHubAnnouncement.insertMany(SEED_ANNOUNCEMENTS);
        console.log("✅ Seeded initial WatchHub announcements");
      }
    }
  } catch (err) {
    console.error("Auto-seed error:", err.message);
  }
};

/*
|--------------------------------------------------------------------------
| GET ANNOUNCEMENTS (with filtering & pagination)
|--------------------------------------------------------------------------
*/
exports.getAnnouncements = async (req, res) => {
  try {
    await ensureSeeded();
    const { type, franchise, page = 1, limit = 20, search } = req.query;

    const filter = {};

    if (type && type !== "all") {
      if (type.includes(",")) {
        filter.announcementType = { $in: type.split(",") };
      } else {
        filter.announcementType = type;
      }
    }

    if (franchise) {
      filter.franchiseSlug = franchise;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { titleText: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const announcements = await WatchHubAnnouncement.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await WatchHubAnnouncement.countDocuments(filter);

    res.json({
      success: true,
      results: announcements,
      page: Number(page),
      limit: Number(limit),
      total,
      hasMore: Number(page) * Number(limit) < total,
    });
  } catch (error) {
    console.error("Announcement Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET RELEASE DATE CHANGES
|--------------------------------------------------------------------------
*/
exports.getReleaseDateChanges = async (req, res) => {
  try {
    const changes = await WatchHubAnnouncement.find({
      $or: [
        { announcementType: "release_date_changed" },
        { changeStatus: { $ne: null } },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      results: changes,
    });
  } catch (error) {
    console.error("Release Date Changes Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch release date changes",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET NEW POSTERS / FIRST LOOKS
|--------------------------------------------------------------------------
*/
exports.getVisualAnnouncements = async (req, res) => {
  try {
    const visuals = await WatchHubAnnouncement.find({
      announcementType: { $in: ["poster", "first_look", "teaser", "movie_announced"] },
      posterPath: { $ne: null },
    })
      .sort({ publishedAt: -1 })
      .limit(24)
      .lean();

    res.json({
      success: true,
      results: visuals,
    });
  } catch (error) {
    console.error("Visual Announcements Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch visual announcements",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SEED ANNOUNCEMENTS ENDPOINT
|--------------------------------------------------------------------------
*/
exports.seedAnnouncements = async (req, res) => {
  try {
    await WatchHubAnnouncement.deleteMany({});
    const inserted = await WatchHubAnnouncement.insertMany(SEED_ANNOUNCEMENTS);

    res.json({
      success: true,
      message: `Seeded ${inserted.length} announcements successfully`,
      results: inserted,
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed announcements",
    });
  }
};
