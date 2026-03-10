import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminCoverageApi } from "@/services/coverage";
import { Loader2, Plus, Pencil, Trash2, MapPin, Package, Users, BarChart3 } from "lucide-react";

// Types
interface CoverageZone {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: "active" | "coming_soon" | "inactive";
  is_serviceable: boolean;
  center_lat?: number;
  center_lng?: number;
  radius_km?: number;
}

interface InterestSignup {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address: string;
  area_description?: string;
  status: string;
  created_at: string;
}

interface Analytics {
  total_checks: number;
  covered_checks: number;
  uncovered_checks: number;
  interest_signups: number;
  pending_signups: number;
  zones_summary: {
    total: number;
    active: number;
    coming_soon: number;
    inactive: number;
  };
}

const CoverageManagement = () => {
  const [activeTab, setActiveTab] = useState("zones");
  const [zones, setZones] = useState<CoverageZone[]>([]);
  const [signups, setSignups] = useState<InterestSignup[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, signupsRes, analyticsRes] = await Promise.all([
          adminCoverageApi.getZones(),
          adminCoverageApi.getInterestSignups(),
          adminCoverageApi.getAnalytics(),
        ]);
        setZones(zonesRes.data?.data || zonesRes.data || []);
        setSignups(signupsRes.data?.data || signupsRes.data || []);
        setAnalytics(analyticsRes);
      } catch (error) {
        console.error("Failed to fetch coverage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "coming_soon":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coverage Management</h1>
          <p className="text-muted-foreground">Manage coverage zones, packages, and leads</p>
        </div>
        <Button className="gradient-royal">
          <Plus className="w-4 h-4 mr-2" /> Add Zone
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Zones</p>
                  <p className="text-2xl font-bold">{analytics.zones_summary.total}</p>
                </div>
                <MapPin className="w-8 h-8 text-primary opacity-50" />
              </div>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline" className="text-green-500">
                  {analytics.zones_summary.active} Active
                </Badge>
                <Badge variant="outline" className="text-yellow-500">
                  {analytics.zones_summary.coming_soon} Coming Soon
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Coverage Checks</p>
                  <p className="text-2xl font-bold">{analytics.total_checks}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary opacity-50" />
              </div>
              <div className="mt-2 text-sm">
                <span className="text-green-500">{analytics.covered_checks} covered</span>
                {" / "}
                <span className="text-red-500">{analytics.uncovered_checks} uncovered</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interest Signups</p>
                  <p className="text-2xl font-bold">{analytics.interest_signups}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
              <div className="mt-2 text-sm text-yellow-500">
                {analytics.pending_signups} pending follow-up
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Packages</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Package className="w-8 h-8 text-primary opacity-50" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Manage per zone
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="zones">Coverage Zones</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="signups">Interest Signups</TabsTrigger>
        </TabsList>

        {/* Zones Tab */}
        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zones.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No coverage zones found. Add your first zone to get started.
                  </p>
                ) : (
                  zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(zone.status)}`} />
                        <div>
                          <p className="font-semibold">{zone.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {zone.type} • {zone.is_serviceable ? "Serviceable" : "Not Serviceable"}
                          </p>
                        </div>
                      </div>{/* ← FIXED: this closing </div> was missing in the original */}
                      <div className="flex items-center gap-2">
                        <Badge variant={zone.status === "active" ? "default" : "secondary"}>
                          {zone.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <CardTitle>Zone Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Select a zone to manage its packages. Packages define available internet plans for each coverage area.
              </p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Select a zone:</p>
                <div className="flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <Button key={zone.id} variant="outline" size="sm">
                      {zone.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signups Tab */}
        <TabsContent value="signups">
          <Card>
            <CardHeader>
              <CardTitle>Interest Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signups.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No interest signups yet.
                  </p>
                ) : (
                  signups.map((signup) => (
                    <div
                      key={signup.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">{signup.name}</p>
                        <p className="text-sm text-muted-foreground">{signup.email}</p>
                        <p className="text-sm text-muted-foreground">{signup.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            signup.status === "pending"
                              ? "default"
                              : signup.status === "contacted"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {signup.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoverageManagement;