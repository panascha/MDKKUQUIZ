import Navbar from "../components/Navbar";
import NextAuthProvider from "../providers/NextAuthProvider";
import { TanstackQueryProvider } from "../providers/TanstackQueryProvider";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import "./globals.css";
import Analytics from "../components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MSEB",
  description: "Develop by Thanagorn",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen w-full flex-col items-center antialiased`}
      >
        <Analytics />
        <TanstackQueryProvider>
          <NextAuthProvider session={session}>
            <Toaster position="bottom-right" />
            <Navbar/>
            <main className="w-full">{children}</main>
          </NextAuthProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
