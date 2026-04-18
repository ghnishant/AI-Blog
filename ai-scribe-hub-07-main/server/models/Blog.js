import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema);
