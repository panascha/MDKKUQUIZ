"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
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
import { BackendRoutes, FrontendRoutes } from "../../config/apiRoutes";

export const RegisterForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [year, setYear] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const validateRegisterForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (name.length > 50) {
      errors.name = "Name cannot be more than 50 characters.";
    }
    if (!regEmail) {
      errors.email = "Email is required.";
    } else if (!/^[a-zA-Z0-9._%+-]+@kkumail\.(com|ac\.th)$/.test(regEmail)) {
      errors.email = "Email must be a valid KKUMail address (@kkumail.com or @kkumail.ac.th).";
    }
    if (!year || isNaN(Number(year))) {
      errors.year = "Year is required.";
    } else if (Number(year) < 1 || Number(year) > 6) {
      errors.year = "Year must be between 1 and 6.";
    }
    if (!newPassword) {
      errors.password = "Password is required.";
    } else if (newPassword.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(newPassword)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter and one number.";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!termsAccepted) {
      errors.terms = "You must accept the Terms of Service.";
    }
    return errors;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsRegistering(true);
    
    const errors = validateRegisterForm();
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) {
      setIsRegistering(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setIsRegistering(false);
      return;
    }

    setError(null);
    const registerPromise = axios.post(BackendRoutes.REGISTER, {
      name,
      email: regEmail,
      password: newPassword,
      year,
      role: "admin",
    });

    toast.promise(registerPromise, {
      loading: "Creating your account...",
      success: "Account created successfully!",
      error: "Registration failed. Please try again.",
    });

    try {
      await registerPromise;
      const loginPromise = signIn("credentials", {
        redirect: false,
        email: regEmail,
        password: newPassword,
      });
      toast.promise(loginPromise, {
        loading: "Logging you in...",
        success: "Logged in successfully!",
        error: "Login failed after registration.",
      });
      const result = await loginPromise;
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(FrontendRoutes.HOMEPAGE);
      }
    } catch (error) {
      axios.isAxiosError(error)
        ? setError(error.response?.data.message || "Registration failed.")
        : setError("An unexpected error occurred.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">Username</Label>
            <Input
              id="name"
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {registerErrors.name && <p className="text-red-500 text-xs">{registerErrors.name}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="user@kkumail.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            {registerErrors.email && <p className="text-red-500 text-xs">{registerErrors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="year">Year</Label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Select year</option>
              {[1,2,3,4,5,6].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {registerErrors.year && <p className="text-red-500 text-xs">{registerErrors.year}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter your password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {registerErrors.password && <p className="text-red-500 text-xs">{registerErrors.password}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {registerErrors.confirmPassword && <p className="text-red-500 text-xs">{registerErrors.confirmPassword}</p>}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              I agree to the <span className="underline">Terms of Service</span>
            </label>
          </div>
          {registerErrors.terms && <p className="text-red-500 text-xs">{registerErrors.terms}</p>}
          {error && <p className="text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="py-3 flex flex-col items-center gap-3">
          <ButtonWithLogo type="submit" disabled={isRegistering}> 
            {isRegistering ? "Registering..." : "Register"}
          </ButtonWithLogo>
        </CardFooter>
      </form>
    </Card>
  );
};
