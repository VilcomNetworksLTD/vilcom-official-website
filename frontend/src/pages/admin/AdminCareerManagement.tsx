import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Plus, Pencil, Trash2, Eye, Download, FileText,
  Users, Search, Filter, ChevronDown, ChevronUp, X, Check,
  Loader2, AlertCircle, Clock, MapPin, Tag, BookOpen,
  UserCheck, UserX, Calendar, ExternalLink, RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  adminVacanciesApi,
  adminCareersApi,
  type JobVacancy,
  type JobVacancyFormData,
  type CareerApplication,
} from '@/services/careers';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  under_review: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  shortlisted:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  interviewed:  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  rejected:     'bg-red-500/20 text-red-300 border-red-500/30',
  hired:        'bg-green-500/20 text-green-300 border-green-500/30',
  withdrawn:    'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const VACANCY_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  draft:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  closed: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const APP_STATUSES = [
  { value: 'pending',      label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted',  label: 'Shortlisted' },
  { value: 'interviewed',  label: 'Interviewed' },
  { value: 'rejected',     label: 'Rejected' },
  { value: 'hired',        label: 'Hired' },
  { value: 'withdrawn',    label: 'Withdrawn' },
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeGlassCard = 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Vacancy Form Modal ───────────────────────────────────────────────────────

interface VacancyModalProps {
  vacancy?: JobVacancy | null;
  onClose: () => void;
  onSaved: (v: JobVacancy) => void;
}

const VacancyModal = ({ vacancy, onClose, onSaved }: VacancyModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [reqInput, setReqInput] = useState('');
  const [form, setForm] = useState<JobVacancyFormData>({
    title:        vacancy?.title        ?? '',
    department:   vacancy?.department   ?? '',
    location:     vacancy?.location     ?? 'Nairobi, Kenya',
    type:         vacancy?.type         ?? 'Full-time',
    description:  vacancy?.description  ?? '',
    requirements: vacancy?.requirements ?? [],
    status:       vacancy?.status       ?? 'active',
    deadline:     vacancy?.deadline     ?? '',
  });

  const addReq = () => {
    if (!reqInput.trim()) return;
    setForm(f => ({ ...f, requirements: [...(f.requirements ?? []), reqInput.trim()] }));
    setReqInput('');
  };

  const removeReq = (i: number) =>
    setForm(f => ({ ...f, requirements: (f.requirements ?? []).filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: 'Validation Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const saved = vacancy
        ? await adminVacanciesApi.update(vacancy.id, form)
        : await adminVacanciesApi.create(form);
      toast({ title: vacancy ? 'Vacancy Updated' : 'Vacancy Created', description: `"${saved.title}" has been ${vacancy ? 'updated' : 'posted'}.` });
      onSaved(saved);
    } catch {
      toast({ title: 'Error', description: 'Failed to save vacancy. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${makeGlassCard} p-6 max-w-2xl w-full my-8 shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            {vacancy ? 'Edit Vacancy' : 'Post New Vacancy'}
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Job Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Network Engineer"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Department</label>
              <input
                type="text"
                value={form.department ?? ''}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Technical"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Location</label>
              <input
                type="text"
                value={form.location ?? ''}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Nairobi, Kenya"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white focus:border-blue-400 outline-none"
              >
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status *</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as JobVacancyFormData['status'] }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white focus:border-blue-400 outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Application Deadline</label>
            <input
              type="date"
              value={form.deadline ?? ''}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Requirements</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={reqInput}
                onChange={e => setReqInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReq())}
                placeholder="Type a requirement and press Enter"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 outline-none"
              />
              <button type="button" onClick={addReq} className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {(form.requirements ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(form.requirements ?? []).map((req, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm">
                    {req}
                    <button type="button" onClick={() => removeReq(i)} className="text-white/40 hover:text-white ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> {vacancy ? 'Update Vacancy' : 'Post Vacancy'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Application Detail Modal ─────────────────────────────────────────────────

interface AppDetailModalProps {
  application: CareerApplication;
  onClose: () => void;
  onUpdated: (a: CareerApplication) => void;
}

const AppDetailModal = ({ application, onClose, onUpdated }: AppDetailModalProps) => {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.hr_notes ?? '');
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadFile = async (type: 'cv' | 'certificates' | 'additional', label: string) => {
    setDownloading(type);
    try {
      let blob: Blob;
      if (type === 'cv')            blob = await adminCareersApi.downloadCv(application.id);
      else if (type === 'certificates') blob = await adminCareersApi.downloadCertificates(application.id);
      else                           blob = await adminCareersApi.downloadAdditionalDocuments(application.id);
      downloadBlob(blob, `${application.application_number}_${label}`);
    } catch {
      toast({ title: 'Download failed', description: `Could not download ${label}`, variant: 'destructive' });
    } finally {
      setDownloading(null);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      await adminCareersApi.updateStatus(application.id, { status: selectedStatus as CareerApplication['status'], notes });
      await adminCareersApi.updateNotes(application.id, notes);
      toast({ title: 'Updated', description: 'Application status updated successfully.' });
      onUpdated({ ...application, status: selectedStatus as CareerApplication['status'], hr_notes: notes });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${makeGlassCard} p-6 max-w-2xl w-full my-8 shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{application.full_name}</h3>
            <p className="text-white/60 text-sm">{application.application_number} · {application.job_title}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Applicant Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Email', value: application.email },
            { label: 'Phone', value: application.phone ?? '—' },
            { label: 'LinkedIn', value: application.linkedin_url ?? '—', link: application.linkedin_url },
            { label: 'Portfolio', value: application.portfolio_url ?? '—', link: application.portfolio_url },
            { label: 'Applied', value: new Date(application.created_at).toLocaleDateString() },
            { label: 'Last Reviewed', value: application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : '—' },
          ].map(({ label, value, link }) => (
            <div key={label} className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs mb-1">{label}</p>
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm flex items-center gap-1 hover:underline">
                  {value} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-white text-sm truncate">{value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Cover Letter */}
        {application.cover_letter && (
          <div className="mb-6">
            <p className="text-white/60 text-sm font-medium mb-2">Cover Letter</p>
            <div className="bg-white/5 rounded-lg p-4 text-white/80 text-sm leading-relaxed max-h-40 overflow-y-auto">
              {application.cover_letter}
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="mb-6">
          <p className="text-white/60 text-sm font-medium mb-3">Documents</p>
          <div className="flex flex-wrap gap-3">
            {application.cv_path && (
              <button
                onClick={() => downloadFile('cv', 'cv')}
                disabled={downloading === 'cv'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-60"
              >
                {downloading === 'cv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download CV
              </button>
            )}
            {application.certificates_path && (
              <button
                onClick={() => downloadFile('certificates', 'certificates')}
                disabled={downloading === 'certificates'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-60"
              >
                {downloading === 'certificates' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Certificates
              </button>
            )}
            {application.additional_documents_path && (
              <button
                onClick={() => downloadFile('additional', 'additional')}
                disabled={downloading === 'additional'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-60"
              >
                {downloading === 'additional' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Additional Docs
              </button>
            )}
            {!application.cv_path && !application.certificates_path && !application.additional_documents_path && (
              <span className="text-white/40 text-sm">No documents uploaded</span>
            )}
          </div>
        </div>

        {/* Status Update */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-white/60 text-sm font-medium mb-3">Update Status</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white focus:border-blue-400 outline-none"
            >
              {APP_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="HR notes (optional)..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 outline-none resize-none mb-4"
          />
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors">
              Close
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={updatingStatus}
              className="flex-1 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {updatingStatus ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Check className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCareerManagement() {
  const { hasRole, isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!hasRole(['admin', 'staff', 'hr'])) return <Navigate to="/client/dashboard" replace />;

  // Tabs
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applications'>('vacancies');

  // ─ Vacancies state ─
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [vacLoading, setVacLoading] = useState(true);
  const [vacSearch, setVacSearch] = useState('');
  const [vacStatusFilter, setVacStatusFilter] = useState('');
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<JobVacancy | null>(null);
  const [deletingVacancy, setDeletingVacancy] = useState<number | null>(null);

  // ─ Applications state ─
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [appTotal, setAppTotal] = useState(0);
  const [appPage, setAppPage] = useState(1);
  const [appLastPage, setAppLastPage] = useState(1);
  const [appLoading, setAppLoading] = useState(true);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appJobFilter, setAppJobFilter] = useState('');
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<CareerApplication | null>(null);

  // ─ Stats ─
  const [stats, setStats] = useState<{ total: number; pending: number; shortlisted: number; hired: number } | null>(null);

  // ─── Load vacancies ───────────────────────────────────────────────────────
  const loadVacancies = useCallback(async () => {
    setVacLoading(true);
    try {
      const res = await adminVacanciesApi.getAll({
        search: vacSearch || undefined,
        status: vacStatusFilter || undefined,
        per_page: 50,
      });
      setVacancies(res.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load vacancies', variant: 'destructive' });
    } finally {
      setVacLoading(false);
    }
  }, [vacSearch, vacStatusFilter]);

  // ─── Load applications ────────────────────────────────────────────────────
  const loadApplications = useCallback(async () => {
    setAppLoading(true);
    try {
      const res = await adminCareersApi.getAll({
        search:    appSearch    || undefined,
        status:    appStatusFilter || undefined,
        job_title: appJobFilter || undefined,
        page:      appPage,
        per_page:  15,
      });
      setApplications(res.data);
      setAppTotal(res.meta.total);
      setAppLastPage(res.meta.last_page);
    } catch {
      toast({ title: 'Error', description: 'Failed to load applications', variant: 'destructive' });
    } finally {
      setAppLoading(false);
    }
  }, [appSearch, appStatusFilter, appJobFilter, appPage]);

  // ─── Load stats & job titles ──────────────────────────────────────────────
  const loadMeta = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        adminCareersApi.getStatistics(),
        adminCareersApi.getJobTitles(),
      ]);
      setStats({ total: s.total, pending: s.pending, shortlisted: s.shortlisted, hired: s.hired });
      setJobTitles(t);
    } catch {/* silent */}
  }, []);

  useEffect(() => { loadVacancies(); }, [loadVacancies]);
  useEffect(() => { loadApplications(); }, [loadApplications]);
  useEffect(() => { loadMeta(); }, [loadMeta]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleVacancySaved = (v: JobVacancy) => {
    setVacancies(prev => {
      const idx = prev.findIndex(x => x.id === v.id);
      return idx >= 0 ? prev.map((x, i) => i === idx ? v : x) : [v, ...prev];
    });
    setShowVacancyModal(false);
    setEditingVacancy(null);
  };

  const handleDeleteVacancy = async (id: number) => {
    if (!confirm('Delete this vacancy? This cannot be undone.')) return;
    setDeletingVacancy(id);
    try {
      await adminVacanciesApi.delete(id);
      setVacancies(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Deleted', description: 'Vacancy removed.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete vacancy.', variant: 'destructive' });
    } finally {
      setDeletingVacancy(null);
    }
  };

  const handleAppUpdated = (updated: CareerApplication) => {
    setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelectedApp(null);
    loadMeta();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout userType={hasRole('admin') ? 'admin' : 'staff'}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-400" />
          Career Management
        </h1>
        <p className="text-slate-400 mt-1">Post job vacancies and manage CV applications</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Vacancies', value: vacancies.filter(v => v.status === 'active').length, icon: Briefcase, color: 'text-blue-400' },
            { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-cyan-400' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
            { label: 'Hired', value: stats.hired, icon: UserCheck, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className={`${makeGlassCard} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color} opacity-70`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {(['vacancies', 'applications'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'vacancies' ? (
              <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Job Vacancies</span>
            ) : (
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Applications ({appTotal})</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ VACANCIES TAB ═══════════ */}
      {activeTab === 'vacancies' && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={vacSearch}
                onChange={e => setVacSearch(e.target.value)}
                placeholder="Search vacancies..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 outline-none text-sm"
              />
            </div>
            <select
              value={vacStatusFilter}
              onChange={e => setVacStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-sm outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
            <button
              onClick={() => { setEditingVacancy(null); setShowVacancyModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Post Vacancy
            </button>
            <button onClick={loadVacancies} className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {vacLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : vacancies.length === 0 ? (
            <div className={`${makeGlassCard} p-12 text-center`}>
              <Briefcase className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">No vacancies found</p>
              <p className="text-slate-400 text-sm mb-4">Post your first job vacancy to get started.</p>
              <button
                onClick={() => setShowVacancyModal(true)}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" /> Post Vacancy
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vacancies.map(v => (
                <div key={v.id} className={`${makeGlassCard} p-5 hover:border-blue-500/30 transition-all group`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate group-hover:text-blue-300 transition-colors">{v.title}</h3>
                      {v.department && <p className="text-slate-400 text-xs mt-0.5">{v.department}</p>}
                    </div>
                    <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs border ${VACANCY_STATUS_COLORS[v.status]}`}>
                      {v.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm line-clamp-2 mb-3">{v.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.location}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{v.type}</span>
                    {v.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Deadline: {new Date(v.deadline).toLocaleDateString()}</span>}
                  </div>

                  {v.requirements && v.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {v.requirements.slice(0, 3).map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60 border border-white/10">{r}</span>
                      ))}
                      {v.requirements.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/40">+{v.requirements.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => { setEditingVacancy(v); setShowVacancyModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30 transition-all text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => { setAppJobFilter(v.title); setActiveTab('applications'); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all text-xs"
                    >
                      <Users className="w-3.5 h-3.5" /> Applications
                    </button>
                    <button
                      onClick={() => handleDeleteVacancy(v.id)}
                      disabled={deletingVacancy === v.id}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all"
                    >
                      {deletingVacancy === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ APPLICATIONS TAB ═══════════ */}
      {activeTab === 'applications' && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={appSearch}
                onChange={e => { setAppSearch(e.target.value); setAppPage(1); }}
                placeholder="Search by name, email, app number..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 outline-none text-sm"
              />
            </div>
            <select
              value={appStatusFilter}
              onChange={e => { setAppStatusFilter(e.target.value); setAppPage(1); }}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-sm outline-none"
            >
              <option value="">All Status</option>
              {APP_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              value={appJobFilter}
              onChange={e => { setAppJobFilter(e.target.value); setAppPage(1); }}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-sm outline-none max-w-[200px]"
            >
              <option value="">All Positions</option>
              {jobTitles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {appJobFilter && (
              <button onClick={() => setAppJobFilter('')} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/30 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <button onClick={loadApplications} className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {appLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className={`${makeGlassCard} p-12 text-center`}>
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">No applications found</p>
              <p className="text-slate-400 text-sm">Applications submitted via the careers page will appear here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {applications.map(app => (
                  <div
                    key={app.id}
                    className={`${makeGlassCard} p-4 hover:border-blue-500/30 transition-all cursor-pointer`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {app.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-medium">{app.full_name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[app.status] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                              {app.status_label}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm truncate">{app.email} · {app.job_title}</p>
                          <p className="text-slate-500 text-xs">{app.application_number} · Applied {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.cv_path && (
                          <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                            <FileText className="w-3 h-3" /> CV
                          </span>
                        )}
                        {app.certificates_path && (
                          <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                            <BookOpen className="w-3 h-3" /> Certs
                          </span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedApp(app); }}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {appLastPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    disabled={appPage === 1}
                    onClick={() => setAppPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/70 disabled:opacity-40 hover:bg-white/20 transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-slate-400 text-sm px-4">Page {appPage} of {appLastPage}</span>
                  <button
                    disabled={appPage === appLastPage}
                    onClick={() => setAppPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/70 disabled:opacity-40 hover:bg-white/20 transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {(showVacancyModal || editingVacancy) && (
        <VacancyModal
          vacancy={editingVacancy}
          onClose={() => { setShowVacancyModal(false); setEditingVacancy(null); }}
          onSaved={handleVacancySaved}
        />
      )}

      {selectedApp && (
        <AppDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdated={handleAppUpdated}
        />
      )}
    </DashboardLayout>
  );
}
