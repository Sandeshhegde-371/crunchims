import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  Package, AlertTriangle, DollarSign, ShoppingCart, 
  TrendingUp, Activity, BarChart3, RefreshCcw,
  Users, ArrowUpRight, ArrowDownRight, Clock,
  Hash, Percent, Layers,
  // AI Agent panel icons
  Bot, X, Send, Loader2, Sparkles, ChevronDown, Database
} from 'lucide-react';
import { adminService, inventoryService, agentService } from '../services/api';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// AI Agent Panel Component
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTED_QUERIES = [
  'What is today\'s revenue?',
  'Which product has the highest sales?',
  'Show me low stock items',
  'Top 5 customers by spending',
  'Total inventory value',
];

const AgentMessage = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
        isUser
          ? 'bg-emerald-500 text-white'
          : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
      }`}>
        {isUser ? (
          <span className="text-xs font-bold">U</span>
        ) : (
          <Bot size={14} />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-emerald-500 text-white rounded-tr-sm'
            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
        }`}>
          {msg.content}
        </div>

        {/* SQL pill (agent messages only) */}
        {msg.sql && (
          <details className="w-full">
            <summary className="cursor-pointer text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none hover:text-slate-600 transition-colors">
              <Database size={10} /> View SQL
            </summary>
            <pre className="mt-1 bg-slate-900 text-emerald-400 text-[10px] p-3 rounded-xl overflow-x-auto leading-relaxed font-mono">
              {msg.sql}
            </pre>
          </details>
        )}

        {/* Row count badge */}
        {msg.rowCount !== undefined && (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {msg.rowCount} row{msg.rowCount !== 1 ? 's' : ''} returned
          </span>
        )}

        {/* Error styling */}
        {msg.isError && (
          <span className="text-[10px] font-bold text-red-400">⚠ Agent error</span>
        )}
      </div>
    </div>
  );
};

const AgentPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      content: "Hi! I'm your IMS AI Analyst. Ask me anything about your inventory, sales, or business performance — in plain English.",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async (query) => {
    const text = query || input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await agentService.chat(text);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.explanation || 'Done.',
          sql: data.sql,
          rowCount: data.row_count,
        }
      ]);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Unknown error';
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Sorry, I couldn't process that query. ${detail}`,
          isError: true,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
      )}

      {/* Slide-over panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-[420px] z-[70]
        bg-slate-50 flex flex-col shadow-2xl
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">IMS AI Analyst</h2>
              <p className="text-[10px] text-violet-200">Powered by SQL Agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Suggested queries (shown when only the welcome message is present) */}
        {messages.length === 1 && (
          <div className="px-4 py-3 flex-shrink-0 border-b border-slate-200 bg-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Try asking…</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100 hover:bg-violet-100 hover:border-violet-200 transition-all font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {messages.map((msg) => (
            <AgentMessage key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about inventory, sales, revenue…"
              disabled={loading}
              className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all overflow-hidden leading-relaxed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 hover:shadow-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-300 mt-2 font-medium">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentOpen, setAgentOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overall, categories, products] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getCategoryAnalytics(),
        adminService.getProducts()
      ]);
      
      setAnalytics(overall.data);
      setCategoryData(categories.data);
      setLowStockItems(products.data.filter(p => p.quantity < 10));
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#059669', '#10b981', '#0d9488', '#14b8a6', '#0f766e', '#064e3b', '#6ee7b7'];

  // Mock trend data for charts
  const trendData = [
    { name: 'Mon', revenue: (analytics?.totalRevenue || 0) * 0.12, orders: (analytics?.totalOrders || 0) * 0.1 },
    { name: 'Tue', revenue: (analytics?.totalRevenue || 0) * 0.15, orders: (analytics?.totalOrders || 0) * 0.14 },
    { name: 'Wed', revenue: (analytics?.totalRevenue || 0) * 0.10, orders: (analytics?.totalOrders || 0) * 0.2 },
    { name: 'Thu', revenue: (analytics?.totalRevenue || 0) * 0.18, orders: (analytics?.totalOrders || 0) * 0.12 },
    { name: 'Fri', revenue: (analytics?.totalRevenue || 0) * 0.22, orders: (analytics?.totalOrders || 0) * 0.25 },
    { name: 'Sat', revenue: (analytics?.totalRevenue || 0) * 0.13, orders: (analytics?.totalOrders || 0) * 0.1 },
    { name: 'Sun', revenue: (analytics?.totalRevenue || 0) * 0.10, orders: (analytics?.totalOrders || 0) * 0.09 },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={24} />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Analyzing business data...</p>
      </div>
    </div>
  );

  const avgOrderValue = analytics?.totalOrders > 0 
    ? (analytics?.totalRevenue / analytics?.totalOrders).toFixed(2) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Intelligence</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Clock size={16} />
            Snapshot as of {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* ── AI Agent Toggle Button ── */}
          <button
            onClick={() => setAgentOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.03] active:scale-95 transition-all font-semibold text-sm"
          >
            <Sparkles size={18} />
            Ask AI Analyst
          </button>

          <button 
            onClick={fetchData}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group flex items-center gap-2"
          >
            <RefreshCcw size={20} className="group-active:rotate-180 transition-transform duration-500" />
            <span className="text-sm font-bold">Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KpiCard 
          title="Total Revenue" 
          value={`$${analytics?.totalRevenue?.toLocaleString() || 0}`} 
          icon={DollarSign} 
          color="emerald"
        />
        <KpiCard 
          title="Total Orders" 
          value={analytics?.totalOrders} 
          icon={ShoppingCart} 
          color="blue"
        />
        <KpiCard 
          title="Total Products" 
          value={analytics?.totalProducts} 
          icon={Package} 
          color="indigo"
        />
        <KpiCard 
          title="Low Stock Items" 
          value={analytics?.lowStockProducts} 
          icon={AlertTriangle} 
          color="amber"
          isAlert={analytics?.lowStockProducts > 0}
        />
        <KpiCard 
          title="Units Sold" 
          value={analytics?.totalUnitsSold} 
          icon={Layers} 
          color="violet"
        />
        <KpiCard 
          title="Avg Order Value" 
          value={`$${avgOrderValue}`} 
          icon={BarChart3} 
          color="slate"
        />
      </div>

      {/* 6 Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* 1. Revenue Performance (Area Chart) */}
        <ChartContainer title="Revenue Performance" subtitle="7-day sales volume trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 2. Category Revenue (Pie Chart) */}
        <ChartContainer title="Revenue by Category" subtitle="Total sales distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60} outerRadius={80}
                paddingAngle={5} dataKey="totalRevenue" nameKey="categoryName"
              >
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 3. Units Sold (Bar Chart) */}
        <ChartContainer title="Units Sold by Category" subtitle="Inventory turnover per category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="categoryName" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="totalUnitsSold" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 4. Order Volume (Line Chart) */}
        <ChartContainer title="Order Frequency" subtitle="Daily order trends">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{fill: '#3b82f6'}} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 5. Inventory Composition (Pie Chart) */}
        <ChartContainer title="Inventory Mix" subtitle="Product count per category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                outerRadius={80}
                dataKey="totalProducts" nameKey="categoryName"
              >
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* 6. Revenue vs Goal (Composed Chart) */}
        <ChartContainer title="Order Performance" subtitle="Revenue vs Transaction volume">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={20} />
              <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Low Stock Watchlist (Table) */}
      <div className="card p-0 overflow-hidden shadow-xl border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Critical Low Stock Watchlist</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Showing {lowStockItems.length} items needing attention</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Current Stock</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lowStockItems.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400">All inventory levels healthy</td></tr>
              ) : (
                lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-black ${
                        item.quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.quantity} UNITS
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${item.quantity === 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AI Agent Slide-Over Panel ── */}
      <AgentPanel isOpen={agentOpen} onClose={() => setAgentOpen(false)} />

      {/* ── Floating AI bubble (always visible on dashboard) ── */}
      <button
        onClick={() => setAgentOpen(true)}
        title="Open AI Analyst"
        className={`
          fixed bottom-8 right-8 z-50
          w-14 h-14 rounded-2xl
          bg-gradient-to-br from-violet-500 to-indigo-600
          text-white shadow-xl shadow-violet-300
          flex items-center justify-center
          hover:scale-110 active:scale-95 transition-all duration-200
          ${agentOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      >
        <Sparkles size={24} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const KpiCard = ({ title, value, icon: Icon, color, isAlert }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-50 text-slate-600'
  };

  return (
    <div className={`card p-5 group transition-all duration-300 ${isAlert ? 'ring-2 ring-amber-400/20 bg-amber-50/10' : ''}`}>
      <div className="flex flex-col gap-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colorMap[color]} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{title}</p>
          <h4 className="text-xl font-bold text-slate-900 mt-1 truncate">{value}</h4>
        </div>
      </div>
    </div>
  );
};

const ChartContainer = ({ title, subtitle, children }) => (
  <div className="card p-6 flex flex-col min-h-[350px]">
    <div className="mb-6">
      <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{subtitle}</p>
    </div>
    <div className="flex-1 w-full min-h-[200px]">
      {children}
    </div>
  </div>
);

export default AdminDashboard;
