import { useState, useCallback } from "react";
import axios from "axios";
import { BackendRoutes } from "../../config/apiRoutes";

export function useGetOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOTP = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(BackendRoutes.REQUEST_OTP, { email });
      return response; // or response.data if you want just the data
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      setLoading(false);
      return false;
    }
  }, []);

  return { getOTP, loading, error };
}
