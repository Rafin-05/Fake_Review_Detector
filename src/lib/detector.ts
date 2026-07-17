import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Structured output schema required by the user
export const detectionSchema = z.object({
  classification: z.enum(['likely_genuine', 'suspicious', 'likely_fake']),
  authenticityScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
  signals: z.array(z.object({
    type: z.string(), // e.g. 'promotional_language', 'rating_mismatch', 'unnatural_wording', 'vague_content'
    severity: z.enum(['low', 'medium', 'high']),
    evidence: z.string(),
    explanation: z.string(),
  })),
  highlightedPhrases: z.array(z.string()),
  recommendedAction: z.enum(['allow', 'monitor', 'manual_review']),
});

export type DetectionResult = z.infer<typeof detectionSchema>;

// Detailed Local Rule-Based NLP Analyzer (Fallback when AI key is missing)
export function analyzeReviewLocally(
  reviewContent: string,
  starRating?: number,
  category?: string,
  reviewerName?: string,
  unverifiedPurchase?: boolean
): DetectionResult {
  const content = reviewContent.trim();
  const contentLower = content.toLowerCase();
  
  const signals: Array<{ type: string; severity: 'low' | 'medium' | 'high'; evidence: string; explanation: string }> = [];
  const highlightedPhrases: string[] = [];
  
  let scorePoints = 100; // Start at 100% genuine, deduct based on suspicion
  let confidence = 80;   // Default confidence
  
  // 1. Check length & vagueness
  if (content.length < 30) {
    const vagueWords = ['good', 'great', 'ok', 'nice', 'bad', 'fine', 'perfect', 'love it', 'not bad'];
    const isVague = vagueWords.some(w => contentLower === w || contentLower.startsWith(w));
    if (isVague) {
      signals.push({
        type: 'very_short_or_vague',
        severity: 'medium',
        evidence: `"${content}"`,
        explanation: 'Review is extremely short and contains only general terms without specific details about the product.'
      });
      scorePoints -= 25;
      confidence += 5;
    } else {
      signals.push({
        type: 'short_review',
        severity: 'low',
        evidence: `${content.length} characters`,
        explanation: 'The review is very brief, which is typical of low-effort or automated reviews.'
      });
      scorePoints -= 10;
    }
  }

  // 2. Check for Excessively Promotional Language
  const promotionalPhrases = [
    'coupon code', 'discount code', 'click here', 'visit my blog', 'use my link', 
    'sponsored', 'promotional', 'free product', 'received in exchange', 'highly recommend buying',
    'game changer', 'revolutionary product', 'do not hesitate', 'buy it now', 'best deals'
  ];
  
  const foundPromo = promotionalPhrases.filter(phrase => contentLower.includes(phrase));
  if (foundPromo.length > 0) {
    signals.push({
      type: 'promotional_language',
      severity: foundPromo.length > 1 ? 'high' : 'medium',
      evidence: foundPromo.map(p => `"${p}"`).join(', '),
      explanation: 'Contains phrases typically found in sponsored campaigns or affiliate spam.'
    });
    foundPromo.forEach(p => {
      // Find the actual phrase with matching casing in the original text
      const index = contentLower.indexOf(p);
      if (index !== -1) {
        highlightedPhrases.push(content.substring(index, index + p.length));
      }
    });
    scorePoints -= 25 * foundPromo.length;
  }

  // 3. Extreme Sentiment / Superlatives
  const superlatives = [
    'perfect in every way', 'flawless', 'absolute perfection', 'changed my life', 
    'best in the world', 'best product ever', 'miracle worker', 'magical', '10/10'
  ];
  const foundSuperlatives = superlatives.filter(phrase => contentLower.includes(phrase));
  if (foundSuperlatives.length > 0) {
    signals.push({
      type: 'extreme_sentiment',
      severity: 'low',
      evidence: foundSuperlatives.map(s => `"${s}"`).join(', '),
      explanation: 'Uses overly dramatic or superlative language that is uncharacteristic of objective reviews.'
    });
    foundSuperlatives.forEach(s => {
      const index = contentLower.indexOf(s);
      if (index !== -1) {
        highlightedPhrases.push(content.substring(index, index + s.length));
      }
    });
    scorePoints -= 12;
  }

  // 4. Rating and Text Mismatch
  if (starRating !== undefined) {
    const positiveWords = ['great', 'excellent', 'love', 'perfect', 'amazing', 'best', 'wonderful', 'happy'];
    const negativeWords = ['terrible', 'worst', 'hate', 'trash', 'waste', 'broken', 'useless', 'disappointed', 'refund', 'return'];
    
    const countPositive = positiveWords.filter(w => contentLower.includes(w)).length;
    const countNegative = negativeWords.filter(w => contentLower.includes(w)).length;

    if (starRating >= 4 && countNegative > countPositive && countNegative >= 2) {
      signals.push({
        type: 'rating_sentiment_mismatch',
        severity: 'high',
        evidence: `Rating is ${starRating} Stars but text contains negative terms: ${negativeWords.filter(w => contentLower.includes(w)).join(', ')}`,
        explanation: 'There is a stark mismatch between a high star rating and predominantly negative review text, indicating potential rating manipulation.'
      });
      scorePoints -= 35;
      confidence += 10;
    } else if (starRating <= 2 && countPositive > countNegative && countPositive >= 2) {
      signals.push({
        type: 'rating_sentiment_mismatch',
        severity: 'high',
        evidence: `Rating is ${starRating} Stars but text contains positive terms: ${positiveWords.filter(w => contentLower.includes(w)).join(', ')}`,
        explanation: 'There is a stark mismatch between a low star rating and highly positive review text, which often happens in review hijacking or rating sabotage.'
      });
      scorePoints -= 35;
      confidence += 10;
    }
  }

  // 5. Unverified Purchase
  if (unverifiedPurchase) {
    signals.push({
      type: 'unverified_purchase',
      severity: 'low',
      evidence: 'Unverified transaction status',
      explanation: 'The reviewer does not have a verified purchase label, increasing the likelihood of a fabricated review.'
    });
    scorePoints -= 15;
  }

  // 6. Reviewer Name Anomaly
  if (reviewerName) {
    const reviewerLower = reviewerName.toLowerCase();
    const isAnonymous = reviewerLower.includes('customer') || reviewerLower.includes('buyer') || reviewerLower === 'anonymous' || reviewerLower.trim() === '';
    if (isAnonymous) {
      signals.push({
        type: 'reviewer_anonymity',
        severity: 'low',
        evidence: `Reviewer name is "${reviewerName}"`,
        explanation: 'The reviewer name is generic or anonymous, commonly seen in bulk automated postings.'
      });
      scorePoints -= 8;
    }
  }

  // Ensure score is between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(scorePoints)));
  
  // Classify based on score
  let classification: 'likely_genuine' | 'suspicious' | 'likely_fake' = 'likely_genuine';
  let recommendedAction: 'allow' | 'monitor' | 'manual_review' = 'allow';
  
  if (finalScore < 45) {
    classification = 'likely_fake';
    recommendedAction = 'manual_review';
  } else if (finalScore < 75) {
    classification = 'suspicious';
    recommendedAction = 'monitor';
  }

  // Generate summary
  let summary = '';
  if (classification === 'likely_genuine') {
    summary = `This review appears genuine with a high authenticity score of ${finalScore}%. The language is descriptive and consistent with natural consumer feedback.`;
  } else if (classification === 'suspicious') {
    summary = `This review has been flagged as suspicious (${finalScore}% authenticity). Key warning signals include ${signals.map(s => s.type.replace(/_/g, ' ')).join(', ')}.`;
  } else {
    summary = `This review is highly likely fake (${finalScore}% authenticity). Serious anomalies were detected, including: ${signals.map(s => s.type.replace(/_/g, ' ')).join(', ')}.`;
  }

  return {
    classification,
    authenticityScore: finalScore,
    confidence: Math.min(95, confidence),
    summary,
    signals,
    highlightedPhrases,
    recommendedAction
  };
}

