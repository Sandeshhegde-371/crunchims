import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Package, AlertTriangle, DollarSign, ShoppingCart, 
  TrendingUp, Activity, BarChart3, RefreshCcw 
} from 'lucide-react';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overall, categories] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getCategoryAnalytics()
      ]);
      setAnalytics(overall.data);
      setCategoryData(categories.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#059669', '#10b981', '#0d9488', '#14b8a6', '#0f766e'];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCcw className="animate-spin text-primary-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Gathering analytics...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time inventory and sales tracking</p>
        </div>
        <button 
          onClick={fetchData}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCcw size={18} />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={analytics?.totalProducts} 
          icon={Package} 
          color="bg-blue-50 text-blue-600"
          trend="+12%"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={analytics?.lowStockProducts} 
          icon={AlertTriangle} 
          color="bg-amber-50 text-amber-600"
          trend={analytics?.lowStockProducts > 0 ? "Action Required" : "Stable"}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${analytics?.totalRevenue?.toLocaleString() || 0}`} 
          icon={DollarSign} 
          color="bg-emerald-50 text-emerald-600"
          trend="+8.5%"
        />
        <StatCard 
          title="Orders Processed" 
          value={analytics?.totalOrders} 
          icon={ShoppingCart} 
          color="bg-indigo-50 text-indigo-600"
          trend="+5.2%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance */}
        <div className="card h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Category Performance</h3>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="categoryName" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="totalUnitsSold" fill="#059669" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Distribution */}
        <div className="card h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-50 text-secondary-600 rounded-lg">
                <Activity size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Stock Distribution</h3>
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="totalProducts"
                  nameKey="categoryName"
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
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             {categoryData.slice(0, 4).map((cat, i) => (
               <div key={cat.categoryName} className="flex items-center gap-2 text-sm">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                 <span className="text-slate-500 font-medium">{cat.categoryName}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card group hover:scale-[1.02] transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${color} transition-colors`}>
        <Icon size={24} />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        trend.includes('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
      }`}>
        {trend}
      </span>
    </div>
    <div className="mt-4">
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
    </div>
  </div>
);

export default AdminDashboard;
