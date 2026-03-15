import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { clientsApi, Client, ClientStatistics, ClientFilters, PaginatedResponse } from '@/services/clients';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const ClientsPage = () => {
  const { hasRole } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientFilters>({});
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsApi.list(filters);
      setClients(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await clientsApi.statistics();
      setStats(response.data.data);
    } catch (err) { console.error('Stats fetch failed', err); }
  };

  useEffect(() => { fetchClients(); fetchStats(); }, [filters]);

  const handleFilterChange = (key: keyof ClientFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleClientSelection = (clientId: number) => {
    const newSelected = new Set(selectedClients);
    newSelected.has(clientId) ? newSelected.delete(clientId) : newSelected.add(clientId);
    setSelectedClients(newSelected);
  };

  const formatStatus = (status: string) => {
    const badges: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      suspended: { variant: 'destructive', label: 'Suspended' },
    };
    return badges[status] || badges.inactive!;
  };

  const formatCustomerType = (type: string) => type === 'business' ? 'Business' : 'Individual';

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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-7 sm:h-7" />
              Client Management
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage client accounts and subscriptions</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/admin/clients/create">
              <UserPlus className="w-4 h-4 mr-2" />
              New Client
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: 'Total Clients', value: stats.total_clients, color: 'text-white' },
              { label: 'Active', value: stats.active_clients, color: 'text-green-400' },
              { label: 'Business', value: stats.business_clients, color: 'text-blue-400' },
              { label: 'New This Month', value: stats.new_clients_this_month, color: 'text-indigo-400' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6 px-3 sm:px-6">
                  <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6 px-3 sm:px-6">
                  <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Search clients..."
                  className="pl-10 text-sm"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Select onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                  <SelectTrigger className="flex-1 text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setFilters({})}>Clear</Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Clients Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
            <CardTitle className="text-white text-base sm:text-lg">Clients ({clients.length})</CardTitle>
            {selectedClients.size > 0 && (
              <Button variant="outline" size="sm" className="text-xs">
                Bulk Actions ({selectedClients.size})
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {error ? (
              <div className="flex items-center gap-2 text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500/20 mx-4 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
              </div>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="block sm:hidden divide-y divide-white/10">
                  {clients.map((client) => (
                    <div key={client.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selectedClients.has(client.id)} onCheckedChange={() => toggleClientSelection(client.id)} className="mt-1" />
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-white font-medium text-sm truncate">{client.name}</div>
                            <Badge {...formatStatus(client.status)} className="text-xs flex-shrink-0">{formatStatus(client.status).label}</Badge>
                          </div>
                          <div className="text-xs text-slate-400 truncate">{client.email}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant={client.customer_type === 'business' ? 'default' : 'secondary'} className="text-xs">
                              {formatCustomerType(client.customer_type)}
                            </Badge>
                            {client.phone && <span className="text-xs text-slate-500">{client.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[48px]">
                          <Checkbox
                            checked={selectedClients.size === clients.length && clients.length > 0}
                            onCheckedChange={(checked) => setSelectedClients(checked ? new Set(clients.map(c => c.id)) : new Set())} />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Phone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-white/5">
                          <TableCell>
                            <Checkbox checked={selectedClients.has(client.id)} onCheckedChange={() => toggleClientSelection(client.id)} />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                                {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-white font-medium text-sm">{client.name}</div>
                                <div className="text-xs text-slate-400">{client.company_name || 'Individual'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">{client.email}</TableCell>
                          <TableCell className="text-slate-300 text-sm hidden lg:table-cell">{client.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={client.customer_type === 'business' ? 'default' : 'secondary'}>
                              {formatCustomerType(client.customer_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge {...formatStatus(client.status)}>{formatStatus(client.status).label}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-400 hidden md:table-cell">
                            {new Date(client.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;