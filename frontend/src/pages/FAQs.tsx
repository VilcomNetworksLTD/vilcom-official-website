import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, HelpCircle, Phone, MessageCircle, Mail, Wifi, CreditCard, Wrench, Package, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

interface FAQItem {
  question: string;
  answer: string[];
}

const faqCategories = [
  {
    name: "General",
    icon: HelpCircle,
    faqs: [
      {
        question: "What is Vilcom Networks?",
        answer: [
          "Vilcom Networks is an Internet Service Provider (ISP) based in Kenya.",
          "We offer fibre internet for both home and business customers.",
          "Additional services include wireless hotspots and web hosting.",
        ],
      },
      {
        question: "What areas do you cover?",
        answer: [
          "Nairobi areas: Kileleshwa, Kilimani, South C, Muthangari, Westlands, Ruiru.",
          "Other towns: Nakuru, Rongai, Mombasa, Kakamega, Meru, Eldoret, Bungoma, Lodwar.",
          "Share your location with us on WhatsApp for coverage confirmation.",
        ],
      },
      {
        question: "How do I sign up for Vilcom services?",
        answer: [
          "Call or email us with your details.",
          "A sales agent will reach out to create your Vilcom account.",
          "A technician is dispatched to install your connection — typically within 48 hours.",
        ],
      },
      {
        question: "How do I contact Vilcom support?",
        answer: [
          "Safaricom: 0111 028800 (Helpline Call Only).",
          "Safaricom: 0726888777 (WhatsApp).",
          "Airtel: 0755055555 (WhatsApp/SMS).",
          "Email: customercare@vilcom.co.ke.",
          "Social media: @vilcomnetworks on Facebook, Instagram, and Twitter.",
        ],
      },
    ],
  },
  {
    name: "Packages & Pricing",
    icon: Package,
    faqs: [
      {
        question: "What home packages do you offer?",
        answer: [
          "8 Mbps — KES 1,999/month",
          "18 Mbps — KES 2,799/month",
          "30 Mbps — KES 3,799/month",
          "60 Mbps — KES 4,999/month",
          "100 Mbps — KES 7,999/month",
          "500 Mbps — KES 11,999/month",
        ],
      },
      {
        question: "What business packages do you offer?",
        answer: [
          "All business packages are inclusive of VAT & Excise duty.",
          "40 Mbps — KES 4,999/month",
          "80 Mbps — KES 6,999/month",
          "120 Mbps — KES 12,999/month",
          "200 Mbps — KES 20,999/month",
          "300 Mbps — KES 29,999/month",
          "500 Mbps — KES 38,999/month",
        ],
      },
      {
        question: "Can I upgrade or downgrade my package?",
        answer: [
          "Yes — upgrades and downgrades can be requested at any time.",
          "Contact us via call, WhatsApp, or email.",
          "Our team will facilitate the change on your account.",
        ],
      },
      {
        question: "Are there any pre-payment benefits?",
        answer: [
          "Pre-pay for 6 months → get 1 month free.",
          "Pre-pay for 12 months → get 2 months free.",
          "Contact us to arrange a pre-payment.",
        ],
      },
    ],
  },
  {
    name: "Payment & Billing",
    icon: CreditCard,
    faqs: [
      {
        question: "How do I pay for my subscription?",
        answer: [
          "M-Pesa Paybill: 4062755 — use your account number (210**** or 211****).",
          "Your account number is in your installation email titled 'New customer signup'.",
          "Bank: Account 2043645032, Absa Bank Kenya, Westgate Branch.",
          "For bank payments, email a scanned copy of the slip with your account number.",
        ],
      },
      {
        question: "How does the billing cycle work?",
        answer: [
          "Billing is on an anniversary basis — you pay on the same date each month.",
          "Example: if you pay on the 25th, next payment is due the 25th of the following month.",
          "Late payments will shift your billing date accordingly.",
          "Make early payments to avoid any service interruptions.",
        ],
      },
      {
        question: "What should I do if I make a wrong payment?",
        answer: [
          "Contact us immediately via our helpline numbers.",
          "We will investigate and rectify the error within the shortest time possible.",
        ],
      },
      {
        question: "Are there any current offers or promotions?",
        answer: [
          "Offers are issued occasionally — check our social media @vilcomnetworks.",
          "Two types: 50% discount (pay half) or 100% discount (pay full, get service free).",
          "Eligible customers receive an SMS from the VILCOM team directly.",
          "We currently do not have a referral programme.",
        ],
      },
    ],
  },
  {
    name: "Technical Support",
    icon: Wrench,
    faqs: [
      {
        question: "What should I do if my internet is not working?",
        answer: [
          "Check if the LOS (Loss of Signal) red indicator on your router is blinking — this means a fiber issue.",
          "Try unplugging the slim patch cord at the back of your router and plugging it back in.",
          "If the indicator stops blinking, the issue is resolved.",
          "If it persists, contact our support team immediately.",
        ],
      },
      {
        question: "How do I test my internet speed?",
        answer: [
          "Visit speedtest.net on your browser.",
          "Run the test close to your router with only one device connected.",
          "A good result is 50–100% of your subscribed package speed.",
          "If speeds are consistently lower, contact us for troubleshooting.",
        ],
      },
      {
        question: "How do I change my WiFi password or username?",
        answer: [
          "Contact us via helpline or WhatsApp to request the change.",
          "Alternatively, log in to https://mobile.vilcom.co.ke (link sent after installation).",
          "Your new password must be at least 8 characters long.",
        ],
      },
      {
        question: "My internet keeps lagging — what should I do?",
        answer: [
          "Too many connected devices is a common cause of lagging.",
          "Contact us — we can help check which devices are on your network.",
          "Change your password to remove unauthorized users.",
          "Be cautious: modern phones can share your WiFi via QR code without revealing the password.",
        ],
      },
    ],
  },
  {
    name: "Installation & Equipment",
    icon: Wifi,
    faqs: [
      {
        question: "How long does installation take?",
        answer: [
          "Standard installation is completed within 48 hours of sign-up.",
          "We always strive to connect clients on the same day of onboarding.",
          "In special cases it may take longer — we will inform you of the new timeline.",
        ],
      },
      {
        question: "How do I return equipment if I'm discontinuing service?",
        answer: [
          "Contact us before discontinuing so we can arrange router pickup.",
          "A technician will be sent to collect the equipment.",
          "Unreturned equipment may attract additional charges.",
        ],
      },
      {
        question: "Can I relocate my connection to a new address?",
        answer: [
          "Yes — contact us or share your new live location via WhatsApp.",
          "To share: tap Attachment → Location → Live Location → send to us.",
          "We'll confirm coverage and raise a relocation ticket for our technicians.",
        ],
      },
      {
        question: "Can I suspend my service temporarily?",
        answer: [
          "Suspension is available for customers away for more than 10 days.",
          "Inform us of your proposed suspension dates in advance.",
          "Our team will process the suspension and reactivation accordingly.",
        ],
      },
    ],
  },
  {
    name: "Service & Outages",
    icon: AlertCircle,
    faqs: [
      {
        question: "What happens during a service outage?",
        answer: [
          "You'll receive an SMS about the issue and the resolution plan.",
          "A follow-up SMS is sent once the issue is resolved.",
          "If you don't receive an SMS, contact us to verify your registered number is correct.",
        ],
      },
      {
        question: "How long does a technician visit take to arrange?",
        answer: [
          "Report your issue — we'll advise if an on-site visit is needed.",
          "A repair ticket is raised and assigned to a technician.",
          "The technician will contact you directly to schedule the visit.",
          "If unresolved within 48 hours, contact support for a follow-up.",
        ],
      },
      {
        question: "How do I connect a Smart TV to my WiFi?",
        answer: [
          "Turn on your Smart TV.",
          "Go to Settings → Network Settings.",
          "Select Wireless (WiFi) and scan for networks.",
          "Choose your Vilcom WiFi name (SSID) from the list.",
          "Enter your WiFi password and connect.",
        ],
      },
      {
        question: "How can I improve my WiFi signal at home?",
        answer: [
          "Place your router in a central location in your home.",
          "Minimize walls, doors, and physical obstructions between devices and router.",
          "Reduce interference from other electronic devices.",
          "Consider WiFi extenders or a mesh system for larger spaces.",
        ],
      },
    ],
  },
];

