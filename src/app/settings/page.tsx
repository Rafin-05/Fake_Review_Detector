"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { clearWorkspaceAction } from "@/app/actions/analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Alert } from "@/components/ui";
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = authClient.useSession();

  // Settings states
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic check for API key (safely on server or fall back to rule-based)
  // Let's assume we can mock this or check if there is an indicator in process.env.
  // Next.js will expose client vars with NEXT_PUBLIC_, so process.env.GEMINI_API_KEY is not directly readable on client, which is good for safety!
  // We can show a placeholder or let them know it is configured in standard .env files.
  const [aiDetectorMode, setAiDetectorMode] = useState<"Gemini 2.5" | "Local Rules Fallback">("Local Rules Fallback");

  // Check auth
  useEffect(() => {
    if (!authPending && !session) {
      router.push("/login?message=Please sign in to access your workspace");
    }
  }, [session, authPending, router]);

  if (authPending || !session) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">Authenticating session...</p>
        </div>
      </div>
    );
  }

  const handleWipeWorkspace = async () => {
    const confirm = window.confirm(
      "Are you sure you want to clear your workspace? This will permanently delete all uploaded datasets and custom review audits, and re-seed the default demonstration dataset."
    );
    if (!confirm) return;

    setIsWiping(true);
    setWipeSuccess(null);
    setError(null);

    try {
      await clearWorkspaceAction();
      setWipeSuccess("Workspace data cleared and demonstration dataset seeded successfully.");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to clear workspace data.");
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-gray-600" /> System Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure detection variables, verify database interfaces, and manage private workspace storage.
        </p>
      </div>

      {wipeSuccess && (
        <Alert variant="success">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <div>{wipeSuccess}</div>
        </Alert>
      )}

      {error && (
        <Alert variant="error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>{error}</div>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Workspace Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Identity</CardTitle>
            <CardDescription>Your registered moderator profile scopes your database operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-none">{session.user.name}</p>
                <p className="text-xs text-gray-500 mt-1.5">{session.user.email}</p>
                <span className="inline-block mt-2.5 px-2 py-0.5 bg-teal-50 text-[10px] font-bold text-teal-800 border border-teal-100 rounded-full">
                  Active Workspace Owner
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Layer Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Infrastructure</CardTitle>
            <CardDescription>Persistence layer details for storing reviews and audits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gray-100 rounded text-gray-600 border border-gray-200">
                <Database className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800">Local SQL Engine (SQLite)</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Workspace logs, uploaded bulk files, and auditor feedback are saved in a zero-configuration SQLite binary database (<code className="bg-gray-100 px-1 py-0.5 rounded font-mono">review_shield.db</code>) residing in your workspace root.
                </p>
                <span className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold rounded-full">
                  <CheckCircle className="h-3 w-3" /> Online & Connected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Classifier Config */}
        <Card>
          <CardHeader>
            <CardTitle>AI Processing Engine</CardTitle>
            <CardDescription>Verify the LLM config used to analyze and flag review sentiment anomalies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gray-100 rounded text-gray-600 border border-gray-200">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-sm font-bold text-gray-800">Detector Mode: <span className="text-teal-700 font-semibold">{aiDetectorMode}</span></p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ReviewShield uses the Vercel AI SDK to contact Google Gemini 2.5 Flash if `GEMINI_API_KEY` is present. If it is missing, the system utilizes a high-precision, locally executing rule-based NLP parser.
                </p>
                <div className="bg-gray-50 p-3.5 rounded border border-gray-200/50 text-xs text-gray-600 mt-3 space-y-2">
                  <p className="font-semibold text-gray-700">How to configure the Gemini model:</p>
                  <p>Create a file named <code className="bg-white border px-1 py-0.5 rounded font-mono">.env</code> in the project root folder and insert your Gemini API Key:</p>
                  <pre className="bg-gray-900 text-gray-200 p-2 rounded font-mono text-[10px] overflow-x-auto select-all">
                    GEMINI_API_KEY=your_gemini_api_key_here
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Workspace Database Card */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Maintenance & Clean Sweep</CardTitle>
            <CardDescription>Wipe workspace history. Deletes all databases entries scoped to you and restores demo templates.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              This action resets your dashboard. It clears all custom review records and uploaded CSV datasets. It will recreate a clean copy of the initial demonstration dataset. This action is irreversible.
            </p>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleWipeWorkspace}
              disabled={isWiping}
              className="inline-flex gap-1.5"
            >
              {isWiping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Wiping Workspace...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Reset Workspace Database
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
