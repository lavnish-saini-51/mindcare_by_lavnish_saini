const mongoose = require('mongoose');

const thoughtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Thought content is required'],
    trim: true,
    maxlength: [2000, 'Thought cannot be more than 2000 characters']
  },
  aiSuggestion: {
    type: String,
    default: ''
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'excited', 'calm', 'stressed', 'neutral'],
    default: 'neutral'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster queries
thoughtSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted date
thoughtSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
thoughtSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Thought', thoughtSchema);

