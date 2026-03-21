import { useState } from "react";
import { Link } from "react-router-dom";
import { passwordApi } from "@/services/password";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await passwordApi.sendResetLink(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          {!sent ? (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password?</h1>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-red-500/10 border-red-500/25 text-red-300 text-sm mb-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 border border-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Check Your Email</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  If an account exists for <span className="text-white font-medium">{email}</span>,
                  a password reset link has been sent. Check your spam folder if you don't see it.
                </p>
              </div>
              <div className="pt-2 text-xs text-slate-600">
                Didn't receive it?{" "}
                <button
                  onClick={() => { setSent(false); setError(null); }}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to login */}
        <div className="text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}