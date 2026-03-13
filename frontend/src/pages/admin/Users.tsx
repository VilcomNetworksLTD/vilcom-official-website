import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  User, 
  Search, 
  Filter, 
  UserPlus,
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { usersApi, User, UserStatistics, UserFilters, PaginatedResponse } from '@/services/users';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const UsersPage = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.list(filters);
      setUsers(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await usersApi.statistics();
      setStats(response.data.data);
    } catch (err) {
      console.error('Stats fetch failed', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  const formatStatus = (status: string) => {
    const badges = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      suspended: { variant: 'destructive' as const, label: 'Suspended' },
    };
    return badges[status as keyof typeof badges] || badges.inactive!;
  };

  const formatCustomerType = (type: string) => {
    return type === 'business' ? 'Business' : 'Individual';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-7 h-7" />
              Users Management
            </h1>
            <p className="text-slate-400">Manage all system users, roles, and permissions</p>
          </div>
          {hasRole('admin') && (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/admin/users/create">
                <UserPlus className="w-4 h-4 mr-2" />
                Create New User
              </Link>
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>Total Users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>Active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>Clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.clients}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>Staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-400">{stats.staff}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters & Search */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <Select onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setFilters({})}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Users ({users.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Bulk Actions ({selectedUsers.size})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-center gap-2 text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            ) : (
              <div className="rounded-md border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.size === users.length && users.length > 0}
                          onCheckedChange={(checked) => {
                            setSelectedUsers(
                              checked 
                                ? new Set(users.map((user) => user.id))
                                : new Set()
                            );
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-white/5">
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.name}</div>
                              <div className="text-xs text-slate-400">{user.company_name || 'Individual'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{user.email}</TableCell>
                        <TableCell className="text-slate-300">{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.customer_type === 'business' ? 'default' : 'secondary'}>
                            {formatCustomerType(user.customer_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge {...formatStatus(user.status)}>
                            {formatStatus(user.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge key={role.id} variant="outline" className="text-xs">
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination would go here */}
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;

