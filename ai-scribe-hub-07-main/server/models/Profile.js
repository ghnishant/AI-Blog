import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  display_name: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar_url: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
