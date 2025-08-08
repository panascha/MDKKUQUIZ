"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { ButtonWithLogo } from "../magicui/Buttonwithlogo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { FrontendRoutes } from "../../config/apiRoutes";

interface ValidationErrors {
  email?: string;
  password?: string;
}

// Validation functions
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return "Email is required";
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  // KKU email validation (optional - can be removed if not required)
  if (!email.toLowerCase().includes("kkumail.com")) {
    return "Please use your KKU email address";
  }
  
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Password is required";
  }
  return undefined;
};

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [touched, setTouched] = useState<{email: boolean; password: boolean}>({
    email: false,
    password: false
  });

  // Real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (touched.email) {
      const emailError = validateEmail(value);
      setValidationErrors(prev => ({ ...prev, email: emailError }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (touched.password) {
      const passwordError = validatePassword(value);
      setValidationErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const emailError = validateEmail(email);
    setValidationErrors(prev => ({ ...prev, email: emailError }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const passwordError = validatePassword(password);
    setValidationErrors(prev => ({ ...prev, password: passwordError }));
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setValidationErrors({
      email: emailError,
      password: passwordError
    });
    
    setTouched({ email: true, password: true });
    
    return !emailError && !passwordError;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsLoggingIn(true);

    const toastId = toast.loading("Logging in...");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password: password,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.", { id: toastId });
        setError(result.error);
      } else {
        toast.success("Logged in successfully!", { id: toastId });
        router.push(FrontendRoutes.HOMEPAGE);
      }
    } catch {
      toast.error("Login failed. Please try again.", { id: toastId });
      setError("An unexpected error occurred.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = !validationErrors.email && !validationErrors.password && email && password;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your email and password.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@kkumail.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={`${
                validationErrors.email && touched.email 
                  ? "border-red-500 focus:border-red-500" 
                  : ""
              }`}
              aria-invalid={validationErrors.email && touched.email ? "true" : "false"}
            />
            {validationErrors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              className={`${
                validationErrors.password && touched.password 
                  ? "border-red-500 focus:border-red-500" 
                  : ""
              }`}
              aria-invalid={validationErrors.password && touched.password ? "true" : "false"}
            />
            {validationErrors.password && touched.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline focus:outline-none"
              onClick={() => router.push(FrontendRoutes.RESET_PASSWORD)}
            >
              Forgot password?
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
        <CardFooter className="py-3 flex flex-col items-center gap-3">
          <ButtonWithLogo 
            type="submit" 
            disabled={isLoggingIn || !isFormValid}
            className={`${
              !isFormValid 
                ? "opacity-50 cursor-not-allowed" 
                : ""
            }`}
          > 
            {isLoggingIn ? "Logging in..." : "Login"}
          </ButtonWithLogo>
          
          {/* TO DO: DO when SSO KKU come */}
          {/* <div className="flex items-center justify-center">
            <div className="h-px bg-gray-300 w-16"></div>
            <span className="mx-2 text-gray-500">OR</span>
            <div className="h-px bg-gray-300 w-16"></div>
          </div>
          <ButtonWithLogo logo={<img src="/kkulogo.svg" alt="Logo" />} type="submit"
            className="bg-[#302E7A] hover:bg-[#302E7A]/90">
            KKU Single Sign On
          </ButtonWithLogo> */}
        </CardFooter>
      </form>
    </Card>
  );
};
