"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  UploadCloud,
  LayoutDashboard,
  FileText,
  History,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        }
      }
    });
  };

  // If not logged in and on landing or auth pages, don't show the dashboard sidebar
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";
  if (!session && isAuthPage) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Single Analysis", href: "/workspace", icon: FileText },
    { name: "Bulk Upload", href: "/bulk", icon: UploadCloud },
    { name: "History Logs", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 rounded">
          <ShieldCheck className="h-6 w-6 text-teal-600" aria-hidden="true" />
          <span className="font-semibold text-lg tracking-tight">ReviewShield</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-gray-600 hover:text-teal-700 hover:bg-gray-100 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-teal-800">
              <ShieldCheck className="h-6 w-6 text-teal-600" />
              <span className="font-semibold text-lg">ReviewShield</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${
                    isActive
                      ? "bg-teal-50 text-teal-800"
                      : "text-gray-700 hover:bg-gray-50 hover:text-teal-700"
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-teal-700" : "text-gray-500"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {session ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                    {session.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="mt-2 flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 hover:text-amber-700 hover:bg-white border border-gray-200 rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 bottom-0 left-0 z-30">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-200">
          <ShieldCheck className="h-7 w-7 text-teal-600" aria-hidden="true" />
          <span className="font-bold text-xl text-gray-900 tracking-tight">ReviewShield</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${
                  isActive
                    ? "bg-teal-50 text-teal-800"
                    : "text-gray-700 hover:bg-gray-50 hover:text-teal-700"
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-teal-700" : "text-gray-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4 bg-gray-50/50">
          {session ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2">
                <div className="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-800 truncate leading-none mb-1">{session.user.name}</p>
                  <p className="text-xs text-gray-500 truncate leading-none">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 hover:text-amber-700 hover:bg-white border border-gray-200 rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
