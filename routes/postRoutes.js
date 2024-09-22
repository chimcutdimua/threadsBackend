const express = require("express");
const {
  createPost,
  getPost,
  deletePost,
  likeAndUnlikePost,
  replyPost,
  getFeed,
  getUserPosts,
} = require("../controllers/postController");
const protectRoute = require("../middleware/protectRoute");

const router = express.Router();

router.get("/feed", protectRoute, getFeed);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeAndUnlikePost);
router.put("/reply/:id", protectRoute, replyPost);

module.exports = router;
