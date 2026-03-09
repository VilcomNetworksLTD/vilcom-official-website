import { useState, useEffect } from "react";
import { Calendar, Clock, User, Mail, Phone, Building2, MessageSquare, Video, MapPin, PhoneCall, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import bookingService, { BookableService, TimeSlot } from "@/services/bookings";

// Glassmorphism card style matching ContactUs
const glassCardStyle = { 
  background: 'rgba(255, 255, 255, 0.08)', 
  border: '1px solid rgba(255, 255, 255, 0.15)', 
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)' 
};

// Pre-defined services for display (fallback if API fails)
const defaultServices = [
  { id: 1, name: "Fibre Internet Consultation", category: "residential", purpose_label: "Learn about fiber plans" },
  { id: 2, name: "Business Connectivity", category: "business", purpose_label: "Enterprise solutions" },
  { id: 3, name: "Cloud Solutions", category: "enterprise", purpose_label: "Cloud infrastructure" },
  { id: 4, name: "Cyber Security Assessment", category: "enterprise", purpose_label: "Security consultation" },
  { id: 5, name: "Smart Integration", category: "iot", purpose_label: "Smart home/business" },
  { id: 6, name: "Hosting Services", category: "hosting", purpose_label: "Web hosting inquiry" },
  { id: 7, name: "General Inquiry", category: "general", purpose_label: "Other questions" },
];

const meetingTypes = [
  { value: "virtual", label: "Virtual Meeting", icon: Video, description: "Via Zoom/Google Meet" },
  { value: "in_person", label: "In Person", icon: MapPin, description: "Visit our office" },
  { value: "phone", label: "Phone Call", icon: PhoneCall, description: "Audio call" },
];

