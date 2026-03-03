import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

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
}

const ServicePage = ({ title, subtitle, description, features, icon, iconBgColor, iconColor }: ServicePageProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requirements: "",
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

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Solid dark background - no image */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,30%,96%)] via-[hsl(220,30%,92%)] to-[hsl(220,30%,88%)]" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,80%,50%)/5] via-transparent to-transparent" />
      
      {/* Animated blobs - Royal Blue, Orange, Navy */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(220,30%,50%)] rounded-full blur-[120px] opacity-20" />
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-gradient-to-r from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)] rounded-full blur-[120px] opacity-15" />
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-gradient-to-tr from-[hsl(220,30%,50%)] to-[hsl(220,80%,50%)] rounded-full blur-[100px] opacity-15" />
      </div>

      <Navbar />
      
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[hsl(220,80%,50%)] hover:text-[hsl(220,30%,50%)] transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${iconBgColor} mb-6 shadow-lg`}>
              <div className={iconColor}>
                {icon}
              </div>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(220,30%,15%)] mb-4">
              {title}
            </h1>
            <p className="text-[hsl(220,30%,45%)] max-w-2xl mx-auto text-lg">
              {subtitle}
            </p>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="glass-crystal rounded-3xl p-8 md:p-12">
              <h2 className="font-heading text-2xl font-bold text-[hsl(220,30%,15%)] mb-4">
                About This Service
              </h2>
              <p className="text-[hsl(220,30%,45%)] leading-relaxed text-lg">
                {description}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="glass-crystal rounded-3xl p-8 md:p-12">
              <h2 className="font-heading text-2xl font-bold text-[hsl(220,30%,15%)] mb-6">
                Key Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full ${iconBgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Check className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <span className="text-[hsl(220,30%,45%)]">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quotation Form */}
          <div className="max-w-2xl mx-auto">
            <div className="glass-crystal rounded-3xl p-8 md:p-10">
              <h2 className="font-heading text-2xl font-bold text-[hsl(220,30%,15%)] mb-2 text-center">
                Request a Quote
              </h2>
              <p className="text-[hsl(220,30%,45%)] text-center mb-8">
                Fill out the form below and our team will get back to you with a customized quotation.
              </p>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(30,100%,55%)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[hsl(220,30%,15%)] mb-2">
                    Request Submitted!
                  </h3>
                  <p className="text-[hsl(220,30%,45%)]">
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
                      <label className="block text-sm font-medium text-[hsl(220,30%,45%)] mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="bg-white/50 border-[hsl(220,20%,85%)] focus:border-[hsl(220,80%,50%)] focus:ring-[hsl(220,80%,50%)/20]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(220,30%,45%)] mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        className="bg-white/50 border-[hsl(220,20%,85%)] focus:border-[hsl(220,80%,50%)] focus:ring-[hsl(220,80%,50%)/20]"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[hsl(220,30%,45%)] mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254 700 000 000"
                        className="bg-white/50 border-[hsl(220,20%,85%)] focus:border-[hsl(220,80%,50%)] focus:ring-[hsl(220,80%,50%)/20]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[hsl(220,30%,45%)] mb-2">
                        Company Name
                      </label>
                      <Input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your Company Ltd"
                        className="bg-white/50 border-[hsl(220,20%,85%)] focus:border-[hsl(220,80%,50%)] focus:ring-[hsl(220,80%,50%)/20]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(220,30%,45%)] mb-2">
                      Your Requirements *
                    </label>
                    <Textarea
                      required
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Please describe your requirements, project scope, timeline, and any specific needs..."
                      rows={5}
                      className="bg-white/50 border-[hsl(220,20%,85%)] focus:border-[hsl(220,80%,50%)] focus:ring-[hsl(220,80%,50%)/20] resize-none"
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
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default ServicePage;

