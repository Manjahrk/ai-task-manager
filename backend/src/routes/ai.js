const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();
router.use(protect);

const callGemini = async (prompt) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.candidates[0].content.parts[0].text;
};

router.post('/analyze', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id, status: { $ne: 'done' } });
    if (tasks.length === 0) return res.json({ message: 'No pending tasks to analyze', suggestions: [] });

    const taskList = tasks.map((t, i) =>
      `${i + 1}. "${t.title}" - Priority: ${t.priority}, Due: ${t.dueDate ? new Date(t.dueDate).toDateString() : 'No deadline'}, Status: ${t.status}`
    ).join('\n');

    const prompt = `You are a productivity AI. Analyze these tasks and respond ONLY with a valid JSON array (no markdown, no backticks, no explanation):
Tasks: ${taskList}
Format: [{"taskIndex":1,"suggestedPriority":"high","reason":"why","suggestion":"actionable tip","estimatedMinutes":45}]`;

    const content = await callGemini(prompt);
    const cleaned = content.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(cleaned);

    for (const s of suggestions) {
      if (tasks[s.taskIndex - 1]) {
        await Task.findByIdAndUpdate(tasks[s.taskIndex - 1]._id, {
          aiSuggestion: s.suggestion,
          aiPriorityReason: s.reason,
          estimatedTime: s.estimatedMinutes || 0,
        });
      }
    }

    const updatedTasks = await Task.find({ user: req.user._id, status: { $ne: 'done' } });
    res.json({ message: 'Tasks analyzed successfully!', suggestions, tasks: updatedTasks });
  } catch (error) {
    console.error('AI analyze error:', error.response?.data || error.message);
    res.status(500).json({ message: 'AI analysis failed.' });
  }
});

router.post('/suggest-task', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) return res.status(400).json({ message: 'Please provide context' });

    const prompt = `Based on: "${context}", suggest ONE task. Respond ONLY with JSON (no markdown, no backticks):
{"title":"Task title","description":"Brief desc","priority":"medium","estimatedMinutes":30,"tags":["tag1"]}`;

    const content = await callGemini(prompt);
    const cleaned = content.replace(/```json|```/g, '').trim();
    const suggestion = JSON.parse(cleaned);
    res.json({ suggestion });
  } catch (error) {
    console.error('AI suggest error:', error.message);
    res.status(500).json({ message: 'AI suggestion failed' });
  }
});

module.exports = router;