import express from 'express';
import Blog from '../models/Blog.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all published blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ updated_at: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get blogs by author
router.get('/me', requireAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author_id: req.user.id }).sort({ updatedAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    
    // Try to update views - non-blocking
    Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
    
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new blog
router.post('/', requireAuth, async (req, res) => {
  try {
    const blog = new Blog({
      ...req.body,
      author_id: req.user.id
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a blog
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author_id: req.user.id },
      { ...req.body },
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a blog
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author_id: req.user.id });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
