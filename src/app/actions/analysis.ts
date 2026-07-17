"use server";

import { db } from "@/lib/db/client";
import { analyses, datasets, feedbacks } from "@/lib/db/schema";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { analyzeReview, DetectionResult } from "@/lib/detector";
import { demoReviews } from "@/lib/demo-data";

// Helper to get authenticated user session
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Seed demo data for user if they don't have any reviews/datasets
export async function ensureDemoDataSeeded(userId: string) {
  // Check if they already have any datasets or analyses
  const userAnalyses = await db
    .select()
    .from(analyses)
    .where(eq(analyses.userId, userId))
    .limit(1);

  if (userAnalyses.length > 0) {
    return; // Already has data (either uploaded or seeded)
  }

  // Create a demonstration dataset entry
  const datasetId = `demo-dataset-${userId}`;
  
  // Calculate average score and count for demo reviews
  const rowCount = demoReviews.length;
  const suspiciousCount = demoReviews.filter(r => r.classification !== 'likely_genuine').length;
  const totalScore = demoReviews.reduce((sum, r) => sum + r.authenticityScore, 0);
  const averageScore = Math.round(totalScore / rowCount);

  try {
    await db.insert(datasets).values({
      id: datasetId,
      userId,
      name: "Demonstration Dataset",
      rowCount,
      suspiciousCount,
      averageScore,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert demo reviews
    for (const review of demoReviews) {
      await db.insert(analyses).values({
        id: `${review.id}-${userId}`,
        userId,
        datasetId,
        reviewContent: review.reviewContent,
        productCategory: review.productCategory,
        starRating: review.starRating,
        reviewerName: review.reviewerName,
        reviewDate: review.reviewDate,
        classification: review.classification,
        authenticityScore: review.authenticityScore,
        confidence: review.confidence,
        summary: review.summary,
        signals: JSON.stringify(review.signals),
        highlightedPhrases: JSON.stringify(review.highlightedPhrases),
        recommendedAction: review.recommendedAction,
        isDemo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (err) {
    console.error("Failed to seed demo data:", err);
  }
}

// Single Review Analysis Action
export async function analyzeSingleReviewAction(formData: {
  reviewContent: string;
  productCategory?: string;
  starRating?: number;
  reviewerName?: string;
  reviewDate?: string;
  productUrl?: string;
  unverifiedPurchase?: boolean;
}) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;

  // Run AI analysis (falls back to local rules engine if Gemini key is missing)
  const result = await analyzeReview(
    formData.reviewContent,
    formData.starRating,
    formData.productCategory,
    formData.reviewerName,
    formData.unverifiedPurchase
  );

  const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Insert into DB
  await db.insert(analyses).values({
    id: analysisId,
    userId,
    reviewContent: formData.reviewContent,
    productCategory: formData.productCategory || null,
    starRating: formData.starRating !== undefined ? formData.starRating : null,
    reviewerName: formData.reviewerName || null,
    reviewDate: formData.reviewDate || new Date().toISOString().split('T')[0],
    productUrl: formData.productUrl || null,
    classification: result.classification,
    authenticityScore: result.authenticityScore,
    confidence: result.confidence,
    summary: result.summary,
    signals: JSON.stringify(result.signals),
    highlightedPhrases: JSON.stringify(result.highlightedPhrases),
    recommendedAction: result.recommendedAction,
    isDemo: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: analysisId,
    ...result,
  };
}

// Get Analysis Detail Action (with feedback)
export async function getAnalysisDetailAction(analysisId: string) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;

  const result = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.id, analysisId), eq(analyses.userId, userId)))
    .limit(1);

  if (result.length === 0) {
    throw new Error("Analysis not found");
  }

  const analysis = result[0];

  // Fetch feedback
  const feedbackResult = await db
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.analysisId, analysisId))
    .limit(1);

  return {
    ...analysis,
    signals: JSON.parse(analysis.signals),
    highlightedPhrases: JSON.parse(analysis.highlightedPhrases),
    feedback: feedbackResult[0] || null,
  };
}

