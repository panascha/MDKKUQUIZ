import { useState, useCallback } from "react";
import axios from "axios";
import { BackendRoutes } from "../../config/apiRoutes";
import { ResetPassword } from "../../types/api/ResetPassword";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(async (data: ResetPassword) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(BackendRoutes.RESET_PASSWORD, data);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
      setLoading(false);
      return false;
    }
  }, []);

  return { resetPassword, loading, error };
}