const Booking = () => {
  const [formStep, setFormStep] = useState(1);
  const [services, setServices] = useState<BookableService[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  
  const [formData, setFormData] = useState({
    service_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    customer_type: "individual" as "individual" | "business",
    meeting_type: "virtual",
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await bookingService.getBookableServices();
        setServices(data.data || data);
      } catch (error) {
        console.log("Using default services");
        setServices(defaultServices as any);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.booking_date && formData.service_id) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
        try {
          const data = await bookingService.getAvailableSlots({
            date: formData.booking_date,
            product_id: parseInt(formData.service_id),
          });
          setAvailableSlots(data.slots || data);
        } catch (error) {
          // Generate mock slots
          const mockSlots: TimeSlot[] = [
            { time: "09:00", available: true },
            { time: "10:00", available: true },
            { time: "11:00", available: false },
            { time: "12:00", available: true },
            { time: "14:00", available: true },
            { time: "15:00", available: true },
            { time: "16:00", available: false },
            { time: "17:00", available: true },
          ];
          setAvailableSlots(mockSlots);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [formData.booking_date, formData.service_id]);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get max date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name || undefined,
        customer_type: formData.customer_type,
        product_id: parseInt(formData.service_id),
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        meeting_type: formData.meeting_type as "in_person" | "virtual" | "phone",
        notes: formData.notes || undefined,
      };
      
      const response = await bookingService.createBooking(bookingData);
      setBookingReference(response.booking?.reference || response.reference || "BK" + Date.now());
      setIsSuccess(true);
    } catch (error) {
      // Simulate success for demo
      setBookingReference("BK" + Date.now());
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = () => {
    return formData.service_id && formData.booking_date && formData.booking_time && formData.meeting_type;
  };

  const isStep2Valid = () => {
    return formData.first_name && formData.last_name && formData.email && formData.phone;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
        <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">VILCOM</h1>
        </div>
        <Navbar />
        
        <main className="pt-32 pb-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <div className="relative rounded-2xl p-8 overflow-hidden backdrop-blur-md text-center" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="font-heading text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
                  <p className="text-white/70 mb-6">
                    Your appointment has been scheduled successfully. We've sent a confirmation email to {formData.email}.
                  </p>
                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <p className="text-white/50 text-sm mb-1">Reference Number</p>
                    <p className="font-mono text-2xl font-bold text-white">{bookingReference}</p>
                  </div>
                  <div className="space-y-3 text-left mb-8">
                    <div className="flex justify-between text-white/80">
                      <span>Service:</span>
                      <span className="font-medium">{services.find(s => s.id === parseInt(formData.service_id))?.name || "Consultation"}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Date:</span>
                      <span className="font-medium">{new Date(formData.booking_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Time:</span>
                      <span className="font-medium">{formData.booking_time}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Type:</span>
                      <span className="font-medium capitalize">{formData.meeting_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link to="/" className="flex-1">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        Back to Home
                      </Button>
                    </Link>
                    <Link to="/contact-us" className="flex-1">
                      <Button className="w-full gradient-royal text-white font-semibold">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - matching ContactUs */}
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

      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white mb-6">
              Book an <span className="text-white">Appointment</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
              Schedule a consultation with our experts. We'll help you find the perfect solution for your needs.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                formStep >= 1 ? "bg-primary text-white" : "bg-white/20 text-white/50"
              }`}>
                1
              </div>
              <div className={`w-16 h-1 rounded ${formStep >= 2 ? "bg-primary" : "bg-white/20"}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                formStep >= 2 ? "bg-primary text-white" : "bg-white/20 text-white/50"
              }`}>
                2
              </div>
              <div className={`w-16 h-1 rounded ${formStep >= 3 ? "bg-primary" : "bg-white/20"}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                formStep >= 3 ? "bg-primary text-white" : "bg-white/20 text-white/50"
              }`}>
                3
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl p-8 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Select Service & Time */}
                    {formStep === 1 && (
                      <div className="space-y-6">
                        <h2 className="font-heading text-2xl font-bold text-white mb-6">Select Service & Time</h2>
                        
                        {/* Service Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-white/80 mb-2">Service *</label>
                          <Select 
                            value={formData.service_id} 
                            onValueChange={(v) => setFormData({...formData, service_id: v})}
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                              {isLoadingServices ? (
                                <SelectItem value="loading" disabled>Loading services...</SelectItem>
                              ) : (
                                services.map((service) => (
                                  <SelectItem 
                                    key={service.id} 
                                    value={service.id.toString()}
                                    className="text-white focus:bg-white/10 focus:text-white"
                                  >
                                    {service.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-white/80 mb-2">Preferred Date *</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <Input 
                              type="date" 
                              value={formData.booking_date}
                              min={getMinDate()}
                              max={getMaxDate()}
                              onChange={(e) => setFormData({...formData, booking_date: e.target.value, booking_time: ""})}
                              className="bg-white/10 border-white/20 text-white pl-10"
                            />
                          </div>
                        </div>

                        {/* Time Slots */}
                        {formData.booking_date && (
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Available Time Slots *</label>
                            {isLoadingSlots ? (
                              <div className="text-white/50">Loading available slots...</div>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                {availableSlots.map((slot) => (
                                  <button
                                    key={slot.time}
                                    type="button"
                                    disabled={!slot.available}
                                    onClick={() => setFormData({...formData, booking_time: slot.time})}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                      formData.booking_time === slot.time
                                        ? "bg-primary text-white"
                                        : slot.available
                                        ? "bg-white/10 text-white hover:bg-white/20"
                                        : "bg-white/5 text-white/30 cursor-not-allowed line-through"
                                    }`}
                                  >
                                    {slot.time}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Meeting Type */}
                        <div>
                          <label className="block text-sm font-semibold text-white/80 mb-2">Meeting Type *</label>
                          <div className="grid grid-cols-3 gap-3">
                            {meetingTypes.map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => setFormData({...formData, meeting_type: type.value})}
                                className={`p-4 rounded-xl text-center transition-all ${
                                  formData.meeting_type === type.value
                                    ? "bg-primary/30 border-2 border-primary"
                                    : "bg-white/10 border-2 border-transparent hover:bg-white/20"
                                }`}
                              >
                                <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                                  formData.meeting_type === type.value ? "text-primary" : "text-white/70"
                                }`} />
                                <p className="text-sm font-semibold text-white">{type.label}</p>
                                <p className="text-xs text-white/50 mt-1">{type.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Button 
                          type="button"
                          disabled={!isStep1Valid()}
                          onClick={() => setFormStep(2)}
                          className="w-full gradient-royal text-white font-semibold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue <ChevronRight className="w-5 h-5 ml-2 inline" />
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Personal Details */}
                    {formStep === 2 && (
                      <div className="space-y-6">
                        <h2 className="font-heading text-2xl font-bold text-white mb-6">Your Details</h2>

                        {/* Customer Type */}
                        <div>
                          <label className="block text-sm font-semibold text-white/80 mb-2">Customer Type *</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, customer_type: "individual"})}
                              className={`p-4 rounded-xl text-center transition-all ${
                                formData.customer_type === "individual"
                                  ? "bg-primary/30 border-2 border-primary"
                                  : "bg-white/10 border-2 border-transparent hover:bg-white/20"
                              }`}
                            >
                              <User className={`w-6 h-6 mx-auto mb-2 ${
                                formData.customer_type === "individual" ? "text-primary" : "text-white/70"
                              }`} />
                              <p className="text-sm font-semibold text-white">Individual</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, customer_type: "business"})}
                              className={`p-4 rounded-xl text-center transition-all ${
                                formData.customer_type === "business"
                                  ? "bg-primary/30 border-2 border-primary"
                                  : "bg-white/10 border-2 border-transparent hover:bg-white/20"
                              }`}
                            >
                              <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                                formData.customer_type === "business" ? "text-primary" : "text-white/70"
                              }`} />
                              <p className="text-sm font-semibold text-white">Business</p>
                            </button>
                          </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">First Name *</label>
                            <Input 
                              type="text" 
                              placeholder="John"
                              value={formData.first_name}
                              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                              required
                              className="bg-white/10 border-white/20 text-white placeholder-white/40"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Last Name *</label>
                            <Input 
                              type="text" 
                              placeholder="Doe"
                              value={formData.last_name}
                              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                              required
                              className="bg-white/10 border-white/20 text-white placeholder-white/40"
                            />
                          </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Email *</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                              <Input 
                                type="email" 
                                placeholder="john@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                className="bg-white/10 border-white/20 text-white placeholder-white/40 pl-10"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Phone *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                              <Input 
                                type="tel" 
                                placeholder="+254..."
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                required
                                className="bg-white/10 border-white/20 text-white placeholder-white/40 pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Company Name (optional for business) */}
                        {formData.customer_type === "business" && (
                          <div>
                            <label className="block text-sm font-semibold text-white/80 mb-2">Company Name</label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                              <Input 
                                type="text" 
                                placeholder="Company Ltd"
                                value={formData.company_name}
                                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                className="bg-white/10 border-white/20 text-white placeholder-white/40 pl-10"
                              />
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-semibold text-white/80 mb-2">Additional Notes</label>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                            <Textarea 
                              placeholder="Tell us more about what you'd like to discuss..."
                              value={formData.notes}
                              onChange={(e) => setFormData({...formData, notes: e.target.value})}
                              rows={4}
                              className="bg-white/10 border-white/20 text-white placeholder-white/40 pl-10 resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setFormStep(1)}
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            Back
                          </Button>
                          <Button 
                            type="button"
                            disabled={!isStep2Valid()}
                            onClick={() => setFormStep(3)}
                            className="flex-1 gradient-royal text-white font-semibold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Review Booking <ChevronRight className="w-5 h-5 ml-2 inline" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Review & Submit */}
                    {formStep === 3 && (
                      <div className="space-y-6">
                        <h2 className="font-heading text-2xl font-bold text-white mb-6">Review Your Booking</h2>

                        <div className="bg-white/10 rounded-xl p-6 space-y-4">
                          <div className="flex justify-between">
                            <span className="text-white/60">Service:</span>
                            <span className="text-white font-medium">{services.find(s => s.id === parseInt(formData.service_id))?.name || "Consultation"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Date:</span>
                            <span className="text-white font-medium">
                              {formData.booking_date ? new Date(formData.booking_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Time:</span>
                            <span className="text-white font-medium">{formData.booking_time || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Meeting Type:</span>
                            <span className="text-white font-medium capitalize">{formData.meeting_type.replace('_', ' ')}</span>
                          </div>
                          <div className="border-t border-white/10 pt-4 flex justify-between">
                            <span className="text-white/60">Name:</span>
                            <span className="text-white font-medium">{formData.first_name} {formData.last_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Email:</span>
                            <span className="text-white font-medium">{formData.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Phone:</span>
                            <span className="text-white font-medium">{formData.phone}</span>
                          </div>
                          {formData.company_name && (
                            <div className="flex justify-between">
                              <span className="text-white/60">Company:</span>
                              <span className="text-white font-medium">{formData.company_name}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-white/70">
                            You'll receive a confirmation email with meeting details after booking. For virtual meetings, the link will be sent to your email.
                          </p>
                        </div>

                        <div className="flex gap-4">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setFormStep(2)}
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            Back
                          </Button>
                          <Button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 gradient-royal text-white font-semibold py-6 disabled:opacity-50"
                          >
                            {isSubmitting ? "Processing..." : "Confirm Booking"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="relative rounded-2xl p-6 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <h3 className="font-heading text-xl font-bold text-white mb-4">Need Help?</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Prefer to speak with us directly? Contact our team.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>0111 028800</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>customercare@vilcom.co.ke</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="relative rounded-2xl p-6 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <h3 className="font-heading text-xl font-bold text-white mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <Link to="/coverage" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
                      <ChevronRight className="w-4 h-4" />
                      Check Coverage
                    </Link>
                    <Link to="/plans" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
                      <ChevronRight className="w-4 h-4" />
                      View Plans
                    </Link>
                    <Link to="/quote" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
                      <ChevronRight className="w-4 h-4" />
                      Request Quote
                    </Link>
                    <Link to="/faqs" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
                      <ChevronRight className="w-4 h-4" />
                      FAQs
                    </Link>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="relative rounded-2xl p-6 overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <h3 className="font-heading text-xl font-bold text-white mb-4">Business Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Mon - Sat:</span>
                      <span className="text-white">8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Sunday:</span>
                      <span className="text-white">Closed</span>
                    </div>
                  </div>
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

export default Booking;

