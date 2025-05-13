"use client";
import { Table } from "@/components/ui/Table";
import { ButtonWithLogo } from "@/components/magicui/Buttonwithlogo";
import { InteractiveHoverButton } from "@/components/magicui/InteractiveHoverButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BackendRoutes, FrontendRoutes } from "@/config/apiRoutes";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    if (session) {
      router.push(FrontendRoutes.MAIN);
    }
  }, [session, router]);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration state
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [year, setYear] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  // Login handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

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
        router.push(FrontendRoutes.MAIN);
      }
    } catch {
      toast.error("Login failed. Please try again.", { id: toastId });
      setError("An unexpected error occurred.");
    }
  };

  // Registration handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    const registerPromise = axios.post(BackendRoutes.REGISTER, {
      name,
      email: regEmail,
      password: newPassword,
      year: year,
      role: "user",
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
        router.push(FrontendRoutes.MAIN);
      }
    } catch (error) {
      axios.isAxiosError(error)
        ? setError(error.response?.data.message || "Registration failed.")
        : setError("An unexpected error occurred.");
    }
  };

  return (
    <main className="mx-auto pt-20 my-10 flex w-full max-w-screen-xl items-center justify-center justify-self-center px-8">
      <Card>
        <div className="flex items-center justify-center text-4xl">
          MSEB
        </div>
      <Tabs defaultValue="login" className="w-[400px] px-3">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-md transition-all duration-300 ease-in-out">
          <TabsTrigger value="login" className="transition-colors duration-300 ease-in-out cursor-pointer">
            Login
          </TabsTrigger>
          <TabsTrigger value="register" className="transition-colors duration-300 ease-in-out cursor-pointer">
            Register
          </TabsTrigger>
        </TabsList>

        {/* Login Form */}
        <TabsContent value="login">
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
                {error && <p className="text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="py-3 flex flex-col items-center gap-3">
                {/* <InteractiveHoverButton type="submit">
                  Log in
                  </InteractiveHoverButton> */}
                <ButtonWithLogo type="submit"> 
                    Login
                  </ButtonWithLogo>
                  <div className="flex items-center justify-center">
                    <div className="h-px bg-gray-300 w-16"></div>
                    <span className="mx-2 text-gray-500">OR</span>
                    <div className="h-px bg-gray-300 w-16"></div>
                  </div>

                  <ButtonWithLogo logo={<img src="/kkulogo.svg" alt="Logo" />} type="submit"
                    className="bg-[#302E7A] hover:bg-[#302E7A]/90">
                    KKU Single Sign On
                  </ButtonWithLogo>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Register Form */}
        <TabsContent value="register">
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
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Year</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
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
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="py-3">
                {/* <InteractiveHoverButton type="submit">
                  Register
                </InteractiveHoverButton> */}
                  <ButtonWithLogo type="submit"> 
                    Register
                  </ButtonWithLogo>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        </Tabs>
      </Card>

    </main>
  );
};

export default Page;
