import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2
} from 'lucide-react';
import { login, LoginCredentials, AuthResponse } from '@/services/auth';

const Auth = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(loginForm as LoginCredentials);
      
      if (response.success) {
        navigate('/');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Deep Blue Gradient Background with Abstract Swirling Textures */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]">
        {/* Animated fluid shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large swirling blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px] animate-pulse" />
          <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
          
          {/* Feathery texture overlays */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-20">
              <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0,60 Q25,40 50,60 T100,60" fill="none" stroke="white" strokeWidth="0.3" />
              <path d="M0,70 Q25,50 50,70 T100,70" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0,40 Q25,20 50,40 T100,40" fill="none" stroke="white" strokeWidth="0.3" />
              <path d="M0,30 Q25,10 50,30 T100,30" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
          
          {/* Additional abstract fluid shapes */}
          <div className="absolute top-[10%] left-[30%] w-40 h-40 rounded-full bg-blue-300/10 blur-[60px] animate-bounce" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[20%] right-[20%] w-60 h-60 rounded-full bg-cyan-400/10 blur-[80px] animate-bounce" style={{ animationDuration: '10s' }} />
          
          {/* More feathery textures */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
        </div>
      </div>

      {/* Left Side - Content */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 xl:p-20">
        {/* Logo */}
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Whatever happens here,<br />
            <span className="font-extrabold text-cyan-300">stays</span> here
          </h1>
          <p className="text-xl text-blue-100/80 max-w-md">
            Please fill the form on the right side to get started with your secure connection.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="mt-auto">
          <div className="flex items-center gap-4 text-blue-200/60">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-blue-300/50" />
            <span className="text-sm">Secure • Private • Fast</span>
          </div>
        </div>
      </div>

      {/* Right Side - Glass Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        {/* Frosted Glass Card */}
        <div className="w-full max-w-md">
          <div className="glass-dark backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10">
            
            {/* Card Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Login
              </h2>
              <p className="text-blue-200/70">
                Welcome back! Enter your credentials to continue.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Your Name / Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-blue-100">Password</label>
                  <button
                    type="button"
                    className="text-sm text-blue-300 hover:text-cyan-300 transition-colors"
                  >
                    Forgot Password!
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-blue-200/70">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>

          </div>

          {/* Mobile Logo (visible on small screens) */}
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

export default Auth;

