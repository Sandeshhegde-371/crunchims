import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  Package, AlertTriangle, DollarSign, ShoppingCart, 
  TrendingUp, Activity, BarChart3, RefreshCcw,
  Users, ArrowUpRight, ArrowDownRight, Clock,
  Hash, Percent, Layers
} from 'lucide-react';
import { adminService, inventoryService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <button 
          onClick={fetchData}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group flex items-center gap-2"
        >
          <RefreshCcw size={20} className="group-active:rotate-180 transition-transform duration-500" />
          <span className="text-sm font-bold">Refresh Analytics</span>
        </button>
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
    </div>
  );
};

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
