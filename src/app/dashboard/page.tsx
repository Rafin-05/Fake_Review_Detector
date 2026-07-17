"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { getDashboardStatsAction, getDatasetsAction } from "@/app/actions/analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Select, Label, Alert } from "@/components/ui";
import DashboardCharts from "@/components/DashboardCharts";
import {
  FileText,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = authClient.useSession();
  const [selectedDataset, setSelectedDataset] = useState<string>("");

  // Check auth
  useEffect(() => {
    if (!authPending && !session) {
      router.push("/login?message=Please sign in to access your workspace");
    }
  }, [session, authPending, router]);

  // Fetch datasets
  const { data: datasets, error: datasetsError } = useSWR(
    session ? "user-datasets" : null,
    () => getDatasetsAction()
  );

  // Fetch dashboard stats (dependent on selected dataset)
  const { data: stats, error: statsError, isValidating, mutate } = useSWR(
    session ? ["dashboard-stats", selectedDataset] : null,
    ([_, datasetId]) => getDashboardStatsAction(datasetId)
  );

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
            Workspace Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Probabilistic risk assessment of your product and review integrity.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Dataset Selector */}
          <div className="flex-1 sm:flex-initial">
            <Select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="min-w-[200px]"
              aria-label="Filter by dataset"
            >
              <option value="">All Reviews (Combined)</option>
              {datasets?.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.rowCount} rows)
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              mutate();
            }}
            className="flex-shrink-0"
            title="Refresh dashboard stats"
          >
            <RotateCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Demo dataset warning banner if looking at the seeded data */}
      {(selectedDataset.includes("demo") || (!selectedDataset && stats?.totalReviews === 6)) && (
        <Alert variant="info" className="border-teal-200 bg-teal-50/50">
          <ShieldAlert className="h-5 w-5 text-teal-700 flex-shrink-0" />
          <div>
            <span className="font-semibold text-teal-900">Viewing Demonstration Dataset:</span> Predictions and classifications displayed here are probabilistic risk outputs for review seeder assets and are not verified facts.
          </div>
        </Alert>
      )}

      {/* Main Stats Summary Cards */}
      {statsError ? (
        <Alert variant="error">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load dashboard statistics. Please refresh the page.</span>
        </Alert>
      ) : !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card: Total Reviews */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Total Reviews</span>
                <span className="text-3xl font-bold text-gray-900 mt-1 block">{stats.totalReviews}</span>
              </div>
              <div className="p-3 rounded-md bg-gray-50 text-gray-500 border border-gray-100">
                <FileText className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Suspicious Review % */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Deceptive Risk Ratio</span>
                <span className="text-3xl font-bold text-amber-600 mt-1 block">{stats.suspiciousPercentage}%</span>
              </div>
              <div className="p-3 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Avg Authenticity Score */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Avg Authenticity</span>
                <span className="text-3xl font-bold text-teal-600 mt-1 block">{stats.averageScore}/100</span>
              </div>
              <div className="p-3 rounded-md bg-teal-50 text-teal-600 border border-teal-100">
                <CheckCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Risk Assessment */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Platform Risk Level</span>
                <span className={`text-xl font-bold mt-2 block ${
                  stats.riskLevel === 'High' 
                    ? 'text-red-600' 
                    : stats.riskLevel === 'Moderate' 
                    ? 'text-amber-600' 
                    : 'text-teal-600'
                }`}>{stats.riskLevel}</span>
              </div>
              <div className={`p-3 rounded-md border ${
                stats.riskLevel === 'High'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : stats.riskLevel === 'Moderate'
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-teal-50 text-teal-600 border-teal-100'
              }`}>
                {stats.riskLevel === 'High' ? (
                  <AlertTriangle className="h-6 w-6 animate-bounce" />
                ) : (
                  <ShieldCheck className="h-6 w-6" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Analytics Section */}
      {stats && (
        <DashboardCharts
          classificationData={stats.classificationDistribution}
          ratingData={stats.ratingDistribution}
        />
      )}

      {/* Most Suspicious Reviews Table */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center py-4 px-6">
          <div>
            <CardTitle>Priority Moderation Queue</CardTitle>
            <CardDescription>Most suspicious reviews surfaced automatically for urgent evaluation.</CardDescription>
          </div>
          <Link href="/workspace">
            <Button variant="outline" size="sm">
              Analyze Review <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {!stats ? (
            <div className="p-6 text-center text-sm text-gray-500 animate-pulse">Loading priority list...</div>
          ) : stats.recentAnalyses.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck className="h-10 w-10 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">All clear!</p>
              <p className="text-xs text-gray-500 mt-1">No reviews have been analyzed yet or seeded in this view.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Review Detail</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-center">Rating</th>
                    <th className="px-6 py-3 text-center">Authenticity Score</th>
                    <th className="px-6 py-3 text-center">Classification</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stats.recentAnalyses.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="text-xs text-gray-400 font-medium mb-1">
                          By {review.reviewerName || "Anonymous"} on {review.reviewDate || "unknown date"}
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                          {review.reviewContent}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500 capitalize">
                        {review.productCategory || "General"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-700">
                        {review.starRating !== null ? `${review.starRating}★` : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center font-semibold text-sm ${
                          review.authenticityScore > 75 
                            ? 'text-teal-700' 
                            : review.authenticityScore > 45 
                            ? 'text-amber-700' 
                            : 'text-red-700'
                        }`}>
                          {review.authenticityScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          review.classification === 'likely_genuine' 
                            ? 'bg-teal-50 text-teal-800 border-teal-200' 
                            : review.classification === 'suspicious'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {review.classification.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/reviews/${review.id}`}>
                          <Button variant="ghost" size="sm" className="inline-flex gap-1.5">
                            Audit Details <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
