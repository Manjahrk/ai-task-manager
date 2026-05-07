const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    console.log('Fetch error:', error.message);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// GET stats
router.get('/stats/summary', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    };
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// POST create task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, estimatedTime, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });
    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate,
      estimatedTime: estimatedTime || 0,
      tags: tags || [],
    });
    res.status(201).json({ task });
  } catch (error) {
    console.log('Create error:', error.message);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate', 'estimatedTime', 'tags', 'aiSuggestion', 'aiPriorityReason'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });
    await task.save();
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;