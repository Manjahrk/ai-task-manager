const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  dueDate: { type: Date },
  estimatedTime: { type: Number, default: 0 },
  tags: [{ type: String }],
  aiSuggestion: { type: String, default: '' },
  aiPriorityReason: { type: String, default: '' },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);