import { useState } from "react";
import { Briefcase, MapPin, Clock, ArrowRight, Users, Award, Heart, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const jobOpenings = [
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

const benefits = [
  { icon: Heart, title: "Health Insurance", description: "Comprehensive medical cover for you and your family" },
  { icon: Zap, title: "Growth Opportunities", description: "Regular training and career advancement paths" },
  { icon: Award, title: "Performance Bonuses", description: "Quarterly bonuses based on individual and company performance" },
  { icon: Users, title: "Great Culture", description: "Work with a talented team in a collaborative environment" },
  { icon: Shield, title: "Job Security", description: "Stable employment with a leading ISP in the region" },
  { icon: Globe, title: "Flexible Work", description: "Hybrid work options and flexible hours" },
];

const values = [
  {
    title: "Innovation",
    description: "We constantly push boundaries and embrace new technologies to deliver the best connectivity solutions.",
  },
  {
    title: "Customer Focus",
    description: "Our customers are at the heart of everything we do. Their success is our success.",
  },
  {
    title: "Integrity",
    description: "We build trust through transparency, honesty, and ethical business practices.",
  },
  {
    title: "Teamwork",
    description: "We believe in the power of collaboration to achieve extraordinary results together.",
  },
];

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
};

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  const departments = ["All", ...new Set(jobOpenings.map((job) => job.department))];

  const filteredJobs = selectedDepartment === "All"
    ? jobOpenings
    : jobOpenings.filter((job) => job.department === selectedDepartment);

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
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <Navbar />
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white mb-6">
              Join Our <span className="text-white">Team</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg font-medium">
              Be part of Kenya's fastest-growing fiber internet provider.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gradient-royal text-white font-semibold shadow-lg royal-glow border-0">
                <Link to="#openings">View Open Positions <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold">
                <Link to="#culture">Learn About Our Culture</Link>
              </Button>
            </div>
          </div>

          <div className="mb-20" id="culture">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-12">Why Join <span className="text-white">Vilcom</span>?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="relative rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl gradient-royal flex items-center justify-center mb-4 shadow-lg">
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-white/70 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-12">Our <span className="text-white">Values</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <div key={index} className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10">
                    <h3 className="font-heading text-xl font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-white/70 text-sm">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="openings">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-8">Open <span className="text-white">Positions</span></h2>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {departments.map((dept) => (
                <button key={dept} onClick={() => setSelectedDepartment(dept)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedDepartment === dept ? "gradient-royal text-white shadow-lg" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}>
                  {dept}
                </button>
              ))}
            </div>
            <div className="space-y-4 max-w-4xl mx-auto">
              {filteredJobs.map((job, index) => (
                <div key={index} className="relative rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading text-xl font-bold text-white">{job.title}</h3>
                        <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">{job.department}</span>
                      </div>
                      <p className="text-white/70 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-white/50">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.type}</div>
                      </div>
                    </div>
                    <Button className="gradient-royal text-white font-semibold shrink-0 royal-glow border-0">Apply Now <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              ))}
            </div>
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/50 text-lg">No positions available</p>
              </div>
            )}
          </div>

          <div className="mt-20">
            <div className="relative rounded-3xl p-10 text-center max-w-3xl mx-auto overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10">
                <h2 className="font-heading text-3xl font-bold text-white mb-4">Don't See the Right Role?</h2>
                <p className="text-white/70 mb-6">We're always looking for talented people.</p>
                <Button asChild size="lg" className="gradient-royal text-white font-semibold shadow-lg royal-glow border-0">
                  <Link to="/contact-us">Get in Touch <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Careers;

