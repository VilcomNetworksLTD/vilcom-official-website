import { ReactNode, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { leadsApi } from "@/services/leads";
import { useLeadTracker } from "@/hooks/useLeadTracker";

interface PlanCTAButtonProps {
  productId?: number;
  productSlug?: string;
  children?: ReactNode;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  asChild?: boolean;
  navigateTo?: string;
}

export const PlanCTAButton = ({
  productId,
  productSlug,
  children = "Get Started",
  variant = "default",
  size = "default",
  className = "",
  asChild = false,
  navigateTo,
}: PlanCTAButtonProps) => {
  const navigate = useNavigate();
  const { getVisitorId, getUTM, deviceType } = useLeadTracker();

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      // Get lead tracking data
      const vlcVid = getVisitorId();
      const utm = getUTM();

      // Capture lead silently before navigation
      try {
        await leadsApi.capture({
          vlc_vid: vlcVid || undefined,
          source: "plan_cta",
          product_id: productId,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          device_type: deviceType,
        });
      } catch (error) {
        // Silently fail - don't block navigation
        console.error("Failed to capture lead:", error);
      }

      // Navigate after lead capture (non-blocking)
      if (navigateTo) {
        navigate(navigateTo);
      }
    },
    [getVisitorId, getUTM, deviceType, productId, navigate, navigateTo]
  );

  // If navigateTo is provided, wrap in Link or navigate programmatically
  if (navigateTo) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        asChild={asChild}
        onClick={handleClick}
      >
        <Link to={navigateTo}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      asChild={asChild}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export default PlanCTAButton;

