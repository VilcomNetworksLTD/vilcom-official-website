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

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  const departments = ["All", ...new Set(jobOpenings.map((job) => job.department))];

  const filteredJobs = selectedDepartment === "All"
    ? jobOpenings
    : jobOpenings.filter((job) => job.department === selectedDepartment);

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Gradient background: White to Deep Sky Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      
      {/* Deep sky blue gradient overlay for richness */}
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
              Join Our <span className="text-sky-700">Team</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-lg font-medium">
              Be part of Kenya's fastest-growing fiber internet provider. We're looking for talented individuals who are passionate about connectivity and customer service.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gradient-royal text-white font-semibold shadow-lg royal-glow border-0">
                <Link to="#openings">
                  View Open Positions <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-slate-300 font-semibold">
                <Link to="#culture">
                  Learn About Our Culture
                </Link>
              </Button>
            </div>
          </div>

          {/* Why Join Us Section */}
          <div className="mb-20" id="culture">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-12">
              Why Join <span className="text-sky-700">Vilcom</span>?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="glass-sky rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl gradient-royal flex items-center justify-center mb-4 shadow-lg">
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-12">
              Our <span className="text-sky-700">Values</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="glass-crystal rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300"
                >
                  <h3 className="font-heading text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
                  <p className="text-slate-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Job Openings Section */}
          <div id="openings">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-8">
              Open <span className="text-sky-700">Positions</span>
            </h2>
            
            {/* Department Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    selectedDepartment === dept
                      ? "gradient-royal text-white shadow-lg"
                      : "glass-crystal text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Job Listings */}
            <div className="space-y-4 max-w-4xl mx-auto">
              {filteredJobs.map((job, index) => (
                <div
                  key={index}
                  className="glass-sky rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading text-xl font-bold text-slate-800">{job.title}</h3>
                        <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
                          {job.department}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {job.type}
                        </div>
                      </div>
                    </div>
                    <Button className="gradient-royal text-white font-semibold shrink-0 royal-glow border-0">
                      Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No positions available in this department currently.</p>
                <p className="text-slate-400">Check back soon for new opportunities!</p>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-20">
            <div className="glass-sky rounded-3xl p-10 text-center max-w-3xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-slate-800 mb-4">
                Don't See the Right Role?
              </h2>
              <p className="text-slate-600 mb-6">
                We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
              </p>
              <Button asChild size="lg" className="gradient-royal text-white font-semibold shadow-lg royal-glow border-0">
                <Link to="/contact-us">
                  Get in Touch <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Careers;
