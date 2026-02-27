import { Link } from "react-router-dom";
import { ArrowLeft, Wifi, Shield, Eye, Lock, Globe, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>
                  At Vilcom Network, we are committed to protecting your privacy and ensuring the security of your personal 
                  information. This Privacy Policy ("Policy") explains how we collect, use, disclose, and safeguard your 
                  data when you use our services, website, and related products.
                </p>
                <p>
                  This policy is in compliance with Kenya's Data Protection Act, 2019, and other applicable privacy laws 
                  and regulations. By using our services, you consent to the practices described in this Policy.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">2. Information We Collect</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>We collect the following types of information:</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Personal Information</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Full name</li>
                      <li>• Email address</li>
                      <li>• Phone number</li>
                      <li>• Physical address</li>
                      <li>• Business details (for business accounts)</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Account Data</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Username and password</li>
                      <li>• Account preferences</li>
                      <li>• Service usage data</li>
                      <li>• Payment information</li>
                      <li>• Support history</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Technical Data</h3>
                    <ul className="text-sm space-y-1">
                      <li>• IP address</li>
                      <li>• Browser type</li>
                      <li>• Device information</li>
                      <li>• Cookies and tracking data</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Pages visited</li>
                      <li>• Time spent on site</li>
                      <li>• Bandwidth usage</li>
                      <li>• Service interactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <div className="space-y-4 text-slate-300">
                <p>We use your information for the following purposes:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Service Delivery:</strong> To provide, maintain, and improve our internet services and customer support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Account Management:</strong> To process your registration, manage your account, and provide billing services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Communication:</strong> To send you service-related updates, notifications, and marketing communications (with your consent)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Personalization:</strong> To tailor our services and content to your preferences and interests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Security:</strong> To detect, prevent, and address fraud, abuse, and security issues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Legal Compliance:</strong> To comply with applicable laws, regulations, and legal requests</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-slate-300">
                <p>We may share your information in the following circumstances:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Service Providers:</strong> With trusted third-party vendors who assist in providing our services (e.g., payment processors, cloud hosting)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Business Transfers:</strong> In connection with mergers, acquisitions, or sale of company assets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Legal Requirements:</strong> When required by law, court order, or government regulation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <p className="text-cyan-200 text-sm">
                    <strong>We do NOT sell your personal information to third parties.</strong> We do not share your data for marketing purposes without your explicit consent.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">5. Data Security</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>We implement appropriate technical and organizational measures to protect your data:</p>
                <ul className="space-y-2">
                  <li>• Encryption of data in transit and at rest</li>
                  <li>• Secure network infrastructure and firewalls</li>
                  <li>• Regular security audits and vulnerability assessments</li>
                  <li>• Access controls and authentication mechanisms</li>
                  <li>• Employee training on data protection</li>
                  <li>• Incident response procedures</li>
                </ul>
                <p className="mt-4">
                  While we strive to protect your personal information, no method of transmission over the Internet or 
                  electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
              <div className="space-y-4 text-slate-300">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="space-y-2">
                  <li>• Provide you with our services</li>
                  <li>• Comply with legal obligations</li>
                  <li>• Resolve disputes</li>
                  <li>• Enforce our agreements</li>
                </ul>
                <p className="mt-4">
                  After account closure, we may retain certain information as required by law or for legitimate business purposes. 
                  Inactive accounts may be archived after a reasonable period.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
              <div className="space-y-4 text-slate-300">
                <p>Under Kenya's Data Protection Act, 2019, you have the following rights:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Right to Access</h3>
                    <p className="text-sm">Request a copy of the personal data we hold about you</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Right to Correction</h3>
                    <p className="text-sm">Request correction of inaccurate personal data</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Right to Deletion</h3>
                    <p className="text-sm">Request deletion of your personal data ("right to be forgotten")</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Right to Object</h3>
                    <p className="text-sm">Object to processing of your personal data</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Right to Data Portability</h3>
                    <p className="text-sm">Request your data in a structured, machine-readable format</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Right to Withdraw Consent</h3>
                    <p className="text-sm">Withdraw consent for processing at any time</p>
                  </div>
                </div>
                <p className="mt-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking Technologies</h2>
              <div className="space-y-4 text-slate-300">
                <p>We use cookies and similar tracking technologies to:</p>
                <ul className="space-y-2">
                  <li>• Keep you logged in to your account</li>
                  <li>• Remember your preferences and settings</li>
                  <li>• Analyze website traffic and performance</li>
                  <li>• Improve our services and user experience</li>
                </ul>
                <p className="mt-4">
                  You can manage cookie preferences through your browser settings. Disabling cookies may affect the functionality of some features.
                </p>
              </div>
            </section>

            {/* Third-Party Links */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">9. Third-Party Links</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>
                  Our website may contain links to third-party websites, services, or applications that are not owned or 
                  controlled by Vilcom Network. We are not responsible for the privacy practices of these third parties. 
                  We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">10. Children's Privacy</h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                  information from children. If you become aware that a child has provided us with personal information, 
                  please contact us.
                </p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="space-y-2">
                  <li>• Posting the updated policy on our website</li>
                  <li>• Sending you an email notification</li>
                  <li>• Displaying a notice on our services</li>
                </ul>
                <p className="mt-4">
                  Your continued use of our services after the effective date of any changes constitutes acceptance of the new policy.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
              <div className="space-y-4 text-slate-300">
                <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <div className="bg-slate-700/30 rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <span>Email: privacy@vilcom.co.ke</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <span>Phone: +254 700 000 000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span>Address: Nairobi, Kenya</span>
                  </div>
                </div>
                <p className="mt-4">
                  You also have the right to lodge a complaint with the Office of the Data Protection Commissioner in Kenya 
                  if you believe your data protection rights have been violated.
                </p>
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
      <footer className="border-t border-slate-700/50 bg-slate-900 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold">Vilcom<span className="text-cyan-400">Network</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/contact-us" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Vilcom Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