// Main detection function utilizing Vercel AI SDK with fallback
export async function analyzeReview(
  reviewContent: string,
  starRating?: number,
  category?: string,
  reviewerName?: string,
  unverifiedPurchase?: boolean
): Promise<DetectionResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    // No API key provided: fall back to the robust local analyzer
    return analyzeReviewLocally(reviewContent, starRating, category, reviewerName, unverifiedPurchase);
  }

  try {
    // Initialize google client using key
    // We can configure the AI SDK model
    const model = google('gemini-2.5-flash');

    const prompt = `
      You are an expert fraud detection AI specialized in identifying fake, deceptive, or coordinated reviews on e-commerce platforms.
      Analyze the following review details and classify it as "likely_genuine", "suspicious", or "likely_fake".
      
      Review Content:
      """
      ${reviewContent}
      """
      
      Additional Context:
      - Star Rating: ${starRating !== undefined ? `${starRating} Stars` : 'Not provided'}
      - Product Category: ${category || 'Not provided'}
      - Reviewer Name: ${reviewerName || 'Not provided'}
      - Verified Purchase Status: ${unverifiedPurchase ? 'Unverified Purchase' : 'Verified Purchase'}

      Provide a strict JSON response validating against the requested schema, identifying behavioral and linguistic signals (like extreme sentiment, templated phrases, rating/text mismatch, promotional words, unverified status, etc.).
      Deduct authenticityScore based on the presence and severity of these signals.
      Clearly provide highlightedPhrases containing substring phrases from the review content that are highly suspicious.
    `;

    const { object } = await generateObject({
      model,
      schema: detectionSchema,
      prompt,
      // Vercel AI gateway configuration can go in headers/options if requested, but this is the standard direct client
    });

    return object;
  } catch (error) {
    console.error('Failed to analyze review with Gemini, falling back to local analysis:', error);
    return analyzeReviewLocally(reviewContent, starRating, category, reviewerName, unverifiedPurchase);
  }
}
