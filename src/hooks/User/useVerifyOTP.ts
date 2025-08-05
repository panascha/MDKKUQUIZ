import { useState, useCallback } from "react";
import axios from "axios";
import { BackendRoutes } from "../../config/apiRoutes";

export function useVerifyOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(BackendRoutes.VERIFY_OTP, { email, otp });
      setLoading(false);
      return response.data.resetToken; // Extract just the resetToken string
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify OTP.");
      setLoading(false);
      return false;
    }
  }, []);

  return { verifyOTP, loading, error };
}
