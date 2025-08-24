const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true,
    maxlength: [5000, 'Prompt cannot exceed 5000 characters']
  },
  responses: [{
    provider: {
      type: String,
      required: true,
      enum: ['openai', 'anthropic', 'google']
    },
    model: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    tokenUsage: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number
    },
    responseTime: {
      type: Number, // milliseconds
      required: true
    },
    error: {
      type: String,
      default: null
    }
  }],
  metadata: {
    totalResponseTime: Number, // milliseconds
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient user queries
chatSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);