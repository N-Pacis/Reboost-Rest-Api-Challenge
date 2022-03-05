import {
  User
} from "../models/user.model.js";
import {
  Post
} from "../models/post.model.js";
import lodash from "lodash";
const {
  pick
} = lodash;

export const getUserPosts = async (req, res) => {
  try {
    let posts = await Post.find({
      author: req.user._id
    })
    .populate("author","Username Email")
    if (posts.length == 0) return res.status(200).send("You don't have any posts yet!");
    return res.send({
      status: 200,
      message: "ok",
      data: posts,
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const getAllposts = async (req, res) => {
  try {
    let posts = await Post.find()
    .populate("author","Username Email")
    if (posts.length == 0) return res.status(200).send("There aren't any posts yet!");
    return res.send({
      status: 200,
      message: "ok",
      data: posts,
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const getPostsByCategory = async (req, res) => {
  try {
    let posts = await Post.find({category: req.params.category})
    .populate("author","Username Email")
    if (posts.length == 0) return res.status(200).send("There aren't any posts in this category yet!");
    return res.send({
      status: 200,
      message: "ok",
      data: posts,
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const getPostsById = async (req, res) => {
  try {
    let posts = await Post.findById(req.params.postId)
    .populate("author","Username Email")
    if (!posts) return res.status(200).send("Invalid post Id!");
    return res.send({
      status: 200,
      message: "ok",
      data: posts,
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};

export const createPost = async (req, res) => {
  try {
    let post = new Post(
      pick(req.body, [
        "body",
        "category"
      ])
    );

    const time = new Date();
    post.CreatedAt = time;
    post.author = req.user._id
    let user = await User.findById(req.user._id);
    user.NumberOfPosts += 1;
    try {
      await post.save();
      await user.save()

      return res.status(201).send({
        message: "Post created successfully",
        data: post
      });
    } catch (ex) {
      res.status(400).send(ex.message);
    }
  } catch (ex) {
    res.status(500).send(ex.message);
  }
};

export const updatePost = async (req, res) => {
  try {
    try {
      let postInfo = await Post.findOne({_id: req.params.postId,author:req.user._id});
      if (!postInfo) return res.status(404).send("Post not found!");

      let body = req.body.body ?
        req.body.body :
        postInfo.body;
      
      let category = req.body.category ?
        req.body.category :
        postInfo.category;

      let post = await Post.findByIdAndUpdate(
        req.params.postId, {
          category: category,
          body: body,
        }, {
          new: true
        }
      );
      res.status(200).send({
        message: "Post updated successfully",
        data: post,
      });
    } catch (ex) {
      res.status(400).send(ex.message);
    }
  } catch (ex) {
    res.status(500).send(ex.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    let post = await Post.findOne({_id:req.params.postId,author:req.user._id});
    if (!post) return res.status(404).send("The post does not exist");
    
    let user = await User.findById(req.user._id);
    user.NumberOfPosts -= 1;

    await Post.findByIdAndRemove(req.params.postId);
    await user.save()
    res.status(200).send("Post deleted successfully");
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};
