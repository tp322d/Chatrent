const express = require('express');
const User = require('../models/User');
const Chat = require('../models/Chat');
const aiService = require('../services/aiService');

const router = express.Router();

// @route   POST /api/chat/compare
// @desc    Get responses from multiple AI models
// @access  Private
router.post('/compare', async (req, res) => {
  try {
    const { prompt, models } = req.body;
    const userId = req.user._id;

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Valid prompt is required' });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({ error: 'Prompt cannot exceed 5000 characters' });
    }

    // Query multiple models using server-side API keys
    const result = await aiService.queryMultipleModels(
      prompt.trim(), 
      models
    );

    // Save chat to database
    const chat = new Chat({
      userId,
      prompt: prompt.trim(),
      responses: result.responses,
      metadata: result.metadata
    });

    await chat.save();

    res.json({
      success: true,
      chatId: chat._id,
      prompt: prompt.trim(),
      responses: result.responses,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Chat comparison error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// @route   GET /api/chat/history
// @desc    Get user's chat history
// @access  Private
router.get('/history', async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('prompt responses.provider responses.model responses.error metadata createdAt');

    const total = await Chat.countDocuments({ userId });

    res.json({
      success: true,
      chats,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// @route   GET /api/chat/:id
// @desc    Get specific chat by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.id;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      chat
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to get chat' });
  }
});

// @route   DELETE /api/chat/:id
// @desc    Delete specific chat
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.id;

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// @route   GET /api/chat/models/available
// @desc    Get available models for each provider
// @access  Private
router.get('/models/available', async (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    res.json({
      success: true,
      models
    });
  } catch (error) {
    console.error('Get available models error:', error);
    res.status(500).json({ error: 'Failed to get available models' });
  }
});

module.exports = router;