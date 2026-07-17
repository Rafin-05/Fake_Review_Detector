"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { getAnalysesAction } from "@/app/actions/analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Select, Label, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Alert } from "@/components/ui";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ExternalLink,
  History,
  FileSpreadsheet,
  Filter,
  RotateCw,
  AlertCircle
} from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = authClient.useSession();

  // Filters State
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState<any>("");
  const [rating, setRating] = useState<number>(0);
  const [confidenceMin, setConfidenceMin] = useState<number>(0);

  // SWR Key based on filters
  const swrKey = session
    ? ["analyses-history", classification, rating, confidenceMin, search]
    : null;

  const { data: reviews, error, isValidating, mutate } = useSWR(
    swrKey,
    () => getAnalysesAction({
      classification: classification || undefined,
      rating: rating || undefined,
      confidenceMin: confidenceMin || undefined,
      search: search || undefined
    })
  );

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

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Analysis History Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse, search, and audit past review analyses, including dataset-linked items.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
          className="flex-shrink-0"
        >
          <RotateCw className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`} />
          Refresh Logs
        </Button>
      </div>

      {/* Filter Toolbar Card */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-4 space-y-1">
              <Label htmlFor="search-input">Search Content or Reviewer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search-input"
                  placeholder="Type terms or usernames..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Classification Filter */}
            <div className="lg:col-span-3 space-y-1">
              <Label htmlFor="class-select">Classification Risk</Label>
              <Select
                id="class-select"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="likely_genuine">Likely Genuine</option>
                <option value="suspicious">Suspicious</option>
                <option value="likely_fake">Likely Fake</option>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="lg:col-span-2 space-y-1">
              <Label htmlFor="star-select">Star Rating</Label>
              <Select
                id="star-select"
                value={rating.toString()}
                onChange={(e) => setRating(parseInt(e.target.value))}
              >
                <option value="0">All Ratings</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </Select>
            </div>

            {/* Confidence Threshold */}
            <div className="lg:col-span-3 space-y-1">
              <Label htmlFor="conf-select">Confidence Level</Label>
              <Select
                id="conf-select"
                value={confidenceMin.toString()}
                onChange={(e) => setConfidenceMin(parseInt(e.target.value))}
              >
                <option value="0">Any Confidence</option>
                <option value="50">50% and above</option>
                <option value="70">70% and above</option>
                <option value="90">90% and above</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {error ? (
        <Alert variant="error">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load analysis history logs.</span>
        </Alert>
      ) : !reviews ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-sm text-gray-500 animate-pulse">
          Retrieving audit history logs...
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-dashed border-2 p-16 text-center">
          <History className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">No matching logs found</p>
          <p className="text-xs text-gray-400 mt-1 max-w-[300px] mx-auto">
            Try adjusting your filters or search terms. If you haven&apos;t run any analysis yet, head over to the Single Analysis workspace.
          </p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3.5">Review Snippet</th>
                    <th className="px-6 py-3.5">Source Type</th>
                    <th className="px-6 py-3.5 text-center">Rating</th>
                    <th className="px-6 py-3.5 text-center">Score</th>
                    <th className="px-6 py-3.5 text-center">Risk Classification</th>
                    <th className="px-6 py-3.5 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="text-xs text-gray-400 font-medium mb-1">
                          By {r.reviewerName || "Anonymous"} on {r.reviewDate || "unknown date"}
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                          {r.reviewContent}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {r.datasetId ? (
                          <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                            <FileSpreadsheet className="h-3 w-3" /> Bulk Upload
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                            Single Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-700">
                        {r.starRating !== null ? `${r.starRating}★` : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center font-semibold text-sm ${
                          r.authenticityScore > 75 
                            ? 'text-teal-700' 
                            : r.authenticityScore > 45 
                            ? 'text-amber-700' 
                            : 'text-red-700'
                        }`}>
                          {r.authenticityScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          r.classification === 'likely_genuine' 
                            ? 'bg-teal-50 text-teal-800 border-teal-200' 
                            : r.classification === 'suspicious'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {r.classification === 'likely_genuine' && <CheckCircle className="h-3 w-3" />}
                          {r.classification === 'suspicious' && <AlertTriangle className="h-3 w-3" />}
                          {r.classification === 'likely_fake' && <XCircle className="h-3 w-3" />}
                          {r.classification.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/reviews/${r.id}`}>
                          <Button variant="ghost" size="sm" className="inline-flex gap-1">
                            Inspect <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
