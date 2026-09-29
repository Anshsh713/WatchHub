const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/Protect");
const CollectionControllers = require("../controllers/CollectionControllers");

/*
|--------------------------------------------------------------------------
| DISCOVERY & SEARCH ROUTES (Must come before /:identifier)
|--------------------------------------------------------------------------
*/
router.get("/public", optionalProtect, CollectionControllers.getPublicCollections);
router.get("/trending", optionalProtect, CollectionControllers.getTrendingCollections);
router.get("/search", optionalProtect, CollectionControllers.searchCollections);
router.get("/user/:userId", optionalProtect, CollectionControllers.getUserCollections);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER COLLECTION LISTS
|--------------------------------------------------------------------------
*/
router.get("/following", protect, CollectionControllers.getFollowingCollections);
router.get("/shared", protect, CollectionControllers.getSharedCollections);
router.get("/", protect, CollectionControllers.getMyCollections);
router.post("/", protect, CollectionControllers.createCollection);

/*
|--------------------------------------------------------------------------
| DETAIL, UPDATE & DELETE (Identifier can be Mongo ID or slug)
|--------------------------------------------------------------------------
*/
router.get("/:identifier", optionalProtect, CollectionControllers.getCollectionByIdOrSlug);
router.patch("/:id", protect, CollectionControllers.updateCollection);
router.delete("/:id", protect, CollectionControllers.deleteCollection);

/*
|--------------------------------------------------------------------------
| MEDIA ITEM MANAGEMENT
|--------------------------------------------------------------------------
*/
router.post("/:id/media", protect, CollectionControllers.addMediaItem);
router.delete("/:id/media/:mediaId", protect, CollectionControllers.removeMediaItem);
router.patch("/:id/reorder", protect, CollectionControllers.reorderMediaItems);
router.patch("/:id/media/:mediaId/note", protect, CollectionControllers.updateMediaItemNote);

/*
|--------------------------------------------------------------------------
| SECTIONS MANAGEMENT
|--------------------------------------------------------------------------
*/
router.post("/:id/sections", protect, CollectionControllers.createSection);
router.patch("/:id/sections/reorder", protect, CollectionControllers.reorderSections);
router.patch("/:id/sections/:sectionId", protect, CollectionControllers.updateSection);
router.delete("/:id/sections/:sectionId", protect, CollectionControllers.deleteSection);

/*
|--------------------------------------------------------------------------
| SOCIAL INTERACTIONS: LIKES, VOTES, RATINGS, FOLLOWS, COPY
|--------------------------------------------------------------------------
*/
router.post("/:id/like", protect, CollectionControllers.likeCollection);
router.delete("/:id/like", protect, CollectionControllers.unlikeCollection);

router.post("/:id/vote", protect, CollectionControllers.voteCollection);
router.delete("/:id/vote", protect, CollectionControllers.removeVote);

router.post("/:id/rating", protect, CollectionControllers.rateCollection);
router.delete("/:id/rating", protect, CollectionControllers.removeRating);

router.post("/:id/follow", protect, CollectionControllers.followCollection);
router.delete("/:id/follow", protect, CollectionControllers.unfollowCollection);

router.post("/:id/copy", protect, CollectionControllers.copyCollection);

/*
|--------------------------------------------------------------------------
| REVIEWS & RATINGS
|--------------------------------------------------------------------------
*/
router.get("/:id/reviews", optionalProtect, CollectionControllers.getCollectionReviews);
router.post("/:id/reviews", protect, CollectionControllers.addCollectionReview);
router.patch("/:id/reviews/:reviewId", protect, CollectionControllers.updateCollectionReview);
router.delete("/:id/reviews/:reviewId", protect, CollectionControllers.deleteCollectionReview);
router.post("/:id/reviews/:reviewId/vote", protect, CollectionControllers.voteReview);

/*
|--------------------------------------------------------------------------
| COLLABORATORS
|--------------------------------------------------------------------------
*/
router.post("/:id/collaborators", protect, CollectionControllers.addCollaborator);
router.patch("/:id/collaborators/:userId", protect, CollectionControllers.updateCollaboratorRole);
router.delete("/:id/collaborators/:userId", protect, CollectionControllers.removeCollaborator);

/*
|--------------------------------------------------------------------------
| ACTIVITY & MODERATION / REPORTING
|--------------------------------------------------------------------------
*/
router.get("/:id/activity", optionalProtect, CollectionControllers.getCollectionActivity);
router.post("/:id/report", protect, CollectionControllers.reportCollection);
router.post("/:id/reviews/:reviewId/report", protect, CollectionControllers.reportReview);

module.exports = router;
