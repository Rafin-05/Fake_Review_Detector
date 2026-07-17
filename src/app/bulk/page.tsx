"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { bulkUploadAction, exportDatasetCsvAction } from "@/app/actions/analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Alert } from "@/components/ui";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  Filter
} from "lucide-react";

export default function BulkUploadPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = authClient.useSession();

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Result States
  const [uploadedDataset, setUploadedDataset] = useState<any | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Only CSV files (.csv) are supported.");
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
      setError("File exceeds the 2MB size limit.");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleProcessCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgressPercent(10);
    setProgressStatus("Reading file content...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        
        setProgressPercent(30);
        setProgressStatus("Validating columns and rows...");

        // Simulate progress intervals for smoother UI transitions
        const progressInterval = setInterval(() => {
          setProgressPercent((prev) => {
            if (prev >= 85) {
              clearInterval(progressInterval);
              return 85;
            }
            return prev + 5;
          });
          setProgressStatus("Running AI model and calculating risk scores...");
        }, 300);

        const dataset = await bulkUploadAction(file.name, csvText);
        
        clearInterval(progressInterval);
        setProgressPercent(100);
        setProgressStatus("Finished. Persisting to workspace...");

        setUploadedDataset(dataset);
        setFile(null);

        // Notify parent router or reload dashboard list
        router.refresh();
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to process CSV file.");
      } finally {
        setIsProcessing(false);
        setProgressPercent(0);
        setProgressStatus("");
      }
    };

    reader.onerror = () => {
      setError("Failed to read local file.");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleExportCSV = async () => {
    if (!uploadedDataset) return;
    try {
      const csvString = await exportDatasetCsvAction(uploadedDataset.id);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `reviewshield_audit_${uploadedDataset.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error(err);
      setError("Failed to export dataset results.");
    }
  };

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bulk CSV Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Audit batches of reviews. Upload a spreadsheet, map fields, and get immediate aggregation metrics.
        </p>
      </div>

      {error && (
        <Alert variant="error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>{error}</div>
        </Alert>
      )}

      {/* Upload Zone */}
      {!uploadedDataset && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-0">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center py-16 px-6 text-center cursor-pointer transition-colors ${
                isDragging ? "bg-teal-50/55" : "hover:bg-gray-50/50"
              }`}
            >
              <Input
                id="csv-file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
              
              {!file ? (
                <label htmlFor="csv-file-upload" className="w-full h-full cursor-pointer flex flex-col items-center">
                  <div className="p-4 bg-teal-50 text-teal-600 rounded-full border border-teal-100 mb-4">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Drag and drop your review CSV here</p>
                  <p className="text-xs text-gray-400 mt-1.5">Or browse files from your computer (Max 2MB)</p>
                  <span className="mt-4 px-3 py-1.5 bg-white text-xs font-semibold text-teal-700 border border-teal-200 rounded hover:bg-teal-50 transition-colors">
                    Choose File
                  </span>
                </label>
              ) : (
                <div className="w-full max-w-sm space-y-4">
                  <div className="flex items-center justify-between p-3 border border-teal-200 bg-teal-50/30 rounded-lg">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileSpreadsheet className="h-5 w-5 text-teal-600 flex-shrink-0" />
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded transition-colors"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isProcessing ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>{progressStatus}</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleProcessCSV}>
                        Begin Batch Audit
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success / Result Summary */}
      {uploadedDataset && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-teal-200">
            <CardHeader className="flex flex-row justify-between items-center py-4 px-6 border-b border-gray-100">
              <div>
                <CardTitle className="text-teal-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-600" /> Batch Processing Complete
                </CardTitle>
                <CardDescription>File &quot;{uploadedDataset.name}&quot; has been analyzed successfully.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setUploadedDataset(null)}>
                  Upload Another File
                </Button>
                <Button size="sm" onClick={handleExportCSV} className="inline-flex gap-1.5">
                  <Download className="h-4 w-4" /> Export CSV Results
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="text-center md:text-left">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Total Reviews Audited</span>
                  <span className="text-3xl font-bold text-gray-900 mt-1 block">{uploadedDataset.rowCount}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Flagged Deceptive Rows</span>
                  <span className="text-3xl font-bold text-amber-600 mt-1 block">{uploadedDataset.suspiciousCount}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Avg Authenticity Score</span>
                  <span className="text-3xl font-bold text-teal-600 mt-1 block">{uploadedDataset.averageScore}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert variant="info" className="text-xs">
            <span className="font-semibold">CSV Column Formatting Guidance:</span> Next time you format your CSV, make sure columns match these supported header names: <code className="bg-white border border-gray-200 px-1 py-0.5 rounded font-mono font-bold">review</code> (required), <code className="bg-white border border-gray-200 px-1 py-0.5 rounded font-mono font-bold">rating</code>, <code className="bg-white border border-gray-200 px-1 py-0.5 rounded font-mono font-bold">category</code>, <code className="bg-white border border-gray-200 px-1 py-0.5 rounded font-mono font-bold">name</code>, <code className="bg-white border border-gray-200 px-1 py-0.5 rounded font-mono font-bold">date</code>.
          </Alert>
        </div>
      )}
    </div>
  );
}
