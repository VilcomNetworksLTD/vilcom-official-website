import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, UserPlus, Loader2, AlertCircle, Wifi } from 'lucide-react';
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
    } catch (err) {
      console.error('Stats fetch failed', err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (key: keyof ClientFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleClientSelection = (clientId: number) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-7 h-7" />
              Client Management
            </h1>
            <p className="text-slate-400">Manage client accounts and subscriptions</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/admin/clients/create">
              <UserPlus className="w-4 h-4 mr-2" />
              New Client
            </Link>
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>Total Clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total_clients}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>Active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.active_clients}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>Business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.business_clients}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="pb-3">
                <CardDescription>New This Month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-400">{stats.new_clients_this_month}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search clients..."
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

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Clients ({clients.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Bulk Actions ({selectedClients.size})
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
                          checked={selectedClients.size === clients.length && clients.length > 0}
                          onCheckedChange={(checked) => {
                            setSelectedClients(
                              checked 
                                ? new Set(clients.map((client) => client.id))
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
                      <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-white/5">
                        <TableCell>
                          <Checkbox
                            checked={selectedClients.has(client.id)}
                            onCheckedChange={() => toggleClientSelection(client.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                              {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                            </div>
                            <div>
                              <div className="text-white font-medium">{client.name}</div>
                              <div className="text-xs text-slate-400">{client.company_name || 'Individual'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{client.email}</TableCell>
                        <TableCell className="text-slate-300">{client.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={client.customer_type === 'business' ? 'default' : 'secondary'}>
                            {formatCustomerType(client.customer_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge {...formatStatus(client.status)}>
                            {formatStatus(client.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-400">
                          {new Date(client.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;

