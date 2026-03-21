import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { passwordApi } from "@/services/password";
import {
  Lock, Eye, EyeOff, ArrowLeft, Loader2,
  CheckCircle2, AlertCircle, Zap, ShieldCheck,
} from "lucide-react";

// ── password strength ─────────────────────────────────────────────────────────

const strength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8)                       score++;
  if (/[A-Z]/.test(pw))                    score++;
  if (/[0-9]/.test(pw))                    score++;
  if (/[^A-Za-z0-9]/.test(pw))            score++;
  const levels = [
    { score: 0, label: "",         color: "" },
    { score: 1, label: "Weak",     color: "bg-red-500" },
    { score: 2, label: "Fair",     color: "bg-amber-500" },
    { score: 3, label: "Good",     color: "bg-blue-500" },
    { score: 4, label: "Strong",   color: "bg-emerald-500" },
  ];
  return levels[score] ?? levels[0];
};

// ── password field ────────────────────────────────────────────────────────────

const PasswordField = ({
  id, label, value, onChange, placeholder, disabled,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
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
          className="w-full px-4 py-3 pr-11 rounded-xl text-sm border outline-none transition-all duration-200 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:opacity-50"
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

// ── main page ─────────────────────────────────────────────────────────────────

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get("token") ?? "";

  const [verifying,    setVerifying]    = useState(true);
  const [tokenValid,   setTokenValid]   = useState(false);
  const [expiresAt,    setExpiresAt]    = useState<string | null>(null);
  const [tokenError,   setTokenError]   = useState<string | null>(null);

  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [done,         setDone]         = useState(false);
  const [formError,    setFormError]    = useState<string | null>(null);

  // ── verify token on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setTokenError("No reset token found. Please request a new password reset link.");
      setVerifying(false);
      return;
    }

    (async () => {
      try {
        const res = await passwordApi.verifyToken(token);
        if (res.success && res.data) {
          setTokenValid(true);
          setExpiresAt(res.data.expires_at);
        } else {
          setTokenError(res.message ?? "Invalid or expired reset link.");
        }
      } catch {
        setTokenError("This reset link is invalid or has expired. Please request a new one.");
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters."); return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match."); return;
    }

    setSubmitting(true);
    try {
      await passwordApi.resetPassword({
        token,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
      // redirect to login after 3 seconds
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? "Failed to reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pw = strength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* mesh blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">VILCOM</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">

          {/* ── verifying token ── */}
          {verifying && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-slate-400 text-sm">Verifying your reset link…</p>
            </div>
          )}

          {/* ── invalid token ── */}
          {!verifying && !tokenValid && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Link Expired</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{tokenError}</p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 border border-blue-500/30 transition-all duration-200"
              >
                Request New Link
              </Link>
            </div>
          )}

          {/* ── success ── */}
          {!verifying && done && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Password Reset!</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Your password has been updated. Redirecting you to sign in…
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                Redirecting in 3 seconds
              </div>
            </div>
          )}

          {/* ── reset form ── */}
          {!verifying && tokenValid && !done && (
            <>
              <div className="mb-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
                <p className="text-slate-400 text-sm mt-2">
                  Choose a strong password for your account.
                </p>
                {expiresAt && (
                  <p className="text-xs text-amber-400/70 mt-1.5">
                    Link expires: {new Date(expiresAt).toLocaleString("en-KE")}
                  </p>
                )}
              </div>

              {/* Form error */}
              {formError && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-red-500/10 border-red-500/25 text-red-300 text-sm mb-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <PasswordField
                  id="password" label="New Password"
                  value={password} onChange={setPassword}
                  placeholder="Min. 8 characters" disabled={submitting}
                />

                {/* Strength bar */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            pw.score >= n ? pw.color : "bg-white/[0.06]"
                          }`}
                        />
                      ))}
                    </div>
                    {pw.label && (
                      <p className="text-xs text-slate-500">
                        Strength: <span className="text-white font-medium">{pw.label}</span>
                        <span className="ml-2 text-slate-600">· Use uppercase, numbers & symbols for best security</span>
                      </p>
                    )}
                  </div>
                )}

                <PasswordField
                  id="confirm" label="Confirm Password"
                  value={confirm} onChange={setConfirm}
                  placeholder="Repeat your new password" disabled={submitting}
                />

                {/* Match indicator */}
                {confirm && password && (
                  <p className={`text-xs flex items-center gap-1.5 ${confirm === password ? "text-emerald-400" : "text-red-400"}`}>
                    {confirm === password
                      ? <><CheckCircle2 className="w-3 h-3" />Passwords match</>
                      : <><AlertCircle  className="w-3 h-3" />Passwords do not match</>
                    }
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !password || !confirm}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 border border-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Resetting…" : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        {!done && (
          <div className="text-center">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}