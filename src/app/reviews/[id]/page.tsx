import React from "react";
import { getAnalysisDetailAction } from "@/app/actions/analysis";
import ReviewDetailClient from "@/components/ReviewDetailClient";
import { Alert, Button } from "@/components/ui";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  let analysis = null;
  let errorMsg = null;

  try {
    analysis = await getAnalysisDetailAction(id);
  } catch (err: any) {
    errorMsg = err.message || "Failed to load audit report.";
  }

  if (errorMsg || !analysis) {
    return (
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/history">
            <Button variant="outline" size="sm" className="px-2.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-sm font-semibold text-gray-500">Go Back to Logs</span>
        </div>
        <Alert variant="error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <span className="font-semibold block">Audit Report Error</span>
            {errorMsg || "The requested analysis record could not be found or is not owned by your active session workspace."}
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <ReviewDetailClient initialAnalysis={analysis} />
    </div>
  );
}
