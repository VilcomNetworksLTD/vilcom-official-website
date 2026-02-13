import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HeadphonesIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+254 700 000 000", "+254 700 111 111"],
    description: "Mon-Fri 8am-8pm, Sat 9am-5pm",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["hello@vilcom.co.ke", "support@vilcom.co.ke"],
    description: "We'll respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    details: ["Victoria Towers, Upper Kabete", "Nairobi, Kenya"],
    description: "Visit us during business hours",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Monday - Friday: 8:00 AM - 8:00 PM", "Saturday: 9:00 AM - 5:00 PM"],
    description: "24/7 Technical Support Available",
  },
];

const departments = [
  { value: "sales", label: "Sales & Inquiries" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing & Accounts" },
  { value: "partnerships", label: "Partnerships" },
  { value: "media", label: "Media & PR" },
  { value: "other", label: "Other" },
];

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-700/40 via-transparent to-white/30" />
      
      {/* Vibrant background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 rounded-full blur-[120px] opacity-35" />
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-gradient-to-tr from-rose-400 via-orange-300 to-sky-400 rounded-full blur-[100px] opacity-40" />
        <div className="absolute top-[70%] left-[60%] w-64 h-64 bg-gradient-to-bl from-teal-400 via-cyan-300 to-sky-300 rounded-full blur-[90px] opacity-40" />
        <div className="absolute top-[25%] left-[30%] w-[300px] h-[300px] bg-gradient-to-br from-yellow-300 via-amber-200 to-orange-300 rounded-full blur-[60px] opacity-30" />
        <div className="absolute bottom-[40%] right-[30%] w-[380px] h-[380px] bg-gradient-to-t from-blue-400 via-sky-400 to-cyan-300 rounded-full blur-[80px] opacity-35" />
      </div>

      {/* Artistic VILCOM text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-sky-600/12 via-sky-500/8 to-sky-400/5 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <Navbar />
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              Contact <span className="text-sky-700">Us</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-lg font-medium">
              Have questions? We're here to help! Reach out to our team through any of the channels below.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl gradient-royal flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-slate-700 text-sm font-medium">{detail}</p>
                ))}
                <p className="text-slate-500 text-xs mt-2">{info.description}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="glass-sky rounded-2xl p-8">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-6">
                Send Us a <span className="text-sky-700">Message</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-white/50 border-white/30 focus:border-sky-500 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white/50 border-white/30 focus:border-sky-500 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/50 border-white/30 focus:border-sky-500 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                      required
                    >
                      <SelectTrigger className="bg-white/50 border-white/30 focus:border-sky-500 focus:ring-sky-500">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
                  <Input
                    type="text"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="bg-white/50 border-white/30 focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
                  <Textarea
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-white/50 border-white/30 focus:border-sky-500 focus:ring-sky-500 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gradient-royal text-white font-semibold shadow-lg royal-glow border-0 py-6"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Additional Contact Options */}
            <div className="space-y-6">
              {/* Quick Support Options */}
              <div className="glass-crystal rounded-2xl p-8">
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-6">
                  Need Quick <span className="text-sky-700">Help?</span>
                </h3>
                <div className="space-y-4">
                  <Link
                    to="/faqs"
                    className="flex items-center gap-4 p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">FAQs</h4>
                      <p className="text-sm text-slate-500">Find answers to common questions</p>
                    </div>
                  </Link>
                  <Link
                    to="/coverage"
                    className="flex items-center gap-4 p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Check Coverage</h4>
                      <p className="text-sm text-slate-500">See if we service your area</p>
                    </div>
                  </Link>
                  <Link
                    to="/plans"
                    className="flex items-center gap-4 p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">View Plans</h4>
                      <p className="text-sm text-slate-500">Browse our internet packages</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Emergency Support */}
              <div className="glass-sky rounded-2xl p-8">
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-4">
                  Emergency <span className="text-sky-700">Support</span>
                </h3>
                <p className="text-slate-600 mb-4">
                  Experiencing service issues? Our technical support team is available 24/7 for critical problems.
                </p>
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <HeadphonesIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">24/7 Emergency Line</h4>
                    <p className="text-red-600 font-bold">+254 700 999 999</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="glass-crystal rounded-2xl p-8">
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-4">
                  Follow <span className="text-sky-700">Us</span>
                </h3>
                <p className="text-slate-600 mb-4">
                  Stay updated with our latest news, promotions, and announcements.
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center text-slate-600 hover:bg-sky-500 hover:text-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center text-slate-600 hover:bg-sky-500 hover:text-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center text-slate-600 hover:bg-sky-500 hover:text-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center text-slate-600 hover:bg-sky-500 hover:text-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default ContactUs;
