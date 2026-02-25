import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  Check,
  X as XIcon,
  Star,
  Quote,
  User,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { testimonialService, Testimonial, TestimonialStats } from '@/services/testimonials';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<TestimonialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    avatar: null as File | null,
    content: '',
    rating: 5,
    is_approved: false,
    is_featured: false,
  });

  useEffect(() => {
    loadTestimonials();
    loadStats();
  }, [searchQuery, statusFilter]);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const response = await testimonialService.getAll({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      });
      // Handle both direct array and { data: [] } response formats
      const testimonialsData = response.data || response;
      setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await testimonialService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('name', formData.name);
    form.append('company', formData.company || '');
    form.append('content', formData.content);
    form.append('rating', String(formData.rating));
    form.append('is_approved', String(formData.is_approved));
    form.append('is_featured', String(formData.is_featured));
    
    if (formData.avatar) {
      form.append('avatar', formData.avatar);
    }

    try {
      if (editingTestimonial) {
        await testimonialService.update(editingTestimonial.id, form);
      } else {
        await testimonialService.create(form);
      }
      setShowModal(false);
      resetForm();
      loadTestimonials();
      loadStats();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      await testimonialService.delete(id);
      loadTestimonials();
      loadStats();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await testimonialService.approve(id);
      loadTestimonials();
      loadStats();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await testimonialService.reject(id);
      loadTestimonials();
      loadStats();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await testimonialService.toggleFeatured(id);
      loadTestimonials();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      company: testimonial.company || '',
      avatar: null,
      content: testimonial.content,
      rating: testimonial.rating,
      is_approved: testimonial.is_approved,
      is_featured: testimonial.is_featured,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      company: '',
      avatar: null,
      content: '',
      rating: 5,
      is_approved: false,
      is_featured: false,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonial Management</h1>
          <p className="text-slate-400">Manage customer testimonials and reviews</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Stats - Glassmorphism */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <p className="text-sm text-slate-400">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <p className="text-sm text-slate-400">Approved</p>
            <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <p className="text-sm text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <p className="text-sm text-slate-400">Featured</p>
            <p className="text-2xl font-bold text-purple-400">{stats.featured}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <p className="text-sm text-slate-400">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.average_rating.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Filters - Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
          >
            <option value="" className="bg-slate-900">All Status</option>
            <option value="approved" className="bg-slate-900">Approved</option>
            <option value="pending" className="bg-slate-900">Pending</option>
          </select>
        </div>
      </div>

      {/* Testimonials list - Glassmorphism */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
            <Quote className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No testimonials found</h3>
            <p className="text-slate-400">Add your first testimonial to get started</p>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-blue-500/20">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-blue-400" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{testimonial.name}</h3>
                        {testimonial.is_featured && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Featured</span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          testimonial.is_approved 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        }`}>
                          {testimonial.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      {testimonial.company && (
                        <p className="text-sm text-slate-400">{testimonial.company}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  
                  <p className="mt-3 text-slate-300 line-clamp-3">{testimonial.content}</p>
                  
                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {!testimonial.is_approved && (
                      <button
                        onClick={() => handleApprove(testimonial.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    {testimonial.is_approved && (
                      <button
                        onClick={() => handleReject(testimonial.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded-lg hover:bg-slate-500/30 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(testimonial.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-all ${
                        testimonial.is_featured 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30' 
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => openEditModal(testimonial)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Glassmorphism */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Avatar {editingTestimonial ? '' : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-300 file:border file:border-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_approved}
                    onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 bg-white/10"
                  />
                  <span className="text-sm text-slate-300">Approved</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 bg-white/10"
                  />
                  <span className="text-sm text-slate-300">Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                >
                  {editingTestimonial ? 'Update' : 'Create'} Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TestimonialManagement;

