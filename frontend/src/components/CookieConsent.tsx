import { useState, useEffect } from "react";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  advertisement: boolean;
}

const COOKIE_KEY = "vilcom_cookie_consent";

const defaultPreferences: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  performance: false,
  advertisement: false,
};

const cookieDescriptions: Record<keyof CookiePreferences, string> = {
  necessary:
    "Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.",
  functional:
    "Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.",
  analytics:
    "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.",
  performance:
    "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
  advertisement:
    "Advertisement cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns.",
};

// Glassmorphism style matching ContactUs page
const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
};

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showDetails, setShowDetails] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_KEY);
    if (savedConsent) {
      setPreferences(JSON.parse(savedConsent));
      setHasConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      performance: true,
      advertisement: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem(COOKIE_KEY, JSON.stringify(allAccepted));
    setIsOpen(false);
    setHasConsent(true);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      performance: false,
      advertisement: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem(COOKIE_KEY, JSON.stringify(onlyNecessary));
    setIsOpen(false);
    setHasConsent(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(preferences));
    setIsOpen(false);
    setHasConsent(true);
  };

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Show floating button if no consent yet
  if (!hasConsent && !isOpen) {
    return (
      <div className="fixed bottom-6 left-4 sm:left-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] hover:from-[hsl(220,80%,55%)] hover:to-[hsl(220,60%,45%)] text-white shadow-2xl shadow-[hsl(220,80%,50%)/40] flex items-center justify-center transition-all hover:scale-110 animate-in slide-in-from-bottom-5 fade-in duration-300"
          aria-label="Cookie Settings"
        >
          <Cookie className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>
    );
  }

  // Floating button to reopen settings
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-4 sm:left-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] hover:from-[hsl(220,80%,55%)] hover:to-[hsl(220,60%,45%)] text-white shadow-xl shadow-[hsl(220,80%,50%)/30] flex items-center justify-center transition-all hover:scale-110"
          aria-label="Cookie Settings"
        >
          <Cookie className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dialog - Centered with Glassmorphism - Mobile Responsive */}
      <div 
        className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl animate-in zoom-in-95 fade-in duration-300 backdrop-blur-md"
        style={glassCardStyle}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl" style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.05)' }} />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
        </button>

        {/* Header */}
        <div className="relative p-5 sm:p-8 pb-4 sm:pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-royal flex items-center justify-center shadow-lg">
              <Cookie className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Customize Consent Preferences</h2>
              <p className="text-white/70 font-semibold text-sm sm:text-base">Manage your cookie preferences</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 overflow-y-auto max-h-[45vh] sm:max-h-[50vh]">
          <p className="text-white/80 font-semibold mb-4 sm:mb-6 text-sm sm:text-lg">
            We use cookies to help you navigate efficiently and perform certain functions. 
          </p>

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-[hsl(200,90%,75%)] hover:text-[hsl(200,90%,85%)] mb-4 sm:mb-6 font-semibold text-sm"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Show less details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                Show cookie details
              </>
            )}
          </button>

          {/* Cookie Categories */}
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(cookieDescriptions).map(([key, description]) => {
              const k = key as keyof CookiePreferences;
              return (
                <div 
                  key={k} 
                  className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all backdrop-blur-sm ${
                    showDetails 
                      ? "bg-white/5 border border-white/10" 
                      : "bg-white/5 border border-transparent opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base sm:text-lg font-bold text-white capitalize">{k}</span>
                    {k === "necessary" ? (
                      <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 sm:px-3 py-1 rounded-full">
                        Always Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggle(k)}
                        className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-colors relative ${
                          preferences[k] ? "bg-gradient-to-r from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)]" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 sm:top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-md transition-transform ${
                            preferences[k] ? "translate-x-7 sm:translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  <p className={`text-sm sm:text-base text-white/60 font-medium transition-all ${showDetails ? "block" : "hidden"}`}>
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Responsive stacking */}
        <div className="relative p-4 sm:p-8 pt-3 sm:pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <button
              onClick={handleRejectAll}
              className="px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all order-3 sm:order-1"
            >
              REJECT ALL
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold text-white bg-transparent hover:bg-white/10 border border-white/30 transition-all order-2 sm:order-2"
            >
              SAVE MY PREFERENCES
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] hover:from-[hsl(220,80%,55%)] hover:to-[hsl(220,60%,45%)] shadow-xl shadow-[hsl(220,80%,50%)/40] transition-all order-1 sm:order-3"
            >
              ACCEPT ALL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