// Submit Moderator Feedback
export async function submitFeedbackAction(
  analysisId: string,
  label: 'correct' | 'incorrect',
  notes: string
) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;

  // Verify ownership
  const analysisResult = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.id, analysisId), eq(analyses.userId, userId)))
    .limit(1);

  if (analysisResult.length === 0) {
    throw new Error("Unauthorized or analysis not found");
  }

  // Check if feedback already exists
  const existingFeedback = await db
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.analysisId, analysisId))
    .limit(1);

  if (existingFeedback.length > 0) {
    // Update
    await db
      .update(feedbacks)
      .set({
        label,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(feedbacks.analysisId, analysisId));
  } else {
    // Insert
    await db.insert(feedbacks).values({
      id: `feedback-${Date.now()}`,
      analysisId,
      userId,
      label,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return { success: true };
}

// Get Analyses list with filters
export async function getAnalysesAction(filters: {
  classification?: 'likely_genuine' | 'suspicious' | 'likely_fake';
  rating?: number;
  confidenceMin?: number;
  search?: string;
  datasetId?: string;
}) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;
  await ensureDemoDataSeeded(userId);

  let queryConditions = [eq(analyses.userId, userId)];

  if (filters.classification) {
    queryConditions.push(eq(analyses.classification, filters.classification));
  }
  if (filters.rating !== undefined && filters.rating !== 0) {
    queryConditions.push(eq(analyses.starRating, filters.rating));
  }
  if (filters.confidenceMin !== undefined) {
    // SQLite uses SQL expressions for >= comparisons
    queryConditions.push(sql`${analyses.confidence} >= ${filters.confidenceMin}`);
  }
  if (filters.datasetId) {
    queryConditions.push(eq(analyses.datasetId, filters.datasetId));
  }
  if (filters.search) {
    // Search in content or reviewer name
    queryConditions.push(
      sql`(${analyses.reviewContent} LIKE ${`%${filters.search}%`} OR ${analyses.reviewerName} LIKE ${`%${filters.search}%`})`
    );
  }

  const results = await db
    .select()
    .from(analyses)
    .where(and(...queryConditions))
    .orderBy(desc(analyses.createdAt));

  return results.map(analysis => ({
    ...analysis,
    signals: JSON.parse(analysis.signals),
    highlightedPhrases: JSON.parse(analysis.highlightedPhrases),
  }));
}

// Get User's Datasets
export async function getDatasetsAction() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;
  await ensureDemoDataSeeded(userId);

  return await db
    .select()
    .from(datasets)
    .where(eq(datasets.userId, userId))
    .orderBy(desc(datasets.createdAt));
}

// Get Dashboard Statistics Action
export async function getDashboardStatsAction(datasetId?: string) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;
  await ensureDemoDataSeeded(userId);

  let conditions = [eq(analyses.userId, userId)];
  if (datasetId) {
    conditions.push(eq(analyses.datasetId, datasetId));
  }

  const allReviews = await db
    .select()
    .from(analyses)
    .where(and(...conditions));

  const totalReviews = allReviews.length;
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      suspiciousPercentage: 0,
      averageScore: 0,
      riskLevel: "None",
      classificationDistribution: [],
      ratingDistribution: [],
      mismatchCount: 0,
      recentAnalyses: []
    };
  }

  const suspiciousCount = allReviews.filter(r => r.classification === 'suspicious' || r.classification === 'likely_fake').length;
  const suspiciousPercentage = Math.round((suspiciousCount / totalReviews) * 100);

  const totalScore = allReviews.reduce((sum, r) => sum + r.authenticityScore, 0);
  const averageScore = Math.round(totalScore / totalReviews);

  let riskLevel: 'Safe' | 'Moderate' | 'High' = 'Safe';
  if (suspiciousPercentage > 35) {
    riskLevel = 'High';
  } else if (suspiciousPercentage > 15) {
    riskLevel = 'Moderate';
  }

  // Classification Distribution
  const genuineCount = allReviews.filter(r => r.classification === 'likely_genuine').length;
  const fakeCount = allReviews.filter(r => r.classification === 'likely_fake').length;
  const suspCount = allReviews.filter(r => r.classification === 'suspicious').length;

  const classificationDistribution = [
    { name: "Likely Genuine", value: genuineCount, color: "#0d9488" }, // teal
    { name: "Suspicious", value: suspCount, color: "#d97706" }, // amber
    { name: "Likely Fake", value: fakeCount, color: "#dc2626" }, // red
  ];

  // Rating Distribution (1 to 5 Stars)
  const ratings = [1, 2, 3, 4, 5];
  const ratingDistribution = ratings.map(star => {
    const starReviews = allReviews.filter(r => r.starRating === star);
    const starCount = starReviews.length;
    const suspiciousInStar = starReviews.filter(r => r.classification !== 'likely_genuine').length;
    return {
      stars: `${star} Star`,
      total: starCount,
      suspicious: suspiciousInStar,
      genuine: starCount - suspiciousInStar,
    };
  });

  // Calculate sentiment mismatches (5-star with bad sentiment, or 1-star with good sentiment)
  let mismatchCount = 0;
  allReviews.forEach(r => {
    try {
      const sigs = JSON.parse(r.signals);
      if (sigs.some((s: any) => s.type === 'rating_sentiment_mismatch')) {
        mismatchCount++;
      }
    } catch (_) {}
  });

  // Surface the 5 most suspicious reviews first
  const recentAnalyses = [...allReviews]
    .sort((a, b) => a.authenticityScore - b.authenticityScore) // Ascending (lowest authenticity score = most suspicious)
    .slice(0, 5)
    .map(r => ({
      ...r,
      signals: JSON.parse(r.signals),
      highlightedPhrases: JSON.parse(r.highlightedPhrases)
    }));

  return {
    totalReviews,
    suspiciousPercentage,
    averageScore,
    riskLevel,
    classificationDistribution,
    ratingDistribution,
    mismatchCount,
    recentAnalyses
  };
}

