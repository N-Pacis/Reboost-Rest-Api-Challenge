import express from 'express'
import { createPost, deletePost, getAllposts, getPostsByCategory, getPostsById, getUserPosts, updatePost } from '../controllers/post.controller.js';
const router = express.Router()

import authenticate from '../middlewares/auth.middleware.js';
import { validatePostCreation, validatePostUpdate } from '../validators/post.validator.js';

router.get("/", getAllposts)

router.get("/:postId", getPostsById)

router.get("/categories/:category", getPostsByCategory)

router.get("/user/all", authenticate,getUserPosts)

router.post("/create", authenticate,validatePostCreation,createPost)

router.put("/:postId/update", authenticate,validatePostUpdate,updatePost)

router.delete("/:postId/delete", authenticate,deletePost)

export default router;