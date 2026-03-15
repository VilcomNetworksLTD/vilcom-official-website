import { useState, useEffect } from "react";
import { MessageCircle, X, Send, User, Mail, Phone } from "lucide-react";
import whatsappService, { WhatsAppOption } from "@/services/whatsapp";

const LOCAL_WHATSAPP_NUMBER = "0726888777"; // Your local format number

// Glassmorphism style matching the project
const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
};

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<WhatsAppOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<WhatsAppOption | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await whatsappService.getOptions();
        if (response.data.success) {
          setOptions(response.data.data);
          // You could also set whatsapp number dynamically here if API returns it:
          // const fetchedNumber = response.data.whatsapp_number || LOCAL_WHATSAPP_NUMBER;
        }
      } catch (error) {
        console.error("Failed to load WhatsApp options:", error);
      }
    };

    if (isOpen && options.length === 0) {
      loadOptions();
    }
  }, [isOpen, options.length]);

  const handleOptionSelect = (option: WhatsAppOption) => {
    setSelectedOption(option);
    setShowCustomInput(true);
    setCustomMessage(option.description);
  };

  const getInternationalNumber = () => {
    // Convert 07xxxxxxxx → 2547xxxxxxxx
    return "254" + LOCAL_WHATSAPP_NUMBER.replace(/^0/, "");
  };

const buildWhatsAppMessage = () => {
  const parts = [];

  if (name.trim()) parts.push(`Name: ${name.trim()}`);
  if (phone.trim()) parts.push(`Phone: ${phone.trim()}`);
  if (email.trim()) parts.push(`Email: ${email.trim()}`);

  // Add the selected option title + description (if any)
  if (selectedOption) {
    parts.push(`${selectedOption.title}\n${selectedOption.description}`);
  }

  // Only add customMessage if:
  // - No option was selected (pure custom)
  // - OR the user actually changed/added something beyond the default description
  if (!selectedOption || customMessage.trim() !== selectedOption.description) {
    if (customMessage.trim()) {
      parts.push(customMessage.trim());
    }
  }

  return parts.filter(Boolean).join("\n\n");
};

  const handleSendMessage = async () => {
    if (!customMessage.trim()) return;

    setIsLoading(true);

    const internationalNumber = getInternationalNumber();
    const fullMessage = buildWhatsAppMessage();

    try {
      // Log to backend
      await whatsappService.logMessage({
        message: fullMessage, // log the full context version
        message_type: selectedOption?.id === 'other' ? 'custom' : 'predefined',
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        page_url: window.location.href,
      });

      // Open WhatsApp with pre-filled message
      whatsappService.openWhatsApp(internationalNumber, fullMessage);

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to log message:", error);

      // Fallback: still open WhatsApp even if logging fails
      whatsappService.openWhatsApp(internationalNumber, fullMessage);

      resetForm();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomMessage = () => {
    setSelectedOption(null);
    setShowCustomInput(true);
    setCustomMessage("");
  };

  const resetForm = () => {
    setSelectedOption(null);
    setCustomMessage("");
    setShowCustomInput(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  // Floating button (when modal is closed)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(145,80%,40%)] to-[hsl(145,60%,30%)] hover:from-[hsl(145,80%,45%)] hover:to-[hsl(145,60%,35%)] text-white shadow-2xl shadow-[hsl(145,80%,40%)/40] flex items-center justify-center transition-all hover:scale-110 animate-in slide-in-from-bottom-5 fade-in duration-300"
          aria-label="Contact us on WhatsApp"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div 
        className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl animate-in zoom-in-95 fade-in duration-300 backdrop-blur-md"
        style={glassCardStyle}
      >
        <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.05)' }} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white/70" />
        </button>

        {/* Header */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(145,80%,40%)] to-[hsl(145,60%,30%)] flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-white">Chat on WhatsApp</h2>
              <p className="text-white/70 font-semibold text-sm">Choose an option or type your message</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-6 pb-4 overflow-y-auto max-h-[50vh]">
          {!showCustomInput ? (
            <div className="space-y-3">
              <p className="text-white/60 text-sm mb-4">
                Select a topic to get started. Your message will be pre-filled in WhatsApp.
              </p>
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left"
                >
                  <span className="text-white font-bold">{option.title}</span>
                  <p className="text-white/60 text-sm mt-1">{option.description}</p>
                </button>
              ))}

              <button
                onClick={handleCustomMessage}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-[hsl(145,80%,40%)] to-[hsl(145,60%,30%)] hover:opacity-90 transition-all text-center"
              >
                <span className="text-white font-bold">Type Your Own Message</span>
                <p className="text-white/80 text-sm mt-1">Send us a custom inquiry</p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-white/70 text-sm font-semibold block mb-2">
                  Your Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:border-[hsl(145,80%,40%)] resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <label className="text-white/50 text-xs font-semibold flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" /> Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <label className="text-white/50 text-xs font-semibold flex items-center gap-1 mb-1">
                    <Phone className="w-3 h-3" /> Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0722 000 000"
                    className="w-full bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <label className="text-white/50 text-xs font-semibold flex items-center gap-1 mb-1">
                  <Mail className="w-3 h-3" /> Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-transparent border-none text-white text-sm placeholder-white/30 focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setSelectedOption(null);
                }}
                className="text-white/60 hover:text-white text-sm font-semibold"
              >
                ← Choose different topic
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showCustomInput && (
          <div className="relative p-6 pt-4 border-t border-white/10">
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!customMessage.trim() || isLoading}
                className="flex-1 px-6 py-3 rounded-full text-base font-bold text-white bg-gradient-to-r from-[hsl(145,80%,40%)] to-[hsl(145,60%,30%)] hover:opacity-90 shadow-xl shadow-[hsl(145,80%,40%)/40] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send to WhatsApp
                  </>
                )}
              </button>
            </div>
            <p className="text-white/50 text-xs text-center mt-3">
              Opens WhatsApp with your message pre-filled — just tap Send
            </p>
          </div>
        )}
      </div>
    </div>
  );
}