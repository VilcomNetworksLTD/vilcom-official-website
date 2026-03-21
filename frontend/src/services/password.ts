import api from '@/lib/axios';

/**
 * Maps to PasswordResetController routes under /v1/auth/
 */
export const passwordApi = {
  /**
   * POST /v1/auth/password/email
   * Sends reset link to email. Always returns success (prevents enumeration).
   */
  sendResetLink: (email: string): Promise<{ success: boolean; message: string }> =>
    api.post("/auth/password/email", { email }),

  /**
   * GET /v1/auth/password/verify-token/{token}
   * Validates a reset token before showing the reset form.
   */
  verifyToken: (token: string): Promise<{
    success: boolean;
    message: string;
    data?: { user_id: number; expires_at: string };
  }> => api.get(`/auth/password/verify-token/${token}`),

  /**
   * POST /v1/auth/password/reset
   * Resets the password using the token from the email link.
   */
  resetPassword: (data: {
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> =>
    api.post("/auth/password/reset", data),

  /**
   * PUT /v1/auth/password/change   (auth:sanctum required)
   * Changes password for an already-authenticated user.
   * Invalidates all other sessions on success.
   */
  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> =>
    api.put("/auth/password/change", data),
};

