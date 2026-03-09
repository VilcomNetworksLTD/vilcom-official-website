import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Send, Layout, Cloud, Shield, Cpu, Briefcase, CreditCard, Plug, Monitor, Lock, Satellite, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import QuoteRequestForm from "@/components/QuoteRequestForm";

interface ServiceFeature {
  text: string;
}

interface ServicePageProps {
  title: string;
  subtitle: string;
  description: string;
  features: ServiceFeature[];
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  blobColor?: string;
  serviceType?: string; // New prop for quote form
}

// Map icons to use consistent styling
const getIconComponent = (icon: React.ReactNode) => {
  return icon;
};

const ServicePage = ({ title, subtitle, description, features, icon, iconBgColor, iconColor, blobColor = "bg-purple-500/20", serviceType }: ServicePageProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requirements: "",
    budget: "",
    timeline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call - in production, this would submit to backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleQuoteSuccess = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Solid dark background - matching ServicesSection and WebDevelopment */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]" />
      
      {/* Animated fluid shapes - matching WebDevelopment */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px]" />
        <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px]" />
        
        {/* Orange radiance splash - from Index.tsx */}
        <div className="absolute top-[15%] right-[20%] w-48 h-48 rounded-full bg-gradient-to-br from-orange-400/30 to-amber-300/20 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[30%] left-[10%] w-60 h-60 rounded-full bg-gradient-to-br from-orange-500/25 to-amber-400/15 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[50%] left-[40%] w-40 h-40 rounded-full bg-gradient-to-br from-orange-300/20 to-yellow-200/10 blur-[60px] animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Concentric rings for geometric depth - from ServicesSection */}
      <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] border border-white/5 rounded-full opacity-30 pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] border border-white/3 rounded-full opacity-20 pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] border border-white/2 rounded-full opacity-15 pointer-events-none" />
      
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] border border-white/5 rounded-full opacity-25 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[200px] h-[200px] border border-white/3 rounded-full opacity-15 pointer-events-none" />

      {/* Wave lines - visible through glass cards - from ServicesSection */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[12%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-40" />
        <div className="absolute top-[28%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-30" />
        <div className="absolute top-[44%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-35" />
        <div className="absolute top-[60%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-25" />
        <div className="absolute top-[76%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-30" />
        <div className="absolute top-[92%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-20" />
      </div>

      <Navbar />
      
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${iconBgColor} mb-6 shadow-lg`}>
              <div className={iconColor}>
                {icon}
              </div>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-blue-100/80 max-w-2xl mx-auto text-lg">
              {subtitle}
            </p>
          </div>

          {/* Description - Glass Card like ServicesSection homepage */}
          <div className="max-w-4xl mx-auto mb-12">
            <div 
              className="relative rounded-3xl p-8 md:p-12 overflow-hidden backdrop-blur-md"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-3xl" style={{
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)'
              }} />
              {/* Orange blob accent */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/20 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <h2 className="font-heading text-2xl font-bold text-white mb-4">
                  About This Service
                </h2>
                <p className="text-white/80 leading-relaxed text-lg">
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Features - Glass Cards Grid like ServicesSection homepage */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-10">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="relative rounded-3xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Inner glow effect for beveled edges */}
                  <div className="absolute inset-0 rounded-3xl" style={{
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)'
                  }} />
                  {/* Orange blob accent */}
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/20 rounded-full blur-[80px]" />
                  <div className="relative z-10 flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full ${iconBgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Check className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <span className="text-white/80">{feature.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies Section - Glass Card like ServicesSection */}
          <div className="max-w-4xl mx-auto mb-16">
            <div 
              className="relative rounded-3xl p-10 overflow-hidden backdrop-blur-md"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-3xl" style={{
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)'
              }} />
              {/* Orange blob accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <h3 className="font-heading text-2xl font-bold text-white text-center mb-8">
                  Technologies We Use
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    "Cloud Infrastructure", "AWS", "Azure", "Google Cloud",
                    "Docker", "Kubernetes", "Python", "Node.js",
                    "React", "Vue.js", "MongoDB", "PostgreSQL"
                  ].map((tech) => (
                    <span 
                      key={tech}
                      className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm backdrop-blur-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Form - Glass Card - Use QuoteRequestForm if serviceType provided */}
          <div className="max-w-2xl mx-auto">
            {serviceType ? (
              <QuoteRequestForm 
                serviceType={serviceType}
                onSuccess={handleQuoteSuccess}
              />
            ) : (
              <div className="glass-dark backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10">
                <h2 className="font-heading text-2xl font-bold text-white mb-2 text-center">
                  Request a Quote
                </h2>
                <p className="text-blue-200/70 text-center mb-8">
                  Fill out the form below and our team will get back to you with a customized quotation.
                </p>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-2">
                      Request Submitted!
                    </h3>
                    <p className="text-blue-200/70">
                      Thank you for your interest. Our team will review your requirements and contact you within 24-48 hours.
                    </p>
                    <Button 
                      onClick={() => setSubmitted(false)}
                      className="mt-6 gradient-royal text-white"
                    >
                      Submit Another Request
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-blue-200/80 mb-2">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/40 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200/80 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@company.com"
                          className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/40 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-blue-200/80 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+254 700 000 000"
                          className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/40 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200/80 mb-2">
                          Company Name
                        </label>
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Your Company Ltd"
                          className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/40 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-blue-200/80 mb-2">
                          Estimated Budget
                        </label>
                        <Input
                          type="text"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="e.g. KES 50,000 - 100,000"
                          className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/40 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200/80 mb-2">
                          Preferred Timeline
                        </label>
                        <Input
                          type="text"
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          placeholder="e.g. 2-4 weeks"
                          className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/40 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200/80 mb-2">
                        Your Requirements *
                      </label>
                      <Textarea
                        required
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="Please describe your requirements, project scope, timeline, and any specific needs..."
                        rows={5}
                        className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/40 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full gradient-royal text-white font-semibold py-6 text-lg disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Request Quote
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="glass-dark backdrop-blur-xl rounded-3xl p-10 max-w-3xl mx-auto border border-white/10">
              <h3 className="font-heading text-2xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-blue-200/70 mb-6">
                Explore our portfolio or contact us for a free consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default ServicePage;

