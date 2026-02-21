import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  List
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { categoriesApi } from '@/services/categories';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  type: string;
  icon: string | null;
  image: string | null;
  is_active: boolean;
  order: number;
  children?: Category[];
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: null as number | null,
    type: 'internet_plan',
    icon: '',
    image: null as File | null,
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, [searchQuery, typeFilter]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAll({
        search: searchQuery || undefined,
        type: typeFilter || undefined,
      });
      setCategories(response);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('name', formData.name);
    form.append('slug', formData.slug);
    form.append('description', formData.description || '');
    if (formData.parent_id) {
      form.append('parent_id', String(formData.parent_id));
    }
    form.append('type', formData.type);
    form.append('icon', formData.icon || '');
    form.append('is_active', String(formData.is_active));
    form.append('order', String(formData.order));
    
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, form);
      } else {
        await createCategory(form);
      }
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const createCategory = async (data: FormData) => {
    // Using axios directly since the API wrapper might not have create
    const api = (await import('@/lib/axios')).default;
    await api.post('/categories', data);
  };

  const updateCategory = async (id: number, data: FormData) => {
    const api = (await import('@/lib/axios')).default;
    await api.post(`/categories/${id}?_method=PUT`, data);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const api = (await import('@/lib/axios')).default;
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch(`/categories/${id}/toggle`);
      loadCategories();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id,
      type: category.type,
      icon: category.icon || '',
      image: null,
      is_active: category.is_active,
      order: category.order,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      type: 'internet_plan',
      icon: '',
      image: null,
      is_active: true,
      order: 0,
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name,
      slug: editingCategory ? formData.slug : generateSlug(name)
    });
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderCategoryTree = (cats: Category[], level = 0): React.ReactNode => {
    return cats.map(category => (
      <div key={category.id} style={{ marginLeft: level * 24 }}>
        <div className="flex items-center gap-2 py-3 px-4 hover:bg-gray-50 rounded-lg group">
          {category.children && category.children.length > 0 ? (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expandedIds.has(category.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
            {category.icon ? (
              <span className="text-lg">{category.icon}</span>
            ) : (
              <Folder className="w-4 h-4 text-cyan-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.slug} • {category.type}</p>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleToggleStatus(category.id)}
              className={`p-2 rounded-lg ${category.is_active ? 'text-green-600' : 'text-gray-400'}`}
              title={category.is_active ? 'Active' : 'Inactive'}
            >
              {category.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
            <button
              onClick={() => openEditModal(category)}
              className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && expandedIds.has(category.id) && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderCategoryList = (cats: Category[], level = 0): React.ReactNode => {
    return cats.map(category => (
      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span style={{ marginLeft: level * 24 }} className="flex items-center">
              {category.icon ? (
                <span className="text-lg mr-2">{category.icon}</span>
              ) : (
                <Folder className="w-4 h-4 text-cyan-600 mr-2" />
              )}
              {category.name}
            </span>
          </div>
        </td>
        <td className="py-3 px-4 text-gray-500">{category.slug}</td>
        <td className="py-3 px-4">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{category.type}</span>
        </td>
        <td className="py-3 px-4 text-gray-500">{category.order}</td>
        <td className="py-3 px-4">
          <button
            onClick={() => handleToggleStatus(category.id)}
            className={`px-2 py-1 rounded text-xs ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {category.is_active ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(category)}
              className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600">Organize your products and services into categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
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
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 flex items-center gap-2 ${viewMode === 'tree' ? 'bg-cyan-50 text-cyan-600' : 'hover:bg-gray-50'}`}
            >
              <FolderOpen className="w-4 h-4" />
              Tree
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 flex items-center gap-2 ${viewMode === 'list' ? 'bg-cyan-50 text-cyan-600' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
            <p className="text-gray-500">Create your first category to get started</p>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="p-4">
            {renderCategoryTree(categories)}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Slug</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderCategoryList(categories)}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">No Parent</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., 📶"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

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
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CategoryManagement;

