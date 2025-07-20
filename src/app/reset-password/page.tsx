"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/Card";
import { useRouter } from "next/navigation";
import { BackendRoutes, FrontendRoutes } from "../../config/apiRoutes";
import { useResetPassword } from "../../hooks/User/useGetResetPassword";
import { useGetOTP } from "../../hooks/User/useGetOTP";

const ResetPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const { resetPassword, loading: resetLoading, error: resetError } = useResetPassword();
  const { getOTP, loading: otpLoading, error: otpError } = useGetOTP();
  const router = useRouter();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  function isOtpResponse(response: unknown): response is { data: { data: string } } {
    const res = response as any;
    return (
      typeof res === 'object' &&
      res !== null &&
      'data' in res &&
      typeof res.data === 'object' &&
      res.data !== null &&
      'data' in res.data &&
      typeof res.data.data === 'string'
    );
  }

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setError(null);
    try {
      const response = await getOTP(email);
      console.log('OTP API response:', response);
      // If getOTP returns the OTP, store it
      if (isOtpResponse(response)) {
        setServerOtp(response.data.data);
        toast.success("OTP sent to your email.");
        setStep(2);
        setCooldown(60); // 60 seconds cooldown
      } else {
        setError("Failed to get OTP from server.");
      }
    } catch {
      setError("Failed to send OTP.");
    }
    // error is handled by the hook
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp === serverOtp) {
      toast.success("OTP verified. Please set your new password.");
      setStep(3);
    } else {
      setError("Invalid OTP.");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    // Password must contain at least one uppercase, one lowercase, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.");
      return;
    }
    const success = await resetPassword({ email, otp, newPassword });
    if (success) {
      toast.success("Password reset successfully! Please log in.");
      router.push(FrontendRoutes.LOGIN);
    }
    // error is handled by the hook
  };

  return (
    <main className="mx-auto pt-20 my-10 flex w-full max-w-screen-xl items-center justify-center px-8">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@kkumail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {(error || otpError) && <p className="text-red-500 text-sm">{error || otpError}</p>}
              <CardFooter>
                <Button
                  type="submit"
                  disabled={otpLoading || cooldown > 0}
                  textButton={cooldown > 0 ? `Resend in ${cooldown}s` : otpLoading ? "Sending..." : "Send OTP"}
                />
              </CardFooter>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block mb-1">Enter OTP</label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter the OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" disabled={loading} className="w-full" textButton={loading ? "Verifying..." : "Verify OTP"} />
                <Button type="button" onClick={() => setStep(1)} className="w-full" textButton="Back" />
              </CardFooter>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block mb-1">New Password</label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block mb-1">Confirm New Password</label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {(error || resetError) && <p className="text-red-500 text-sm">{error || resetError}</p>}
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" disabled={resetLoading} className="w-full" textButton={resetLoading ? "Resetting..." : "Reset Password"} />
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ResetPasswordPage;
