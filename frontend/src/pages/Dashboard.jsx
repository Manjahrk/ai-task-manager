import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Zap, TrendingUp, Target, Brain } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, transition: 'border-color 0.2s', cursor: 'default' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const COLORS = ['#9090a8', '#7c6bff', '#22d3a0'];
const PRIORITY_COLORS = { critical: '#ff5566', high: '#ff8833', medium: '#ffcc44', low: '#22d3a0' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        axios.get('/tasks/stats/summary'),
        axios.get('/tasks?status=all')
      ]);
      setStats(statsRes.data.stats);
      setTasks(tasksRes.data.tasks);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('/ai/analyze');
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const pieData = stats ? [
    { name: 'To Do', value: stats.todo },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Done', value: stats.done },
  ].filter(d => d.value > 0) : [];

  const priorityData = tasks.reduce((acc, t) => {
    if (t.status !== 'done') {
      const ex = acc.find(a => a.priority === t.priority);
      if (ex) ex.count++;
      else acc.push({ priority: t.priority, count: 1 });
    }
    return acc;
  }, []);

  const recentTasks = tasks.slice(0, 5);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1200 }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>Here's your productivity overview</p>
        </div>
        <button className="btn btn-primary" onClick={handleAIAnalyze} disabled={aiLoading}>
          {aiLoading ? <><div className="spinner" />Analyzing...</> : <><Brain size={16} />AI Analyze Tasks</>}
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Target} label="Total Tasks" value={stats?.total || 0} color="var(--accent)" />
        <StatCard icon={Clock} label="In Progress" value={stats?.inProgress || 0} color="var(--accent)" sub="Active now" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.done || 0} color="var(--green)" sub="Great work!" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdue || 0} color="var(--red)" sub={stats?.overdue > 0 ? 'Needs attention' : 'All on track'} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Task Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-display)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>No tasks yet</div>
          )}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['To Do', 'In Progress', 'Done'].map((l, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Pending by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} barSize={32}>
                <XAxis dataKey="priority" tick={{ fill: 'var(--text2)', fontSize: 12, fontFamily: 'var(--font-display)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-display)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={PRIORITY_COLORS[entry.priority] || 'var(--accent)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>No pending tasks</div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Tasks</h3>
          <a href="/tasks" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
        </div>
        {recentTasks.length === 0 ? (
          <p style={{ color: 'var(--text2)', textAlign: 'center', padding: '20px 0' }}>No tasks yet. Create your first task!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentTasks.map(task => (
              <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text2)' : 'var(--text)' }}>
                    {task.title}
                  </div>
                  {task.aiSuggestion && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={10} /> {task.aiSuggestion.slice(0, 80)}{task.aiSuggestion.length > 80 ? '...' : ''}
                    </div>
                  )}
                </div>
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                <span className={`badge badge-${task.status}`}>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
