const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { getAISuggestion, getMoodAnalysis } = require('../services/aiService');

const router = express.Router();

// @route   POST /api/ai/suggest
// @desc    Get AI suggestion for a thought
// @access  Private
router.post('/suggest', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters')
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

    const { content } = req.body;

    const suggestion = await getAISuggestion(content);

    res.json({
      suggestion,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI suggestion' 
    });
  }
});

// @route   POST /api/ai/analyze-mood
// @desc    Analyze mood from thought content
// @access  Private
router.post('/analyze-mood', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters')
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

    const { content } = req.body;

    const mood = await getMoodAnalysis(content);

    res.json({
      mood,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze mood' 
    });
  }
});

module.exports = router;


