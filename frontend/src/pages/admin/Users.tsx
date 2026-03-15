import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  User, 
  UserPlus,
  UserCheck,
  Shield,
  Building2,
  Search, 
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import type { UserType } from '@/services/users';
import { usersApi } from '@/services/users';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: 'Active',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]' },
  inactive:  { label: 'Inactive',  color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: 'bg-slate-500' },
  suspended: { label: 'Suspended', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: 'bg-red-400 shadow-[0_0_6px_#ef4444]' },
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: React.ElementType; accent: string; sub?: React.ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 hover:bg-white/10 transition-all">
    <div className="flex items-start justify-between">
      <p className="text-xs sm:text-sm font-medium text-slate-400">{label}</p>
      <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${accent}18` }}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: accent }} />
      </div>
    </div>
    <div>
      <p className="text-xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <div className="mt-1 sm:mt-1.5 text-xs text-slate-500 hidden sm:block">{sub}</div>}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const m = STATUS_META[status] ?? STATUS_META.inactive;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
      style={{ color: m.color, background: m.bg }}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

// ─── User Card (Mobile - Testimonial Style) ─────────────────────────────────────
const UserCard = ({ user, onEdit, onDelete }: {
  user: UserType;
  onEdit: () => void;
  onDelete: (id: number) => void;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border border-white/10">
          <AvatarImage src={user.avatar_url} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm sm:text-base truncate">{user.name}</h3>
          <p className="text-slate-400 text-xs truncate">{user.email}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
          <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8" onClick={onEdit}>
            <Edit className="w-3.5 h-3.5" /> Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10"
            onClick={() => onDelete(user.id)}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
      <div className="flex flex-col gap-1">
        <span className="text-slate-500">Phone</span>
        <span className="text-slate-300 truncate">{user.phone || '—'}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-slate-500">Type</span>
        <Badge variant="outline" className="w-fit text-[10px] border-slate-600 text-slate-300">
          {user.customer_type === 'business' ? 'Business' : 'Individual'}
        </Badge>
      </div>
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <StatusBadge status={user.status} />
      {user.roles && user.roles.length > 0 && (
        <div className="flex gap-1">
          {user.roles.slice(0, 3).map((role) => (
            <Badge key={role.id} variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-800 text-slate-300 border-slate-700">
              {role.name}
            </Badge>
          ))}
          {user.roles.length > 3 && (
            <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded-full border border-slate-700">
              +{user.roles.length - 3}
            </span>
          )}
        </div>
      )}
    </div>

    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
      <span className="text-slate-500">Joined {fmtDate(user.created_at)}</span>
      <Link to={`/admin/users/${user.id}`} className="text-blue-400 hover:underline whitespace-nowrap">View Profile</Link>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const UsersPage = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = (await usersApi.list(filters)) as any;

      const usersArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any)?.data)
        ? (response.data as any).data
        : [];

      setUsers(usersArray);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await usersApi.statistics();
      setStats(response.data);
    } catch (err) {
      console.error('Stats fetch failed', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const filterValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
  };

  const toggleUserSelection = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    console.log("Delete user:", id);
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="w-full px-2 sm:px-4 py-4 sm:py-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase hidden sm:inline">People</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">User Management</h1>
            <p className="text-slate-400 mt-0.5 sm:mt-1 text-xs sm:text-sm hidden sm:block">Manage system users, roles, and access</p>
          </div>
          {hasRole('admin') && (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/admin/users/create">
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create User</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Stats - Responsive Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <StatCard label="Total Users" value={stats.total} icon={Users} accent="#3b82f6" />
            <StatCard label="Active"      value={stats.active} icon={UserCheck} accent="#10b981" />
            <StatCard label="Staff"       value={stats.staff} icon={Shield}  accent="#f59e0b" />
            <StatCard label="Clients"     value={stats.clients} icon={Building2} accent="#8b5cf6" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition"
              />
            </div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              {(filters.search || filters.status) && (
                 <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="text-slate-500 hover:text-white px-3">
                  Clear
                </Button>
              )}
              <Button variant="outline" size="sm" className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex">
                Bulk Actions ({selectedUsers.size})
              </Button>
            </div>
          </div>
          {/* Mobile Bulk Action Bar */}
          {selectedUsers.size > 0 && (
            <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">{selectedUsers.size} selected</span>
              <Button variant="outline" size="sm" className="h-8 text-xs">Actions</Button>
            </div>
          )}
        </div>

        {/* Desktop Table - Pure CSS Grid (No Shadcn Table) */}
        <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden overflow-x-auto bg-white/5">
          {/* Header Row */}
          <div className="grid grid-cols-[0.5fr_2.5fr_2fr_1.5fr_1fr_1.5fr_2fr_1fr_auto] gap-3 px-4 sm:px-5 py-3 bg-white/[0.02] border-b border-white/10 min-w-[800px]">
            {['','User','Contact','Type','Status','Roles','Created',''].map((h, i) => (
              <div key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
            ))}
          </div>

          {/* Body */}
          <div className="divide-y divide-white/[0.04]">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading users…</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No users found</p>
                <p className="text-sm mt-1">{filters.search||filters.status ? 'Try adjusting your filters' : 'No users in system yet'}</p>
              </div>
            ) : users.map((user) => (
              <div key={user.id} className="grid grid-cols-[0.5fr_2.5fr_2fr_1.5fr_1fr_1.5fr_2fr_1fr_auto] gap-3 px-4 sm:px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group min-w-[800px]">
                
                {/* Select Checkbox */}
                <div className="p-0 flex items-center">
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                  />
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 border border-white/20 shrink-0">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{user.name}</div>
                    <div className="text-slate-500 text-xs truncate">{user.company_name || 'Individual'}</div>
                  </div>
                </div>

                {/* Contact */}
                <div className="min-w-0">
                  <div className="text-slate-300 text-sm truncate">{user.email}</div>
                  <div className="text-slate-500 text-xs truncate">{user.phone || '-'}</div>
                </div>

                {/* Type */}
                <span className={`text-[10px] sm:text-xs font-medium capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 w-fit ${
                  user.customer_type === 'business' ? 'text-blue-300' : 'text-slate-400'
                }`}>
                  {user.customer_type === 'business' ? 'Business' : 'Individual'}
                </span>

                {/* Status */}
                <StatusBadge status={user.status} />

                {/* Roles */}
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.slice(0, 2).map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-800 text-slate-300 border-slate-700">
                        {role.name}
                      </Badge>
                    ))}
                    {user.roles.length > 2 && (
                      <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded-full border border-slate-700">
                        +{user.roles.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="text-right text-xs sm:text-sm text-slate-400">
                  {fmtDate(user.created_at)}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-36">
                      <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8" asChild>
                        <Link to={`/admin/users/${user.id}`} className="w-full flex items-center">
                           <Edit className="w-3.5 h-3.5" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10"
                        onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No users found</p>
            </div>
          ) : users.map(user => (
            <UserCard key={user.id} user={user}
              onEdit={() => console.log('Edit', user.id)}
              onDelete={handleDelete} 
            />
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UsersPage;