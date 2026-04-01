import api from "@/lib/axios";

export const trackVisit = async (url: string, referrer: string) => {
  // Try to grab session ID from local storage, or create one
  let sessionId = localStorage.getItem("visitor_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("visitor_session_id", sessionId);
  }

  const payload = {
    session_id: sessionId,
    url,
    referrer,
    user_agent: navigator.userAgent,
  };

  try {
    // Fire and forget
    await api.post("/analytics/track", payload);
  } catch (error) {
    // Silent fail for tracking to not interrupt UX
    console.error("Tracking error:", error);
  }
};

export const fetchAdminAnalytics = async () => {
  const { data } = await api.get("/admin/analytics/visitors");
  return data;
};
