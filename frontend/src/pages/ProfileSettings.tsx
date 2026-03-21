import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usersApi, ProfileUpdatePayload, User } from "@/services/users";
import { useToast } from "@/hooks/use-toast";
import {
  User as UserIcon,
  Phone,
  MapPin,
  Globe,
  Mail,
  Building2,
  Save,
  RefreshCw,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── helpers ───────────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const ROLE_STYLE: Record<string, string> = {
  admin:             "text-purple-300 bg-purple-500/15 border-purple-500/30",
  staff:             "text-blue-300   bg-blue-500/15   border-blue-500/30",
  client:            "text-amber-300  bg-amber-500/15  border-amber-500/30",
  sales:             "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
  technical_support: "text-cyan-300   bg-cyan-500/15   border-cyan-500/30",
};

// ── Field component ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  icon: React.ElementType;
  id: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const Field = ({
  label, icon: Icon, id, value, onChange,
  placeholder, type = "text", readOnly, disabled,
}: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 border outline-none",
          readOnly
            ? "bg-white/[0.02] border-white/[0.05] text-slate-500 cursor-default"
            : disabled
            ? "bg-white/[0.02] border-white/[0.05] text-slate-600 cursor-not-allowed opacity-60"
            : "bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
        ].join(" ")}
      />
      {readOnly && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-semibold tracking-wide uppercase">
          locked
        </span>
      )}
    </div>
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section = ({
  icon: Icon,
  title,
  aside,
  children,
}: {
  icon: React.ElementType;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm p-6 space-y-5">
    <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
      <Icon className="w-4 h-4 text-blue-400" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {aside && <span className="ml-auto">{aside}</span>}
    </div>
    {children}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfileSettings() {
  const { isAuthenticated, user: authUser, setUser } = useAuth() as {
    isAuthenticated: boolean;
    user: User | null;
    setUser?: (u: User) => void;
  };

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const { toast } = useToast();

  const [profile,  setProfile]  = useState<User | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);
  const [banner,   setBanner]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState<ProfileUpdatePayload>({
    name: "", phone: "", address: "", city: "", county: "", country: "", postal_code: "",
  });

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await usersApi.getCurrent();
        const u: User = (res as any)?.data ?? res;
        setProfile(u);
        populate(u);
      } catch {
        setBanner({ type: "error", msg: "Could not load your profile. Please refresh." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const populate = (u: User) =>
    setForm({
      name:        u.name        ?? "",
      phone:       u.phone       ?? "",
      address:     u.address     ?? "",
      city:        u.city        ?? "",
      county:      u.county      ?? "",
      country:     u.country     ?? "",
      postal_code: u.postal_code ?? "",
    });

  const set = (key: keyof ProfileUpdatePayload) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
    setBanner(null);
  };

  const handleReset = () => {
    if (!profile) return;
    populate(profile);
    setDirty(false);
    setBanner(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      const res     = await usersApi.updateCurrent(form);
      const updated: User = (res as any)?.data ?? res;
      setProfile(updated);
      populate(updated);
      setDirty(false);
      if (setUser) setUser(updated);
      setBanner({ type: "success", msg: "Profile updated successfully." });
      toast({ title: "Saved!", description: "Your profile has been updated." });
    } catch (err: any) {
      setBanner({
        type: "error",
        msg:  err?.response?.data?.message ?? "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // resolve layout type from roles
  const roles    = profile?.roles?.map((r) => r.name) ?? [];
  const userType: "admin" | "staff" | "client" =
    roles.includes("admin") ? "admin" :
    roles.some((r) => ["staff", "sales", "technical_support"].includes(r)) ? "staff" :
    "client";

  const avatarGradient =
    userType === "admin" ? "from-blue-600 to-indigo-700 shadow-blue-500/25" :
    userType === "staff" ? "from-cyan-600  to-blue-700  shadow-cyan-500/25"  :
                           "from-amber-500 to-yellow-600 shadow-amber-500/25";

  // ── skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout userType={userType}>
        <div className="w-full max-w-2xl px-6 py-10 space-y-7">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.06] animate-pulse flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 rounded-lg bg-white/[0.06] animate-pulse" />
              <div className="h-4 w-36 rounded-lg bg-white/[0.04] animate-pulse" />
              <div className="h-5 w-20 rounded-full bg-white/[0.04] animate-pulse" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-white/[0.05] animate-pulse" />
                  <div className="h-11 rounded-xl bg-white/[0.04] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="w-full max-w-2xl px-6 py-8 space-y-8">

        {/* ── Page title ── */}
        <div className="flex items-start gap-2">
          <UserIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase">Account</span>
            <h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
            <p className="text-slate-400 mt-1 text-sm">Manage your personal information</p>
          </div>
        </div>

        {/* ── Identity card ── */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6">
          <div className="flex items-center gap-5">
            <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white tracking-tight select-none bg-gradient-to-br shadow-lg ${avatarGradient}`}>
              {profile?.name ? initials(profile.name) : "?"}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-xl font-bold text-white truncate">{profile?.name}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {profile?.email}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {roles.map((r) => (
                  <span
                    key={r}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${ROLE_STYLE[r] ?? ROLE_STYLE.client}`}
                  >
                    <Shield className="w-3 h-3" />
                    {r.replace("_", " ")}
                  </span>
                ))}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  profile?.status === "active"
                    ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
                    : "text-red-300 bg-red-500/10 border-red-500/25"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile?.status === "active" ? "bg-emerald-400 shadow-[0_0_5px_#34d399]" : "bg-red-500"}`} />
                  {profile?.status}
                </span>
                {profile?.customer_type && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border text-slate-400 bg-white/[0.03] border-white/[0.08] capitalize">
                    <Building2 className="w-3 h-3" />
                    {profile.customer_type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Banner ── */}
        {banner && (
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-medium ${
            banner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : "bg-red-500/10 border-red-500/25 text-red-300"
          }`}>
            {banner.type === "success"
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle  className="w-4 h-4 flex-shrink-0" />
            }
            {banner.msg}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSave} noValidate className="space-y-6">

          {/* Personal */}
          <Section icon={UserIcon} title="Personal Information">
            <div className="space-y-5">
              {/* Full name — full width */}
              <Field id="name" label="Full Name" icon={UserIcon}
                value={form.name ?? ""} onChange={set("name")}
                placeholder="Your full name" disabled={saving} />
              {/* Email + Phone — side by side */}
              <div className="grid grid-cols-2 gap-5">
                <Field id="email" label="Email Address" icon={Mail}
                  value={profile?.email ?? ""} readOnly />
                <Field id="phone" label="Phone Number" icon={Phone} type="tel"
                  value={form.phone ?? ""} onChange={set("phone")}
                  placeholder="+254 700 000 000" disabled={saving} />
              </div>
            </div>
          </Section>

          {/* Address */}
          <Section icon={MapPin} title="Address">
            <div className="space-y-5">
              {/* Street address — full width */}
              <Field id="address" label="Street Address" icon={MapPin}
                value={form.address ?? ""} onChange={set("address")}
                placeholder="123 Main Street" disabled={saving} />
              {/* City + County — side by side */}
              <div className="grid grid-cols-2 gap-5">
                <Field id="city" label="City" icon={Building2}
                  value={form.city ?? ""} onChange={set("city")}
                  placeholder="Nairobi" disabled={saving} />
                <Field id="county" label="County" icon={MapPin}
                  value={form.county ?? ""} onChange={set("county")}
                  placeholder="Nairobi County" disabled={saving} />
              </div>
              {/* Country + Postal — side by side */}
              <div className="grid grid-cols-2 gap-5">
                <Field id="country" label="Country" icon={Globe}
                  value={form.country ?? ""} onChange={set("country")}
                  placeholder="Kenya" disabled={saving} />
                <Field id="postal_code" label="Postal Code" icon={Hash}
                  value={form.postal_code ?? ""} onChange={set("postal_code")}
                  placeholder="00100" disabled={saving} />
              </div>
            </div>
          </Section>

          {/* Read-only account info — shown only when data exists */}
          {(profile?.company_name || profile?.emerald_mbr_id) && (
            <Section
              icon={Building2}
              title="Account Info"
              aside={<span className="text-xs text-slate-600">Contact support to change</span>}
            >
              <div className="grid grid-cols-2 gap-5">
                {profile?.company_name && (
                  <Field id="company" label="Company Name" icon={Building2}
                    value={profile.company_name} readOnly />
                )}
                {profile?.emerald_mbr_id && (
                  <Field id="mbr" label="Emerald MBR ID" icon={Hash}
                    value={profile.emerald_mbr_id} readOnly />
                )}
              </div>
            </Section>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-600">
              {dirty ? "You have unsaved changes" : "All changes saved"}
            </p>
            <div className="flex items-center gap-3">
              {dirty && (
                <Button
                  type="button" variant="ghost" onClick={handleReset} disabled={saving}
                  className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-10 px-4 text-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Discard
                </Button>
              )}
              <Button
                type="submit" disabled={saving || !dirty}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 h-10 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
                  : <><Save    className="w-4 h-4 mr-2" />Save Changes</>
                }
              </Button>
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}