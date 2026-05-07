import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Brain, X, Check, Calendar, Clock, Tag, Zap, Search, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['todo', 'in-progress', 'done'];

function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task?._id;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedTime: task?.estimatedTime || '',
    tags: task?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : 0,
        dueDate: form.dueDate || undefined,
      };
      if (isEdit) {
        await axios.put(`/tasks/${task._id}`, payload);
        toast.success('Task updated!');
      } else {
        await axios.post('/tasks', payload);
        toast.success('Task created!');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleAISuggest = async () => {
    if (!form.title.trim()) return toast.error('Enter a task title first');
    setAiLoading(true);
    try {
      const res = await axios.post('/ai/suggest-task', { context: form.title + ' ' + form.description });
      const s = res.data.suggestion;
      setForm(p => ({
        ...p,
        description: s.description || p.description,
        priority: s.priority || p.priority,
        estimatedTime: s.estimatedMinutes || p.estimatedTime,
        tags: s.tags?.join(', ') || p.tags,
      }));
      toast.success('AI filled in the details!');
    } catch {
      toast.error('AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 20 }}>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 4 }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Title *</label>
            <input className="input" placeholder="What needs to be done?" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Description</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAISuggest} disabled={aiLoading}>
                {aiLoading ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Zap size={12} />}
                AI Fill
              </button>
            </div>
            <textarea className="input" placeholder="Add details..." value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              style={{ minHeight: 90, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
                <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Due Date
              </label>
              <input className="input" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Est. Time (mins)
              </label>
              <input className="input" type="number" placeholder="30" value={form.estimatedTime}
                onChange={e => setForm(p => ({ ...p, estimatedTime: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
              <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />Tags (comma separated)
            </label>
            <input className="input" placeholder="design, frontend, urgent" value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? <div className="spinner" /> : <><Check size={15} />{isEdit ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="card slide-in" style={{ marginBottom: 12, transition: 'border-color 0.2s, transform 0.2s', opacity: task.status === 'done' ? 0.7 : 1 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Status toggle circle */}
        <button onClick={() => onStatusChange(task._id, task.status === 'done' ? 'todo' : 'done')}
          style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${task.status === 'done' ? 'var(--green)' : 'var(--border2)'}`,
            background: task.status === 'done' ? 'var(--green)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          {task.status === 'done' && <Check size={12} color="white" strokeWidth={3} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, flex: 1, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text2)' : 'var(--text)' }}>
              {task.title}
            </h3>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              <span className={`badge badge-${task.status}`}>{task.status}</span>
            </div>
          </div>

          {task.description && (
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5 }}>{task.description}</p>
          )}

          {/* AI Suggestion */}
          {task.aiSuggestion && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(124,107,255,0.08)', borderRadius: 8, border: '1px solid rgba(124,107,255,0.2)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Zap size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>AI TIP: </span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{task.aiSuggestion}</span>
              </div>
            </div>
          )}

          {/* Meta info */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {task.dueDate && (
              <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} />
                {isOverdue ? '⚠️ ' : ''}{new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.estimatedTime > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} />{task.estimatedTime}m
              </span>
            )}
            {task.tags?.map(tag => (
              <span key={tag} style={{ fontSize: 11, background: 'var(--bg3)', color: 'var(--text2)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(task)} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDelete(task._id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  const [aiLoading, setAiLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const res = await axios.get('/tasks', { params });
      setTasks(res.data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('/ai/analyze');
      toast.success(res.data.message);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 32px', maxWidth: 900 }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>My Tasks</h1>
          <p style={{ color: 'var(--text2)', marginTop: 2, fontSize: 13 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleAIAnalyze} disabled={aiLoading}>
            {aiLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} />Analyzing...</> : <><Brain size={15} />AI Analyze</>}
          </button>
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            <Plus size={16} />New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
          <input className="input" placeholder="Search tasks..." value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} style={{ paddingLeft: 36 }} />
        </div>
        <select className="input" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} style={{ width: 'auto', minWidth: 130 }}>
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="input" value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} style={{ width: 'auto', minWidth: 140 }}>
          <option value="all">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No tasks found</h3>
          <p style={{ fontSize: 14, marginBottom: 20 }}>Create your first task to get started!</p>
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            <Plus size={16} />Create Task
          </button>
        </div>
      ) : (
        <div>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task}
              onEdit={(t) => { setEditTask(t); setShowModal(true); }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskModal task={editTask} onClose={() => { setShowModal(false); setEditTask(null); }} onSave={fetchTasks} />
      )}
    </div>
  );
}
