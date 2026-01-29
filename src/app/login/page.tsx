"use client";
import { Card } from "../../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { BACKEND_URL, FrontendRoutes } from "../../config/apiRoutes";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoginForm } from "../../components/auth/LoginForm";
import { RegisterForm } from "../../components/auth/RegisterForm";

const Page = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('login');

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

  return (
    <main className="mx-auto pt-20 my-10 flex w-full max-w-screen-xl items-center justify-center justify-self-center px-8">
      <Card>
        <div className="flex items-center justify-center text-4xl">
          MSEB
        </div>
        <Tabs defaultValue="login" className="w-[400px] px-3" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-gray-100 rounded-md transition-all duration-300 ease-in-out">
            <TabsTrigger value="login" className="transition-colors duration-300 ease-in-out cursor-pointer">
              Login
            </TabsTrigger>
            {/* TODO: remove comment when it's not trial mode */}
            <TabsTrigger value="register" className="transition-colors duration-300 ease-in-out cursor-pointer">
              Register
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
};

export default Page;
