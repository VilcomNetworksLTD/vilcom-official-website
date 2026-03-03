import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Wifi, Mail, CheckCircle, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

const EmailVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  const id = searchParams.get("id");
  const hash = searchParams.get("hash");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!id || !hash) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email for the correct verification link.");
        return;
      }

      try {
        const response = await api.get(`/auth/email/verify/${id}/${hash}`);
        
        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message || "Email verified successfully!");
          
          // If token is returned, auto-login the user
          if (response.data.data.token) {
            // Store token
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.data.user));
            
            // Redirect after a short delay
            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
          }
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message === "Email already verified.") {
          setStatus("already");
          setMessage("Your email is already verified. You can login to your account.");
        } else {
          setStatus("error");
          setMessage(err.response?.data?.message || "Failed to verify email. The verification link may have expired.");
        }
      }
    };

    verifyEmail();
  }, [id, hash, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-300/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-300/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">VILCOM</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-dark backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            )}
            {(status === "error" || status === "already") && (
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-amber-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "already" && "Already Verified"}
          </h1>

          {/* Message */}
          <p className="text-slate-300 text-center mb-8">
            {message}
          </p>

          {/* Actions */}
          {status === "success" && (
            <div className="text-center">
              <p className="text-green-400 text-sm mb-4">
                Redirecting to dashboard...
              </p>
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-4">
                  Please try again or request a new verification email.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/auth" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
                    Go to Login
                  </Button>
                </Link>
                <Link to="/" className="w-full">
                  <Button variant="ghost" className="w-full text-slate-300 hover:text-white">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "already" && (
            <div className="space-y-4">
              <Link to="/auth" className="w-full">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
                  Login to Account <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {status === "loading" && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Please wait...</span>
              </div>
            </div>
          )}
        </div>

        {/* Support Text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Need help?{" "}
          <Link to="/contact-us" className="text-cyan-400 hover:text-cyan-300">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmailVerify;

