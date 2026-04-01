import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackVisit } from "@/services/analytics";

export default function VisitorTracker() {
  const location = useLocation();
  const previousUrl = useRef(document.referrer);

  useEffect(() => {
    // Reconstruct full URL path for better tracking
    const currentUrl = window.location.origin + location.pathname + location.search;
    
    // Ignore dashboard routes for public tracking (optional, but good practice)
    if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/staff') && !location.pathname.startsWith('/client')) {
      trackVisit(currentUrl, previousUrl.current);
    }
    
    // Update referrer to current URL for the next navigation within SPA
    previousUrl.current = currentUrl;
  }, [location]);

  return null; // This is a silent observer component
}
