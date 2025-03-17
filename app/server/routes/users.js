const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authMiddleware, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post('/', [
  authMiddleware,
  authorize('admin'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
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
    const { email, password, firstName, lastName, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Create new user
    user = await User.create({
      email,
      password, // Will be hashed by the model hook
      firstName,
      lastName,
      role: role || 'user',
      active: true
    });
    
    // Return user data (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Private (Admin only)
 */
router.put('/:id', [
  authMiddleware,
  authorize('admin'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
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
    // Find user by ID
    let user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const { email, firstName, lastName, role, password } = req.body;
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already taken' 
        });
      }
    }
    
    // Update user fields
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    
    // If password is provided, hash it
    if (password) {
      user.password = password; // Will be hashed by the model hook
    }
    
    // Save updated user
    await user.save();
    
    // Return updated user (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate a user
 * @access  Private (Admin only)
 */
router.put('/:id/activate', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Already active
    if (user.active) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already active' 
      });
    }
    
    // Activate user
    user.active = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/users/:id/deactivate
 * @desc    Deactivate a user
 * @access  Private (Admin only)
 */
router.put('/:id/deactivate', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Cannot deactivate yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot deactivate your own account' 
      });
    }
    
    // Already inactive
    if (!user.active) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already inactive' 
      });
    }
    
    // Deactivate user
    user.active = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Change user role
 * @access  Private (Admin only)
 */
router.put('/:id/role', [
  authMiddleware,
  authorize('admin'),
  body('role').isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
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
    // Find user by ID
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const { role } = req.body;
    
    // No change needed
    if (user.role === role) {
      return res.status(400).json({ 
        success: false, 
        message: `User already has role: ${role}` 
      });
    }
    
    // Update role
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: `User role changed to ${role} successfully`
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/users/:id/change-role
 * @desc    Change user role (legacy endpoint)
 * @access  Private (Admin only)
 */
router.put('/:id/change-role', [
  authMiddleware,
  authorize('admin'),
  body('role').isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
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
    // Find user by ID
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const { role } = req.body;
    
    // No change needed
    if (user.role === role) {
      return res.status(400).json({ 
        success: false, 
        message: `User already has role: ${role}` 
      });
    }
    
    // Update role
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: `User role changed to ${role} successfully`
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 