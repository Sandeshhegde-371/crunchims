import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, Package, Search, Loader2, 
  CheckCircle2, AlertCircle, X, Plus, Minus, 
  ShoppingBag, History, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { inventoryService, userService } from '../services/api';

const ShopShowroom = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [buying, setBuying] = useState(false);
  const [returningId, setReturningId] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchOrders = async () => {
    try {
      const { data } = await userService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.stockQuantity || 99));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    setBuying(true);
    try {
      const items = cart.map(item => ({
        productName: item.name,
        quantity: item.quantity
      }));
      await userService.createOrder(items);
      setCart([]);
      setIsCartOpen(false);
      setMessage({ type: 'success', text: 'Order placed successfully!' });
      fetchProducts();
      fetchOrders();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to place order. Check stock availability.' });
    } finally {
      setBuying(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReturn = async (orderItemId) => {
    setReturningId(orderItemId);
    try {
      // The API is post /user/return/{id} but it takes the orderItemId
      // In the backend it's public String returnItem(@PathVariable Long orderItemId, ...)
      // userService.returnItem needs to be defined in api.js if not already
      // Checking api.js... it was missing returnItem. I will add it if needed.
      // For now using axios directly or assuming I'll fix api.js
      await userService.returnItem(orderItemId);
      setMessage({ type: 'success', text: 'Item returned and stock refilled!' });
      fetchProducts();
      fetchOrders();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to return item.' });
    } finally {
      setReturningId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pb-20">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 w-64 shadow-soft"
              />
            </div>
            <button 
              onClick={() => setIsOrdersOpen(true)}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 shadow-soft hover:bg-slate-50 transition-colors relative"
              title="My Orders"
            >
              <History size={22} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-colors relative"
            >
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-[400px] animate-pulse bg-slate-50"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Package className="mx-auto text-slate-300" size={64} />
            <h3 className="text-xl font-bold text-slate-800 mt-4">No products found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
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
                  <h3 className="font-bold text-slate-800 truncate text-lg">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-primary-600">${product.price.toFixed(2)}</p>
                    <p className={`text-xs font-bold ${product.quantity <= 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    disabled={product.quantity <= 0}
                    onClick={() => addToCart(product)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      product.quantity <= 0 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-600/20 active:scale-[0.98]'
                    }`}
                  >
                    <Plus size={18} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                  <ShoppingCart size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Your Cart</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={40} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Cart is empty</h3>
                    <p className="text-slate-500 text-sm">Add some items to get started!</p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                      <Package size={32} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-primary-600 font-bold">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-50 text-slate-500"><Minus size={16} /></button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-50 text-slate-500"><Plus size={16} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-xs font-bold text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  disabled={buying}
                  onClick={handleCheckout}
                  className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center justify-center gap-2"
                >
                  {buying ? <Loader2 className="animate-spin" size={20} /> : 'Buy Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Modal */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOrdersOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <History size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">My Orders</h2>
              </div>
              <button onClick={() => setIsOrdersOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-500 font-medium">No order history found.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-bold text-slate-700">Order #{order.id.toString().slice(-6)}</p>
                        <p className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">Completed</span>
                    </div>
                    <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-300 shrink-0 border border-slate-100">
                              <Package size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{item.product.name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                            {item.status !== 'RETURNED' ? (
                              <button 
                                onClick={() => handleReturn(item.id)}
                                disabled={returningId === item.id}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4"
                              >
                                {returningId === item.id ? <RefreshCw size={14} className="animate-spin" /> : 'Return'}
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 italic">Returned</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {message && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="font-bold">{message.text}</p>
        </div>
      )}
    </div>
  );
};

export default ShopShowroom;
