import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HeadphonesIcon, Zap, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import contactService from "@/services/contact";

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Firm location coordinates - Ramco Court, Mombasa Road, Nairobi
const FIRM_LOCATION = {
  lat: -1.3186238,
  lng: 36.8352056,
  address: "Ramco Court, Block B, Mombasa Road, Nairobi"
};

const contactInfo = [
  { icon: Phone, title: "Safaricom Helpline", details: ["0111 028800"], description: "Call Only - Mon-Sat 8AM-5PM" },
  { icon: Phone, title: "Safaricom WhatsApp", details: ["0726888777"], description: "WhatsApp Only" },
  { icon: Phone, title: "Airtel", details: ["0755055555"], description: "WhatsApp/SMS" },
  { icon: Mail, title: "Email", details: ["customercare@vilcom.co.ke"], description: "We respond within 24h" },
  { icon: MapPin, title: "Location", details: ["Ramco Court, Block B", "Mombasa Road, Nairobi"], description: "Physical Address" },
  { icon: Clock, title: "Hours", details: ["Mon-Sat: 8AM-5PM"], description: "Frontend Support" },
];

const departments = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

const glassCardStyle = { background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)' };

const ContactUs = () => {
  useEffect(() => {
    document.title = "Contact Us | Vilcom Networks Ltd";
  }, []);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", department: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    setIsMapLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await contactService.sendMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department || 'other',
        subject: formData.subject,
        message: formData.message,
      });
      
      alert("Thank you for contacting us! We'll get back to you shortly.");
      setFormData({ name: "", email: "", phone: "", department: "", subject: "", message: "" });
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Main content wrapper */}
      <main className="pt-32 pb-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white mb-6">Contact <span className="text-white">Us</span></h1>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg font-medium">Have questions? We're here to help!</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl gradient-royal flex items-center justify-center mx-auto mb-4 shadow-lg"><info.icon className="w-7 h-7 text-white" /></div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">{info.title}</h3>
                  {info.details.map((d, i) => <p key={i} className="text-white/80 text-sm font-medium">{d}</p>)}
                  <p className="text-white/50 text-xs mt-2">{info.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto pb-8">
            <div className="relative rounded-2xl p-8 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10">
                <h2 className="font-heading text-2xl font-bold text-white mb-6">Send Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-white/80 mb-2">Name *</label><Input type="text" placeholder="John" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="bg-white/10 border-white/20 text-white placeholder-white/40" /></div>
                    <div><label className="block text-sm font-semibold text-white/80 mb-2">Email *</label><Input type="email" placeholder="john@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="bg-white/10 border-white/20 text-white placeholder-white/40" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-white/80 mb-2">Phone</label><Input type="tel" placeholder="+254..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-white/10 border-white/20 text-white placeholder-white/40" /></div>
                    <div><label className="block text-sm font-semibold text-white/80 mb-2">Dept *</label><Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})} required><SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-white/80 mb-2">Subject *</label><Input type="text" placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required className="bg-white/10 border-white/20 text-white placeholder-white/40" /></div>
                  <div><label className="block text-sm font-semibold text-white/80 mb-2">Message *</label><Textarea placeholder="Tell us more..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required rows={5} className="bg-white/10 border-white/20 text-white placeholder-white/40 resize-none" /></div>
                  <Button type="submit" disabled={isSubmitting} className="w-full gradient-royal text-white font-semibold py-6">{isSubmitting ? "Sending..." : "Send Message"}</Button>
                </form>
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative rounded-2xl p-8 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <h3 className="font-heading text-xl font-bold text-white mb-6">Quick Help</h3>
                  <div className="space-y-4">
                    <Link to="/faqs" className="flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-white" /></div><div><h4 className="font-semibold text-white">FAQs</h4><p className="text-sm text-white/50">Find answers</p></div></Link>
                    <Link to="/coverage" className="flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div><div><h4 className="font-semibold text-white">Coverage</h4><p className="text-sm text-white/50">Check area</p></div></Link>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl p-8 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <h3 className="font-heading text-xl font-bold text-white mb-4">Emergency Support</h3>
                  <p className="text-white/70 mb-4">Technical support available during business hours.</p>
                  <div className="flex items-center gap-3 p-4 bg-red-500/20 rounded-xl border border-red-500/30"><div className="w-12 h-12 rounded-xl bg-red-500/30 flex items-center justify-center"><HeadphonesIcon className="w-6 h-6 text-red-400" /></div><div><h4 className="font-semibold text-white">Helpline</h4><p className="text-red-400 font-bold">0111 028800</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width map — outside container, no bottom margin, sits directly above footer */}
        {isMapLoaded && (
          <div className="w-full h-[500px]" style={{ position: 'relative', zIndex: 10 }}>
            <MapContainer
              center={[FIRM_LOCATION.lat, FIRM_LOCATION.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[FIRM_LOCATION.lat, FIRM_LOCATION.lng]}>
                <Popup>
                  <div className="text-center">
                    <strong className="text-base">VILCOM Headquarters</strong><br />
                    {FIRM_LOCATION.address}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
};

export default ContactUs;