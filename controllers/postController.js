const Post = require("../models/postModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getPost: ", error.message);
  }
};

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;
    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "postedBy and text fields are required" });
    }
    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user?._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized create post" });
    }
    const maxlength = 500;
    if (text.length > maxlength) {
      return res.status(400).json({
        error: `Text field should not exceed ${maxlength} characters`,
      });
    }

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in createPost: ", error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized delete post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deletePost: ", error.message);
  }
};

const likeAndUnlikePost = async (req, res) => {
  try {
    const { id: PostId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(PostId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      await Post.findByIdAndUpdate(PostId, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in likeAndUnlikePost: ", error.message);
  }
};

const replyPost = async (req, res) => {
  try {
    const { text } = req.body;
    const PostId = req.params.id;
    const userId = req.user._id;
    const userProfilePicture = req.user.userProfilePicture;
    const username = req.user.username;

    const post = await Post.findById(PostId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const reply = {
      userId,
      text,
      userProfilePicture,
      username,
    };

    post.replies.push(reply);
    await post.save();

    res.status(201).json({ message: "Reply created successfully", reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in replyPost: ", error.message);
  }
};

const getFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const following = user.following;
    const newFeed = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });
    res.status(200).json(newFeed);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getFeed: ", error.message);
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getUserPosts: ", error.message);
  }
};

module.exports = {
  createPost,
  getPost,
  deletePost,
  likeAndUnlikePost,
  replyPost,
  getFeed,
  getUserPosts,
};
