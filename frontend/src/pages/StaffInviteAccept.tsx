import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import invitationsService from '@/services/invitations';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  invited_by: number;
  expires_at: string;
  created_at: string;
  inviter: {
    id: number;
    name: string;
  } | null;
}

const StaffInviteAccept = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  // Invitation state
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link. No token provided.');
        setLoadingInvitation(false);
        return;
      }

      try {
        const data = await invitationsService.getByToken(token);
        setInvitation(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Invalid or expired invitation. Please contact your administrator.');
        console.error('Fetch invitation error:', err);
      } finally {
        setLoadingInvitation(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!token || !invitation) {
      setError('Invitation details not available.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await invitationsService.accept({
        token: token,
        name: form.name,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      setSuccess('Staff account created successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create account. Please try again.');
      console.error('Accept invitation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(235,85%,25%)] to-[hsl(225,70%,40%)]">
        <div className="glass-dark p-8 rounded-3xl text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  // If no token or error
  if (!token || error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px]" />
            <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px]" />
          </div>
        </div>
        
        <div className="max-w-md w-full">
          <div className="glass-dark backdrop-blur-xl rounded-3xl p-8 text-center border border-white/10">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h2>
            <p className="text-blue-200/70 mb-6">
              {error || 'This invitation link is invalid or has expired. Please contact your administrator for a new invitation.'}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Deep Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px]" />
          <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px]" />
        </div>
      </div>

      {/* Left Side - Content */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 xl:p-20">
        <div className="mb-auto">
          <Link to="/" className="inline-block">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">VILCOM</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Welcome to the<br />
            <span className="font-extrabold text-cyan-300">{invitation!.role.toUpperCase()} Team!</span>
          </h1>
          <p className="text-xl text-blue-100/80 max-w-md">
            Invited by {invitation!.inviter?.name || 'Admin'}. Complete your registration to get started.
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-4 text-blue-200/60">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-blue-300/50" />
            <span className="text-sm">Secure • Private • Fast</span>
          </div>
        </div>
      </div>

      {/* Right Side - Glass Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass-dark backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10">
            
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Invitation Details */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Invitation Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200/70">Role:</span>
                  <span className="font-semibold text-cyan-300 capitalize">{invitation!.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200/70">Email:</span>
                  <span className="font-mono text-white bg-black/20 px-2 py-1 rounded text-xs">{invitation!.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200/70">Invited by:</span>
                  <span className="font-semibold text-white">{invitation!.inviter?.name || 'Admin'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200/70">Expires:</span>
                  <span className="text-green-400 font-semibold">{new Date(invitation!.expires_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Join as {invitation!.role.charAt(0).toUpperCase() + invitation!.role.slice(1)}
              </h2>
              <p className="text-blue-200/70">
                Complete your staff account registration
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              {/* Email Display (read-only) */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                  <input
                    type="email"
                    disabled
                    value={invitation!.email}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-green-500/10 border border-green-500/30 text-white font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-blue-200/50 mt-1">
                  Invitation email address (cannot be changed)
                </p>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 8 chars)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={form.password_confirmation}
                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating {invitation!.role} Account...
                  </>
                ) : (
                  `Create ${invitation!.role.charAt(0).toUpperCase() + invitation!.role.slice(1)} Account`
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-blue-200/70">
                Already have an account?{' '}
                <Link
                  to="/auth"
                  className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>

          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mt-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">VILCOM</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffInviteAccept;

