import { useState, useEffect, useRef } from "react";
import { Briefcase, MapPin, Clock, ArrowRight, Users, Award, Heart, Zap, Shield, Globe, Upload, X, Check, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { careersApi, publicVacanciesApi, type JobVacancy } from "@/services/careers";
import { useAuth } from "@/contexts/AuthContext";

// Type for job from backend
interface JobPosition {
  id?: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

// Mock job openings for UI fallback (demo purposes when API unavailable)
const mockJobOpenings: JobPosition[] = [
  {
    title: "Network Engineer",
    department: "Technical",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Design, implement and maintain our fiber optic network infrastructure.",
    requirements: ["CCNP or equivalent", "3+ years experience", "Fiber optics expertise"],
  },
  {
    title: "Customer Support Specialist",
    department: "Support",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Provide exceptional technical support to our residential and business customers.",
    requirements: ["Excellent communication skills", "Technical aptitude", "Customer service experience"],
  },
  {
    title: "Sales Executive",
    department: "Sales",
    location: "Mombasa, Kenya",
    type: "Full-time",
    description: "Drive new business acquisition and maintain client relationships.",
    requirements: ["B2B sales experience", "IT/Telecom background", "Proven track record"],
  },
  {
    title: "Marketing Manager",
    department: "Marketing",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Lead marketing initiatives and brand development for our growing company.",
    requirements: ["5+ years marketing experience", "Digital marketing expertise", "Team leadership"],
  },
  {
    title: "Field Technician",
    department: "Technical",
    location: "Kisumu, Kenya",
    type: "Full-time",
    description: "Install and maintain customer connections in the Western region.",
    requirements: ["Technical diploma", "Valid driver's license", "Physical fitness"],
  },
];

// Extended mock data with more details for full job listings from backend
const jobDetailsMap: Record<string, JobPosition> = {
  "Network Engineer": {
    title: "Network Engineer",
    department: "Technical",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Design, implement and maintain our fiber optic network infrastructure.",
    requirements: ["CCNP or equivalent", "3+ years experience", "Fiber optics expertise"],
  },
  "Customer Support Specialist": {
    title: "Customer Support Specialist",
    department: "Support",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Provide exceptional technical support to our residential and business customers.",
    requirements: ["Excellent communication skills", "Technical aptitude", "Customer service experience"],
  },
  "Sales Executive": {
    title: "Sales Executive",
    department: "Sales",
    location: "Mombasa, Kenya",
    type: "Full-time",
    description: "Drive new business acquisition and maintain client relationships.",
    requirements: ["B2B sales experience", "IT/Telecom background", "Proven track record"],
  },
  "Marketing Manager": {
    title: "Marketing Manager",
    department: "Marketing",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Lead marketing initiatives and brand development for our growing company.",
    requirements: ["5+ years marketing experience", "Digital marketing expertise", "Team leadership"],
  },
  "Field Technician": {
    title: "Field Technician",
    department: "Technical",
    location: "Kisumu, Kenya",
    type: "Full-time",
    description: "Install and maintain customer connections in the Western region.",
    requirements: ["Technical diploma", "Valid driver's license", "Physical fitness"],
  },
  "Software Developer": {
    title: "Software Developer",
    department: "Technical",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Develop and maintain our web applications and internal systems.",
    requirements: ["Bachelor's in Computer Science", "3+ years experience", "React/Node.js knowledge"],
  },
  "System Administrator": {
    title: "System Administrator",
    department: "Technical",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Manage and maintain our server infrastructure and cloud services.",
    requirements: ["Linux certification", "Cloud platform experience", "Security best practices"],
  },
  "Data Analyst": {
    title: "Data Analyst",
    department: "Analytics",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Analyze customer data and generate insights for business decisions.",
    requirements: ["Statistics/Math background", "SQL proficiency", "Data visualization skills"],
  },
  "IT Security Specialist": {
    title: "IT Security Specialist",
    department: "Security",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Ensure the security of our network and customer data.",
    requirements: ["Security certifications", "Penetration testing experience", "Compliance knowledge"],
  },
  "Accountant": {
    title: "Accountant",
    department: "Finance",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Handle financial reporting and accounting operations.",
    requirements: ["CPA certification", "2+ years experience", "ERP software knowledge"],
  },
  "Human Resources Manager": {
    title: "Human Resources Manager",
    department: "HR",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Oversee HR operations and employee relations.",
    requirements: ["HR degree", "5+ years experience", "Labor law knowledge"],
  },
  "Graphic Designer": {
    title: "Graphic Designer",
    department: "Marketing",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Create visual content for marketing and branding.",
    requirements: ["Portfolio required", "Adobe Suite proficiency", "Branding experience"],
  },
  "Content Creator": {
    title: "Content Creator",
    department: "Marketing",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Create engaging content for digital platforms.",
    requirements: ["Writing skills", "Social media knowledge", "Video editing is a plus"],
  },
  "Project Manager": {
    title: "Project Manager",
    department: "Operations",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Lead technical projects from initiation to completion.",
    requirements: ["PMP certification", "3+ years experience", "Agile methodology"],
  },
  "DevOps Engineer": {
    title: "DevOps Engineer",
    department: "Technical",
    location: "Nairobi, Kenya",
    type: "Full-time",
    description: "Implement CI/CD pipelines and manage cloud infrastructure.",
    requirements: ["Docker/Kubernetes experience", "AWS/Azure certification", "Scripting skills"],
  },
};

const benefits = [
  { icon: Heart, title: "Health Insurance", description: "Comprehensive medical cover for you and your family" },
  { icon: Zap, title: "Growth Opportunities", description: "Regular training and career advancement paths" },
  { icon: Award, title: "Performance Bonuses", description: "Quarterly bonuses based on individual and company performance" },
  { icon: Users, title: "Great Culture", description: "Work with a talented team in a collaborative environment" },
  { icon: Shield, title: "Job Security", description: "Stable employment with a leading ISP in the region" },
  { icon: Globe, title: "Flexible Work", description: "Hybrid work options and flexible hours" },
];

const values = [
  { title: "Innovation", description: "We constantly push boundaries and embrace new technologies to deliver the best connectivity solutions." },
  { title: "Customer Focus", description: "Our customers are at the heart of everything we do. Their success is our success." },
  { title: "Integrity", description: "We build trust through transparency, honesty, and ethical business practices." },
  { title: "Teamwork", description: "We believe in the power of collaboration to achieve extraordinary results together." },
];

const glassCardStyle = { background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)' };

// File upload component
interface FileUploadProps {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const FileUpload = ({ label, accept, file, onChange, error }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all backdrop-blur-md hover:scale-[1.01] ${
          error ? "border-red-400/50" : "border-white/20 hover:border-white/40"
        }`}
        style={{ 
          background: 'rgba(255, 255, 255, 0.08)', 
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.15)'
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            <span className="text-white text-sm">{file.name}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="ml-2 text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-white/70">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Click or drag file here</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

// Application form modal
interface ApplicationModalProps {
  jobTitle: string;
  onClose: () => void;
}

const ApplicationModal = ({ jobTitle, onClose }: ApplicationModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    job_title: jobTitle,
    full_name: user?.name || "",
    email: user?.email || "",
    phone: "",
    linkedin_url: "",
    portfolio_url: "",
    cover_letter: "",
  });
  
  const [files, setFiles] = useState({
    cv: null as File | null,
    certificates: null as File | null,
    additional_documents: null as File | null,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, full_name: user.name || "", email: user.email || "" }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!files.cv) newErrors.cv = "CV is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const result = await careersApi.submit({
        ...formData,
        cv: files.cv!,
        certificates: files.certificates || undefined,
        additional_documents: files.additional_documents || undefined,
      });
      setApplicationNumber(result.application_number);
      setSuccess(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        const flatErrors: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([key, value]) => {
          flatErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(flatErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center" style={glassCardStyle}>
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
          <p className="text-white/70 mb-4">Your application for <strong>{jobTitle}</strong> has been submitted successfully.</p>
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <p className="text-white/60 text-sm">Application Number</p>
            <p className="text-white font-mono font-bold">{applicationNumber}</p>
          </div>
          <p className="text-white/50 text-sm mb-6">Please save this number to check your application status.</p>
          <Button onClick={onClose} className="w-full gradient-royal text-white">Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full my-8 border border-white/20 shadow-2xl" style={glassCardStyle}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Apply for {jobTitle}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg bg-white/10 border text-white placeholder:text-white/50 ${errors.full_name ? "border-red-400" : "border-white/20"}`} placeholder="John Doe" />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg bg-white/10 border text-white placeholder:text-white/50 ${errors.email ? "border-red-400" : "border-white/20"}`} placeholder="john@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50" placeholder="+254 700 000 000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">LinkedIn URL</label>
              <input type="url" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50" placeholder="https://linkedin.com/in/johndoe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Portfolio URL</label>
            <input type="url" value={formData.portfolio_url} onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50" placeholder="https://johndoe.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Cover Letter</label>
            <textarea value={formData.cover_letter} onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 min-h-[120px]" placeholder="Tell us why you'd be great for this role..." />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <FileUpload label="CV/Resume *" accept=".pdf,.doc,.docx" file={files.cv} onChange={(file) => setFiles({ ...files, cv: file })} error={errors.cv} />
            <FileUpload label="Certificates" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" file={files.certificates} onChange={(file) => setFiles({ ...files, certificates: file })} />
            <FileUpload label="Additional Documents" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" file={files.additional_documents} onChange={(file) => setFiles({ ...files, additional_documents: file })} />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gradient-royal text-white">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Careers Page Component
export default function Careers() {
  useEffect(() => {
    document.title = "Careers | Vilcom Networks Ltd";
  }, []);

  const [jobOpenings, setJobOpenings] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchJobPositions = async () => {
      try {
        setLoading(true);
        setError(null);
        // First try to fetch admin-posted vacancies from the DB
        const liveVacancies = await publicVacanciesApi.getActive();
        if (liveVacancies && liveVacancies.length > 0) {
          const jobs: JobPosition[] = liveVacancies.map((v: JobVacancy) => ({
            id: v.id,
            title: v.title,
            department: v.department ?? 'General',
            location: v.location,
            type: v.type,
            description: v.description,
            requirements: v.requirements ?? [],
          }));
          setJobOpenings(jobs);
        } else {
          // Fallback: legacy string-based API
          const jobTitles = await careersApi.getJobPositions();
          const jobs: JobPosition[] = jobTitles.map(title => {
            const details = jobDetailsMap[title];
            if (details) return details;
            return {
              title,
              department: 'General',
              location: 'Nairobi, Kenya',
              type: 'Full-time',
              description: `We are looking for a talented ${title} to join our team.`,
              requirements: ['Relevant qualifications', 'Problem-solving skills', 'Team player'],
            };
          });
          setJobOpenings(jobs.length > 0 ? jobs : mockJobOpenings);
        }
      } catch (err) {
        console.error('Failed to fetch job positions:', err);
        setError('Unable to load live positions. Showing demo positions.');
        setJobOpenings(mockJobOpenings);
      } finally {
        setLoading(false);
      }
    };
    fetchJobPositions();
  }, []);

  const departments = ["all", ...new Set(jobOpenings.map(job => job.department))];
  const filteredJobs = filter === "all" ? jobOpenings : jobOpenings.filter(job => job.department === filter);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
      <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
      <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">VILCOM</h1>
      </div>
      <Navbar />
      <section className="relative pt-36 pb-16 overflow-hidden z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Join Our <span className="text-cyan-400">Team</span></h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">Be part of Kenya's leading ISP company and help us connect communities through innovative solutions.</p>
          <div className="flex justify-center gap-4">
            <Button asChild className="gradient-royal text-white px-8 py-3"><a href="#openings">View Openings</a></Button>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3"><Link to="/about">Learn About Us</Link></Button>
          </div>
        </div>
      </section>
      <section className="py-12 border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ number: "50+", label: "Employees" }, { number: "10K+", label: "Customers" }, { number: "99.9%", label: "Uptime" }, { number: "24/7", label: "Support" }].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{stat.number}</div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="openings" className="py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Open Positions</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Find your next career opportunity and join our team of experts.</p>
          </div>
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <span className="ml-3 text-white/60">Loading positions...</span>
            </div>
          )}
          {error && !loading && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 text-center">
              <p className="text-yellow-400">{error}</p>
            </div>
          )}
          {!loading && filteredJobs.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {departments.map((dept) => (
                <button key={dept} onClick={() => setFilter(dept)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === dept ? "bg-cyan-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                  {dept === "all" ? "All Departments" : dept}
                </button>
              ))}
            </div>
          )}
          {!loading && filteredJobs.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <div key={index} className="group rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300" style={glassCardStyle} onClick={() => setSelectedJob(job.title)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center"><Briefcase className="w-6 h-6 text-cyan-400" /></div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">{job.type}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                    <div className="flex items-center gap-1"><Users className="w-4 h-4" />{job.department}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.slice(0, 2).map((req, i) => (
                        <span key={i} className="px-2 py-1 rounded text-xs bg-white/5 text-white/60">{req}</span>
                      ))}
                    </div>
                    <ArrowRight className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filteredJobs.length === 0 && (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No positions found</h3>
              <p className="text-white/50">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </section>
      <section className="py-10 bg-slate-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Join Us?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">We offer competitive benefits and a great work environment.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-2xl" style={glassCardStyle}>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><benefit.icon className="w-6 h-6 text-cyan-400" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-white/60 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-white/60 max-w-2xl mx-auto">The principles that guide everything we do.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-2xl" style={glassCardStyle}>
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4"><span className="text-2xl font-bold text-cyan-400">{index + 1}</span></div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-white/60 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section - Reduced height */}
      <section className="py-10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-6 md:p-8 text-center" style={glassCardStyle}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Make an Impact?</h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">Join our team and help shape the future of internet connectivity in Kenya.</p>
            <Button asChild className="gradient-royal text-white px-8 py-3"><a href="#openings">Browse All Positions</a></Button>
          </div>
        </div>
      </section>
      <FooterSection />
      {selectedJob && <ApplicationModal jobTitle={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}