const express = require('express');
const { body, validationResult } = require('express-validator');
const Thought = require('../models/Thought');
const auth = require('../middleware/auth');
const { getAISuggestion } = require('../services/aiService');

const router = express.Router();

// @route   POST /api/thoughts
// @desc    Create a new thought with AI suggestion
// @access  Private
router.post('/', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Thought content must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { content, mood, tags } = req.body;

    // Create thought
    const thought = new Thought({
      user: req.user._id,
      content,
      mood: mood || 'neutral',
      tags: tags || []
    });

    // Get AI suggestion
    try {
      const aiSuggestion = await getAISuggestion(content);
      thought.aiSuggestion = aiSuggestion;
    } catch (aiError) {
      console.error('AI suggestion error:', aiError);
      thought.aiSuggestion = 'Unable to generate AI suggestion at this time.';
    }

    await thought.save();

    // Populate user info
    await thought.populate('user', 'name email');

    res.status(201).json({
      message: 'Thought created successfully',
      thought
    });

  } catch (error) {
    console.error('Create thought error:', error);
    res.status(500).json({ 
      error: 'Server error while creating thought' 
    });
  }
});

// @route   GET /api/thoughts
// @desc    Get all thoughts for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, mood } = req.query;
    
    const query = { user: req.user._id };
    if (mood && mood !== 'all') {
      query.mood = mood;
    }

    const thoughts = await Thought.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Thought.countDocuments(query);

    res.json({
      thoughts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalThoughts: total
    });

  } catch (error) {
    console.error('Get thoughts error:', error);
    res.status(500).json({ 
      error: 'Server error while fetching thoughts' 
    });
  }
});

// @route   GET /api/thoughts/:id
// @desc    Get a specific thought by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const thought = await Thought.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email');

    if (!thought) {
      return res.status(404).json({ 
        error: 'Thought not found' 
      });
    }

    res.json({ thought });

  } catch (error) {
    console.error('Get thought error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        error: 'Invalid thought ID' 
      });
    }
    res.status(500).json({ 
      error: 'Server error while fetching thought' 
    });
  }
});

// @route   PUT /api/thoughts/:id
// @desc    Update a thought
// @access  Private
router.put('/:id', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Thought content must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { content, mood, tags } = req.body;

    const thought = await Thought.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!thought) {
      return res.status(404).json({ 
        error: 'Thought not found' 
      });
    }

    // Update thought
    thought.content = content;
    if (mood) thought.mood = mood;
    if (tags) thought.tags = tags;

    // Get new AI suggestion if content changed
    if (content !== thought.content) {
      try {
        const aiSuggestion = await getAISuggestion(content);
        thought.aiSuggestion = aiSuggestion;
      } catch (aiError) {
        console.error('AI suggestion error:', aiError);
        thought.aiSuggestion = 'Unable to generate AI suggestion at this time.';
      }
    }

    await thought.save();
    await thought.populate('user', 'name email');

    res.json({
      message: 'Thought updated successfully',
      thought
    });

  } catch (error) {
    console.error('Update thought error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        error: 'Invalid thought ID' 
      });
    }
    res.status(500).json({ 
      error: 'Server error while updating thought' 
    });
  }
});

// @route   DELETE /api/thoughts/:id
// @desc    Delete a thought
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const thought = await Thought.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!thought) {
      return res.status(404).json({ 
        error: 'Thought not found' 
      });
    }

    res.json({
      message: 'Thought deleted successfully'
    });

  } catch (error) {
    console.error('Delete thought error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        error: 'Invalid thought ID' 
      });
    }
    res.status(500).json({ 
      error: 'Server error while deleting thought' 
    });
  }
});

module.exports = router;

