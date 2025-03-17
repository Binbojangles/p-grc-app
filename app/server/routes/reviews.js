const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Review, User, Control } = require('../models');
const { authMiddleware, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get query parameters
    const { status, controlId } = req.query;
    
    // Build where clause based on query parameters
    const whereClause = {};
    if (status) whereClause.status = status;
    if (controlId) whereClause.controlId = controlId;
    
    // If user is not admin or manager, only show their reviews
    if (req.user.role === 'user') {
      whereClause.reviewerId = req.user.id;
    }
    
    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Control,
          attributes: ['id', 'controlId', 'title', 'category']
        }
      ],
      order: [['reviewDate', 'DESC']]
    });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/reviews/:id
 * @desc    Get review by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Control,
          attributes: ['id', 'controlId', 'title', 'description', 'category', 'requirements', 'guidance']
        }
      ]
    });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    // Check if user has access to this review
    if (req.user.role === 'user' && review.reviewerId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this review' 
      });
    }
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private (Admin or Manager)
 */
router.post('/', [
  authMiddleware,
  authorize(['admin', 'manager']),
  body('controlId').notEmpty().withMessage('Control ID is required'),
  body('reviewerId').notEmpty().withMessage('Reviewer ID is required'),
  body('reviewDate').isISO8601().withMessage('Review date must be a valid date'),
  body('status').isIn(['compliant', 'non-compliant', 'partially-compliant']).withMessage('Invalid status'),
  body('findings').notEmpty().withMessage('Findings are required'),
  body('nextReviewDate').isISO8601().withMessage('Next review date must be a valid date')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation error', 
      errors: errors.array() 
    });
  }

  try {
    const { 
      controlId, 
      reviewerId, 
      reviewDate, 
      status, 
      findings, 
      recommendations, 
      nextReviewDate 
    } = req.body;
    
    // Check if control exists
    const control = await Control.findByPk(controlId);
    if (!control) {
      return res.status(404).json({ 
        success: false, 
        message: 'Control not found' 
      });
    }
    
    // Check if reviewer exists
    const reviewer = await User.findByPk(reviewerId);
    if (!reviewer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reviewer not found' 
      });
    }
    
    // Create new review
    const review = await Review.create({
      controlId,
      reviewerId,
      reviewDate,
      status,
      findings,
      recommendations,
      nextReviewDate
    });
    
    // Update control's next review date
    await control.update({
      nextReviewDate
    });
    
    // Fetch the review with associations
    const reviewWithAssociations = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Control,
          attributes: ['id', 'controlId', 'title']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: reviewWithAssociations
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (Admin or Manager)
 */
router.put('/:id', [
  authMiddleware,
  authorize(['admin', 'manager']),
  body('status').optional().isIn(['compliant', 'non-compliant', 'partially-compliant']).withMessage('Invalid status'),
  body('findings').optional().notEmpty().withMessage('Findings cannot be empty'),
  body('nextReviewDate').optional().isISO8601().withMessage('Next review date must be a valid date')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation error', 
      errors: errors.array() 
    });
  }

  try {
    // Find review by ID
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    const { 
      reviewerId, 
      reviewDate, 
      status, 
      findings, 
      recommendations, 
      nextReviewDate 
    } = req.body;
    
    // If changing reviewer, check if user exists
    if (reviewerId && reviewerId !== review.reviewerId) {
      const reviewer = await User.findByPk(reviewerId);
      if (!reviewer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Reviewer not found' 
        });
      }
      review.reviewerId = reviewerId;
    }
    
    // Update review fields
    if (reviewDate) review.reviewDate = reviewDate;
    if (status) review.status = status;
    if (findings) review.findings = findings;
    if (recommendations !== undefined) review.recommendations = recommendations;
    if (nextReviewDate) review.nextReviewDate = nextReviewDate;
    
    // Save updated review
    await review.save();
    
    // If next review date changed, update control's next review date
    if (nextReviewDate) {
      const control = await Control.findByPk(review.controlId);
      if (control) {
        await control.update({
          nextReviewDate
        });
      }
    }
    
    // Fetch the updated review with associations
    const updatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Control,
          attributes: ['id', 'controlId', 'title']
        }
      ]
    });
    
    res.json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    // Find review by ID
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    // Delete review
    await review.destroy();
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/reviews/control/:controlId
 * @desc    Get reviews for a specific control
 * @access  Private
 */
router.get('/control/:controlId', authMiddleware, async (req, res) => {
  try {
    const controlId = req.params.controlId;
    
    // Check if control exists
    const control = await Control.findByPk(controlId);
    if (!control) {
      return res.status(404).json({ 
        success: false, 
        message: 'Control not found' 
      });
    }
    
    // Build where clause
    const whereClause = { controlId };
    
    // If user is not admin or manager, only show their reviews
    if (req.user.role === 'user') {
      whereClause.reviewerId = req.user.id;
    }
    
    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['reviewDate', 'DESC']]
    });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get control reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews by a specific user
 * @access  Private (Admin, Manager, or the User themselves)
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user has permission to view these reviews
    if (req.user.role === 'user' && req.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these reviews' 
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const reviews = await Review.findAll({
      where: { reviewerId: userId },
      include: [
        {
          model: Control,
          attributes: ['id', 'controlId', 'title', 'category']
        }
      ],
      order: [['reviewDate', 'DESC']]
    });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 