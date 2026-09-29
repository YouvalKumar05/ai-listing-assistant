/** Fraud Detection & Risk Review Models
 *
 * These interfaces mirror the future backend fraud API contract.
 * The fraud score formula, weights and thresholds are prototype/demo design only.
 * No production fraud-scoring formula is claimed or replicated.
 */

export type RiskBand = 'low' | 'review' | 'high';
export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuthenticityStatus =
  | 'evidence_sufficient'
  | 'evidence_insufficient'
  | 'additional_evidence_recommended'
  | 'escalate_for_authentication';

export type RecommendedAction =
  | 'proceed_to_admin_review'
  | 'request_more_information'
  | 'hold_for_review'
  | 'escalate_authentication'
  | 'restrict_remove';

/** A single detected fraud signal within a category group */
export interface FraudSignal {
  id: string;
  label: string;
  finding: string;
  severity: SignalSeverity;
  confidence: number; // 0-100
  evidence: string;
  score: number;      // points contribution
  maxScore: number;
}

/** A scored signal category group */
export interface SignalGroup {
  id: string;
  label: string;
  score: number;       // points earned (contribution toward risk)
  maxScore: number;    // maximum possible contribution
  severity: SignalSeverity;
  signals: FraudSignal[];
  summary: string;
}

/** An evidence item displayed in the evidence panel */
export interface EvidenceItem {
  id: string;
  imageIndex?: number;
  /** 'image' | 'text' | 'metadata' | 'price' */
  sourceType: 'image' | 'text' | 'metadata' | 'price';
  detectedSignal: string;
  reason: string;
  confidence: number;
}

export interface FraudResult {
  listingId: string;
  screenedAt: string; // ISO timestamp
  /**
   * 0–100 prototype fraud risk score.
   * This is our own demo scoring formula — not any production system's score.
   */
  fraudRiskScore: number;
  riskBand: RiskBand;
  /** Display disclaimer for prototype score */
  scoreDisclaimer: string;
  signalGroups: SignalGroup[];
  evidenceItems: EvidenceItem[];
  authenticityStatus: AuthenticityStatus;
  authenticityNote: string;
  keyFindings: string[];
  recommendedAction: RecommendedAction;
  recommendedActionLabel: string;
  policyFlags: string[];
}
