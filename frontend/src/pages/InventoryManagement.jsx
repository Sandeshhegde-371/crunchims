import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, Package, ArrowUpRight, ArrowDownRight, 
  Trash2, Edit3, MoreVertical, Loader2, AlertCircle, 
  History, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { inventoryService } from '../services/api';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAction, setStockAction] = useState('add'); // 'add' or 'reduce'
  const [stockQuantity, setStockQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    category: 'ELECTRONICS'
  });

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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inventoryService.addProduct(newProduct);
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', price: 0, quantity: 0, category: 'ELECTRONICS' });
      fetchProducts();
    } catch (err) {
      alert('Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (stockAction === 'add') {
        await inventoryService.addStock(selectedProduct.name, stockQuantity);
      } else {
        await inventoryService.reduceStock(selectedProduct.name, stockQuantity);
      }
      setShowStockModal(false);
      setStockQuantity(1);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Track and manage your product stock</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 py-3 px-6"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No products found.</td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-500">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${product.quantity < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                        {product.quantity}
                      </span>
                      {product.quantity < 5 && (
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Low Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.quantity > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                        <CheckCircle2 size={12} />
                        In Stock
                      </span>
                    ) : ( 
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-bold">
                        <ArrowDownRight size={12} />
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedProduct(product); setStockAction('add'); setShowStockModal(true); }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Add Stock"
                      >
                        <ArrowUpRight size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedProduct(product); setStockAction('reduce'); setShowStockModal(true); }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Reduce Stock"
                      >
                        <ArrowDownRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name</label>
                  <input type="text" required className="input" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea className="input min-h-[100px]" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" required className="input" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Quantity</label>
                  <input type="number" required className="input" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: parseInt(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select className="input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="FURNITURE">Furniture</option>
                    <option value="CLOTHING">Clothing</option>
                    <option value="GROCERY">Grocery</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 btn-outline py-3">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary py-3">
                  {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Management Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${stockAction === 'add' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {stockAction === 'add' ? <ArrowUpRight size={32} /> : <ArrowDownRight size={32} />}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {stockAction === 'add' ? 'Increase' : 'Decrease'} Stock
            </h2>
            <p className="text-sm text-slate-500 mb-6">{selectedProduct?.name}</p>
            
            <form onSubmit={handleStockUpdate}>
              <div className="flex items-center justify-center gap-6 mb-8">
                <button 
                  type="button" 
                  onClick={() => setStockQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl hover:bg-slate-200"
                >
                  -
                </button>
                <span className="text-3xl font-bold text-slate-900 w-12">{stockQuantity}</span>
                <button 
                  type="button" 
                  onClick={() => setStockQuantity(q => q + 1)}
                  className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl hover:bg-slate-200"
                >
                  +
                </button>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowStockModal(false)} className="flex-1 btn-outline py-3">Cancel</button>
                <button type="submit" disabled={submitting} className={`flex-1 py-3 btn ${stockAction === 'add' ? 'btn-primary' : 'bg-amber-600 text-white hover:bg-amber-500'}`}>
                  {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