// ─── Animated Accordion Item ────────────────────────────────────────────────
const AccordionItem = ({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Sync panel height whenever open state or content changes
  useEffect(() => {
    if (contentRef.current) {
      setPanelHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const cardBg = isOpen
    ? "rgba(255,255,255,0.11)"
    : hovered
    ? "rgba(255,255,255,0.10)"
    : "rgba(255,255,255,0.07)";

  const cardShadow = isOpen || hovered
    ? "0 12px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18)"
    : "0 2px 8px rgba(0,0,0,0.15)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: cardBg,
        backdropFilter: "blur(14px)",
        border: `1px solid ${isOpen ? "rgba(147,197,253,0.25)" : "rgba(255,255,255,0.11)"}`,
        boxShadow: cardShadow,
        transform: hovered && !isOpen ? "translateY(-2px)" : "translateY(0px)",
        transition:
          "background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* ── Question button ── */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span
          className="font-semibold text-white text-sm leading-snug"
          style={{ transition: "color 0.2s ease", color: isOpen ? "#e0f2fe" : "white" }}
        >
          {faq.question}
        </span>

        {/* Animated chevron badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            flexShrink: 0,
            background: isOpen ? "rgba(99,179,237,0.22)" : "rgba(255,255,255,0.09)",
            transition: "background 0.3s ease",
          }}
        >
          <ChevronDown
            style={{
              width: 16,
              height: 16,
              color: isOpen ? "#93c5fd" : "rgba(255,255,255,0.65)",
              transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1), color 0.3s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </span>
      </button>

      {/* ── Smooth-height answer panel ── */}
      <div
        style={{
          height: panelHeight,
          overflow: "hidden",
          transition: "height 0.42s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div ref={contentRef} className="px-5 pb-5">
          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.09)",
              marginBottom: 14,
            }}
          />

          {/* Bulleted answer lines */}
          <ul className="space-y-2.5">
            {faq.answer.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-white/80 text-sm leading-relaxed"
                style={{
                  animation: isOpen ? "faqFadeIn 0.35s ease forwards" : "none",
                  animationDelay: `${0.05 + i * 0.055}s`,
                  opacity: 0,
                }}
              >
                {/* Dot bullet */}
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "rgba(147,197,253,0.85)",
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keyframe injected once */}
      <style>{`
        @keyframes faqFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────
const FAQs = () => {
  useEffect(() => {
    document.title = "FAQs | Vilcom Networks Ltd";
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  // Exclusive accordion: only one item open across ALL categories
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenItem((prev) => (prev === key ? null : key));
  };

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />

      {/* Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
      <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
      <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <Navbar />
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white mb-6">
              Frequently Asked <span className="text-white">Questions</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg font-medium">
              Find answers to common questions about our services, plans, and support.
              Can't find what you're looking for? Contact our team.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(e.target.value);
                  setOpenItem(null);
                }}
                className="pl-12 pr-4 py-6 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg focus:border-sky-400 focus:ring-sky-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            </div>
          </div>

          {/* FAQ sections */}
          <div className="space-y-12 max-w-7xl mx-auto">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h2 className="font-heading text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <category.icon className="w-6 h-6 text-white" />
                  {category.name}
                </h2>

                {/* 2-column grid — items-start keeps cards from stretching */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                  {category.faqs.map((faq, index) => {
                    const key = `${category.name}-${index}`;
                    return (
                      <AccordionItem
                        key={key}
                        faq={faq}
                        isOpen={openItem === key}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/50 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-white/40">Try different keywords or contact our support team</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16">
            <div
              className="rounded-2xl p-8 max-w-3xl mx-auto text-center"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <h2 className="font-heading text-2xl font-bold text-white mb-4">
                Still Have Questions?
              </h2>
              <p className="text-white/70 mb-6">
                Our support team is here to help you with any questions not covered above.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Us
                </Link>
                <a
                  href="tel:0111028800"
                  className="inline-flex items-center gap-2 px-6 py-3 glass-crystal text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
                <a
                  href="mailto:customercare@vilcom.co.ke"
                  className="inline-flex items-center gap-2 px-6 py-3 glass-crystal text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Mail className="w-5 h-5" />
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default FAQs;