import { useState } from "react";
import { passwordApi } from "@/services/password";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, Eye, EyeOff, Save, Loader2,
  CheckCircle2, AlertCircle, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── password strength ─────────────────────────────────────────────────────────

const strength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8)               score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;
  return [
    { score: 0, label: "",       color: "" },
    { score: 1, label: "Weak",   color: "bg-red-500" },
    { score: 2, label: "Fair",   color: "bg-amber-500" },
    { score: 3, label: "Good",   color: "bg-blue-500" },
    { score: 4, label: "Strong", color: "bg-emerald-500" },
  ][score];
};

// ── password input with show/hide ─────────────────────────────────────────────

const PasswordInput = ({
  id, label, value, onChange, placeholder, disabled, accentFocus = "focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  disabled?: boolean; accentFocus?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />{label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-11 rounded-xl text-sm border outline-none transition-all duration-200 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 ${accentFocus} focus:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// ── section wrapper (matches profile pages) ───────────────────────────────────

interface SectionProps {
  icon: React.ElementType;
  title: string;
  accent?: string;
  children: React.ReactNode;
}
const Section = ({ icon: Icon, title, accent = "text-blue-400", children }: SectionProps) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm p-6 space-y-5">
    <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
      <Icon className={`w-4 h-4 ${accent}`} />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

// ── main export ───────────────────────────────────────────────────────────────

/**
 * Drop this component at the bottom of any profile settings page form.
 *
 * Props:
 *   accentFocus  – Tailwind focus ring classes to match role theme (optional)
 *   sectionAccent – Icon colour class to match role theme (optional)
 *   buttonClass  – Full button className override (optional)
 */
export default function ChangePasswordSection({
  accentFocus,
  sectionAccent = "text-blue-400",
  buttonClass = "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 border-blue-500/30",
}: {
  accentFocus?: string;
  sectionAccent?: string;
  buttonClass?: string;
}) {
  const { toast } = useToast();

  const [current,     setCurrent]     = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [saving,      setSaving]      = useState(false);
  const [banner,      setBanner]      = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const isDirty = current || newPw || confirm;
  const pw      = strength(newPw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    if (!current) { setBanner({ type: "error", msg: "Please enter your current password." }); return; }
    if (newPw.length < 8) { setBanner({ type: "error", msg: "New password must be at least 8 characters." }); return; }
    if (newPw !== confirm) { setBanner({ type: "error", msg: "New passwords do not match." }); return; }

    setSaving(true);
    try {
      await passwordApi.changePassword({
        current_password:      current,
        password:              newPw,
        password_confirmation: confirm,
      });
      setCurrent(""); setNewPw(""); setConfirm("");
      setBanner({ type: "success", msg: "Password changed. All other sessions have been logged out." });
      toast({ title: "Password updated!", description: "You remain logged in on this device." });
    } catch (err: any) {
      setBanner({
        type: "error",
        msg:  err?.response?.data?.message ?? "Failed to change password. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={ShieldCheck} title="Change Password" accent={sectionAccent}>
      {/* Banner */}
      {banner && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          banner.type === "success" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border-red-500/25 text-red-300"
        }`}>
          {banner.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {banner.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Current password */}
        <PasswordInput
          id="current_password" label="Current Password"
          value={current} onChange={setCurrent}
          placeholder="Your current password"
          disabled={saving} accentFocus={accentFocus}
        />

        {/* New password */}
        <PasswordInput
          id="new_password" label="New Password"
          value={newPw} onChange={setNewPw}
          placeholder="Min. 8 characters"
          disabled={saving} accentFocus={accentFocus}
        />

        {/* Strength bar */}
        {newPw && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pw && pw.score >= n ? pw.color : "bg-white/[0.06]"}`} />
              ))}
            </div>
            {pw?.label && (
              <p className="text-xs text-slate-500">
                Strength: <span className="text-white font-medium">{pw.label}</span>
                <span className="ml-2 text-slate-600">· Use uppercase, numbers & symbols</span>
              </p>
            )}
          </div>
        )}

        {/* Confirm */}
        <PasswordInput
          id="confirm_password" label="Confirm New Password"
          value={confirm} onChange={setConfirm}
          placeholder="Repeat new password"
          disabled={saving} accentFocus={accentFocus}
        />

        {/* Match indicator */}
        {confirm && newPw && (
          <p className={`text-xs flex items-center gap-1.5 ${confirm === newPw ? "text-emerald-400" : "text-red-400"}`}>
            {confirm === newPw
              ? <><CheckCircle2 className="w-3 h-3" />Passwords match</>
              : <><AlertCircle  className="w-3 h-3" />Passwords do not match</>
            }
          </p>
        )}

        {/* Note */}
        <p className="text-xs text-slate-600 leading-relaxed">
          Changing your password will log out all other active sessions. You will remain logged in on this device.
        </p>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving || !isDirty}
            className={`text-white font-semibold px-6 h-10 rounded-xl shadow-lg border disabled:opacity-40 disabled:cursor-not-allowed flex items-center ${buttonClass}`}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Updating…</> : <><Save className="w-4 h-4 mr-2" />Update Password</>}
          </Button>
        </div>
      </form>
    </Section>
  );
}