const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Control, Task, Review, User } = require('../models');
const { authMiddleware, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

/**
 * @route   GET /api/controls
 * @desc    Get all controls
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const controls = await Control.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: controls
    });
  } catch (error) {
    console.error('Get controls error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/controls/:id
 * @desc    Get control by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const control = await Control.findByPk(req.params.id, {
      include: [
        {
          model: Task,
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });
    
    if (!control) {
      return res.status(404).json({ 
        success: false, 
        message: 'Control not found' 
      });
    }
    
    res.json({
      success: true,
      data: control
    });
  } catch (error) {
    console.error('Get control error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/controls
 * @desc    Create a new control
 * @access  Private (Admin or Manager)
 */
router.post('/', [
  authMiddleware,
  authorize(['admin', 'manager']),
  body('controlId').notEmpty().withMessage('Control ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('requirements').notEmpty().withMessage('Requirements are required'),
  body('implementationStatus').isIn(['not-implemented', 'partially-implemented', 'implemented']).withMessage('Invalid implementation status'),
  body('reviewFrequency').isIn(['monthly', 'quarterly', 'bi-annually', 'annually']).withMessage('Invalid review frequency')
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
      title, 
      description, 
      category, 
      requirements, 
      guidance, 
      implementationStatus, 
      reviewFrequency, 
      nextReviewDate 
    } = req.body;
    
    // Check if control ID already exists
    const existingControl = await Control.findOne({ where: { controlId } });
    if (existingControl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Control ID already exists' 
      });
    }
    
    // Create new control
    const control = await Control.create({
      controlId,
      title,
      description,
      category,
      requirements,
      guidance,
      implementationStatus: implementationStatus || 'not-implemented',
      reviewFrequency: reviewFrequency || 'quarterly',
      nextReviewDate: nextReviewDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Default to 90 days from now
    });
    
    res.status(201).json({
      success: true,
      data: control
    });
  } catch (error) {
    console.error('Create control error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/controls/:id
 * @desc    Update a control
 * @access  Private (Admin or Manager)
 */
router.put('/:id', [
  authMiddleware,
  authorize(['admin', 'manager']),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('requirements').optional().notEmpty().withMessage('Requirements cannot be empty'),
  body('implementationStatus').optional().isIn(['not-implemented', 'partially-implemented', 'implemented']).withMessage('Invalid implementation status'),
  body('reviewFrequency').optional().isIn(['monthly', 'quarterly', 'bi-annually', 'annually']).withMessage('Invalid review frequency')
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
    // Find control by ID
    const control = await Control.findByPk(req.params.id);
    
    if (!control) {
      return res.status(404).json({ 
        success: false, 
        message: 'Control not found' 
      });
    }
    
    const { 
      controlId, 
      title, 
      description, 
      category, 
      requirements, 
      guidance, 
      implementationStatus, 
      reviewFrequency, 
      nextReviewDate 
    } = req.body;
    
    // Check if control ID is being changed and already exists
    if (controlId && controlId !== control.controlId) {
      const existingControl = await Control.findOne({ where: { controlId } });
      if (existingControl) {
        return res.status(400).json({ 
          success: false, 
          message: 'Control ID already exists' 
        });
      }
      control.controlId = controlId;
    }
    
    // Update control fields
    if (title) control.title = title;
    if (description) control.description = description;
    if (category) control.category = category;
    if (requirements) control.requirements = requirements;
    if (guidance !== undefined) control.guidance = guidance;
    if (implementationStatus) control.implementationStatus = implementationStatus;
    if (reviewFrequency) control.reviewFrequency = reviewFrequency;
    if (nextReviewDate) control.nextReviewDate = nextReviewDate;
    
    // Save updated control
    await control.save();
    
    res.json({
      success: true,
      data: control
    });
  } catch (error) {
    console.error('Update control error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/controls/:id
 * @desc    Delete a control
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    // Find control by ID
    const control = await Control.findByPk(req.params.id);
    
    if (!control) {
      return res.status(404).json({ 
        success: false, 
        message: 'Control not found' 
      });
    }
    
    // Check if control has associated tasks or reviews
    const tasks = await Task.count({ where: { controlId: control.id } });
    const reviews = await Review.count({ where: { controlId: control.id } });
    
    if (tasks > 0 || reviews > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete control with associated tasks or reviews' 
      });
    }
    
    // Delete control
    await control.destroy();
    
    res.json({
      success: true,
      message: 'Control deleted successfully'
    });
  } catch (error) {
    console.error('Delete control error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/controls/due-for-review
 * @desc    Get controls due for review
 * @access  Private
 */
router.get('/due-for-review', authMiddleware, async (req, res) => {
  try {
    const controls = await Control.findAll({
      where: {
        nextReviewDate: {
          [Op.lte]: new Date() // Less than or equal to today
        }
      },
      order: [['nextReviewDate', 'ASC']]
    });
    
    res.json({
      success: true,
      data: controls
    });
  } catch (error) {
    console.error('Get controls due for review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 