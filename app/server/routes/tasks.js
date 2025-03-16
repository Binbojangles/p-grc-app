const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Task, User, Control } = require('../models');
const { authMiddleware, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get query parameters
    const { status, priority, assignedTo } = req.query;
    
    // Build where clause based on query parameters
    const whereClause = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assignedTo) whereClause.assignedTo = assignedTo;
    
    // If user is not admin or manager, only show their tasks
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      whereClause.assignedTo = req.user.id;
    }
    
    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Control,
          attributes: ['id', 'controlId', 'title']
        }
      ],
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC']
      ]
    });
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Control,
          attributes: ['id', 'controlId', 'title', 'description', 'category']
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    // Check if user has access to this task
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this task' 
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private (Admin or Manager)
 */
router.post('/', [
  authMiddleware,
  authorize(['admin', 'manager']),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('controlId').notEmpty().withMessage('Control ID is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user ID is required'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('status').isIn(['pending', 'in-progress', 'completed', 'overdue']).withMessage('Invalid status'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
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
      title, 
      description, 
      controlId, 
      assignedTo, 
      dueDate, 
      status, 
      priority, 
      notes 
    } = req.body;
    
    // Check if control exists
    const control = await Control.findByPk(controlId);
    if (!control) {
      return res.status(404).json({ 
        success: false, 
        message: 'Control not found' 
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(assignedTo);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Create new task
    const task = await Task.create({
      title,
      description,
      controlId,
      assignedTo,
      assignedDate: new Date(),
      dueDate,
      status: status || 'pending',
      priority: priority || 'medium',
      notes
    });
    
    // Fetch the task with associations
    const taskWithAssociations = await Task.findByPk(task.id, {
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
      data: taskWithAssociations
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private (Admin, Manager, or Assigned User)
 */
router.put('/:id', [
  authMiddleware,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'overdue']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
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
    // Find task by ID
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    // Check if user has permission to update this task
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this task' 
      });
    }
    
    const { 
      title, 
      description, 
      assignedTo, 
      dueDate, 
      status, 
      priority, 
      notes 
    } = req.body;
    
    // Only admin or manager can reassign tasks
    if (assignedTo && assignedTo !== task.assignedTo && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to reassign this task' 
      });
    }
    
    // If reassigning, check if user exists
    if (assignedTo && assignedTo !== task.assignedTo) {
      const user = await User.findByPk(assignedTo);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      task.assignedTo = assignedTo;
      task.assignedDate = new Date();
    }
    
    // Update task fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (notes !== undefined) task.notes = notes;
    
    // Save updated task
    await task.save();
    
    // Fetch the updated task with associations
    const updatedTask = await Task.findByPk(task.id, {
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
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private (Admin or Manager)
 */
router.delete('/:id', authMiddleware, authorize(['admin', 'manager']), async (req, res) => {
  try {
    // Find task by ID
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    // Delete task
    await task.destroy();
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/tasks/user/:userId
 * @desc    Get tasks assigned to a specific user
 * @access  Private (Admin, Manager, or the User themselves)
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user has permission to view these tasks
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these tasks' 
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
    
    const tasks = await Task.findAll({
      where: { assignedTo: userId },
      include: [
        {
          model: Control,
          attributes: ['id', 'controlId', 'title']
        }
      ],
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC']
      ]
    });
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/tasks/control/:controlId
 * @desc    Get tasks for a specific control
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
    
    // If user is not admin or manager, only show their tasks
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      whereClause.assignedTo = req.user.id;
    }
    
    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC']
      ]
    });
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get control tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/tasks/overdue
 * @desc    Get all overdue tasks
 * @access  Private (Admin or Manager)
 */
router.get('/overdue', authMiddleware, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        [Op.and]: [
          {
            dueDate: {
              [Op.lt]: new Date() // Less than today
            }
          },
          {
            status: {
              [Op.ne]: 'completed' // Not completed
            }
          }
        ]
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Control,
          attributes: ['id', 'controlId', 'title']
        }
      ],
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC']
      ]
    });
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 