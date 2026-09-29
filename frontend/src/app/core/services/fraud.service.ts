import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { FraudResult } from '../models/fraud.model';

/**
 * Fraud Detection Service
 *
 * IMPORTANT: All scores, weights and thresholds below are prototype/demo values only.
 * They do not represent any production fraud-scoring system.
 */
const MOCK_FRAUD_RESULT: FraudResult = {
  listingId: '',
  screenedAt: new Date().toISOString(),
  fraudRiskScore: 67,
  riskBand: 'review',
  scoreDisclaimer:
    'Automated screening — prototype demo score (0–100). Final decision requires human review. Score formula and weights are not representative of any production system.',
  signalGroups: [
    {
      id: 'image_integrity',
      label: 'Image Integrity',
      score: 4,   // lower contribution = better
      maxScore: 20,
      severity: 'low',
      summary: 'Images appear authentic. Minor background noise detected in hero shot.',
      signals: [
        {
          id: 'img-bg',
          label: 'Background complexity',
          finding: 'Hero image shows a natural domestic background consistent with authentic seller photography.',
          severity: 'low',
          confidence: 72,
          evidence: 'Image #1 — natural desk setting and ambient lighting',
          score: 1,
          maxScore: 6,
        },
        {
          id: 'img-duplicate',
          label: 'Duplicate image check',
          finding: 'No matching duplicate or stock images found in recent marketplace index.',
          severity: 'low',
          confidence: 91,
          evidence: 'Visual perceptual hash search across 50,000 recent listings',
          score: 1,
          maxScore: 7,
        },
        {
          id: 'img-ownership',
          label: 'Image originality',
          finding: 'Photographs appear to be original user-captured images, not manufacturer or promotional assets.',
          severity: 'low',
          confidence: 85,
          evidence: 'EXIF sensor pattern and composition analysis',
          score: 2,
          maxScore: 7,
        },
      ],
    },
    {
      id: 'product_consistency',
      label: 'Product Consistency',
      score: 17,
      maxScore: 20,
      severity: 'high',
      summary: 'Listing title references Canon EOS 90D with 18-135mm lens, but lens markings in image #2 require visual verification.',
      signals: [
        {
          id: 'pc-model',
          label: 'Brand/model match',
          finding: 'Brand "Canon" and model "EOS 90D" verified from body badge and dial typography.',
          severity: 'low',
          confidence: 96,
          evidence: 'Image #1 — camera body faceplate engraving matches Canon EOS 90D styling',
          score: 2,
          maxScore: 6,
        },
        {
          id: 'pc-lens',
          label: 'Lens specification conflict',
          finding: 'Seller states "18-135mm" but lens barrel marking analysis suggests possible 18-55mm lens in image #2.',
          severity: 'high',
          confidence: 71,
          evidence: 'Image #2 — focal length markings partially obscured; diameter appears compact',
          score: 13,
          maxScore: 8,
        },
        {
          id: 'pc-category',
          label: 'Category consistency',
          finding: 'Category "DSLR Camera" accurately matches detected physical product form factor.',
          severity: 'low',
          confidence: 99,
          evidence: 'Mirror box and optical viewfinder morphology verified',
          score: 2,
          maxScore: 6,
        },
      ],
    },
    {
      id: 'authenticity_evidence',
      label: 'Authenticity Evidence',
      score: 13,
      maxScore: 20,
      severity: 'medium',
      summary: 'Serial number not visible in submitted images. Canon branding appears genuine; additional evidence recommended for high-value threshold.',
      signals: [
        {
          id: 'auth-logo',
          label: 'Brand marking analysis',
          finding: 'Canon wordmark and logo proportions match authentic OEM specifications.',
          severity: 'low',
          confidence: 89,
          evidence: 'Image #1 — Canon prism housing wordmark font geometry verified',
          score: 2,
          maxScore: 6,
        },
        {
          id: 'auth-serial',
          label: 'Serial number visibility',
          finding: 'Serial number area is not clearly visible in any of the submitted images.',
          severity: 'medium',
          confidence: 94,
          evidence: 'Image #3 — camera base plate serial sticker area is angled out of frame',
          score: 8,
          maxScore: 8,
        },
        {
          id: 'auth-engravings',
          label: 'Body engravings / compliance tags',
          finding: 'Regulatory and CE/FCC compliance engravings are partially obscured by angle.',
          severity: 'medium',
          confidence: 76,
          evidence: 'Image #4 — bottom chassis markings obscured by tabletop shadow',
          score: 3,
          maxScore: 6,
        },
      ],
    },
    {
      id: 'policy_signals',
      label: 'Policy Signals',
      score: 8,
      maxScore: 15,
      severity: 'medium',
      summary: 'Keyword density in AI-suggested title is elevated. No off-platform solicitation detected.',
      signals: [
        {
          id: 'pol-keywords',
          label: 'Keyword density',
          finding: 'Original seller title is standard; AI-optimised suggestion contains multiple search keywords.',
          severity: 'medium',
          confidence: 68,
          evidence: 'Title text analysis: 4 search keywords ("DSLR", "WiFi", "4K", "Vlogging")',
          score: 5,
          maxScore: 5,
        },
        {
          id: 'pol-offplatform',
          label: 'Off-platform solicitation',
          finding: 'No external contact info, phone numbers, or off-platform payment links detected.',
          severity: 'low',
          confidence: 97,
          evidence: 'Natural language regex and pattern screening on description & notes',
          score: 1,
          maxScore: 3,
        },
        {
          id: 'pol-prohibited',
          label: 'Prohibited item check',
          finding: 'Product is standard consumer electronics and not on any restricted item catalog.',
          severity: 'low',
          confidence: 99,
          evidence: 'Marketplace category catalog restriction rule-set check: Passed',
          score: 1,
          maxScore: 3,
        },
        {
          id: 'pol-false-brand',
          label: 'False brand claim',
          finding: 'Brand name matches photographed equipment; no brand misrepresentation detected.',
          severity: 'low',
          confidence: 91,
          evidence: 'Brand claim "Canon" cross-matched against detected manufacturer emblems',
          score: 1,
          maxScore: 4,
        },
      ],
    },
    {
      id: 'duplicate_repost',
      label: 'Duplicate / Repost',
      score: 5,
      maxScore: 15,
      severity: 'medium',
      summary: 'A similar listing with comparable images was active 18 days ago from this seller account.',
      signals: [
        {
          id: 'dup-listing',
          label: 'Duplicate listing detection',
          finding: 'A listing with similar title and matching camera model was closed by seller 18 days prior.',
          severity: 'medium',
          confidence: 78,
          evidence: 'Historical listing #LST-9042 from seller account closed on 2026-09-03',
          score: 4,
          maxScore: 10,
        },
        {
          id: 'dup-repost',
          label: 'Excessive repost pattern',
          finding: 'Repost interval (18 days) exceeds rapid-cycling spam threshold of 72 hours.',
          severity: 'low',
          confidence: 85,
          evidence: 'Account frequency audit: 1 prior camera listing in past 90 days',
          score: 1,
          maxScore: 5,
        },
      ],
    },
    {
      id: 'price_anomaly',
      label: 'Price Anomaly',
      score: 6,
      maxScore: 10,
      severity: 'medium',
      summary:
        'Asking price is ₹74,999 — 3.4% above the 18-comparable market median of ₹72,500. Slight premium observed.',
      signals: [
        {
          id: 'price-position',
          label: 'Price vs. market comparables',
          finding:
            'Asking price ₹74,999 is slightly above market median ₹72,500 (+3.4%). Observed range is ₹68,000–₹78,000.',
          severity: 'medium',
          confidence: 82,
          evidence: 'Market dataset: 18 comparable verified pre-owned Canon 90D listings in 60 days',
          score: 4,
          maxScore: 6,
        },
        {
          id: 'price-extreme',
          label: 'Extreme price deviation',
          finding: 'Price is comfortably within the interquartile market band. No suspicious deep discount detected.',
          severity: 'low',
          confidence: 95,
          evidence: 'Price z-score = +0.48 (within normal range of ±2.0)',
          score: 2,
          maxScore: 4,
        },
      ],
    },
  ],
  evidenceItems: [
    {
      id: 'e1',
      imageIndex: 1,
      sourceType: 'image',
      detectedSignal: 'Lens specification conflict',
      reason: 'Focal length markings on barrel partially obscured — cannot confirm 18–135mm vs 18–55mm',
      confidence: 71,
    },
    {
      id: 'e2',
      imageIndex: 2,
      sourceType: 'image',
      detectedSignal: 'Serial number not visible',
      reason: 'Serial number sticker area not clearly in frame in any image',
      confidence: 94,
    },
    {
      id: 'e3',
      sourceType: 'text',
      detectedSignal: 'Keyword density (AI suggestion)',
      reason: 'AI-optimised title has high keyword density — review before applying',
      confidence: 68,
    },
    {
      id: 'e4',
      sourceType: 'metadata',
      detectedSignal: 'Possible duplicate listing',
      reason: 'Account listed similar camera 18 days prior with matching image composition',
      confidence: 78,
    },
    {
      id: 'e5',
      sourceType: 'price',
      detectedSignal: 'Price above median (supporting signal)',
      reason: '₹74,999 vs median ₹72,500 — 3.4% above market mid-point. Not alone indicative of fraud.',
      confidence: 82,
    },
  ],
  authenticityStatus: 'additional_evidence_recommended',
  authenticityNote:
    'Canon branding appears consistent with genuine products. However, serial number is not visible and lens specification requires clarification. Additional evidence recommended before final determination. Professional authentication available for eligible items.',
  keyFindings: [
    'Lens specification text may conflict with image evidence — clarification required',
    'Serial number not visible in any submitted image',
    'Similar listing found on account 18 days prior',
    'Price is slightly above market median (supporting signal only)',
    'No off-platform solicitation or prohibited content detected',
  ],
  recommendedAction: 'request_more_information',
  recommendedActionLabel: 'Request More Information',
  policyFlags: [
    'Lens specification requires seller clarification',
    'Serial number evidence absent',
  ],
};

@Injectable({ providedIn: 'root' })
export class FraudService {
  private cache = new Map<string, FraudResult>();

  /** Screen a listing for fraud signals — simulates async backend call */
  screenListing(listingId: string): Observable<FraudResult> {
    if (this.cache.has(listingId)) {
      return of(this.cache.get(listingId)!);
    }
    const result: FraudResult = {
      ...MOCK_FRAUD_RESULT,
      listingId,
      screenedAt: new Date().toISOString(),
    };
    this.cache.set(listingId, result);
    return of(result).pipe(delay(2200));
  }

  getCached(listingId: string): FraudResult | null {
    return this.cache.get(listingId) ?? null;
  }
}
