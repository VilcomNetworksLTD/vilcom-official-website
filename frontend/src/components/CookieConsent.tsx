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
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] hover:from-[hsl(220,80%,55%)] hover:to-[hsl(220,60%,45%)] text-white shadow-2xl shadow-[hsl(220,80%,50%)/40] flex items-center justify-center transition-all hover:scale-110 animate-in slide-in-from-bottom-5 fade-in duration-300"
          aria-label="Cookie Settings"
        >
          <Cookie className="w-8 h-8" />
        </button>
      </div>
    );
  }

  // Floating button to reopen settings
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] hover:from-[hsl(220,80%,55%)] hover:to-[hsl(220,60%,45%)] text-white shadow-xl shadow-[hsl(220,80%,50%)/30] flex items-center justify-center transition-all hover:scale-110"
          aria-label="Cookie Settings"
        >
          <Cookie className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dialog - Centered with Glassmorphism */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl animate-in zoom-in-95 fade-in duration-300 backdrop-blur-md"
        style={glassCardStyle}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.05)' }} />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white/70" />
        </button>

        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl gradient-royal flex items-center justify-center shadow-lg">
              <Cookie className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-extrabold text-white">Customize Consent Preferences</h2>
              <p className="text-white/70 font-semibold">Manage your cookie preferences for this website</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-8 pb-6 overflow-y-auto max-h-[50vh]">
          <p className="text-white/80 font-semibold mb-6 text-lg">
            We use cookies to help you navigate efficiently and perform certain functions. 
            You will find detailed information about all cookies under each consent category below.
          </p>

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-[hsl(200,90%,75%)] hover:text-[hsl(200,90%,85%)] mb-6 font-semibold"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-5 h-5" />
                Show less details
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                Show cookie details
              </>
            )}
          </button>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {Object.entries(cookieDescriptions).map(([key, description]) => {
              const k = key as keyof CookiePreferences;
              return (
                <div 
                  key={k} 
                  className={`rounded-2xl p-5 transition-all backdrop-blur-sm ${
                    showDetails 
                      ? "bg-white/5 border border-white/10" 
                      : "bg-white/5 border border-transparent opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-white capitalize">{k}</span>
                    {k === "necessary" ? (
                      <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full">
                        Always Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggle(k)}
                        className={`w-14 h-7 rounded-full transition-colors relative ${
                          preferences[k] ? "bg-gradient-to-r from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)]" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            preferences[k] ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  <p className={`text-base text-white/60 font-medium transition-all ${showDetails ? "block" : "hidden"}`}>
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative p-8 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleRejectAll}
              className="px-8 py-3 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            >
              REJECT ALL
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-8 py-3 rounded-full text-base font-bold text-white bg-transparent hover:bg-white/10 border border-white/30 transition-all"
            >
              SAVE MY PREFERENCES
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-8 py-3 rounded-full text-base font-bold text-white bg-gradient-to-r from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] hover:from-[hsl(220,80%,55%)] hover:to-[hsl(220,60%,45%)] shadow-xl shadow-[hsl(220,80%,50%)/40] transition-all"
            >
              ACCEPT ALL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

