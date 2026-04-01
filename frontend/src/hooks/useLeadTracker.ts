import { useEffect, useRef, useCallback } from "react";
import { leadsApi } from "@/services/leads";

const COOKIE_NAME = "vlc_vid";
const COOKIE_DAYS = 365;

// ============================================
// API URL Helpers
// ============================================

/**
 * Returns the base URL without /api/v1 suffix
 * This matches the logic used in your axios configuration
 */
const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") return "";
  
  const envUrl = import.meta.env.VITE_API_URL || "";
  // Remove trailing /api/v1 if present
  return envUrl.replace(/\/api\/v1\/?$/, "");
};

/**
 * Returns the full API URL with /api/v1 prefix
 * Use this for all direct fetch/sendBeacon calls
 */
const getFullApiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return `${base}/api/v1/${cleanEndpoint}`;
};

// ============================================
// Utility Functions
// ============================================

// Generate UUID for visitor ID
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "vlc_" + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop();
    return cookieValue ? cookieValue.split(";").shift() : null;
  }
  return null;
};

// Set cookie
const setCookie = (name: string, value: string, days: number): void => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

// Get UTM parameters from URL
const getUTMParams = (): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
} => {
  if (typeof window === "undefined") return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
  };
};

// Get device type
const getDeviceType = (): "desktop" | "mobile" | "tablet" => {
  if (typeof window === "undefined") return "desktop";
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|tablet|playbook|silk/i.test(userAgent);
  
  if (isTablet) return "tablet";
  if (isMobile) return "mobile";
  return "desktop";
};

// Get current page data
const getPageData = () => {
  if (typeof window === "undefined") {
    return {
      url: "",
      page_title: "",
      referrer: "",
    };
  }
  
  return {
    url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
  };
};

// ============================================
// Main Hook
// ============================================

export const useLeadTracker = () => {
  const vlcVidRef = useRef<string | null>(null);
  const pageStartTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Track page visit using sendBeacon (non-blocking)
  const trackVisit = useCallback(
    async (additionalData?: {
      time_on_page?: number;
      scroll_depth?: number;
    }) => {
      if (!vlcVidRef.current) return;

      const utmParams = getUTMParams();
      const pageData = getPageData();
      const deviceType = getDeviceType();
      
      const timeOnPage = additionalData?.time_on_page ?? Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      const scrollDepth = additionalData?.scroll_depth ?? maxScrollDepthRef.current;

      const data = {
        vlc_vid: vlcVidRef.current,
        url: pageData.url,
        page_title: pageData.page_title,
        referrer: pageData.referrer,
        time_on_page: timeOnPage,
        scroll_depth: scrollDepth,
        device_type: deviceType,
        ...utmParams,
      };

      // Primary: Use sendBeacon for reliability on page unload
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        const endpoint = getFullApiUrl("leads/track-visit");
        
        const sent = navigator.sendBeacon(endpoint, blob);
        
        if (!sent) {
          console.warn("sendBeacon failed, falling back to fetch");
          fallbackToFetch(data);
        }
      } 
      // Fallback for browsers that don't support sendBeacon
      else {
        fallbackToFetch(data);
      }
    },
    []
  );

  // Internal fallback using the existing leadsApi (which has correct /api/v1 base)
  const fallbackToFetch = async (data: any) => {
    try {
      await leadsApi.trackVisit(data);
    } catch (error) {
      console.error("Failed to track visit with fallback:", error);
    }
  };

  // Initialize visitor ID and track first visit
  useEffect(() => {
    if (isInitializedRef.current || typeof window === "undefined") return;
    isInitializedRef.current = true;

    // Check for existing cookie
    let vid = getCookie(COOKIE_NAME);

    // Generate new visitor ID if none exists
    if (!vid) {
      vid = "vlc_" + generateUUID();
      setCookie(COOKIE_NAME, vid, COOKIE_DAYS);
    }

    vlcVidRef.current = vid;

    // Track initial page visit
    trackVisit();

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentDepth = Math.min(
          100,
          Math.round((window.scrollY / scrollHeight) * 100)
        );
        if (currentDepth > maxScrollDepthRef.current) {
          maxScrollDepthRef.current = currentDepth;
        }
      }
    };

    // Track time on page when user leaves
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      trackVisit({ time_on_page: timeOnPage });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);
    // Better alternative for modern browsers
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [trackVisit]);

  // Public methods
  const getVisitorId = useCallback(() => {
    return vlcVidRef.current || getCookie(COOKIE_NAME);
  }, []);

  const getUTM = useCallback(() => {
    return getUTMParams();
  }, []);

  return {
    getVisitorId,
    getUTM,
    trackVisit,
    deviceType: getDeviceType(),
  };
};

export default useLeadTracker;