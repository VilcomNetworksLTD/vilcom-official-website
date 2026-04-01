import { useQuery } from "@tanstack/react-query";
import { fetchAdminAnalytics } from "@/services/analytics";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_analytics"],
    queryFn: fetchAdminAnalytics,
  });

  if (isLoading || !data) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics & Web Visitors</h1>
          <p className="text-slate-400 mt-2">
            Track and trace website visitor activity and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.total_visits}</div>
              <p className="text-xs text-slate-400">All time tracked</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors (Sessions)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.unique_visitors}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription className="text-slate-400">Most frequently visited pages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5 text-slate-300">
                    <TableHead className="text-slate-300">URL Path</TableHead>
                    <TableHead className="text-right text-slate-300">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.top_pages?.map((page: any, i: number) => (
                    <TableRow key={i} className="border-white/10 hover:bg-white/5">
                      <TableCell className="max-w-[200px] truncate">{new URL(page.url).pathname}</TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Recent Traced Visitors</CardTitle>
              <CardDescription className="text-slate-400">Real-time page views</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-slate-300">Time</TableHead>
                    <TableHead className="text-slate-300">Path</TableHead>
                    <TableHead className="text-slate-300">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_logs?.slice(0, 10).map((log: any, i: number) => (
                    <TableRow key={i} className="border-white/10 hover:bg-white/5">
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {log.url ? new URL(log.url).pathname : 'Unknown'}
                      </TableCell>
                      <TableCell>{log.ip_address || "Hidden"}</TableCell>
                    </TableRow>
                  ))}
                  {(!data.recent_logs || data.recent_logs.length === 0) && (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={3} className="text-center text-slate-400 py-4">
                        No visitors tracked yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
