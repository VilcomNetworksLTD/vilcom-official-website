import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, Search, ToggleLeft, ToggleRight,
  ChevronRight, ChevronDown, Folder, FolderOpen, List, X, ArrowRight
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { categoriesApi } from '@/services/categories';

interface CategoryType {
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
  children?: CategoryType[];
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', parent_id: null as number | null,
    type: 'internet_plan', icon: '', image: null as File | null,
    is_active: true, order: 0,
  });

  useEffect(() => { loadCategories(); }, [searchQuery, typeFilter]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAll({
        search: searchQuery || undefined,
        type: typeFilter || undefined,
      });
      const categoriesWithOrder = (Array.isArray(response) ? response : []).map((cat: any) => ({
        ...cat, order: cat.order ?? 0, children: cat.children || []
      }));
      setCategories(categoriesWithOrder as CategoryType[]);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
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
    if (formData.parent_id) form.append('parent_id', String(formData.parent_id));
    form.append('type', formData.type);
    form.append('icon', formData.icon || '');
    form.append('is_active', String(formData.is_active));
    form.append('order', String(formData.order));
    if (formData.image) form.append('image', formData.image);

    try {
      if (editingCategory) {
        const api = (await import('@/lib/axios')).default;
        await api.post(`/categories/${editingCategory.id}?_method=PUT`, form);
      } else {
        const api = (await import('@/lib/axios')).default;
        await api.post('/categories', form);
      }
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error) { console.error('Failed to save category:', error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const api = (await import('@/lib/axios')).default;
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error) { console.error('Failed to delete:', error); }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch(`/categories/${id}/toggle`);
      loadCategories();
    } catch (error) { console.error('Failed to toggle status:', error); }
  };

  const openEditModal = (category: CategoryType) => {
    setEditingCategory(category);
    setFormData({
      name: category.name, slug: category.slug,
      description: category.description || '', parent_id: category.parent_id,
      type: category.type, icon: category.icon || '', image: null,
      is_active: category.is_active, order: category.order,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', parent_id: null, type: 'internet_plan', icon: '', image: null, is_active: true, order: 0 });
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: editingCategory ? formData.slug : generateSlug(name) });
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const buildTree = (cats: CategoryType[], parentId: number | null = null): CategoryType[] =>
    cats.filter(cat => cat.parent_id === parentId)
      .map(cat => ({ ...cat, children: buildTree(cats, cat.id) }))
      .sort((a, b) => a.order - b.order);

  const flattenTree = (cats: CategoryType[], level = 0): { category: CategoryType; level: number }[] => {
    let result: { category: CategoryType; level: number }[] = [];
    cats.forEach(cat => {
      result.push({ category: cat, level });
      if (expandedIds.has(cat.id) && cat.children && cat.children.length > 0) {
        result = result.concat(flattenTree(cat.children, level + 1));
      }
    });
    return result;
  };

  const treeCategories = buildTree(categories);
  const flatCategories = flattenTree(treeCategories);

  const renderCategoryRow = ({ category, level }: { category: CategoryType; level: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}
        className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-5 mb-2 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 group"
        style={{ marginLeft: Math.min(level * 24, 72) }}
      >
        {/* Expand/Collapse */}
        <div className="w-7 sm:w-8 flex-shrink-0">
          {hasChildren ? (
            <button onClick={() => toggleExpanded(category.id)} className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              {isExpanded
                ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
            </button>
          ) : (
            <div className="w-7 sm:w-8 flex items-center justify-center">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500/40" />
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
          {category.icon && /^[\u{1F300}-\u{1F9FF}]$/u.test(category.icon)
            ? <span className="text-base sm:text-xl">{category.icon}</span>
            : <Folder className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm sm:text-base truncate">{category.name}</h3>
            {hasChildren && (
              <span className="hidden sm:inline text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">
                {category.children?.length} sub
              </span>
            )}
            {!category.is_active && (
              <span className="text-xs px-1.5 sm:px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">Inactive</span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate hidden sm:block">
            <span className="text-slate-500">{category.slug}</span>
            <span className="mx-1.5">•</span>
            <span className="capitalize text-slate-500">{category.type?.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button onClick={() => handleToggleStatus(category.id)}
            className={`p-2 sm:p-2.5 rounded-xl ${category.is_active ? 'text-green-400 hover:bg-green-500/20' : 'text-slate-500 hover:bg-slate-500/20'} transition-all`}>
            {category.is_active
              ? <ToggleRight className="w-4 h-4 sm:w-5 sm:h-5" />
              : <ToggleLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button onClick={() => openEditModal(category)}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all">
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button onClick={() => handleDelete(category.id)}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all">
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderCategoryList = (cats: CategoryType[], level = 0): React.ReactNode =>
    cats.map(category => (
      <tr key={category.id} className="border-b border-white/10 hover:bg-white/5">
        <td className="py-3 px-3 sm:px-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: level * 16 }}>
            {category.icon
              ? <span className="text-base sm:text-lg">{category.icon}</span>
              : <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            <span className="text-white text-sm truncate max-w-[120px] sm:max-w-none">{category.name}</span>
          </div>
        </td>
        <td className="py-3 px-3 sm:px-4 text-slate-400 text-sm hidden md:table-cell">{category.slug}</td>
        <td className="py-3 px-3 sm:px-4 hidden sm:table-cell">
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300">{category.type}</span>
        </td>
        <td className="py-3 px-3 sm:px-4 text-slate-400 text-sm hidden lg:table-cell">{category.order}</td>
        <td className="py-3 px-3 sm:px-4">
          <button onClick={() => handleToggleStatus(category.id)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs ${category.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
            {category.is_active ? 'Active' : 'Off'}
          </button>
        </td>
        <td className="py-3 px-3 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => openEditModal(category)} className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all">
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => handleDelete(category.id)} className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all">
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <DashboardLayout userType="admin">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Category Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Organize your products and services into categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all text-sm w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search categories..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 text-sm" />
          </div>
          <div className="flex gap-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm">
              <option value="" className="bg-slate-900">All Types</option>
              <option value="internet_plan" className="bg-slate-900">Internet Plan</option>
              <option value="hosting" className="bg-slate-900">Hosting</option>
              <option value="domain" className="bg-slate-900">Domain</option>
              <option value="addon" className="bg-slate-900">Add-on</option>
              <option value="service" className="bg-slate-900">Service</option>
            </select>
            <div className="flex rounded-lg border border-white/20 overflow-hidden">
              <button onClick={() => setViewMode('tree')}
                className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'tree' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'}`}>
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Tree</span>
              </button>
              <button onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'}`}>
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category list */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-white mb-1">No categories found</h3>
            <p className="text-slate-400 text-sm">Create your first category to get started</p>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="p-3 sm:p-4">
            {/* Tree header — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3 py-3 px-5 mb-4 text-sm font-medium text-slate-400 border-b border-white/10 bg-white/5">
              <div className="w-8" /><div className="w-12" />
              <div className="flex-1">Category Name</div>
              <div className="w-36">Actions</div>
            </div>
            <div className="space-y-1">
              {flatCategories.map((item) => renderCategoryRow(item))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-400">Name</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-400 hidden md:table-cell">Slug</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-400 hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-400 hidden lg:table-cell">Order</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>{renderCategoryList(treeCategories)}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-white/20 flex justify-between items-center sticky top-0 bg-slate-900/95 z-10">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug *</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Parent Category</label>
                <select value={formData.parent_id || ''} onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm">
                  <option value="" className="bg-slate-900">No Parent (Top Level)</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" required>
                    <option value="internet_plan" className="bg-slate-900">Internet Plan</option>
                    <option value="hosting" className="bg-slate-900">Hosting</option>
                    <option value="domain" className="bg-slate-900">Domain</option>
                    <option value="addon" className="bg-slate-900">Add-on</option>
                    <option value="service" className="bg-slate-900">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Order</label>
                  <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-300 file:text-xs" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-white/30 bg-white/10" />
                <span className="text-sm text-slate-300">Active</span>
              </label>
              <div className="flex justify-end gap-2 pt-3 sm:pt-4 border-t border-white/20">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 sm:flex-none px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm">
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