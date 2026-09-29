/** AI Analysis Models — full spec */

export type AttributeConfidence = 'confirmed' | 'likely' | 'review' | 'not_detected' | 'missing';
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'applied' | 'dismissed';

export interface AttributeItem {
  key: string;
  label: string;
  value: string | null;
  confidence: AttributeConfidence;
  source?: string;
  evidence?: string;
  confidencePct: number;
  sellerEdited?: boolean;
}

export interface ContentSuggestion {
  field: 'title' | 'description';
  original: string;
  optimized: string;
  alternates?: string[];
  improvements: string[];
  characterCount: { original: number; optimized: number };
  sellerEdited?: boolean;
}

export interface PriceIntelligence {
  askingPrice: number;
  currency: string;
  comparableCount: number;
  marketRangeLow: number;
  marketRangeHigh: number;
  marketMedian: number;
  pricePosition: 'below' | 'within' | 'above';
  pricePositionLabel: string;
  marketReference: string;
}

export interface PhotoInsight {
  imageIndex: number;
  score: number;
  clarity: 'good' | 'fair' | 'poor';
  lighting: 'good' | 'fair' | 'poor';
  coverage: 'good' | 'fair' | 'poor';
  issues: string[];
  recommendation?: string;
  url?: string;
  label?: string;
  qualityBadge?: string;
}

export interface QualityScore {
  overall: number;
  productUnderstanding: number;
  contentQuality: number;
  attributeCompleteness: number;
  photoQuality: number;
  searchDiscoverability: number;
  buyerClarity: number;
}

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  field: string;
  title: string;
  reason: string;
  actionLabel?: string;
  status: RecommendationStatus;
}

export interface BuyerQuestion {
  question: string;
  coverage: 'covered' | 'not_specified';
  answer?: string;
}

export interface ConsistencyCheck {
  field: string;
  sellerValue: string;
  aiDetectedValue: string;
  status: 'match' | 'conflict' | 'unverifiable' | 'consistent';
  note?: string;
}

export interface SearchMetadata {
  keywords: string[];
  tags: string[];
  searchIntentCoverage: string[];
  missingIntents: string[];
}

export interface MissingInfoItem {
  id: string;
  label: string;
  reason: string;
  importance?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  actionLabel: string;
}

export interface SupportingDocumentReview {
  id: string;
  type: string;
  name: string;
  status: 'uploaded' | 'verified' | 'inconsistent';
  productIdentified: string;
  retailer?: string;
  purchaseDate?: string;
  amount?: string;
  modelDetected?: boolean;
  notes?: string;
}

export interface AiAnalysisResult {
  listingId: string;
  analyzedAt: string;
  listingQuality: QualityScore;
  attributes: AttributeItem[];
  content: { title: ContentSuggestion; description: ContentSuggestion };
  priceIntelligence: PriceIntelligence;
  photoInsights: PhotoInsight[];
  recommendations: Recommendation[];
  buyerQuestions: BuyerQuestion[];
  consistencyChecks: ConsistencyCheck[];
  searchMetadata: SearchMetadata;
  executiveSummary: { headline: string; strengths: string[]; opportunities: string[] };
  productUnderstanding: {
    detectedProduct: string;
    productType: string;
    brand: string;
    model: string;
    specification: string;
    color: string;
    condition: string;
    conditionWhy?: string;
    conditionConfidence?: number;
    conditionEvidence: string[];
    includedItems: string[];
    confidenceOverall: number;
    sellerEdited?: boolean;
  };
  missingInformation?: MissingInfoItem[];
  supportingDocuments?: SupportingDocumentReview[];
  beforeAfter?: { beforeTitle: string; beforeDescription: string; afterTitle: string; afterDescription: string };
  photoQualitySummary?: { imageQuality: string; productVisibility: string; textVisibility: string; additionalPhoto: string; recommendedPhotos: string[] };
}
