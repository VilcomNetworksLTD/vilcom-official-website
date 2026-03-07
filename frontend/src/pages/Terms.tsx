import { Link } from "react-router-dom";
import { ArrowLeft, Wifi, Shield, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FooterSection from "@/components/FooterSection";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Vilcom<span className="text-cyan-400">Network</span></span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link to="/signup" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registration</span>
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Terms and Conditions</h1>
            <p className="text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  Welcome to Vilcom Network. These Terms and Conditions ("Terms") constitute a legally binding agreement 
                  between you ("Customer", "you", or "your") and Vilcom Network ("Company", "we", "our", or "us") 
                  governing your use of our internet services, website, and related products.
                </p>
                <p>
                  By accessing our website, placing an order, or using our services, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms. If you do not agree to these Terms, you should not 
                  use our services.
                </p>
              </div>
            </section>

            {/* Services */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">2. Services Description</h2>
              <div className="space-y-4 text-slate-300">
                <p>Vilcom Network provides the following services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fiber optic internet connectivity</li>
                  <li>Wireless broadband solutions</li>
                  <li>Web hosting services</li>
                  <li>Domain registration</li>
                  <li>Web development services</li>
                  <li>Related telecommunications services</li>
                </ul>
                <p className="mt-4">
                  Service availability may vary based on your location and network coverage. We reserve the right to 
                  modify, suspend, or discontinue any service at our sole discretion.
                </p>
              </div>
            </section>

            {/* Account Registration */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
              <div className="space-y-4 text-slate-300">
                <p>To use our services, you must create an account and provide accurate, complete information. You agree to:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Provide accurate and complete registration information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Maintain the security of your account credentials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Promptly update your account information when changes occur</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Accept responsibility for all activities under your account</span>
                  </li>
                </ul>
                <div className="flex items-start gap-3 mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-200 text-sm">
                    You must be at least 18 years old to create an account. Business accounts require valid business registration.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment and Billing */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">4. Payment and Billing</h2>
              <div className="space-y-4 text-slate-300">
                <p>All services are billed according to the following terms:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Payment is due on the billing date specified in your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Services are billed in advance on a monthly basis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Late payments may incur additional fees and service suspension</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>All fees are non-refundable unless otherwise specified</span>
                  </li>
                </ul>
                <p className="mt-4">
                  We accept M-Pesa, bank transfers, and other payment methods as specified on our website. 
                  Prices are subject to change with 30 days' notice.
                </p>
              </div>
            </section>

            {/* Service Level Agreement */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">5. Service Level Agreement</h2>
              <div className="space-y-4 text-slate-300">
                <p>We commit to providing reliable internet services according to the following standards:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Uptime Guarantee</h3>
                    <p className="text-sm">99.5% network uptime for fiber services</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Support Response</h3>
                    <p className="text-sm">Response within 4 hours for critical issues</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Installation</h3>
                    <p className="text-sm">Standard installation within 7 business days</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Speed</h3>
                    <p className="text-sm">Advertised speeds subject to network conditions</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Acceptable Use Policy */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">6. Acceptable Use Policy</h2>
              <div className="space-y-4 text-slate-300">
                <p>You agree not to use our services for any unlawful purpose or in any manner that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violates any applicable laws or regulations</li>
                  <li>Infringes on the rights of others</li>
                  <li>Transmits viruses, malware, or other harmful code</li>
                  <li>Engages in spamming or unsolicited communications</li>
                  <li>Attempts to gain unauthorized access to systems</li>
                  <li>Interferes with the proper operation of our network</li>
                  <li>Resells or redistributes services without authorization</li>
                </ul>
                <p className="mt-4">
                  Violation of this policy may result in service suspension or termination without refund.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  To the maximum extent permitted by law, Vilcom Network shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Loss of profits, revenue, or data</li>
                  <li>Service interruptions or downtime</li>
                  <li>Failure to deliver services</li>
                  <li>Security breaches beyond our reasonable control</li>
                </ul>
                <p className="mt-4">
                  Our total liability shall not exceed the amount paid by you for the services in the twelve (12) 
                  months preceding the claim.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
              <div className="space-y-4 text-slate-300">
                <p>Either party may terminate this agreement under the following conditions:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>You may cancel services with 30 days' written notice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>We may suspend or terminate services for violation of Terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Non-payment may result in immediate service suspension</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>All fees paid are non-refundable upon termination</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
              <div className="space-y-4 text-slate-300">
                <p>If you have questions about these Terms, please contact us:</p>
                <div className="bg-slate-700/30 rounded-xl p-6 space-y-2">
                  <p className="font-semibold text-white">Vilcom Network</p>
                  <p>Nairobi, Kenya</p>
                  <p>Email: support@vilcom.co.ke</p>
                  <p>Phone: +254 700 000 000</p>
                </div>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-6">Ready to get started with Vilcom Network?</p>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Terms;

