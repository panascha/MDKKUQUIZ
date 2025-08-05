import { useState, useCallback } from "react";
import axios from "axios";
import { BackendRoutes } from "../../config/apiRoutes";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(async (newPassword: string, resetToken: string) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure resetToken is a string
      const tokenString = typeof resetToken === 'string' ? resetToken : String(resetToken);
      
      await axios.post(BackendRoutes.RESET_PASSWORD, 
        { newPassword },
        {
          headers: {
            'x-access-token': tokenString
          }
        }
      );
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
