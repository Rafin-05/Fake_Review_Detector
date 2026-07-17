"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { analyzeSingleReviewAction } from "@/app/actions/analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Textarea, Label, Alert, Select } from "@/components/ui";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = authClient.useSession();

  // Form State
  const [reviewContent, setReviewContent] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [starRating, setStarRating] = useState<number | undefined>(undefined);
  const [reviewerName, setReviewerName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [unverifiedPurchase, setUnverifiedPurchase] = useState(false);

  // Status State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!reviewContent.trim()) {
      setError("Review content is required.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzeSingleReviewAction({
        reviewContent,
        productCategory: productCategory || undefined,
        starRating,
        reviewerName: reviewerName || undefined,
        productUrl: productUrl || undefined,
        unverifiedPurchase,
      });

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze review. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setReviewContent("");
    setProductCategory("");
    setStarRating(undefined);
    setReviewerName("");
    setProductUrl("");
    setUnverifiedPurchase(false);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Single Review Workspace</h1>
        <p className="text-sm text-gray-500 mt-1">
          Perform a microscopic linguistic and metadata evaluation on a single customer review.
        </p>
      </div>

      {error && (
        <Alert variant="error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>{error}</div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form Column */}
        <form onSubmit={handleAnalyze} className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Details</CardTitle>
              <CardDescription>Enter review text and optional parameters to evaluate integrity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="content">Review Content <span className="text-red-500">*</span></Label>
                <Textarea
                  id="content"
                  required
                  rows={8}
                  placeholder="Paste the product review text here..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="category">Product Category</Label>
                  <Input
                    id="category"
                    type="text"
                    placeholder="e.g. Electronics, Fashion"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rating">Star Rating</Label>
                  <Select
                    id="rating"
                    value={starRating === undefined ? "" : starRating.toString()}
                    onChange={(e) => setStarRating(e.target.value === "" ? undefined : parseInt(e.target.value))}
                    disabled={isAnalyzing}
                  >
                    <option value="">No Rating Provided</option>
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <option key={stars} value={stars}>
                        {stars} Star{stars > 1 ? "s" : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="reviewer">Reviewer Username</Label>
                  <Input
                    id="reviewer"
                    type="text"
                    placeholder="e.g. JaneDoe12"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="url">Product Page URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://ecommerce.com/product"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="unverified"
                  type="checkbox"
                  checked={unverifiedPurchase}
                  onChange={(e) => setUnverifiedPurchase(e.target.checked)}
                  disabled={isAnalyzing}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <Label htmlFor="unverified" className="mb-0 cursor-pointer">
                  Flag as Unverified Purchase
                </Label>
              </div>
            </CardContent>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isAnalyzing}>
                Clear Form
              </Button>
              <Button type="submit" size="sm" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing review...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run AI Detector
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>

        {/* Results Column */}
        <div className="lg:col-span-5">
          {result ? (
            <Card className="border-teal-200 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <CardTitle>Analysis Findings</CardTitle>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    result.classification === 'likely_genuine' 
                      ? 'bg-teal-50 text-teal-800 border-teal-200' 
                      : result.classification === 'suspicious'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {result.classification === 'likely_genuine' && <CheckCircle className="h-3 w-3" />}
                    {result.classification === 'suspicious' && <AlertTriangle className="h-3 w-3" />}
                    {result.classification === 'likely_fake' && <XCircle className="h-3 w-3" />}
                    {result.classification.replace(/_/g, ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Score and confidence */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase block">Authenticity</span>
                    <span className={`text-2xl font-bold ${
                      result.authenticityScore > 75 
                        ? 'text-teal-600' 
                        : result.authenticityScore > 45 
                        ? 'text-amber-600' 
                        : 'text-red-600'
                    }`}>{result.authenticityScore}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase block">AI Confidence</span>
                    <span className="text-2xl font-bold text-gray-700">{result.confidence}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-600 mb-1">AI Assessment Summary</h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded border border-gray-100">{result.summary}</p>
                </div>

                {result.signals && result.signals.length > 0 ? (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-600 mb-2">Detected Signals ({result.signals.length})</h4>
                    <div className="space-y-3">
                      {result.signals.map((sig: any, idx: number) => (
                        <div key={idx} className="text-xs border-l-2 border-teal-500 pl-3 py-0.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-800 capitalize">{sig.type.replace(/_/g, ' ')}</span>
                            <span className={`text-[9px] px-1 py-0.2 rounded border uppercase ${
                              sig.severity === 'high' 
                                ? 'bg-red-50 border-red-200 text-red-700' 
                                : sig.severity === 'medium'
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-blue-50 border-blue-200 text-blue-700'
                            }`}>{sig.severity}</span>
                          </div>
                          <p className="text-gray-600 mt-1">{sig.explanation}</p>
                          {sig.evidence && (
                            <p className="text-gray-400 mt-0.5 font-mono text-[10px]">Evidence: {sig.evidence}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded text-center">
                    No negative indicators or deception signals found.
                  </div>
                )}

                {result.highlightedPhrases && result.highlightedPhrases.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-600 mb-1.5">Highlighted Phrases</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.highlightedPhrases.map((phrase: string, idx: number) => (
                        <span key={idx} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Action: <span className="text-gray-700 font-bold">{result.recommendedAction.replace(/_/g, ' ')}</span></span>
                  <Link href={`/reviews/${result.id}`}>
                    <Button variant="ghost" size="sm" className="inline-flex gap-1">
                      Open Audit View <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center border-dashed border-2 py-32 bg-gray-50/20">
              <div className="text-center px-6">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">Awaiting review input</p>
                <p className="text-xs text-gray-400 mt-1.5 max-w-[250px]">
                  Fill out the review content form on the left and click &quot;Run AI Detector&quot; to inspect it.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
