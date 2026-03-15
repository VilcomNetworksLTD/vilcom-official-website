import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, Search, Eye, Package, Wifi, Star,
  Grid3X3, List, Globe, X, MessageSquare,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { productsApi, Product } from '@/services/products';
import { categoriesApi } from '@/services/categories';

interface Category { id: number; name: string; slug: string; }
interface ProductFormData {
  name: string; slug: string; description: string; short_description: string;
  category_id: number | null; type: string; is_featured: boolean; is_active: boolean;
  is_quote_based: boolean; price_monthly: number | null; price_annually: number | null;
  price_one_time: number | null; promotional_price: number | null; sku: string;
  stock_quantity: number; speed_mbps: number | null; plan_category: string;
  setup_fee: number; badge: string;
}

const PRODUCT_TYPES = [
  { value: 'internet_plan', label: 'Internet Plan' }, { value: 'hosting_package', label: 'Hosting Package' },
  { value: 'domain', label: 'Domain' }, { value: 'web_development', label: 'Web Development' },
  { value: 'bulk_sms', label: 'Bulk SMS' }, { value: 'addon', label: 'Add-on' },
  { value: 'service', label: 'Service' }, { value: 'other', label: 'Other' },
];

const defaultForm = (): ProductFormData => ({
  name: '', slug: '', description: '', short_description: '',
  category_id: null, type: 'internet_plan', is_featured: false, is_active: true,
  is_quote_based: false, price_monthly: null, price_annually: null, price_one_time: null,
  promotional_price: null, sku: '', stock_quantity: 0, speed_mbps: null,
  plan_category: 'home', setup_fee: 0, badge: '',
});

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [formData, setFormData] = useState<ProductFormData>(defaultForm());

  useEffect(() => { loadProducts(); loadCategories(); }, [searchQuery, categoryFilter, statusFilter, typeFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { per_page: 'all' };
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category_id = categoryFilter;
      if (statusFilter) params.is_active = statusFilter === 'active';
      if (typeFilter) params.type = typeFilter;
      const response = await productsApi.getAll(params);
      setProducts(response);
    } catch (error) { console.error('Failed to load products:', error); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try { const response = await categoriesApi.getAll({}); setCategories(response); }
    catch (error) { console.error('Failed to load categories:', error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const api = (await import('@/lib/axios')).default;
      const payload = {
        ...formData,
        price_monthly: formData.price_monthly || null,
        price_annually: formData.price_annually || null,
        price_one_time: formData.price_one_time || null,
        promotional_price: formData.promotional_price || null,
        speed_mbps: formData.speed_mbps || null,
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.slug}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) { console.error('Failed to save product:', error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      const api = (await import('@/lib/axios')).default;
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error) { console.error('Failed to delete product:', error); }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch(`/products/${product.slug}`, { is_active: !product.is_active });
      loadProducts();
    } catch {}
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch(`/products/${product.slug}`, { is_featured: !product.is_featured });
      loadProducts();
    } catch {}
  };

  const handleToggleQuoteBased = async (product: Product) => {
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch(`/products/${product.slug}`, { is_quote_based: !product.is_quote_based });
      loadProducts();
    } catch {}
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name ?? '', slug: product.slug ?? '', description: product.description ?? '',
      short_description: product.short_description ?? '', category_id: product.category_id ?? null,
      type: product.type ?? 'internet_plan', is_featured: product.is_featured ?? false,
      is_active: product.is_active ?? true, is_quote_based: product.is_quote_based ?? false,
      price_monthly: product.price_monthly ?? null, price_annually: product.price_annually ?? null,
      price_one_time: product.price_one_time ?? null, promotional_price: product.promotional_price ?? null,
      sku: product.sku ?? '', stock_quantity: product.stock_quantity ?? 0,
      speed_mbps: product.speed_mbps ?? null, plan_category: product.plan_category ?? 'home',
      setup_fee: product.setup_fee ?? 0, badge: product.badge ?? '',
    });
    setShowModal(true);
  };

  const resetForm = () => { setEditingProduct(null); setFormData(defaultForm()); };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: editingProduct ? formData.slug : generateSlug(name) });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internet_plan': return <Wifi className="w-4 h-4" />;
      case 'domain': return <Globe className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatPrice = (product: Product): string => {
    if (product.is_quote_based) return 'Get Quote';
    if (product.price_monthly) return `KES ${Number(product.price_monthly).toLocaleString()}/mo`;
    if (product.price_annually) return `KES ${Number(product.price_annually).toLocaleString()}/yr`;
    if (product.price_one_time) return `KES ${Number(product.price_one_time).toLocaleString()}`;
    return '—';
  };

  const inputCls = "w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 text-sm";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <DashboardLayout userType="admin">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Product Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage internet plans, hosting, domains, and services</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search products..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none text-white text-sm">
              <option value="" className="bg-slate-900">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none text-white text-sm">
              <option value="" className="bg-slate-900">All Types</option>
              {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none text-white text-sm">
              <option value="" className="bg-slate-900">All Status</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="inactive" className="bg-slate-900">Inactive</option>
            </select>
            <div className="flex rounded-lg border border-white/20 overflow-hidden">
              <button onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-10 sm:p-12 text-center">
          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-white mb-1">No products found</h3>
          <p className="text-slate-400 text-sm">Create your first product to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all">
              <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    {getTypeIcon(product.type)}
                    <span className="text-xs text-slate-400 capitalize">{product.type?.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {product.badge && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">{product.badge}</span>
                )}
                {product.is_quote_based && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-purple-500/80 text-white text-xs rounded-full font-medium flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Quote
                  </span>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-semibold text-white text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{product.short_description || product.category?.name}</p>
                  </div>
                  {product.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                </div>
                <div className="mb-3">
                  <span className={`text-base sm:text-lg font-bold ${product.is_quote_based ? 'text-purple-400' : 'text-blue-400'}`}>
                    {formatPrice(product)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => handleToggleStatus(product)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${product.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          {/* Mobile card list */}
          <div className="block sm:hidden divide-y divide-white/10">
            {products.map(product => (
              <div key={product.id} className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      : <span className="text-blue-400">{getTypeIcon(product.type)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-medium text-white text-sm">{product.name}</h3>
                      {product.badge && <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded">{product.badge}</span>}
                      {product.is_featured && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                    </div>
                    <span className={`font-medium text-sm ${product.is_quote_based ? 'text-purple-400' : 'text-white'}`}>{formatPrice(product)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleStatus(product)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${product.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  {['Product','Type','Price','Quote','Featured','Status','Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-sm font-medium text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" /> : <span className="text-blue-400">{getTypeIcon(product.type)}</span>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white text-sm">{product.name}</h3>
                            {product.badge && <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded">{product.badge}</span>}
                          </div>
                          <p className="text-xs text-slate-500">{product.sku || product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300 capitalize">{product.type?.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4">
                      <span className={`font-medium text-sm ${product.is_quote_based ? 'text-purple-400' : 'text-white'}`}>{formatPrice(product)}</span>
                      {product.promotional_price && <p className="text-xs text-green-400">Promo: KES {Number(product.promotional_price).toLocaleString()}</p>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleToggleQuoteBased(product)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${product.is_quote_based ? 'bg-purple-500/30 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-slate-600 border border-white/10'}`}>
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleToggleFeatured(product)} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${product.is_featured ? 'text-yellow-400' : 'text-slate-600'}`}>
                        <Star className={`w-5 h-5 ${product.is_featured ? 'fill-yellow-400' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleToggleStatus(product)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${product.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
              <span>{products.length} product{products.length !== 1 ? 's' : ''}</span>
              <span>{products.filter(p => p.is_quote_based).length} quote-based · {products.filter(p => p.is_active).length} active · {products.filter(p => p.is_featured).length} featured</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-white/20 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={labelCls}>Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Slug *</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className={inputCls} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Short Description</label>
                <input type="text" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select value={formData.category_id || ''} onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })} className={inputCls}>
                    <option value="" className="bg-slate-900">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputCls} required>
                    {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={labelCls}>SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className={inputCls} placeholder="e.g. HOME-FIBER-8" />
                </div>
                <div>
                  <label className={labelCls}>Badge</label>
                  <input type="text" value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className={inputCls} placeholder="e.g. Best Value" />
                </div>
              </div>
              {formData.type === 'internet_plan' && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 border border-white/10 rounded-lg bg-white/5">
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Internet Plan Details</h4>
                  </div>
                  <div>
                    <label className={labelCls}>Speed (Mbps)</label>
                    <input type="number" value={formData.speed_mbps ?? ''} onChange={(e) => setFormData({ ...formData, speed_mbps: e.target.value ? Number(e.target.value) : null })} className={inputCls} placeholder="e.g. 100" />
                  </div>
                  <div>
                    <label className={labelCls}>Plan Category</label>
                    <select value={formData.plan_category} onChange={(e) => setFormData({ ...formData, plan_category: e.target.value })} className={inputCls}>
                      <option value="home" className="bg-slate-900">Home</option>
                      <option value="business" className="bg-slate-900">Business</option>
                      <option value="enterprise" className="bg-slate-900">Enterprise</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="p-3 sm:p-4 border border-white/10 rounded-lg bg-white/5 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-300">Pricing</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs sm:text-sm text-slate-400">Quote-based</span>
                    <div onClick={() => setFormData({ ...formData, is_quote_based: !formData.is_quote_based })}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${formData.is_quote_based ? 'bg-purple-500' : 'bg-white/20'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.is_quote_based ? 'translate-x-5' : ''}`} />
                    </div>
                  </label>
                </div>
                {formData.is_quote_based ? (
                  <p className="text-sm text-purple-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Shows "Get Quote" button
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { label: 'Monthly Price (KES)', key: 'price_monthly', placeholder: 'e.g. 1999' },
                      { label: 'Annual Price (KES)', key: 'price_annually', placeholder: 'e.g. 4500' },
                      { label: 'One-Time Price (KES)', key: 'price_one_time', placeholder: 'For services' },
                      { label: 'Promo Price (KES)', key: 'promotional_price', placeholder: 'Optional' },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input type="number" step="0.01" value={(formData as any)[key] ?? ''}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value ? Number(e.target.value) : null })}
                          className={inputCls} placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded border-white/30 bg-white/10 accent-yellow-400" />
                  <span className="text-sm text-slate-300">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded border-white/30 bg-white/10 accent-green-400" />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
              </div>
              <div className="flex gap-2 pt-3 sm:pt-4 border-t border-white/20">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 sm:flex-none px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm">Cancel</button>
                <button type="submit"
                  className="flex-1 sm:flex-none px-6 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-medium text-sm">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProductManagement;