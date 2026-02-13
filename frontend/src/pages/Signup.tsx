import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Building,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { register, RegisterData } from "@/services/auth";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    customerType: "individual" as "individual" | "business",
    companyName: "",
    companyRegistration: "",
    taxPin: "",
    address: "",
    city: "",
    county: "",
    postalCode: "",
    smsNotifications: true,
    marketingConsent: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.confirmPassword,
        customer_type: form.customerType,
        address: form.address,
        city: form.city,
        county: form.county,
        postal_code: form.postalCode,
        sms_notifications: form.smsNotifications,
        marketing_consent: form.marketingConsent,
      };

      if (form.customerType === "business") {
        registerData.company_name = form.companyName;
        registerData.company_registration = form.companyRegistration;
        registerData.tax_pin = form.taxPin;
      }

      const response = await register(registerData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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

        {/* Success Card */}
        <div className="w-full flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
          <div className="glass-dark backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10 max-w-md text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Registration Successful!
            </h1>
            <p className="text-blue-200/70 mb-6">
              Please check your email to verify your account. You will be
              redirected to the login page shortly.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Deep Blue Gradient Background with Abstract Swirling Textures */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]">
        {/* Animated fluid shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large swirling blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px] animate-pulse" />
          <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />

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
          <div className="absolute top-[10%] left-[30%] w-40 h-40 rounded-full bg-blue-300/10 blur-[60px] animate-bounce" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-[20%] right-[20%] w-60 h-60 rounded-full bg-cyan-400/10 blur-[80px] animate-bounce" style={{ animationDuration: "10s" }} />

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
          <Link to="/plans" className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors mb-6 w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Plans</span>
          </Link>
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Create Your<br />
            <span className="font-extrabold text-cyan-300">Account</span>
          </h1>
          <p className="text-xl text-blue-100/80 max-w-md">
            Join Vilcom Network and get connected with high-speed internet. Fill out the form to get started.
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
      <div className="w-full lg:w-3/5 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        {/* Frosted Glass Card */}
        <div className="w-full max-w-4xl">
          <div className="glass-dark backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10">
            
            {/* Card Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Sign Up
              </h2>
              <p className="text-blue-200/70">
                Create your account to get started.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone + Customer Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Mobile Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type="tel"
                      placeholder="0712 345 678"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Customer Type</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => update("customerType", "individual")}
                      className={`flex-1 py-3 px-3 rounded-xl border transition-all text-sm ${
                        form.customerType === "individual"
                          ? "bg-cyan-500/30 border-cyan-400/50 text-white"
                          : "bg-white/5 border-white/20 text-blue-200/70 hover:bg-white/10"
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => update("customerType", "business")}
                      className={`flex-1 py-3 px-3 rounded-xl border transition-all text-sm flex items-center justify-center gap-2 ${
                        form.customerType === "business"
                          ? "bg-cyan-500/30 border-cyan-400/50 text-white"
                          : "bg-white/5 border-white/20 text-blue-200/70 hover:bg-white/10"
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      Business
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Password + Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
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
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Business Fields - shown when business customer type selected */}
              {form.customerType === "business" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">Company Name</label>
                    <input
                      type="text"
                      placeholder="Your Company Ltd"
                      value={form.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">Company Registration</label>
                    <input
                      type="text"
                      placeholder="Registration Number"
                      value={form.companyRegistration}
                      onChange={(e) => update("companyRegistration", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">Tax PIN</label>
                    <input
                      type="text"
                      placeholder="Tax PIN"
                      value={form.taxPin}
                      onChange={(e) => update("taxPin", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Row 4: Address + Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Physical Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50 group-focus-within:text-blue-300 transition-colors" />
                    <input
                      type="text"
                      placeholder="Street address, estate, or building"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">Postal Code</label>
                  <input
                    type="text"
                    placeholder="00100"
                    value={form.postalCode}
                    onChange={(e) => update("postalCode", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              {/* Row 5: City + County */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">City</label>
                  <input
                    type="text"
                    placeholder="Nairobi"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">County</label>
                  <select
                    value={form.county}
                    onChange={(e) => update("county", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all"
                  >
                    <option value="" className="text-gray-500">Select County</option>
                    <option value="nairobi" className="text-gray-800">Nairobi County</option>
                    <option value="mombasa" className="text-gray-800">Mombasa County</option>
                    <option value="kisumu" className="text-gray-800">Kisumu County</option>
                    <option value="nakuru" className="text-gray-800">Nakuru County</option>
                    <option value="eldoret" className="text-gray-800">Uasin Gishu County</option>
                    <option value="other" className="text-gray-800">Other</option>
                  </select>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={form.smsNotifications}
                  onChange={(e) => update("smsNotifications", e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/30"
                />
                <label htmlFor="smsNotifications" className="text-sm text-blue-200/70">
                  Receive SMS updates about your installation
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  checked={form.marketingConsent}
                  onChange={(e) => update("marketingConsent", e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/30"
                />
                <label htmlFor="marketingConsent" className="text-sm text-blue-200/70">
                  Receive marketing offers and promotions
                </label>
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
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-blue-200/70">
                Already have an account?{" "}
                <Link
                  to="/auth"
                  className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Login
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

export default Signup;

