import { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff,
  Search, X, ExternalLink, Loader2, AlertCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  pressArticleAdminService,
  type PressArticle,
  type PressArticlePayload,
  type ArticleType,
} from '@/services/pressarticle';
import { mediaService, type Media } from '@/services/media';

const CATEGORIES = [
  'Company News', 'Training', 'Expansion', 'Awards',
  'Interview', 'Product Launch', 'Partnership',
];

const EMPTY_FORM: PressArticlePayload = {
  title:              '',
  excerpt:            '',
  source_name:        '',
  source_url:         '',
  article_url:        '',
  category:           'Company News',
  type:               'press',
  thumbnail_url:      '',
  thumbnail_media_id: null,
  is_featured:        false,
  is_published:       false,
  published_at:       null,
};

// ── Media picker modal ────────────────────────────────────────────────────

const MediaPickerModal = ({
  onSelect,
  onClose,
}: {
  onSelect: (media: Media) => void;
  onClose: () => void;
}) => {
  const [media, setMedia]     = useState<Media[]>([]);
  const [search, setSearch]   = useState('');
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
          <h3 className="text-lg font-semibold text-white">Pick a thumbnail</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search images…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {media.map((m) => (
                <button key={m.id} onClick={() => onSelect(m)}
                  className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-blue-400 transition-all group">
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

// ── Article form modal ────────────────────────────────────────────────────

const ArticleFormModal = ({
  initial,
  onSave,
  onClose,
}: {
  initial?: PressArticle | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  // Use a ref to always hold the latest type value — bypasses stale closure issues
  const typeRef = useRef<ArticleType>(initial?.type ?? 'press');

  const [articleType, setArticleType] = useState<ArticleType>(initial?.type ?? 'press');
  const [title,        setTitle]        = useState(initial?.title ?? '');
  const [excerpt,      setExcerpt]      = useState(initial?.excerpt ?? '');
  const [sourceName,   setSourceName]   = useState(initial?.source_name ?? '');
  const [sourceUrl,    setSourceUrl]    = useState(initial?.source_url ?? '');
  const [articleUrl,   setArticleUrl]   = useState(initial?.article_url ?? '');
  const [category,     setCategory]     = useState(initial?.category ?? 'Company News');
  const [thumbUrl,     setThumbUrl]     = useState(initial?.thumbnail_url ?? '');
  const [thumbMediaId, setThumbMediaId] = useState<number | null>(initial?.thumbnail_media_id ?? null);
  const [isFeatured,   setIsFeatured]   = useState(initial?.is_featured ?? false);
  const [isPublished,  setIsPublished]  = useState(initial?.is_published ?? false);
  const [publishedAt,  setPublishedAt]  = useState(initial?.published_at ?? null);

  const [saving,      setSaving]      = useState(false);
  const [showPicker,  setShowPicker]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Keep ref in sync with state
  const handleTypeChange = (t: ArticleType) => {
    typeRef.current = t;
    setArticleType(t);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !sourceName.trim()) {
      setError('Title and source name are required.');
      return;
    }

    // Read type from BOTH state and ref — use ref as authoritative
    const resolvedType: ArticleType = typeRef.current;

    const payload: PressArticlePayload = {
      title:              title.trim(),
      excerpt:            excerpt.trim(),
      source_name:        sourceName.trim(),
      source_url:         sourceUrl.trim(),
      article_url:        articleUrl.trim(),
      category,
      type:               resolvedType,
      thumbnail_url:      thumbUrl.trim(),
      thumbnail_media_id: thumbMediaId,
      is_featured:        isFeatured,
      is_published:       isPublished,
      published_at:       publishedAt,
    };

    // Sanity log — remove after confirming it works
    console.log('[ArticleFormModal] submitting payload:', payload);

    setSaving(true);
    setError(null);
    try {
      if (initial) {
        await pressArticleAdminService.update(initial.id, payload);
      } else {
        await pressArticleAdminService.create(payload);
      }
      onSave();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? (err?.response?.data?.errors
            ? JSON.stringify(err.response.data.errors)
            : null)
        ?? 'Failed to save. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900/95 z-10">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                {initial ? 'Edit article' : 'New article'}
              </h3>
              {/* Live badge — if this doesn't change when you click, React state is broken */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                articleType === 'press'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
              }`}>
                {articleType === 'press' ? '📰 PRESS' : '✍️ BLOG'}
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 break-words">{error}</span>
              </div>
            )}

            {/* ── Content type ──────────────────────────────────────────
                Two approaches in parallel:
                1. Visual button picker (nice UX)
                2. Native <select> (always sends correct value, acts as truth source)
            ─────────────────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content type <span className="text-slate-500 font-normal">(current: <strong className="text-white">{articleType}</strong>)</span>
              </label>

              {/* Visual buttons */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('press')}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left ${
                    articleType === 'press'
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-1 ring-blue-400'
                      : 'bg-white/5 border-white/20 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="text-base mb-0.5">📰</div>
                  <div>Press / Media feature</div>
                  {articleType === 'press' && <div className="text-xs text-blue-400 mt-0.5">✓ Selected</div>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('blog')}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left ${
                    articleType === 'blog'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-1 ring-purple-400'
                      : 'bg-white/5 border-white/20 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="text-base mb-0.5">✍️</div>
                  <div>Blog post / Update</div>
                  {articleType === 'blog' && <div className="text-xs text-purple-400 mt-0.5">✓ Selected</div>}
                </button>
              </div>

              {/* Native select — always in sync, acts as the authoritative control */}
              <select
                value={articleType}
                onChange={(e) => handleTypeChange(e.target.value as ArticleType)}
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="press">📰 Press / Media feature → shows on /media</option>
                <option value="blog">✍️ Blog post / Update → shows on /blog</option>
              </select>
            </div>

            {/* ── Title ───────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Article headline"
              />
            </div>

            {/* ── Excerpt ─────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Short summary shown on the card"
              />
            </div>

            {/* ── Source ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Source name *</label>
                <input
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. Vilcom Networks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Source URL</label>
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* ── Article URL ─────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Article URL</label>
              <input
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="https://..."
              />
            </div>

            {/* ── Category ────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* ── Thumbnail ───────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Thumbnail</label>
              <div className="flex gap-3">
                <input
                  value={thumbUrl}
                  onChange={(e) => { setThumbUrl(e.target.value); setThumbMediaId(null); }}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Paste an image URL, or pick from library →"
                />
                <button type="button" onClick={() => setShowPicker(true)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all text-sm whitespace-nowrap">
                  Media library
                </button>
              </div>
              {thumbUrl && (
                <img src={thumbUrl} alt="preview" className="mt-2 h-20 rounded-lg object-cover" />
              )}
            </div>

            {/* ── Toggles ─────────────────────────────────────────────── */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500" />
                <span className="text-sm text-slate-300">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400" />
                <span className="text-sm text-slate-300">Featured (hero card)</span>
              </label>
            </div>

            {/* ── Published date ───────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Published date</label>
              <input
                type="datetime-local"
                value={publishedAt ? publishedAt.slice(0, 16) : ''}
                onChange={(e) => setPublishedAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6">
            <button type="button" onClick={onClose}
              className="px-5 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? 'Save changes' : 'Create article'}
            </button>
          </div>
        </div>
      </div>

      {showPicker && (
        <MediaPickerModal
          onSelect={(m) => { setThumbUrl(m.url); setThumbMediaId(m.id); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

// ── Main admin page ───────────────────────────────────────────────────────

const AdminPressArticles = () => {
  const [articles, setArticles]  = useState<PressArticle[]>([]);
  const [loading, setLoading]    = useState(true);
  const [search, setSearch]      = useState('');
  const [typeFilter, setType]    = useState<'' | 'press' | 'blog'>('');
  const [categoryFilter, setCat] = useState('');
  const [editTarget, setEdit]    = useState<PressArticle | null | undefined>(undefined);

  const load = () => {
    setLoading(true);
    pressArticleAdminService
      .getAll({
        search:   search || undefined,
        type:     (typeFilter as ArticleType) || undefined,
        category: categoryFilter || undefined,
        per_page: 50,
      })
      .then((res) => setArticles(res.data.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, typeFilter, categoryFilter]);

  const handleDelete         = async (id: number) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    await pressArticleAdminService.destroy(id);
    load();
  };
  const handleTogglePublish  = async (id: number) => { await pressArticleAdminService.togglePublish(id);  load(); };
  const handleToggleFeatured = async (id: number) => { await pressArticleAdminService.toggleFeatured(id); load(); };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Press Articles</h1>
          <p className="text-slate-400">Manage content for the Blog and Media Features pages</p>
        </div>
        <button onClick={() => setEdit(null)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all">
          <Plus className="w-4 h-4" /> New article
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search articles…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <select value={typeFilter} onChange={(e) => setType(e.target.value as '' | 'press' | 'blog')}
          className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none">
          <option value="">All types</option>
          <option value="press">Press / Media</option>
          <option value="blog">Blog posts</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCat(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid of articles */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((a) => (
             <div key={a.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 hover:bg-white/15 hover:border-white/30 transition-all flex flex-col">
                <div className="flex items-start gap-4 mb-3">
                   {a.thumbnail ? (
                     <img src={a.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-slate-800" />
                   ) : (
                     <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                       <span className="text-2xl">{a.type === 'press' ? '📰' : '✍️'}</span>
                     </div>
                   )}
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                           a.type === 'press' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                         }`}>
                           {a.type === 'press' ? 'Press' : 'Blog'}
                         </span>
                         {a.category && (
                           <span className="px-2 py-0.5 bg-white/10 text-slate-300 rounded-full text-[10px] font-bold uppercase tracking-wider truncate border border-white/10">
                             {a.category}
                           </span>
                         )}
                      </div>
                      <h3 className="text-white font-semibold text-sm line-clamp-2" title={a.title}>{a.title}</h3>
                   </div>
                </div>

                <div className="flex-1 text-sm text-slate-400 mb-4 line-clamp-3">
                   {a.excerpt || 'No excerpt provided.'}
                </div>

                <div className="flex items-center justify-between gap-2 mb-4 text-[11px] font-medium uppercase tracking-wide">
                   <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-500">Source:</span> 
                      <span className="text-slate-300 truncate">{a.source_name}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      {a.is_featured && <span className="text-amber-400 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" /> Featured</span>}
                      <span className={`flex items-center gap-1 ${a.is_published ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {a.is_published ? 'Published' : 'Draft'}
                      </span>
                   </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
                   {a.article_url && (
                     <a href={a.article_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex-1"
                     >
                       <ExternalLink className="w-3.5 h-3.5" /> Link
                     </a>
                   )}
                   <div className="flex-1" />
                   <button onClick={() => handleToggleFeatured(a.id)}
                     className={`p-1.5 rounded-lg border transition-all ${
                       a.is_featured ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                     }`}
                     title={a.is_featured ? 'Unfeature' : 'Feature'}>
                     <Star className={`w-4 h-4 ${a.is_featured ? 'fill-amber-400' : ''}`} />
                   </button>
                   <button onClick={() => handleTogglePublish(a.id)}
                     className={`p-1.5 rounded-lg border transition-all ${
                       a.is_published ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                     }`}
                     title={a.is_published ? 'Unpublish' : 'Publish'}>
                     {a.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                   <button onClick={() => setEdit(a)}
                     className="p-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all">
                     <Edit className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDelete(a.id)}
                     className="p-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
          ))}
          {articles.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-slate-400">
              No articles found. Click "New article" to get started.
            </div>
          )}
        </div>
      )}

      {editTarget !== undefined && (
        <ArticleFormModal
          initial={editTarget}
          onSave={load}
          onClose={() => setEdit(undefined)}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminPressArticles;