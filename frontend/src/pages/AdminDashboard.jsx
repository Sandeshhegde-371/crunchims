import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Package, AlertTriangle, DollarSign, ShoppingCart, 
  TrendingUp, Activity, BarChart3, RefreshCcw,
  Users, ArrowUpRight, ArrowDownRight, Clock,
  PlusCircle, FileText, Settings, ExternalLink
} from 'lucide-react';
import { adminService, inventoryService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('weekly');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overall, categories, products, logs] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getCategoryAnalytics(),
        inventoryService.getProducts(),
        adminService.getActivityLogs()
      ]);
      
      setAnalytics(overall.data);
      setCategoryData(categories.data);
      setLowStockItems(products.data.filter(p => p.quantity < 10).slice(0, 5));
      setRecentLogs(logs.data.slice(0, 6));
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#059669', '#10b981', '#0d9488', '#14b8a6', '#0f766e'];

  // Mock trend data for the AreaChart based on overall totals
  // In a real app, this would come from a time-series endpoint
  const trendData = [
    { name: 'Mon', revenue: (analytics?.totalRevenue || 0) * 0.12 },
    { name: 'Tue', revenue: (analytics?.totalRevenue || 0) * 0.15 },
    { name: 'Wed', revenue: (analytics?.totalRevenue || 0) * 0.10 },
    { name: 'Thu', revenue: (analytics?.totalRevenue || 0) * 0.18 },
    { name: 'Fri', revenue: (analytics?.totalRevenue || 0) * 0.22 },
    { name: 'Sat', revenue: (analytics?.totalRevenue || 0) * 0.13 },
    { name: 'Sun', revenue: (analytics?.totalRevenue || 0) * 0.10 },
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Clock size={16} />
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex shadow-sm">
            {['daily', 'weekly', 'monthly'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === t ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
          >
            <RefreshCcw size={20} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Gross Revenue" 
          value={`$${analytics?.totalRevenue?.toLocaleString() || 0}`} 
          icon={DollarSign} 
          trend="+12.5%" 
          isPositive={true}
          color="emerald"
        />
        <KpiCard 
          title="Orders Completed" 
          value={analytics?.totalOrders} 
          icon={ShoppingCart} 
          trend="+5.2%" 
          isPositive={true}
          color="blue"
        />
        <KpiCard 
          title="Inventory Items" 
          value={analytics?.totalProducts} 
          icon={Package} 
          trend={analytics?.totalProducts < 50 ? "Low Stock" : "Healthy"} 
          isPositive={analytics?.totalProducts >= 50}
          color="indigo"
        />
        <KpiCard 
          title="Active Staff" 
          value={12} // Mocked or fetched if available
          icon={Users} 
          trend="Stable" 
          isPositive={true}
          color="violet"
        />
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend - Spans 2 columns */}
        <div className="lg:col-span-2 card p-6 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Revenue Performance</h3>
              <p className="text-sm text-slate-500">Sales volume over the past 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp size={14} />
              <span>Trending Up</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sales by Category</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="totalRevenue"
                    nameKey="categoryName"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-2xl font-black text-slate-800">
                  {categoryData.length}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Categories</p>
              </div>
            </div>
            <div className="w-full mt-6 space-y-3">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={cat.categoryName} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                    <span className="text-slate-600 font-medium">{cat.categoryName}</span>
                  </div>
                  <span className="font-bold text-slate-900">${cat.totalRevenue?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Watchlist */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Low Stock Watchlist</h3>
            </div>
            <button onClick={() => navigate('/inventory/manage')} className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all">View All</button>
          </div>
          <div className="flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">In Stock</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">All stock levels healthy</td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-black ${
                          item.quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {item.quantity} UNITS
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary-600 hover:text-primary-700 transition-colors">
                          <PlusCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Activity size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Recent System Activity</h3>
            </div>
            <button onClick={() => navigate('/admin/logs')} className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all text-nowrap">View Logs</button>
          </div>
          <div className="flex-1 p-6 space-y-6">
            {recentLogs.map((log, i) => (
              <div key={log.id || i} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                    <Activity size={18} />
                  </div>
                  {i !== recentLogs.length - 1 && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-primary-700 transition-colors">{log.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="text-[10px] font-medium text-slate-400">{log.performedBy}</span>
                     <span className="text-[10px] text-slate-300">•</span>
                     <span className="text-[10px] font-medium text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction label="New Employee" icon={Users} onClick={() => navigate('/admin/staff')} />
        <QuickAction label="Sales Report" icon={FileText} color="blue" />
        <QuickAction label="Browse Shop" icon={ExternalLink} color="amber" onClick={() => navigate('/shop')} />
        <QuickAction label="System Config" icon={Settings} color="slate" />
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, trend, isPositive, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
      <div className="flex items-start justify-between relative">
        <div className={`p-4 rounded-2xl ${colorMap[color]} shadow-inner`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg ${
          isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{value}</h4>
      </div>
    </div>
  );
};

const QuickAction = ({ label, icon: Icon, onClick, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100',
    blue: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100',
    amber: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-100',
    slate: 'hover:bg-slate-50 hover:text-slate-700 hover:border-slate-200'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl transition-all duration-300 group shadow-sm ${colorMap[color]}`}
    >
      <div className={`p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all`}>
        <Icon size={24} />
      </div>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
};

export default AdminDashboard;