// Bulk Upload Action (parses CSV, analyzes in batches, creates Dataset)
export async function bulkUploadAction(fileName: string, csvData: string) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;

  // Simple CSV Parser that handles double quotes correctly
  function parseCSV(text: string) {
    const lines = text.split(/\r\n|\n/);
    const result: string[][] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const row: string[] = [];
      let inQuotes = false;
      let currentField = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      row.push(currentField.trim());
      result.push(row);
    }
    return result;
  }

  const parsed = parseCSV(csvData);
  if (parsed.length <= 1) {
    throw new Error("CSV is empty or missing data rows");
  }

  // Header validation
  const headers = parsed[0].map(h => h.toLowerCase());
  const reviewIndex = headers.indexOf('review');
  const ratingIndex = headers.indexOf('rating');
  const categoryIndex = headers.indexOf('category');
  const nameIndex = headers.indexOf('name');
  const dateIndex = headers.indexOf('date');
  const unverifiedIndex = headers.indexOf('unverified');

  if (reviewIndex === -1) {
    throw new Error("CSV must contain a 'review' or 'Review' column");
  }

  const rows = parsed.slice(1);
  const totalRows = rows.length;

  const datasetId = `dataset-${Date.now()}`;
  const analyzedRows: Array<{
    id: string;
    reviewContent: string;
    starRating?: number;
    productCategory?: string;
    reviewerName?: string;
    reviewDate?: string;
    unverifiedPurchase?: boolean;
    result: DetectionResult;
  }> = [];

  let totalScore = 0;
  let suspiciousCount = 0;

  // Batch process reviews
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const reviewContent = row[reviewIndex];
    if (!reviewContent) continue; // skip empty rows

    const starRating = ratingIndex !== -1 && row[ratingIndex] ? parseInt(row[ratingIndex]) : undefined;
    const productCategory = categoryIndex !== -1 ? row[categoryIndex] : undefined;
    const reviewerName = nameIndex !== -1 ? row[nameIndex] : undefined;
    const reviewDate = dateIndex !== -1 ? row[dateIndex] : undefined;
    const unverifiedPurchase = unverifiedIndex !== -1 ? (row[unverifiedIndex].toLowerCase() === 'true' || row[unverifiedIndex] === '1') : false;

    // Analyze this row
    const result = await analyzeReview(
      reviewContent,
      starRating,
      productCategory,
      reviewerName,
      unverifiedPurchase
    );

    totalScore += result.authenticityScore;
    if (result.classification !== 'likely_genuine') {
      suspiciousCount++;
    }

    analyzedRows.push({
      id: `analysis-bulk-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      reviewContent,
      starRating,
      productCategory,
      reviewerName,
      reviewDate,
      unverifiedPurchase,
      result
    });
  }

  if (analyzedRows.length === 0) {
    throw new Error("No valid reviews found in the CSV");
  }

  const averageScore = Math.round(totalScore / analyzedRows.length);

  // Insert dataset
  await db.insert(datasets).values({
    id: datasetId,
    userId,
    name: fileName,
    rowCount: analyzedRows.length,
    suspiciousCount,
    averageScore,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insert all analyses
  for (const row of analyzedRows) {
    await db.insert(analyses).values({
      id: row.id,
      userId,
      datasetId,
      reviewContent: row.reviewContent,
      productCategory: row.productCategory || null,
      starRating: row.starRating !== undefined ? row.starRating : null,
      reviewerName: row.reviewerName || null,
      reviewDate: row.reviewDate || new Date().toISOString().split('T')[0],
      classification: row.result.classification,
      authenticityScore: row.result.authenticityScore,
      confidence: row.result.confidence,
      summary: row.result.summary,
      signals: JSON.stringify(row.result.signals),
      highlightedPhrases: JSON.stringify(row.result.highlightedPhrases),
      recommendedAction: row.result.recommendedAction,
      isDemo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return {
    id: datasetId,
    name: fileName,
    rowCount: analyzedRows.length,
    suspiciousCount,
    averageScore
  };
}

// Export dataset results to CSV string
export async function exportDatasetCsvAction(datasetId: string) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;

  const datasetResult = await db
    .select()
    .from(datasets)
    .where(and(eq(datasets.id, datasetId), eq(datasets.userId, userId)))
    .limit(1);

  if (datasetResult.length === 0) {
    throw new Error("Dataset not found");
  }

  const rows = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.datasetId, datasetId), eq(analyses.userId, userId)))
    .orderBy(desc(analyses.createdAt));

  // Build CSV content
  const headers = ['Review', 'Rating', 'Category', 'Reviewer Name', 'Review Date', 'Classification', 'Authenticity Score', 'Confidence', 'Summary', 'Recommended Action'];
  
  const csvLines = [headers.join(',')];

  rows.forEach(r => {
    const escapedReview = `"${r.reviewContent.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const escapedSummary = `"${r.summary.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const line = [
      escapedReview,
      r.starRating || '',
      r.productCategory || '',
      `"${(r.reviewerName || '').replace(/"/g, '""')}"`,
      r.reviewDate || '',
      r.classification,
      r.authenticityScore,
      r.confidence,
      escapedSummary,
      r.recommendedAction
    ];
    csvLines.push(line.join(','));
  });

  return csvLines.join('\n');
}

// Clear Workspace Action (deletes all analyses, datasets, feedbacks for user, resets demo seed)
export async function clearWorkspaceAction() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  const userId = session.user.id;

  try {
    // Delete all records scoped to the user
    await db.delete(feedbacks).where(eq(feedbacks.userId, userId));
    await db.delete(analyses).where(eq(analyses.userId, userId));
    await db.delete(datasets).where(eq(datasets.userId, userId));

    // Reseed a clean demonstration dataset
    await ensureDemoDataSeeded(userId);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to clear workspace:", err);
    throw new Error(err.message || "Failed to clear workspace.");
  }
}

