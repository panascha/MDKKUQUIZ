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

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    const toastId = toast.loading("Logging in...");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
          {error && <p className="text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="py-3 flex flex-col items-center gap-3">
          <ButtonWithLogo type="submit" disabled={isLoggingIn}> 
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
