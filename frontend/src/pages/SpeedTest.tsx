import { Wifi, Zap, Gauge, ArrowRight, Download, Upload, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

// Glass card style matching ContactUs
const glassCardStyle = { background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)' };

const SpeedTest = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient matching ContactUs */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />
      
      {/* Ambient light orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
      <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
      <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />
      
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">SPEED</h1>
      </div>

      <Navbar />
      
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white mb-6">
              Internet <span className="text-white">Speed Test</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto mb-6 text-lg font-medium">
              Test your internet connection speed directly on our website. 
              No redirects - test your speed right here.
            </p>
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Wifi className="w-4 h-4" />
              <span>Powered by OpenSpeedTest</span>
            </div>
          </div>

          {/* Speed Test Widget Container */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              
              {/* Speed Test Iframe */}
              <div style={{ 
                width: '100%', 
                height: '550px', 
                position: 'relative',
                background: '#0f172a'
              }}>
                <iframe
                  style={{
                    border: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                  src="//openspeedtest.com/speedtest"
                  title="Internet Speed Test"
                  allow="fullscreen"
                />
              </div>
            </div>
            
            <p className="text-center text-white/50 text-sm mt-4">
              Test your download and upload speeds, as well as ping and jitter.
            </p>
          </div>

          {/* Features Cards - Glassmorphic */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {/* Download Speed Card */}
            <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-heading text-lg font-bold text-white mb-2">
                  Download Speed
                </h4>
                <p className="text-white/70 text-sm">
                  Measures how fast data can be pulled from the internet to your device
                </p>
              </div>
            </div>
            
            {/* Upload Speed Card */}
            <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-heading text-lg font-bold text-white mb-2">
                  Upload Speed
                </h4>
                <p className="text-white/70 text-sm">
                  Measures how fast data can be sent from your device to the internet
                </p>
              </div>
            </div>
            
            {/* Ping Card */}
            <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-heading text-lg font-bold text-white mb-2">
                  Ping & Jitter
                </h4>
                <p className="text-white/70 text-sm">
                  Measures latency and stability of your internet connection
                </p>
              </div>
            </div>
          </div>

          {/* Why Test With Us - Glassmorphic */}
          <div className="relative rounded-2xl p-8 max-w-4xl mx-auto mb-12 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
            <div className="relative z-10">
              <h3 className="font-heading text-2xl font-bold text-white text-center mb-6">
                Why Test Your Internet Speed?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Verify you're getting the speeds you pay for",
                  "Diagnose slow connection issues",
                  "Test Wi-Fi vs Ethernet performance",
                  "Check if your ISP is delivering promised speeds",
                  "Optimize your network for gaming & streaming",
                  "Compare speeds at different times of day"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section - Glassmorphic */}
          <div className="relative rounded-2xl p-8 max-w-4xl mx-auto text-center overflow-hidden backdrop-blur-md" style={glassCardStyle}>
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
            <div className="relative z-10">
              <h3 className="font-heading text-2xl font-bold text-white mb-4">
                Need Faster Internet?
              </h3>
              <p className="text-white/70 mb-6">
                Vilcom offers high-speed fiber internet plans for home and business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/plans"
                  className="inline-flex items-center justify-center px-6 py-3 gradient-royal text-white font-semibold rounded-xl hover:scale-105 transition-transform"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  to="/coverage"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                >
                  Check Coverage
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

export default SpeedTest;

