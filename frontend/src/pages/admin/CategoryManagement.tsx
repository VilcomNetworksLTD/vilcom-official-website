import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Search, ToggleLeft, ToggleRight,
  ChevronRight, ChevronDown, Folder, FolderOpen, List, X, ArrowRight
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { categoriesApi } from '@/services/categories';

// ── Enum values must match the backend migration exactly ──────────────────────
const CATEGORY_TYPES = [
  { value: 'internet_plans',     label: 'Internet Plans' },
  { value: 'hosting_packages',   label: 'Hosting Packages' },
  { value: 'web_development',    label: 'Web Development' },
  { value: 'bulk_sms',           label: 'Bulk SMS' },
  { value: 'domains',            label: 'Domains' },
  { value: 'addons',             label: 'Add-ons' },
  { value: 'other',              label: 'Other' },
] as const;

type CategoryTypeValue = typeof CATEGORY_TYPES[number]['value'];

interface CategoryType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  parent_id: number | null;
  type: CategoryTypeValue;
  icon: string | null;
  image: string | null;
  banner: string | null;
  color: string | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  show_in_menu: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  children?: CategoryType[];
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  parent_id: number | null;
  type: CategoryTypeValue;
  icon: string;
  image: File | null;
  color: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  show_in_menu: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

const DEFAULT_FORM: FormData = {
  name: '', slug: '', description: '', short_description: '',
  parent_id: null, type: 'internet_plans', icon: '', image: null,
  color: '', sort_order: 0, is_featured: false, is_active: true,
  show_in_menu: true, meta_title: '', meta_description: '', meta_keywords: '',
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  useEffect(() => { loadCategories(); }, [searchQuery, typeFilter]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAll({
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        per_page: 'all',
      });
      const normalized = (Array.isArray(response) ? response : []).map((cat: any) => ({
        ...cat,
        sort_order: cat.sort_order ?? 0,
        children: cat.children || [],
      }));
      setCategories(normalized as CategoryType[]);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const form = new FormData();
    form.append('name',              formData.name);
    form.append('description',       formData.description);
    form.append('short_description', formData.short_description);
    form.append('type',              formData.type);
    form.append('icon',              formData.icon);
    form.append('color',             formData.color);
    form.append('sort_order',        String(formData.sort_order));
    form.append('is_active',         formData.is_active    ? '1' : '0');
    form.append('is_featured',       formData.is_featured  ? '1' : '0');
    form.append('show_in_menu',      formData.show_in_menu ? '1' : '0');
    form.append('meta_title',        formData.meta_title);
    form.append('meta_description',  formData.meta_description);
    form.append('meta_keywords',     formData.meta_keywords);

    // Only send slug if it actually changed (avoids unique constraint 422 on edit)
    if (!editingCategory || formData.slug !== editingCategory.slug) {
      form.append('slug', formData.slug);
    }

    if (formData.parent_id !== null) {
      form.append('parent_id', String(formData.parent_id));
    }
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      const api = (await import('@/lib/axios')).default;
      if (editingCategory) {
        await api.post(`/categories/${editingCategory.id}?_method=PUT`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error: any) {
      const errors = error.response?.data?.errors ?? {};
      setFormErrors(errors);
      // Also log for debugging
      if (Object.keys(errors).length) {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
      } else {
        console.error('Failed to save category:', error.response?.data?.message ?? error.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const api = (await import('@/lib/axios')).default;
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error: any) {
      const msg = error.response?.data?.message ?? 'Failed to delete category';
      alert(msg);
    }
  };

  // Toggle uses a PATCH to update — the controller has no dedicated /toggle route
  const handleToggleStatus = async (category: CategoryType) => {
    try {
      const api = (await import('@/lib/axios')).default;
      const form = new FormData();
      form.append('_method',    'PUT');
      form.append('name',       category.name);
      form.append('type',       category.type);
      form.append('is_active',  category.is_active ? '0' : '1');
      await api.post(`/categories/${category.id}?_method=PUT`, form);
      loadCategories();
    } catch (error) { console.error('Failed to toggle status:', error); }
  };

  const openEditModal = (category: CategoryType) => {
    setEditingCategory(category);
    setFormData({
      name:              category.name,
      slug:              category.slug,
      description:       category.description       || '',
      short_description: category.short_description || '',
      parent_id:         category.parent_id,
      type:              category.type,
      icon:              category.icon              || '',
      image:             null,
      color:             category.color             || '',
      sort_order:        category.sort_order,
      is_featured:       category.is_featured,
      is_active:         category.is_active,
      show_in_menu:      category.show_in_menu,
      meta_title:        category.meta_title        || '',
      meta_description:  category.meta_description  || '',
      meta_keywords:     category.meta_keywords     || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData(DEFAULT_FORM);
    setShowSeo(false);
    setFormErrors({});
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const set = (field: keyof FormData) => (value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ── Tree helpers ──────────────────────────────────────────────────────────
  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const buildTree = (cats: CategoryType[], parentId: number | null = null): CategoryType[] =>
    cats
      .filter(c => c.parent_id === parentId)
      .map(c => ({ ...c, children: buildTree(cats, c.id) }))
      .sort((a, b) => a.sort_order - b.sort_order);

  const flattenTree = (cats: CategoryType[], level = 0): { category: CategoryType; level: number }[] => {
    let result: { category: CategoryType; level: number }[] = [];
    cats.forEach(cat => {
      result.push({ category: cat, level });
      if (expandedIds.has(cat.id) && cat.children?.length) {
        result = result.concat(flattenTree(cat.children, level + 1));
      }
    });
    return result;
  };

  const treeCategories = buildTree(categories);
  const flatCategories = flattenTree(treeCategories);

  // ── Render helpers ────────────────────────────────────────────────────────
  const typeLabelMap = Object.fromEntries(CATEGORY_TYPES.map(t => [t.value, t.label]));

  /**
   * Render a category icon correctly:
   * - Empty / null  → fallback (Folder or custom JSX)
   * - Emoji         → <span> so the glyph renders as-is
   * - FA class      → <i className="fa fa-xxx"> (or "fas fa-xxx" / "fab fa-xxx")
   *                   The backend stores values like "fa-globe", "globe", "fas fa-wifi"
   */
  const renderIcon = (icon: string | null, fallback: React.ReactNode, className = 'text-base sm:text-xl') => {
    if (!icon) return fallback;

    // Emoji: any string whose first code-point is outside the basic ASCII range
    // (covers all Unicode emoji blocks)
    const firstChar = String.fromCodePoint(icon.codePointAt(0)!);
    const isEmoji = firstChar.codePointAt(0)! > 127;
    if (isEmoji) return <span className={className}>{icon}</span>;

    // Font Awesome: normalise to a full class string
    // Accepts: "fa-globe"  → "fa fa-globe"
    //          "globe"     → "fa fa-globe"
    //          "fas fa-wifi" / "fab fa-brands" → pass through as-is
    let faClass = icon.trim();
    if (!faClass.includes(' ')) {
      // single token — prefix with "fa" and ensure "fa-" prefix on icon name
      faClass = faClass.startsWith('fa-') ? `fa ${faClass}` : `fa fa-${faClass}`;
    }
    return <i className={`${faClass} text-blue-300`} aria-hidden="true" />;
  };

  const renderCategoryRow = ({ category, level }: { category: CategoryType; level: number }) => {
    const hasChildren = !!category.children?.length;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div
        key={category.id}
        className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-5 mb-2 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200"
        style={{ marginLeft: Math.min(level * 24, 72) }}
      >
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

        <div
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20"
          style={category.color ? { background: `${category.color}33`, borderColor: `${category.color}44` } : undefined}
        >
          {renderIcon(category.icon, <Folder className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm sm:text-base truncate">{category.name}</h3>
            {hasChildren && (
              <span className="hidden sm:inline text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">
                {category.children?.length} sub
              </span>
            )}
            {category.is_featured && (
              <span className="text-xs px-1.5 sm:px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full">Featured</span>
            )}
            {!category.is_active && (
              <span className="text-xs px-1.5 sm:px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">Inactive</span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate hidden sm:block">
            <span className="text-slate-500">{category.slug}</span>
            <span className="mx-1.5">•</span>
            <span className="text-slate-500">{typeLabelMap[category.type] ?? category.type}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button onClick={() => handleToggleStatus(category)}
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
            {renderIcon(category.icon, <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />, 'text-base sm:text-lg')}
            <span className="text-white text-sm truncate max-w-[120px] sm:max-w-none">{category.name}</span>
          </div>
        </td>
        <td className="py-3 px-3 sm:px-4 text-slate-400 text-sm hidden md:table-cell">{category.slug}</td>
        <td className="py-3 px-3 sm:px-4 hidden sm:table-cell">
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300">
            {typeLabelMap[category.type] ?? category.type}
          </span>
        </td>
        <td className="py-3 px-3 sm:px-4 text-slate-400 text-sm hidden lg:table-cell">{category.sort_order}</td>
        <td className="py-3 px-3 sm:px-4">
          <button onClick={() => handleToggleStatus(category)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs ${category.is_active
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
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

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout userType="admin">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Category Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Organize your products and services into categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all text-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search categories..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
            >
              <option value="" className="bg-slate-900">All Types</option>
              {CATEGORY_TYPES.map(t => (
                <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
              ))}
            </select>
            <div className="flex rounded-lg border border-white/20 overflow-hidden">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'tree' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'}`}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Tree</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'}`}
              >
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
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-white mb-1">No categories found</h3>
            <p className="text-slate-400 text-sm">Create your first category to get started</p>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="p-3 sm:p-4">
            <div className="hidden sm:flex items-center gap-3 py-3 px-5 mb-4 text-sm font-medium text-slate-400 border-b border-white/10 bg-white/5">
              <div className="w-8" /><div className="w-12" />
              <div className="flex-1">Category Name</div>
              <div className="w-36">Actions</div>
            </div>
            <div className="space-y-1">
              {flatCategories.map(item => renderCategoryRow(item))}
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

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
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

              {/* Global error banner */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  {Object.entries(formErrors).map(([field, msgs]) => (
                    <p key={field} className="text-red-300 text-xs">
                      <span className="font-semibold capitalize">{field.replace('_', ' ')}</span>: {msgs[0]}
                    </p>
                  ))}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-4 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm ${formErrors.name ? 'border-red-500/60' : 'border-white/20'}`} required />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name[0]}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug *</label>
                <input type="text" value={formData.slug}
                  onChange={(e) => { set('slug')(e.target.value); setFormErrors(prev => ({ ...prev, slug: [] })); }}
                  className={`w-full px-4 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm ${formErrors.slug ? 'border-red-500/60' : 'border-white/20'}`} required />
                {formErrors.slug && <p className="text-red-400 text-xs mt-1">{formErrors.slug[0]}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => set('description')(e.target.value)}
                  rows={3} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
              </div>

              {/* Short description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Short Description</label>
                <input type="text" value={formData.short_description} onChange={(e) => set('short_description')(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
              </div>

              {/* Parent */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Parent Category</label>
                <select
                  value={formData.parent_id ?? ''}
                  onChange={(e) => set('parent_id')(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
                >
                  <option value="" className="bg-slate-900">No Parent (Top Level)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                    ))}
                </select>
              </div>

              {/* Type + Sort Order */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => set('type')(e.target.value as CategoryTypeValue)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
                    required
                  >
                    {CATEGORY_TYPES.map(t => (
                      <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Sort Order</label>
                  <input
                    type="number" min={0}
                    value={formData.sort_order}
                    onChange={(e) => set('sort_order')(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
                  />
                </div>
              </div>

              {/* Icon + Colour */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Icon (emoji / FA class)</label>
                  <input type="text" value={formData.icon} onChange={(e) => set('icon')(e.target.value)}
                    placeholder="🌐 or fa-globe"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Colour</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={formData.color || '#3b82f6'}
                      onChange={(e) => set('color')(e.target.value)}
                      className="h-9 w-12 rounded-lg border border-white/20 bg-white/10 cursor-pointer"
                    />
                    <input type="text" value={formData.color} onChange={(e) => set('color')(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image</label>
                <input
                  type="file" accept="image/*"
                  onChange={(e) => set('image')(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-300 file:text-xs"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2">
                {(
                  [
                    { field: 'is_active',    label: 'Active' },
                    { field: 'is_featured',  label: 'Featured' },
                    { field: 'show_in_menu', label: 'Show in Menu' },
                  ] as const
                ).map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[field] as boolean}
                      onChange={(e) => set(field)(e.target.checked)}
                      className="w-4 h-4 rounded border-white/30 bg-white/10"
                    />
                    <span className="text-sm text-slate-300">{label}</span>
                  </label>
                ))}
              </div>

              {/* SEO accordion */}
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSeo(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium">SEO Settings</span>
                  {showSeo ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {showSeo && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10">
                    <div className="pt-3">
                      <label className="block text-sm font-medium text-slate-300 mb-1">Meta Title</label>
                      <input type="text" value={formData.meta_title} onChange={(e) => set('meta_title')(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Meta Description</label>
                      <textarea value={formData.meta_description} onChange={(e) => set('meta_description')(e.target.value)}
                        rows={2} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Meta Keywords</label>
                      <input type="text" value={formData.meta_keywords} onChange={(e) => set('meta_keywords')(e.target.value)}
                        placeholder="keyword1, keyword2"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Form actions */}
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