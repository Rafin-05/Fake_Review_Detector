"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, Card, CardContent, Textarea, Alert } from "@/components/ui";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  UploadCloud,
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { analyzeReviewLocally, DetectionResult } from "@/lib/detector";

export default function LandingPage() {
  const { data: session } = authClient.useSession();
  const [sandboxText, setSandboxText] = useState(
    "This product is a total miracle!! It changed my life in literally 3 days! It is perfect in every way and there are absolutely no flaws whatsoever. You must buy it now, don't hesitate! Use my coupon code GETBEST10 at checkout to get an extra 10% off! Visit my blog for more awesome reviews and click here to check out my other links. The best product in the world, 10/10!"
  );
  const [sandboxRating, setSandboxRating] = useState<number>(5);
  const [sandboxResult, setSandboxResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTestAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate slight network delay
    setTimeout(() => {
      const result = analyzeReviewLocally(sandboxText, sandboxRating, "General", "Reviewer Name", true);
      setSandboxResult(result);
      setIsAnalyzing(false);
    }, 600);
  };

  const loadPreset = (presetType: 'genuine' | 'fake' | 'mismatch') => {
    if (presetType === 'genuine') {
      setSandboxText("I bought these headphones last week after reading several tech blog reviews. The noise cancellation is decent for the price, though it struggles with high-pitched sounds. Sound quality is balanced but lacks deep bass. Battery life is solid—I got about 22 hours of continuous playback before needing a charge.");
      setSandboxRating(4);
    } else if (presetType === 'fake') {
      setSandboxText("This product is a total miracle!! It changed my life in literally 3 days! It is perfect in every way and there are absolutely no flaws whatsoever. You must buy it now, don't hesitate! Use my coupon code GETBEST10 at checkout to get an extra 10% off! Visit my blog for more awesome reviews and click here to check out my other links. The best product in the world, 10/10!");
      setSandboxRating(5);
    } else {
      setSandboxText("Extremely disappointed with this blender. It literally caught fire the first time I tried to make a simple fruit smoothie! There was smoke pouring out of the bottom and it completely ruined my kitchen counter. Customer service refused to give a refund and screamed at me on the phone. This is a hazardous product that will burn your house down, stay away!!!");
      setSandboxRating(5);
    }
    setSandboxResult(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fbfbfa]">
      {/* Header Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5 text-teal-800">
          <ShieldCheck className="h-8 w-8 text-teal-600" />
          <span className="font-bold text-xl tracking-tight">ReviewShield</span>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Enter Console <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/50 mb-6">
          <ShieldAlert className="h-3.5 w-3.5" /> Probabilistic E-Commerce Risk Assessment
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 max-w-3xl mx-auto leading-tight">
          Protect your platform integrity from deceptive feedback
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Deploy transparent AI analysis to evaluate e-commerce reviews. Spot promotional patterns, rating mismatches, and review farm behavior instantly.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg">Go to Workspace Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">Create Private Account</Button>
              </Link>
              <a href="#demo-sandbox">
                <Button variant="outline" size="lg">Try Sandbox Demo</Button>
              </a>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-white border-y border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Integrated Features for Modern E-Commerce Moderation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-100 rounded-lg">
              <div className="h-10 w-10 bg-teal-50 text-teal-700 flex items-center justify-center rounded-md mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Single Review Analysis</h3>
              <p className="text-gray-600 text-sm">
                Paste any review content. Get a structured assessment outlining authenticity score, classification risk, and highlighted suspicious spans.
              </p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <div className="h-10 w-10 bg-teal-50 text-teal-700 flex items-center justify-center rounded-md mb-4">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk CSV Analysis</h3>
              <p className="text-gray-600 text-sm">
                Drag-and-drop datasets. Process hundreds of reviews in secure background batches. Export findings and flag clusters of deceptive behavior.
              </p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <div className="h-10 w-10 bg-teal-50 text-teal-700 flex items-center justify-center rounded-md mb-4">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Product Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Track suspicious-review trends, ratings anomalies, extreme sentiment mismatches, and surface coordinates of targeted listing attacks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sandbox Demo Section */}
      <section id="demo-sandbox" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Interactive Review Analysis Sandbox
        </h2>
        <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-10">
          Try the analysis logic directly. Paste a custom review or select from one of our seed presets below.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadPreset('genuine')}>
                    Preset: Genuine Review
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => loadPreset('fake')}>
                    Preset: Promo Fake
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => loadPreset('mismatch')}>
                    Preset: Star Mismatch
                  </Button>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase">Review Text</label>
                  <Textarea
                    rows={6}
                    value={sandboxText}
                    onChange={(e) => setSandboxText(e.target.value)}
                    placeholder="Paste review text here to test..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Star Rating (1 - 5)</label>
                    <select
                      value={sandboxRating}
                      onChange={(e) => setSandboxRating(parseInt(e.target.value))}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-teal-500 focus:ring-teal-500"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleTestAnalysis} className="w-full" disabled={isAnalyzing}>
                      {isAnalyzing ? "Analyzing..." : "Analyze Review"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert variant="info">
              <span className="font-semibold">Disclaimer:</span> ReviewShield outputs are probabilistic risk assessments designed to flag suspicious signals for review. They should support, not replace, human moderation actions.
            </Alert>
          </div>

          <div className="lg:col-span-5">
            {sandboxResult ? (
              <Card className="border-teal-200">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Sandbox Result</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      sandboxResult.classification === 'likely_genuine' 
                        ? 'bg-teal-50 text-teal-800 border-teal-200' 
                        : sandboxResult.classification === 'suspicious'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {sandboxResult.classification === 'likely_genuine' && <CheckCircle className="h-3 w-3" />}
                      {sandboxResult.classification === 'suspicious' && <AlertTriangle className="h-3 w-3" />}
                      {sandboxResult.classification === 'likely_fake' && <XCircle className="h-3 w-3" />}
                      {sandboxResult.classification.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Authenticity Score Gauge */}
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                        <span>Authenticity Score</span>
                        <span>{sandboxResult.authenticityScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            sandboxResult.authenticityScore > 75 
                              ? 'bg-teal-600' 
                              : sandboxResult.authenticityScore > 45
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${sandboxResult.authenticityScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block uppercase font-semibold">Confidence</span>
                      <span className="text-lg font-bold text-gray-700">{sandboxResult.confidence}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-600 mb-1">Explanation</h4>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/40 p-3 rounded border border-gray-100">{sandboxResult.summary}</p>
                  </div>

                  {sandboxResult.signals.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-gray-600 mb-2">Detected Signals ({sandboxResult.signals.length})</h4>
                      <div className="space-y-2">
                        {sandboxResult.signals.map((sig, idx) => (
                          <div key={idx} className="text-xs border-l-2 border-teal-500 pl-3 py-0.5">
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-800 capitalize">{sig.type.replace(/_/g, ' ')}</span>
                              <span className={`text-[10px] px-1 py-0.2 rounded border ${
                                sig.severity === 'high' 
                                  ? 'bg-red-50 border-red-200 text-red-700' 
                                  : sig.severity === 'medium'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-blue-50 border-blue-200 text-blue-700'
                              }`}>{sig.severity}</span>
                            </div>
                            <p className="text-gray-500 mt-0.5">{sig.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No suspicious flags or linguistic anomalies detected.</div>
                  )}

                  {sandboxResult.highlightedPhrases.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-gray-600 mb-1">Highlighted Phrases</h4>
                      <div className="flex flex-wrap gap-1">
                        {sandboxResult.highlightedPhrases.map((phrase, idx) => (
                          <span key={idx} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono">
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center border-dashed border-2 py-20 bg-gray-50/20">
                <div className="text-center px-6">
                  <ShieldCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Ready for evaluation</p>
                  <p className="text-xs text-gray-400 mt-1">Configure inputs and click Analyze Review above</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 border-t border-gray-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <div className="flex justify-center items-center gap-2 text-white font-semibold mb-4">
            <ShieldCheck className="h-5 w-5 text-teal-500" /> ReviewShield
          </div>
          <p>© {new Date().getFullYear()} ReviewShield. All rights reserved. Probabilistic analysis dashboard.</p>
        </div>
      </footer>
    </div>
  );
}
