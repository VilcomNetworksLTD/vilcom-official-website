import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, EyeOff,
  Search, X, Loader2, MapPin, Target,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { portfolioAdminService, type PortfolioProject, type PortfolioPayload } from '@/services/portfolio';
import { mediaService, type Media } from '@/services/media';

const CATEGORIES = ['Fiber Installation', 'Business Installation', 'Hotspot Network', 'Enterprise', 'General'];

// ── Media picker ───────────────────────────────────────────────────────────

const MediaPickerModal = ({
  onSelect,
  onClose,
}: {
  onSelect: (m: Media) => void;
  onClose: () => void;
}) => {
  const [media, setMedia]   = useState<Media[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mediaService
      .getAll({ type: 'image', search: search || undefined })
      .then((res) => {
        const raw = (res as any).data?.data ?? (res as any).data ?? res;
        setMedia(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Choose an image from the media library</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images…"
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {media.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelect(m)}
                  className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-blue-400 transition-all group"
                >
                  <img src={m.url} alt={m.alt_text} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </button>
              ))}
              {media.length === 0 && (
                <p className="col-span-4 text-center text-slate-400 py-8">No images found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Portfolio item form modal ────────────────────────────────────────────────

const PortfolioFormModal = ({
  initial,
  onSave,
  onClose,
}: {
  initial?: PortfolioProject | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [form, setForm]             = useState<PortfolioPayload & { _preview?: string }>({
    media_id:     initial?.media_id   ?? null,
    title:        initial?.title      ?? '',
    category:     initial?.category   ?? 'Fiber Installation',
    location:     initial?.location   ?? '',
    description:  initial?.description ?? '',
    stats_value:  initial?.stats_value ?? '',
    stats_label:  initial?.stats_label ?? '',
    is_published: initial?.is_published ?? true,
    _preview:     initial?.media?.url,
  });
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('A title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: PortfolioPayload = {
        media_id:     form.media_id,
        title:        form.title,
        category:     form.category,
        location:     form.location,
        description:  form.description,
        stats_value:  form.stats_value,
        stats_label:  form.stats_label,
        is_published: form.is_published,
      };
      if (initial) {
        await portfolioAdminService.update(initial.id, payload);
      } else {
        await portfolioAdminService.create(payload);
      }
      onSave();
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-white">
              {initial ? 'Edit portfolio project' : 'Add to portfolio'}
            </h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>
            )}

            {/* Image preview / picker */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
              {form._preview ? (
                <div className="relative group">
                  <img src={form._preview} alt="selected" className="w-full h-40 object-cover rounded-xl" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <button
                      onClick={() => setShowPicker(true)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg"
                    >
                      Change image
                    </button>
                    <button
                      onClick={() => { set('media_id', null); set('_preview' as any, undefined); }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowPicker(true)}
                  className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-all"
                >
                  <Plus className="w-6 h-6 mr-2" /> Pick from media library
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="e.g. Nairobi Metropolitan Fiber Deployment"
              />
            </div>

            {/* Category + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                <input
                  value={form.location ?? ''}
                  onChange={(e) => set('location', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. Nairobi County"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Describe the project..."
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Highlight Stat Value</label>
                <input
                  value={form.stats_value ?? ''}
                  onChange={(e) => set('stats_value', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. 50,000+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Highlight Stat Label</label>
                <input
                  value={form.stats_label ?? ''}
                  onChange={(e) => set('stats_label', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. Homes Connected"
                />
              </div>
            </div>

            {/* Published */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set('is_published', e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm text-slate-300">Visible on the public portfolio</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 sticky bottom-0 bg-slate-900/95 border-t border-white/10">
            <button onClick={onClose} className="px-5 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? 'Save changes' : 'Add project'}
            </button>
          </div>
        </div>
      </div>

      {showPicker && (
        <MediaPickerModal
          onSelect={(m) => { set('media_id', m.id); set('_preview' as any, m.url); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

// ── Main admin page ────────────────────────────────────────────────────────

const AdminPortfolio = () => {
  const [items, setItems]         = useState<PortfolioProject[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [catFilter, setCat]       = useState('');
  const [editTarget, setEdit]     = useState<PortfolioProject | null | undefined>(undefined);

  const load = () => {
    setLoading(true);
    portfolioAdminService
      .getAll({ search: search || undefined, category: catFilter || undefined, per_page: 50 })
      .then((res) => {
        const data = (res as any).data?.data ?? res.data ?? res;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, catFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this project from the portfolio?')) return;
    await portfolioAdminService.destroy(id);
    load();
  };

  const handleTogglePublish = async (id: number) => {
    await portfolioAdminService.togglePublish(id);
    load();
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Projects</h1>
          <p className="text-slate-400">Manage case studies and completed projects</p>
        </div>
        <button
          onClick={() => setEdit(null)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCat(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white/10 border rounded-xl overflow-hidden group transition-all flex flex-col ${
                item.is_published ? 'border-white/20' : 'border-white/10 opacity-70'
              }`}
            >
              <div className="h-40 relative bg-slate-800 shrink-0">
                {item.media?.url ? (
                  <img
                    src={item.media.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Target className="w-8 h-8" />
                  </div>
                )}
                {!item.is_published && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-xs text-white/80 font-medium px-2 py-1 bg-black/50 rounded-full">Hidden</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-sky-600/90 text-white font-medium px-2 py-1 rounded-full shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                  {item.location ? (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />{item.location}
                    </span>
                  ) : (
                    <span>No location</span>
                  )}
                </div>
                <h3 className="text-white font-semibold text-lg line-clamp-2 leading-tight mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 flex-1">{item.description}</p>
                
                {item.stats_value && item.stats_label && (
                  <div className="mt-3 bg-white/5 rounded-lg p-2 border border-white/5 flex items-center gap-2 text-sm text-slate-300">
                    <span className="font-bold text-sky-400">{item.stats_value}</span>
                    <span className="text-xs truncate">{item.stats_label}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleTogglePublish(item.id)}
                    className="flex-1 py-1.5 flex justify-center items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                    title={item.is_published ? 'Hide' : 'Show'}
                  >
                    {item.is_published ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Show</>}
                  </button>
                  <button
                    onClick={() => setEdit(item)}
                    className="flex-1 py-1.5 flex justify-center items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="py-1.5 px-3 flex justify-center items-center text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400 glass-panel rounded-xl">
              <Target className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <p className="text-lg font-medium text-white mb-1">No portfolio projects</p>
              <p>Click "Add Project" to add a new case study or installation.</p>
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {editTarget !== undefined && (
        <PortfolioFormModal
          initial={editTarget}
          onSave={load}
          onClose={() => setEdit(undefined)}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminPortfolio;
