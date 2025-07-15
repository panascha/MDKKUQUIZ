"use client";
import { ButtonWithLogo } from "../../components/magicui/Buttonwithlogo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { BackendRoutes, FrontendRoutes, BACKEND_URL } from "../../config/apiRoutes";
import axios from "axios";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TermOfServise from '../../components/ui/TermOfServise';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog";
import RegistrationQuestionsModal from "../../components/ui/RegistrationQuestionsModal";

const Page = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkUserExists = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await axios.get(
            `${BACKEND_URL}/api/v1/auth/user-exists?email=${encodeURIComponent(session.user.email)}`
          );
          if (!res.data.exists) {
            toast.error("Your account has been deleted.");
            await signOut({ redirect: false });
            router.push(FrontendRoutes.LOGIN);
          } else {
            router.push(FrontendRoutes.HOMEPAGE);
          }
        } catch (err) {
          toast.error("Session invalid. Please log in again.");
          await signOut({ redirect: false });
          router.push(FrontendRoutes.LOGIN);
        }
      }
    };
    checkUserExists();
  }, [status, session, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [year, setYear] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});

  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (activeTab === 'register') {
      setShowTerms(true);
    }
  }, [activeTab]);

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
        router.push(FrontendRoutes.HOMEPAGE);
      }
    } catch {
      toast.error("Login failed. Please try again.", { id: toastId });
      setError("An unexpected error occurred.");
    }
  };

  // Registration handler
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
  });
  const [pendingRegister, setPendingRegister] = useState<{
    name: string;
    email: string;
    password: string;
    year: string;
  } | null>(null);

  // Registration form handler (opens modal only)
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
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(newPassword)) {
      errors.password = "Password must contain upper, lower, number, and special character.";
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
    const errors = validateRegisterForm();
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    setPendingRegister({
      name,
      email: regEmail,
      password: newPassword,
      year,
    });
    setShowQuestionsModal(true);
  };

  // Backend registration after modal submit
  const handleModalSubmit = async () => {
    if (!pendingRegister) return;
    setError(null);
    const registerPromise = axios.post(BackendRoutes.REGISTER, {
      name: pendingRegister.name,
      email: pendingRegister.email,
      password: pendingRegister.password,
      year: pendingRegister.year,
      role: "user",
      ...questionAnswers, // Optionally send answers to backend if supported
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
        email: pendingRegister.email,
        password: pendingRegister.password,
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
      setPendingRegister(null);
      setShowQuestionsModal(false);
    }
  };

  return (
    <main className="mx-auto pt-20 my-10 flex w-full max-w-screen-xl items-center justify-center justify-self-center px-8">
      <Card>
        <div className="flex items-center justify-center text-4xl">
          MSEB
        </div>
      <Tabs defaultValue="login" className="w-[400px] px-3" value={activeTab} onValueChange={setActiveTab}>
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
                    I agree to the <span className="underline" onClick={() => setShowTerms(true)}>Terms of Service</span>
                  </label>
                </div>
                {registerErrors.terms && <p className="text-red-500 text-xs">{registerErrors.terms}</p>}
                {error && <p className="text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="py-3 flex flex-col items-center gap-3">
                <ButtonWithLogo type="submit"> 
                  Register
                </ButtonWithLogo>
                {/* Terms of Service Modal (controlled) */}
                {showTerms && (
                  <TermOfServise open={showTerms} setOpen={setShowTerms} onAccept={() => setTermsAccepted(true)} />
                )}
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        </Tabs>
      </Card>

      <RegistrationQuestionsModal
        open={showQuestionsModal}
        setOpen={setShowQuestionsModal}
        answers={questionAnswers}
        setAnswers={setQuestionAnswers}
        onSubmit={handleModalSubmit}
      />
    </main>
  );
};

export default Page;
