import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Image, 
  Search,
  ToggleLeft,
  ToggleRight,
  Copy,
  GripVertical,
  ExternalLink,
  Calendar,
  Users,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { bannerService, Banner } from '@/services/banners';

const BannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [positions, setPositions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: null as File | null,
    position: 'homepage_hero',
    start_date: '',
    end_date: '',
    target_logged_in: true,
    target_guests: true,
    cta_text: '',
    cta_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadBanners();
    loadPositions();
  }, [searchQuery, positionFilter, statusFilter]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerService.getAll({
        search: searchQuery || undefined,
        position: positionFilter || undefined,
        status: statusFilter || undefined,
      });
      // Handle both direct array and { data: [] } response formats
      const bannersData = response.data || response;
      setBanners(Array.isArray(bannersData) ? bannersData : []);
    } catch (error) {
      console.error('Failed to load banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const response = await bannerService.getPositions();
      setPositions(response.data);
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('title', formData.title);
    form.append('subtitle', formData.subtitle || '');
    form.append('position', formData.position);
    form.append('start_date', formData.start_date || '');
    form.append('end_date', formData.end_date || '');
    form.append('target_logged_in', String(formData.target_logged_in));
    form.append('target_guests', String(formData.target_guests));
    form.append('cta_text', formData.cta_text || '');
    form.append('cta_url', formData.cta_url || '');
    form.append('is_active', String(formData.is_active));
    
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      if (editingBanner) {
        await bannerService.update(editingBanner.id, form);
      } else {
        await bannerService.create(form);
      }
      setShowModal(false);
      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await bannerService.delete(id);
      loadBanners();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await bannerService.toggleStatus(id);
      loadBanners();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await bannerService.duplicate(id);
      loadBanners();
    } catch (error) {
      console.error('Failed to duplicate:', error);
    }
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: null,
      position: banner.position,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
      target_logged_in: banner.target_logged_in,
      target_guests: banner.target_guests,
      cta_text: banner.cta_text || '',
      cta_url: banner.cta_url || '',
      is_active: banner.is_active,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image: null,
      position: 'homepage_hero',
      start_date: '',
      end_date: '',
      target_logged_in: true,
      target_guests: true,
      cta_text: '',
      cta_url: '',
      is_active: true,
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Banner Management</h1>
          <p className="text-slate-400">Manage your promotional banners and sliders</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Filters - Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
            />
          </div>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
          >
            <option value="" className="bg-slate-900">All Positions</option>
            {Object.entries(positions).map(([key, value]) => (
              <option key={key} value={key} className="bg-slate-900">{value}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
          >
            <option value="" className="bg-slate-900">All Status</option>
            <option value="active" className="bg-slate-900">Active</option>
            <option value="inactive" className="bg-slate-900">Inactive</option>
          </select>
        </div>
      </div>

      {/* Banner list - Glassmorphism */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
            <Image className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No banners found</h3>
            <p className="text-slate-400">Create your first banner to get started</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 hover:border-white/30 transition-all">
              <div className="flex gap-4">
                {/* Banner image */}
                <div className="w-48 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg overflow-hidden flex-shrink-0">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-blue-400" />
                    </div>
                  )}
                </div>
                
                {/* Banner info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{banner.title}</h3>
                      <p className="text-sm text-slate-400">{positions[banner.position] || banner.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(banner.id)}
                        className={`p-2 rounded-lg ${banner.is_active ? 'text-green-400 hover:bg-green-500/20' : 'text-slate-400 hover:bg-slate-500/20'}`}
                      >
                        {banner.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                    {banner.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(banner.start_date).toLocaleDateString()}
                        {banner.end_date && ` - ${new Date(banner.end_date).toLocaleDateString()}`}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {banner.target_logged_in && 'Logged In'}{banner.target_logged_in && banner.target_guests && ', '}{banner.target_guests && 'Guests'}
                    </div>
                    {banner.cta_text && (
                      <div className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        {banner.cta_text}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(banner.id)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Position *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  required
                >
                  {Object.entries(positions).map(([key, value]) => (
                    <option key={key} value={key} className="bg-slate-900">{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Banner Image {editingBanner ? '' : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-300 file:border file:border-blue-500/30"
                  required={!editingBanner}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="e.g., Learn More"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">CTA URL</label>
                  <input
                    type="url"
                    value={formData.cta_url}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                    placeholder="https://"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.target_logged_in}
                    onChange={(e) => setFormData({ ...formData, target_logged_in: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 bg-white/10"
                  />
                  <span className="text-sm text-slate-300">Show to logged in users</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.target_guests}
                    onChange={(e) => setFormData({ ...formData, target_guests: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 bg-white/10"
                  />
                  <span className="text-sm text-slate-300">Show to guests</span>
                </label>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-white/30 bg-white/10"
                />
                <span className="text-sm text-slate-300">Active</span>
              </label>

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
                  {editingBanner ? 'Update' : 'Create'} Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BannerManagement;

