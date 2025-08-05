"use client";
import { FrontendRoutes, MAINTENANCE_MODE } from "../config/apiRoutes";
import { redirect } from "next/navigation";

export default function Home() {
  if (MAINTENANCE_MODE) {
    redirect(FrontendRoutes.MAINTENANCE);
  } else {
    redirect(FrontendRoutes.MAIN);
  }
}
