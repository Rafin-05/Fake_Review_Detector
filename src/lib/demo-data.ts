export interface DemoReview {
  id: string;
  reviewContent: string;
  starRating: number;
  productCategory: string;
  reviewerName: string;
  reviewDate: string;
  productUrl?: string;
  classification: 'likely_genuine' | 'suspicious' | 'likely_fake';
  authenticityScore: number;
  confidence: number;
  summary: string;
  signals: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    evidence: string;
    explanation: string;
  }>;
  highlightedPhrases: string[];
  recommendedAction: 'allow' | 'monitor' | 'manual_review';
  unverifiedPurchase: boolean;
}

export const demoReviews: DemoReview[] = [
  {
    id: "demo-1",
    reviewContent: "I bought these headphones last week after reading several tech blog reviews. The noise cancellation is decent for the price, though it struggles with high-pitched sounds. Sound quality is balanced but lacks deep bass. Battery life is solid—I got about 22 hours of continuous playback before needing a charge. The earcups are comfortable, but the headband starts to pinch after 2 hours of wearing. Overall, a good mid-range option but don't expect premium performance.",
    starRating: 4,
    productCategory: "Electronics",
    reviewerName: "David K.",
    reviewDate: "2026-06-15",
    classification: "likely_genuine",
    authenticityScore: 92,
    confidence: 88,
    summary: "This review appears genuine with a high authenticity score of 92%. The reviewer provides specific, balanced feedback mentioning both positives (battery life, comfort) and negatives (high-pitched noise cancellation, headband pinching).",
    signals: [
      {
        type: "balanced_feedback",
        severity: "low",
        evidence: "Mentions both positive battery life and negative ear pressure after 2 hours.",
        explanation: "Authentic reviews generally detail specific trade-offs rather than pure praise or criticism."
      }
    ],
    highlightedPhrases: [],
    recommendedAction: "allow",
    unverifiedPurchase: false
  },
  {
    id: "demo-2",
    reviewContent: "This product is a total miracle!! It changed my life in literally 3 days! It is perfect in every way and there are absolutely no flaws whatsoever. You must buy it now, don't hesitate! Use my coupon code GETBEST10 at checkout to get an extra 10% off! Visit my blog for more awesome reviews and click here to check out my other links. The best product in the world, 10/10!",
    starRating: 5,
    productCategory: "Beauty & Health",
    reviewerName: "SuperSaver_Reviews",
    reviewDate: "2026-07-02",
    classification: "likely_fake",
    authenticityScore: 18,
    confidence: 94,
    summary: "This review is highly likely fake. It exhibits multiple high-severity signals including excessively promotional language (active discount codes, links), superlative wording, and extreme sentiment without objective details.",
    signals: [
      {
        type: "promotional_language",
        severity: "high",
        evidence: "Contains: 'Use my coupon code GETBEST10', 'Visit my blog', 'click here'",
        explanation: "Reviews that advertise discount codes or link to outside blogs are almost always promotional spam."
      },
      {
        type: "extreme_sentiment",
        severity: "high",
        evidence: "Phrases like 'perfect in every way', 'total miracle', 'best product in the world'",
        explanation: "Unrealistic positive sentiment with no constructive feedback is standard in incentivized reviews."
      },
      {
        type: "reviewer_anonymity",
        severity: "low",
        evidence: "Username is 'SuperSaver_Reviews'",
        explanation: "Commercialized or promotional username patterns strongly correlate with deceptive review campaigns."
      }
    ],
    highlightedPhrases: [
      "Use my coupon code GETBEST10",
      "Visit my blog",
      "click here",
      "perfect in every way",
      "total miracle"
    ],
    recommendedAction: "manual_review",
    unverifiedPurchase: true
  },
  {
    id: "demo-3",
    reviewContent: "Honestly very disappointed. The description says it is compatible with all USB-C devices, but it would not charge my iPad Pro or my MacBook Air at all. It does work with my phone, but charges extremely slowly. The build quality feels like cheap plastic that could crack if dropped. Returning this tomorrow. I advise everyone to avoid this seller.",
    starRating: 1,
    productCategory: "Electronics",
    reviewerName: "tech_guru88",
    reviewDate: "2026-06-20",
    classification: "likely_genuine",
    authenticityScore: 89,
    confidence: 85,
    summary: "This review shows genuine feedback with an authenticity score of 89%. The reviewer gives specific compatibility details (iPad Pro, MacBook Air, phone charging speed) explaining the reasons for the 1-star rating.",
    signals: [
      {
        type: "detailed_evidence",
        severity: "low",
        evidence: "Lists specific device names and behavior (fails to charge iPad Pro, slow on phone).",
        explanation: "Specific technical details and troubleshooting statements indicate actual usage of the product."
      }
    ],
    highlightedPhrases: [],
    recommendedAction: "allow",
    unverifiedPurchase: false
  },
  {
    id: "demo-4",
    reviewContent: "I am absolutely in love with this! It is so amazing. Highly recommend. It works perfectly. The customer service was great. Best buy ever! Go get yours!",
    starRating: 5,
    productCategory: "Home & Kitchen",
    reviewerName: "Amazon Customer",
    reviewDate: "2026-07-10",
    classification: "suspicious",
    authenticityScore: 58,
    confidence: 75,
    summary: "This review is classified as suspicious (58% authenticity). It is short, vague, uses generic phrases, and is posted under a default anonymous reviewer name, which is common in low-cost review farm listings.",
    signals: [
      {
        type: "very_short_or_vague",
        severity: "medium",
        evidence: "Text consists of short boilerplate phrases with zero mention of product features.",
        explanation: "Reviews lacking detail about what the product is or how it performs are often written in bulk."
      },
      {
        type: "reviewer_anonymity",
        severity: "low",
        evidence: "Reviewer name is 'Amazon Customer'",
        explanation: "Default anonymous profile names prevent verification of reviewer history."
      }
    ],
    highlightedPhrases: ["Highly recommend", "Best buy ever"],
    recommendedAction: "monitor",
    unverifiedPurchase: true
  },
  {
    id: "demo-5",
    reviewContent: "Extremely disappointed with this blender. It literally caught fire the first time I tried to make a simple fruit smoothie! There was smoke pouring out of the bottom and it completely ruined my kitchen counter. Customer service refused to give a refund and screamed at me on the phone. This is a hazardous product that will burn your house down, stay away!!!",
    starRating: 5,
    productCategory: "Home & Kitchen",
    reviewerName: "AngryShopper",
    reviewDate: "2026-07-14",
    classification: "suspicious",
    authenticityScore: 52,
    confidence: 80,
    summary: "This review is suspicious (52% authenticity). There is a critical rating mismatch: the reviewer leaves a 5-star rating despite writing a highly negative review claiming the product caught fire and customer service screamed at them.",
    signals: [
      {
        type: "rating_sentiment_mismatch",
        severity: "high",
        evidence: "5-star rating coupled with comments like 'caught fire', 'extremely disappointed', 'burn your house down'",
        explanation: "An extreme negative review text with a 5-star rating indicates either review hijacking (injecting critical comments into a 5-star rating to bypass positive rating filters) or user error, requiring moderator attention."
      }
    ],
    highlightedPhrases: ["Extremely disappointed", "caught fire", "burn your house down"],
    recommendedAction: "monitor",
    unverifiedPurchase: false
  },
  {
    id: "demo-6",
    reviewContent: "Amazing product! It does exactly what it is supposed to do. Quality is top-notch, packaging was beautiful, and shipping was very fast. I will definitely buy from this brand again. Outstanding seller support too.",
    starRating: 5,
    productCategory: "Clothing",
    reviewerName: "Jessica S.",
    reviewDate: "2026-07-16",
    classification: "suspicious",
    authenticityScore: 68,
    confidence: 70,
    summary: "This review is suspicious (68% authenticity). It uses positive templated phrases with no specific descriptions of the clothing item (fit, fabric, color, style). It is also from an unverified purchase.",
    signals: [
      {
        type: "vague_content",
        severity: "low",
        evidence: "Generic praise ('Quality is top-notch', 'does exactly what it is supposed to')",
        explanation: "Generic reviews that fit any product category are frequently bought in batches to boost seller scores."
      },
      {
        type: "unverified_purchase",
        severity: "low",
        evidence: "Transaction has not been verified by the platform.",
        explanation: "Reviews posted without a verified purchase badge carry a slightly higher risk of fabrication."
      }
    ],
    highlightedPhrases: ["Amazing product", "top-notch"],
    recommendedAction: "monitor",
    unverifiedPurchase: true
  }
];
