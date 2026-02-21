import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  ToggleLeft,
  ToggleRight,
  Eye,
  Copy,
  MoreVertical,
  Package,
  Wifi,
  DollarSign,
  Star,
  Calendar,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { productsApi, Product } from '@/services/products';
import { categoriesApi } from '@/services/categories';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: number | null;
  type: string;
  is_featured: boolean;
  is_active: boolean;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
  plan_data: {
    speed: string;
    bandwidth: string;
    validity: string;
    device_limit: number;
    installation_fee: number;
    router_available: boolean;
    router_price: number;
  };
}

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category_id: null,
    type: 'internet_plan',
    is_featured: false,
    is_active: true,
    price: 0,
    sale_price: null,
    sku: '',
    stock_quantity: 0,
    plan_data: {
      speed: '',
      bandwidth: 'unlimited',
      validity: '30',
      device_limit: 1,
      installation_fee: 0,
      router_available: false,
      router_price: 0,
    },
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [searchQuery, categoryFilter, statusFilter, typeFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category_id = categoryFilter;
      if (statusFilter) params.is_active = statusFilter === 'active';
      if (typeFilter) params.type = typeFilter;
      
      const response = await productsApi.getAll(params);
      setProducts(response);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll({ type: 'internet_plan' });
      setCategories(response);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('name', formData.name);
    form.append('slug', formData.slug);
    form.append('description', formData.description);
    form.append('short_description', formData.short_description);
    if (formData.category_id) form.append('category_id', String(formData.category_id));
    form.append('type', formData.type);
    form.append('is_featured', String(formData.is_featured));
    form.append('is_active', String(formData.is_active));
    form.append('price', String(formData.price));
    if (formData.sale_price) form.append('sale_price', String(formData.sale_price));
    form.append('sku', formData.sku);
    form.append('stock_quantity', String(formData.stock_quantity));
    form.append('plan_data', JSON.stringify(formData.plan_data));

    try {
      if (editingProduct) {
        const api = (await import('@/lib/axios')).default;
        await api.post(`/products/${editingProduct.id}?_method=PUT`, form);
      } else {
        const api = (await import('@/lib/axios')).default;
        await api.post('/products', form);
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const api = (await import('@/lib/axios')).default;
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch(`/products/${id}/toggle`);
      loadProducts();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch(`/products/${id}/featured`);
      loadProducts();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      category_id: product.category_id,
      type: product.type,
      is_featured: product.is_featured || false,
      is_active: product.is_active,
      price: product.price,
      sale_price: product.sale_price,
      sku: product.sku || '',
      stock_quantity: product.stock_quantity || 0,
      plan_data: product.plan_data || {
        speed: '',
        bandwidth: 'unlimited',
        validity: '30',
        device_limit: 1,
        installation_fee: 0,
        router_available: false,
        router_price: 0,
      },
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      category_id: null,
      type: 'internet_plan',
      is_featured: false,
      is_active: true,
      price: 0,
      sale_price: null,
      sku: '',
      stock_quantity: 0,
      plan_data: {
        speed: '',
        bandwidth: 'unlimited',
        validity: '30',
        device_limit: 1,
        installation_fee: 0,
        router_available: false,
        router_price: 0,
      },
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name,
      slug: editingProduct ? formData.slug : generateSlug(name)
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internet_plan':
        return <Wifi className="w-4 h-4" />;
      case 'hosting':
        return <Package className="w-4 h-4" />;
      case 'domain':
        return <Globe className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your internet plans, hosting, and services</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Types</option>
            <option value="internet_plan">Internet Plan</option>
            <option value="hosting">Hosting</option>
            <option value="domain">Domain</option>
            <option value="addon">Add-on</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 flex items-center gap-2 ${viewMode === 'grid' ? 'bg-cyan-50 text-cyan-600' : 'hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 flex items-center gap-2 ${viewMode === 'list' ? 'bg-cyan-50 text-cyan-600' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500">Create your first product to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-12 h-12 text-cyan-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.short_description || product.type}</p>
                  </div>
                  {product.is_featured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-cyan-600">${product.price}</span>
                  {product.sale_price && (
                    <span className="text-sm text-gray-400 line-through">${product.sale_price}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(product.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      product.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Featured</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-cyan-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">{product.type?.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">${product.price}</span>
                    {product.sale_price && (
                      <span className="text-sm text-gray-400 line-through ml-2">${product.sale_price}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleFeatured(product.id)}
                      className={`p-1 ${product.is_featured ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(product.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="internet_plan">Internet Plan</option>
                    <option value="hosting">Hosting</option>
                    <option value="domain">Domain</option>
                    <option value="addon">Add-on</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price || ''}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Plan Data (for internet plans) */}
              {formData.type === 'internet_plan' && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-4">Plan Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
                      <input
                        type="text"
                        value={formData.plan_data.speed}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          plan_data: { ...formData.plan_data, speed: e.target.value } 
                        })}
                        placeholder="e.g., 100 Mbps"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bandwidth</label>
                      <select
                        value={formData.plan_data.bandwidth}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          plan_data: { ...formData.plan_data, bandwidth: e.target.value } 
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="unlimited">Unlimited</option>
                        <option value="limited">Limited</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Validity (days)</label>
                      <input
                        type="number"
                        value={formData.plan_data.validity}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          plan_data: { ...formData.plan_data, validity: e.target.value } 
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Limit</label>
                      <input
                        type="number"
                        value={formData.plan_data.device_limit}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          plan_data: { ...formData.plan_data, device_limit: Number(e.target.value) } 
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Installation Fee</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.plan_data.installation_fee}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          plan_data: { ...formData.plan_data, installation_fee: Number(e.target.value) } 
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Router Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.plan_data.router_price}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          plan_data: { ...formData.plan_data, router_price: Number(e.target.value) } 
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      checked={formData.plan_data.router_available}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        plan_data: { ...formData.plan_data, router_available: e.target.checked } 
                      })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Router Available</span>
                  </label>
                </div>
              )}

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
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

// Need to import Globe for getTypeIcon
import { Globe } from 'lucide-react';

export default ProductManagement;

