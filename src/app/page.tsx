"use client";
import { FrontendRoutes } from "@/config/apiRoutes";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar"


export default function Home() {
  redirect(FrontendRoutes.MAIN);
}
