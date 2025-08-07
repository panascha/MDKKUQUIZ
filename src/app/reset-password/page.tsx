'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGetOTP } from '../../hooks/User/useGetOTP';
import { useVerifyOTP } from '../../hooks/User/useVerifyOTP';
import { useResetPassword } from '../../hooks/User/useGetResetPassword';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { AlertCircle, CheckCircle, Send, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { FrontendRoutes } from '../../config/apiRoutes';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getOTP, loading: sendingOTP, error: otpError } = useGetOTP();
  const { verifyOTP, loading: verifyingOTP, error: verifyError } = useVerifyOTP();
  const { resetPassword, loading: resettingPassword, error: resetError } = useResetPassword();

  const [currentStep, setCurrentStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Redirect authenticated users
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(FrontendRoutes.HOMEPAGE);
    }
  }, [status, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const response = await getOTP(email);
    if (response) {
      setCurrentStep('otp');
      setCountdown(60);
      toast.success('OTP sent to your email successfully!');
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    const response = await getOTP(email);
    if (response) {
      setCountdown(60);
      toast.success('OTP sent again to your email!');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = await verifyOTP(email, otp);
    if (token) {
      setResetToken(token);
      setCurrentStep('password');
      toast.success('OTP verified successfully!');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    // Password validation regex - matches backend validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter and one number.');
      return;
    }

    const success = await resetPassword(newPassword, resetToken);

    if (success) {
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push(FrontendRoutes.LOGIN);
      }, 2000);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <main className="mx-auto pt-20 my-10 flex w-full max-w-screen-xl items-center justify-center px-8">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
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
                  disabled={sendingOTP}
                  textButton={sendingOTP ? "Sending..." : "Send OTP"}
                />
              </CardFooter>
            </form>
          )}
          
          {currentStep === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block mb-1">Enter OTP</label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter the OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-600 mt-1">OTP sent to: {email}</p>
              </div>
              {(error || verifyError) && <p className="text-red-500 text-sm">{error || verifyError}</p>}
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  disabled={verifyingOTP} 
                  className="w-full" 
                  textButton={verifyingOTP ? "Verifying..." : "Verify OTP"} 
                />
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep('email')} 
                    className="flex-1" 
                    textButton="Back" 
                  />
                  <Button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || sendingOTP}
                    className="flex-1"
                    textButton={countdown > 0 ? `Resend (${countdown}s)` : sendingOTP ? "Sending..." : "Resend OTP"}
                  />
                </div>
              </CardFooter>
            </form>
          )}
          
          {currentStep === 'password' && (
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
                <Button 
                  type="submit" 
                  disabled={resettingPassword} 
                  className="w-full" 
                  textButton={resettingPassword ? "Resetting..." : "Reset Password"} 
                />
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep('otp')} 
                  className="w-full" 
                  textButton="Back to OTP" 
                />
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ResetPasswordPage;
