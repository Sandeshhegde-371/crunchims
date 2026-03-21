import React, { useEffect, useState } from 'react';
import { ShoppingCart, Package, Search, Filter, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { inventoryService, userService } from '../services/api';

const ShopShowroom = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [buyingId, setBuyingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBuy = async (product) => {
    setBuyingId(product.id);
    try {
      const orderItems = [{ productName: product.name, quantity: 1 }];
      await userService.createOrder(orderItems);
      setCartCount(prev => prev + 1);
      setMessage({ type: 'success', text: `Successfully purchased ${product.name}!` });
      fetchProducts(); // Refresh stock
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to complete purchase. Out of stock?' });
    } finally {
      setBuyingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Showroom</h1>
          <p className="text-slate-500 mt-1">Discover premium products for your needs</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search showroom..." 
              className="bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 w-64 shadow-soft"
            />
          </div>
          <div className="relative">
            <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 shadow-soft hover:bg-slate-50 transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`fixed bottom-8 right-8 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="font-bold">{message.text}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-[400px] animate-pulse bg-slate-50"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Package className="mx-auto text-slate-300" size={64} />
          <h3 className="text-xl font-bold text-slate-800 mt-4">Showroom Empty</h3>
          <p className="text-slate-500">Wait for the manager to add fresh items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="card group hover:translate-y-[-8px] transition-all duration-300 flex flex-col p-4">
              <div className="relative aspect-square rounded-2xl bg-slate-50 mb-4 overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <Package size={64} className="text-slate-200 group-hover:text-primary-200 transition-colors" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/80 backdrop-blur text-primary-700 font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm border border-white">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 truncate text-lg">{product.name}</h3>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                  High-quality {product.category.toLowerCase()} item for professional use.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary-600">${product.price.toFixed(2)}</p>
                  <p className={`text-xs font-bold ${product.quantity <= 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {product.quantity > 0 ? `${product.quantity} units left` : 'Out of stock'}
                  </p>
                </div>

                <button 
                  disabled={product.quantity <= 0 || buyingId === product.id}
                  onClick={() => handleBuy(product)}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                    product.quantity <= 0 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-600/20 active:scale-[0.98]'
                  }`}
                >
                  {buyingId === product.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      {product.quantity <= 0 ? 'Out of Stock' : 'Buy Now'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopShowroom;
