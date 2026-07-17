"use client";

import React, { useState } from "react";
import Link from "next/link";
import { submitFeedbackAction } from "@/app/actions/analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Textarea, Label, Alert } from "@/components/ui";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Calendar,
  User,
  ShoppingBag,
  Info,
  Check,
  X,
  Send
} from "lucide-react";

interface ReviewDetailClientProps {
  initialAnalysis: any;
}

export default function ReviewDetailClient({ initialAnalysis }: ReviewDetailClientProps) {
  const [feedbackLabel, setFeedbackLabel] = useState<'correct' | 'incorrect'>(
    initialAnalysis.feedback?.label || 'correct'
  );
  const [feedbackNotes, setFeedbackNotes] = useState(initialAnalysis.feedback?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await submitFeedbackAction(initialAnalysis.id, feedbackLabel, feedbackNotes);
      setSuccessMsg("Moderator assessment logged successfully.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to log feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe highlighted text renderer
  const renderHighlightedText = (text: string, phrases: string[]) => {
    if (!phrases || phrases.length === 0) return <span>{text}</span>;

    // Remove empty phrases and escape regex special characters
    const validPhrases = phrases.filter(p => p.trim().length > 0);
    if (validPhrases.length === 0) return <span>{text}</span>;

    // Sort descending by length to highlight longest matching blocks first
    const sorted = [...validPhrases].sort((a, b) => b.length - a.length);
    const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    try {
      const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
      const parts = text.split(regex);
      
      return (
        <>
          {parts.map((part, i) => {
            const isMatch = sorted.some(phrase => phrase.toLowerCase() === part.toLowerCase());
            if (isMatch) {
              return (
                <mark key={i} className="bg-amber-100 text-amber-950 font-medium px-1 py-0.5 rounded border-b border-amber-300 select-none">
                  {part}
                </mark>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </>
      );
    } catch (_) {
      return <span>{text}</span>;
    }
  };

  const isFakeOrSuspicious = initialAnalysis.classification !== 'likely_genuine';

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <Link href="/history">
          <Button variant="outline" size="sm" className="px-2.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <span className="text-xs text-gray-500 font-semibold uppercase">Inspection Console</span>
          <h1 className="text-xl font-bold text-gray-900 leading-none mt-1">Review Audit Report</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Review text and indicators */}
        <div className="lg:col-span-8 space-y-6">
          {/* Original Review Content */}
          <Card>
            <CardHeader className="py-4 border-b border-gray-100">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Original Review Text
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <blockquote className="text-gray-800 text-base leading-relaxed border-l-4 border-teal-500/30 pl-4 py-1">
                {renderHighlightedText(initialAnalysis.reviewContent, initialAnalysis.highlightedPhrases)}
              </blockquote>

              {/* Reviewer Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="block font-medium text-gray-400">Reviewer Name</span>
                    <span className="text-gray-800 font-semibold">{initialAnalysis.reviewerName || "Anonymous"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="block font-medium text-gray-400">Date Posted</span>
                    <span className="text-gray-800 font-semibold">{initialAnalysis.reviewDate || "unknown"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="block font-medium text-gray-400">Category</span>
                    <span className="text-gray-800 font-semibold capitalize">{initialAnalysis.productCategory || "General"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="block font-medium text-gray-400">Star Rating</span>
                    <span className="text-gray-800 font-semibold">
                      {initialAnalysis.starRating !== null ? `${initialAnalysis.starRating} Stars` : "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Signals Explanations */}
          <Card>
            <CardHeader className="py-4 border-b border-gray-100">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Linguistic & Behavioral Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {initialAnalysis.signals && initialAnalysis.signals.length > 0 ? (
                <div className="space-y-4">
                  {initialAnalysis.signals.map((sig: any, index: number) => (
                    <div key={index} className="p-4 rounded-md border border-gray-200 bg-gray-50/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-800 capitalize">
                          {sig.type.replace(/_/g, ' ')}
                        </h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${
                          sig.severity === 'high'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : sig.severity === 'medium'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          {sig.severity} Severity
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{sig.explanation}</p>
                      {sig.evidence && (
                        <div className="text-[11px] font-mono text-gray-500 bg-gray-150 p-2 rounded border border-gray-200/50">
                          <span className="font-semibold text-gray-600 block uppercase text-[9px] tracking-wider mb-0.5">Evidence Snippet</span>
                          {sig.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic text-center py-4">
                  No flags detected. Review parameters align with typical buyer feedback patterns.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Authenticity score and moderator actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Classification & Scores */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Risk Assessment</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-2 ${
                  initialAnalysis.classification === 'likely_genuine'
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : initialAnalysis.classification === 'suspicious'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {initialAnalysis.classification === 'likely_genuine' && <CheckCircle className="h-3.5 w-3.5" />}
                  {initialAnalysis.classification === 'suspicious' && <AlertTriangle className="h-3.5 w-3.5" />}
                  {initialAnalysis.classification === 'likely_fake' && <XCircle className="h-3.5 w-3.5" />}
                  {initialAnalysis.classification.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Authenticity Score Gauge */}
              <div className="bg-gray-50 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Authenticity Score</span>
                  <span>{initialAnalysis.authenticityScore}/100</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      initialAnalysis.authenticityScore > 75
                        ? 'bg-teal-600'
                        : initialAnalysis.authenticityScore > 45
                        ? 'bg-amber-500'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${initialAnalysis.authenticityScore}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Model Confidence:</span>
                  <span className="text-gray-800">{initialAnalysis.confidence}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">Moderator Recommended Action</span>
                <span className={`text-sm font-bold capitalize ${
                  initialAnalysis.recommendedAction === 'manual_review'
                    ? 'text-red-700'
                    : initialAnalysis.recommendedAction === 'monitor'
                    ? 'text-amber-700'
                    : 'text-teal-700'
                }`}>
                  {initialAnalysis.recommendedAction.replace(/_/g, ' ')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card>
            <CardHeader className="py-4 border-b border-gray-100">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Moderator Verdict & Feedback
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleFeedbackSubmit}>
              <CardContent className="pt-6 space-y-4">
                {successMsg && <Alert variant="success">{successMsg}</Alert>}
                {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

                <div className="space-y-1.5">
                  <Label>AI Classification Verdict</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={feedbackLabel === 'correct' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setFeedbackLabel('correct')}
                      className="flex-1 inline-flex gap-1"
                    >
                      <Check className="h-4 w-4" /> Correct
                    </Button>
                    <Button
                      type="button"
                      variant={feedbackLabel === 'incorrect' ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => setFeedbackLabel('incorrect')}
                      className="flex-1 inline-flex gap-1"
                    >
                      <X className="h-4 w-4" /> Incorrect
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Internal Moderator Notes</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    placeholder="Provide additional details regarding actual fraud flags, account history, or transaction matching..."
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Button type="submit" size="sm" className="w-full inline-flex gap-1.5" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Log Assessment Verdict
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
