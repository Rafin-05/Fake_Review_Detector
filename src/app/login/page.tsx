"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Alert } from "@/components/ui";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show a message if redirected from an auth block
  const message = searchParams.get("message");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      let { data, error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      // Autofill demo registration fallback if the account is missing on first launch
      if (authError && email === "moderator@reviewshield.com" && password === "password123") {
        const { error: signUpError } = await authClient.signUp.email({
          email: "moderator@reviewshield.com",
          password: "password123",
          name: "Demo Moderator",
        });

        if (!signUpError) {
          const retry = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
          });
          data = retry.data;
          authError = retry.error;
        }
      }

      if (authError) {
        setError(authError.message || "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to autofill a demo account for quick evaluation
  const handleAutofillDemo = () => {
    setEmail("moderator@reviewshield.com");
    setPassword("password123");
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-teal-800 focus-ring rounded p-1">
            <ShieldCheck className="h-10 w-10 text-teal-600" />
            <span className="font-bold text-2xl tracking-tight">ReviewShield</span>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-teal-600 hover:text-teal-700 focus-ring rounded"
            >
              create a new workspace account
            </Link>
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {message && (
                <Alert variant="info">
                  {message}
                </Alert>
              )}

              {error && (
                <Alert variant="error">
                  <span className="font-medium">Authentication failed:</span> {error}
                </Alert>
              )}

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="password" className="mb-0">Password</Label>
                  <a href="#" className="text-xs text-teal-600 hover:text-teal-700 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 py-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <button
                type="button"
                onClick={handleAutofillDemo}
                className="w-full text-xs text-teal-600 hover:text-teal-700 hover:underline text-center py-1 mt-1"
              >
                Autofill demo credential (moderator@reviewshield.com / password123)
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
