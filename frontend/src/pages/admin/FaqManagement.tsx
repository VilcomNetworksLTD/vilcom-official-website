import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  ToggleLeft,
  ToggleRight,
  Eye,
  ChevronDown,
  ChevronUp,
  Folder
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { faqService, Faq, FaqCategory, FaqStats } from '@/services/faqs';

const FaqManagement = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [stats, setStats] = useState<FaqStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category_id: null as number | null,
    is_active: true,
  });

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadFaqs();
    loadCategories();
    loadStats();
  }, [searchQuery, categoryFilter, statusFilter]);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const response = await faqService.getAll({
        search: searchQuery || undefined,
        category_id: categoryFilter ? Number(categoryFilter) : undefined,
        status: statusFilter || undefined,
      });
      setFaqs(response.data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await faqService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await faqService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFaq) {
        await faqService.update(editingFaq.id, formData);
      } else {
        await faqService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadFaqs();
      loadStats();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      await faqService.delete(id);
      loadFaqs();
      loadStats();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await faqService.toggleStatus(id);
      loadFaqs();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await faqService.createCategory(categoryFormData);
      setShowCategoryModal(false);
      setCategoryFormData({ name: '', description: '' });
      loadCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? FAQs will be moved to uncategorized.')) return;
    
    try {
      await faqService.deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const openEditModal = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category_id: faq.category_id,
      is_active: faq.is_active,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category_id: null,
      is_active: true,
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedFaqs(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Manage your frequently asked questions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Folder className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total FAQs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_faqs}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active_faqs}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{stats.inactive_faqs}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Views</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total_views}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-purple-600">{stats.total_categories}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* FAQs list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No FAQs found</h3>
            <p className="text-gray-500">Create your first FAQ to get started</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(faq.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button className="mt-1 text-gray-400">
                      {expandedFaqs.includes(faq.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                      {faq.category && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          {faq.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(faq.id); }}
                      className={`p-2 rounded-lg ${faq.is_active ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {faq.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(faq); }}
                      className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Expanded content */}
              {expandedFaqs.includes(faq.id) && (
                <div className="px-4 pb-4 pt-0 pl-12">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 whitespace-pre-wrap">{faq.answer}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {faq.views} views
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
                  {editingFaq ? 'Update' : 'Create'} FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Manage Categories</h3>
            </div>
            <div className="p-6">
              {/* Create category form */}
              <form onSubmit={handleCategorySubmit} className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Add New Category</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                  >
                    Add Category
                  </button>
                </div>
              </form>

              {/* Category list */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Existing Categories</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        {cat.description && (
                          <p className="text-sm text-gray-500">{cat.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FaqManagement;

