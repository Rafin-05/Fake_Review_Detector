"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import { authClient } from "@/lib/auth-client";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  
  // Public routes without sidebar layout
  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/register";
  
  // Show navigation if logged in OR if not on a public route (forces sidebar on dashboard pages)
  const showSidebar = !isPublicRoute && session;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-teal-100 selection:text-teal-900">
      {showSidebar && <Navigation />}
      <main className={`flex-1 flex flex-col ${showSidebar ? "md:pl-64" : ""}`}>
        {children}
      </main>
    </div>
  );
}
