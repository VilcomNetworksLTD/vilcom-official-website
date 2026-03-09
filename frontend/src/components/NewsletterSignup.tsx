import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { leadsApi } from "@/services/leads";
import { useLeadTracker } from "@/hooks/useLeadTracker";

interface NewsletterSignupProps {
  className?: string;
  variant?: "default" | "inline";
}

export const NewsletterSignup = ({ className = "", variant = "default" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { getVisitorId, deviceType } = useLeadTracker();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const vlcVid = getVisitorId();
      await leadsApi.newsletter({
        vlc_vid: vlcVid || undefined,
        email,
        device_type: deviceType,
      });
      
      setMessage({ type: "success", text: "Thank you for subscribing!" });
      setEmail("");
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "..." : "Subscribe"}
        </Button>
        {message && (
          <span className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </span>
        )}
      </form>
    );
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email for updates"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Subscribe"}
          </Button>
        </div>
        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default NewsletterSignup;

