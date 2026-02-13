import { useState } from "react";
import { ChevronDown, ChevronUp, Search, HelpCircle, Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

interface FAQItem {
  question: string;
  answer: string;
}

const faqCategories = [
  {
    name: "General",
    icon: HelpCircle,
    faqs: [
      {
        question: "What is Vilcom Networks?",
        answer: "Vilcom Networks is a leading Internet Service Provider (ISP) in Kenya, offering high-speed fiber internet solutions for both residential and business customers. We provide reliable, fast, and affordable internet connectivity across multiple regions in Kenya.",
      },
      {
        question: "What areas do you cover?",
        answer: "We currently provide fiber internet services in Nairobi, Mombasa, Kisumu, and surrounding areas. We're continuously expanding our coverage. You can check our coverage map to see if your location is within our service area.",
      },
      {
        question: "How do I sign up for Vilcom services?",
        answer: "You can sign up easily by clicking on the 'Get Started' button on our website, calling our sales team, or visiting our office. Our team will help you choose the best plan for your needs and schedule installation.",
      },
      {
        question: "What makes Vilcom different from other ISPs?",
        answer: "Vilcom Networks stands out for our commitment to quality, reliability, and customer service. We offer 99.9% network uptime, 24/7 technical support, competitive pricing, and fast installation times. Our local presence and understanding of Kenyan connectivity needs set us apart.",
      },
    ],
  },
  {
    name: "Internet Plans & Pricing",
    icon: HelpCircle,
    faqs: [
      {
        question: "What internet plans do you offer?",
        answer: "We offer a variety of plans for both home and business users, ranging from 10 Mbps to 1 Gbps. Our home plans start at KES 999/month, while business plans start at KES 5,000/month with additional features like SLA guarantees and static IPs.",
      },
      {
        question: "Are there any installation fees?",
        answer: "We offer free standard installation for all new customers on annual contracts. For monthly contracts, a small installation fee may apply. This includes professional setup and configuration of your connection.",
      },
      {
        question: "Can I upgrade my plan later?",
        answer: "Absolutely! You can upgrade your plan at any time. Contact our customer service or log into your account to request an upgrade. The change usually takes effect within 24-48 hours, and we'll prorate any difference in pricing.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept M-Pesa, bank transfers, credit/debit cards, and cash payments at our offices. You can also set up automatic monthly payments for convenience.",
      },
    ],
  },
  {
    name: "Technical Support",
    icon: HelpCircle,
    faqs: [
      {
        question: "How do I contact technical support?",
        answer: "You can reach our technical support team 24/7 through our emergency hotline at +254 700 999 999, via email at support@vilcom.co.ke, or through our live chat feature on the website.",
      },
      {
        question: "What should I do if my internet is not working?",
        answer: "First, try restarting your router by unplugging it for 30 seconds and plugging it back in. Check all cable connections to ensure they're secure. If the issue persists, contact our technical support for assistance.",
      },
      {
        question: "How long does it take to get a technician on-site?",
        answer: "For standard issues, we aim to resolve problems remotely within 2 hours. If an on-site visit is required, our technicians typically arrive within 24-48 hours, depending on your location and the complexity of the issue. Business customers with SLA get priority response times.",
      },
      {
        question: "Do you offer Wi-Fi services or only wired connections?",
        answer: "We provide both wired (Ethernet) and Wi-Fi connections. All our router packages include Wi-Fi capability, and we can also set up mesh Wi-Fi systems for larger homes and offices to ensure complete coverage.",
      },
    ],
  },
  {
    name: "Service & Installation",
    icon: HelpCircle,
    faqs: [
      {
        question: "How long does installation take?",
        answer: "For areas with existing fiber infrastructure, installation is typically completed within 48 hours of your order. For new areas, installation may take 5-7 business days. Same-day installation is available for select business plans.",
      },
      {
        question: "What equipment do you provide?",
        answer: "We provide a high-quality router suitable for your plan. Home plans include a standard Wi-Fi router, while business plans include more advanced managed routers. Mesh Wi-Fi systems are available as add-ons for enhanced coverage.",
      },
      {
        question: "Can I use my own router?",
        answer: "Yes, you can use your own router if it's compatible with our network. However, for optimal performance and to receive full technical support, we recommend using our provided equipment. Our team can help you configure third-party routers.",
      },
      {
        question: "What is the contract term?",
        answer: "We offer both monthly and annual contract options. Annual contracts come with benefits like free installation, discounted rates, and priority support. Monthly contracts offer flexibility but may have higher rates.",
      },
    ],
  },
  {
    name: "Billing & Accounts",
    icon: HelpCircle,
    faqs: [
      {
        question: "When will I be billed?",
        answer: "Billing is done on a monthly basis. Your first invoice will be prorated based on your installation date, and subsequent invoices are generated on the same date each month. You can view all invoices in your online account portal.",
      },
      {
        question: "How do I view my bills?",
        answer: "Log into your account on our website or mobile app to view and download your bills. We also send monthly email invoices. For business customers, we can provide detailed monthly reports.",
      },
      {
        question: "What is your refund policy?",
        answer: "We don't offer refunds for prepaid services. However, if we fail to deliver the agreed-upon service level, we may credit your account based on our service level agreement terms.",
      },
      {
        question: "How do I cancel my service?",
        answer: "To cancel service, contact our customer service team at least 30 days before your desired cancellation date. Early termination fees may apply for annual contracts. You'll need to return any rented equipment to avoid additional charges.",
      },
    ],
  },
];

const FAQs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0);

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
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
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              Frequently Asked <span className="text-sky-700">Questions</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-lg font-medium">
              Find answers to common questions about our services, plans, and support. Can't find what you're looking for? Contact our team.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 bg-white/80 border-white/30 text-lg focus:border-sky-500 focus:ring-sky-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-12 max-w-4xl mx-auto">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h2 className="font-heading text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <category.icon className="w-6 h-6 text-sky-600" />
                  {category.name}
                </h2>
                <div className="space-y-3">
                  {category.faqs.map((faq, index) => {
                    const itemKey = `${category.name}-${index}`;
                    const isOpen = openItems[itemKey];
                    
                    return (
                      <div
                        key={index}
                        className="glass-sky rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full flex items-center justify-between p-5 text-left"
                        >
                          <span className="font-semibold text-slate-800 pr-4">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-sky-600 shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-sky-600 shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5">
                            <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-slate-400">Try different keywords or contact our support team</p>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16">
            <div className="glass-sky rounded-2xl p-8 max-w-3xl mx-auto text-center">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-4">
                Still Have Questions?
              </h2>
              <p className="text-slate-600 mb-6">
                Our support team is here to help you with any questions not covered above.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Us
                </Link>
                <a
                  href="tel:+254700000000"
                  className="inline-flex items-center gap-2 px-6 py-3 glass-crystal text-slate-700 font-semibold rounded-xl hover:bg-white/80 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
                <a
                  href="mailto:support@vilcom.co.ke"
                  className="inline-flex items-center gap-2 px-6 py-3 glass-crystal text-slate-700 font-semibold rounded-xl hover:bg-white/80 transition-all"
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
