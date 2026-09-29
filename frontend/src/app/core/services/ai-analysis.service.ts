import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AiAnalysisResult, Recommendation } from '../models/ai-analysis.model';

/** Full Sony WH-1000XM5 mock dataset matching spec Section 54 */
const MOCK: AiAnalysisResult = {
  listingId: 'LS-1042',
  analyzedAt: new Date().toISOString(),

  executiveSummary: {
    headline: 'High-confidence product identification. Sony WH-1000XM5 detected with strong attribute confirmation and matching purchase invoice.',
    strengths: [
      'Brand (Sony) and model (WH-1000XM5) confirmed from image markings',
      'Original purchase invoice verified with matching model identification',
      'Authentic accessories detected including OEM travel case and cables',
      'Listing quality rated Good with strong keyword coverage',
    ],
    opportunities: [
      'Condition details need minor clarification regarding light ear-cup wear',
      'Serial number label is partially visible — clearer photo recommended',
      'Packaging box not photographed — confirm if retail box is included',
    ],
  },

  listingQuality: {
    overall: 88,
    productUnderstanding: 96,
    contentQuality: 92,
    attributeCompleteness: 90,
    photoQuality: 86,
    searchDiscoverability: 94,
    buyerClarity: 85,
  },

  productUnderstanding: {
    detectedProduct: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    productType: 'Wireless Headphones',
    brand: 'Sony',
    model: 'WH-1000XM5',
    specification: 'Active Noise Cancelling · 30mm Carbon Drivers · Bluetooth 5.2 · 30h Battery',
    color: 'Black',
    condition: 'Used – Good',
    conditionWhy: 'Minor handling marks on outer ear cup surface; headband and ear cushions are clean with no cracking.',
    conditionConfidence: 84,
    conditionEvidence: [
      'Minor surface wear on outer ear cup — photo 2',
      'Headband leather cushion clean, no tears — photo 1',
      '"WH-1000XM5" label detected on inner headband — photo 3',
      'USB-C port and buttons appear clean and undamaged',
    ],
    includedItems: [
      'Sony WH-1000XM5 Headphones (Black)',
      'Original Sony Zipper Hard Case',
      'USB-C Charging Cable',
      '3.5mm Gold-Plated Audio Cable',
    ],
    confidenceOverall: 92,
  },

  attributes: [
    { key: 'brand',        label: 'Brand',          value: 'Sony',                confidence: 'confirmed', confidencePct: 98, source: 'Image',            evidence: 'Sony wordmark engraved on headband slider — photo 1' },
    { key: 'model',        label: 'Model',          value: 'WH-1000XM5',          confidence: 'likely',    confidencePct: 89, source: 'Image + Document',  evidence: 'Model label on headband; confirmed on ABC Electronics invoice' },
    { key: 'color',        label: 'Color',          value: 'Black',               confidence: 'confirmed', confidencePct: 99, source: 'Image',            evidence: 'Matte black finish identified from primary photo' },
    { key: 'product_type', label: 'Product Type',   value: 'Wireless Headphones', confidence: 'confirmed', confidencePct: 99, source: 'Image',            evidence: 'Over-ear wireless headphone form factor identified' },
    { key: 'condition',    label: 'Condition',      value: 'Used – Good',          confidence: 'review',    confidencePct: 84, source: 'Image + Notes',    evidence: 'Minor surface scuffs on ear cup; clean cushions and headband' },
    { key: 'connectivity', label: 'Connectivity',   value: 'Bluetooth 5.2 + 3.5mm', confidence: 'confirmed', confidencePct: 95, source: 'Model Spec', evidence: 'Standard hardware spec for WH-1000XM5' },
    { key: 'anc',          label: 'Noise Cancelling', value: 'Active (Dual Processor)', confidence: 'confirmed', confidencePct: 97, source: 'Model Spec', evidence: 'ANC microphone ports visible; standard WH-1000XM5 hardware' },
    { key: 'accessories',  label: 'Accessories',    value: 'Case, USB-C, Audio Cable', confidence: 'confirmed', confidencePct: 94, source: 'Image',       evidence: 'OEM travel case and two original cables shown — photo 4' },
  ],

  content: {
    title: {
      field: 'title',
      original: 'Headphones',
      optimized: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones – Black',
      alternates: [
        'Sony WH-1000XM5 Wireless Headphones (Black)',
        'Sony WH-1000XM5 Noise Cancelling Headphones – Black',
        'Sony WH-1000XM5 Over-Ear Bluetooth Headphones',
      ],
      improvements: [
        'Added verified brand (Sony) and exact model (WH-1000XM5)',
        'Included high-intent noise cancellation and wireless search terms',
        'Specified black colorway for buyer clarity',
      ],
      characterCount: { original: 10, optimized: 58 },
    },
    description: {
      field: 'description',
      original: 'Used headphones in good condition with charger and case.',
      optimized: `Sony WH-1000XM5 wireless noise cancelling headphones in black.

Condition: Used – Good. Minor visible wear on outer ear cups. Headband cushion and ear pads are clean with no cracking. All touch controls and microphones function normally.

What's included:
• Original Sony zipper hard-shell travel case
• USB-C charging cable
• 3.5mm gold-plated stereo audio cable

Key specifications:
• Up to 30 hours battery life (3-min quick charge = 3h playback)
• Multipoint Bluetooth 5.2 — pair two devices simultaneously
• Industry-leading Active Noise Cancellation
• Lightweight 250g over-ear design

Shipping: Carefully packed and shipped with tracking.`,
      improvements: [
        'Structured sections for scanability and buyer trust',
        'Detailed condition evidence based on photo inspection',
        'Accurate inventory of verified accessories',
        'Key specifications answering common buyer questions',
      ],
      characterCount: { original: 55, optimized: 620 },
    },
  },

  priceIntelligence: {
    askingPrice: 8500,
    currency: '₹',
    comparableCount: 24,
    marketRangeLow: 18000,
    marketRangeHigh: 24000,
    marketMedian: 21000,
    pricePosition: 'below',
    pricePositionLabel: 'Below typical range',
    marketReference: 'Based on the current reference dataset.',
  },

  photoInsights: [
    { imageIndex: 0, score: 90, clarity: 'good', lighting: 'good', coverage: 'good', issues: [], label: 'Photo 1 – Hero Angle', qualityBadge: 'Good', recommendation: 'Clear product angle showing headphone form and cushion.', url: '/images/sony-xm5-hero.jpg' },
    { imageIndex: 1, score: 88, clarity: 'good', lighting: 'good', coverage: 'good', issues: ['Minor reflection on matte ear cup'], label: 'Photo 2 – Side Profile', qualityBadge: 'Good', recommendation: 'Side profile shows hinge and headband condition.', url: '/images/sony-xm5-side.jpg' },
    { imageIndex: 2, score: 76, clarity: 'fair', lighting: 'good', coverage: 'fair', issues: ['Model text partially angled', 'Serial partially obscured'], label: 'Photo 3 – Label Closeup', qualityBadge: 'Partial', recommendation: 'Retake straight-on for instant model verification.', url: '/images/sony-xm5-label.jpg' },
    { imageIndex: 3, score: 92, clarity: 'good', lighting: 'good', coverage: 'good', issues: [], label: 'Photo 4 – Case & Cables', qualityBadge: 'Good', recommendation: 'All included accessories clearly documented.', url: '/images/sony-xm5-case.jpg' },
  ],

  photoQualitySummary: {
    imageQuality: 'Good',
    productVisibility: 'Good',
    textVisibility: 'Partial',
    additionalPhoto: 'Recommended',
    recommendedPhotos: [
      'Back of product (outer ear cups symmetrically)',
      'Serial/model label — straight-on shot',
      'Package contents (retail box if available)',
    ],
  },

  recommendations: [
    { id: 'r1', priority: 'high',   field: 'photo',       title: 'Add a straight-on photo of the model/serial label', reason: 'Speeds up verification and eliminates buyer inquiries about model authenticity.', actionLabel: 'Add Photo', status: 'pending' },
    { id: 'r2', priority: 'medium', field: 'condition',   title: 'Clarify condition details',                          reason: 'Noting the light ear-cup wear sets realistic buyer expectations and avoids post-sale disputes.', actionLabel: 'Clarify', status: 'pending' },
    { id: 'r3', priority: 'medium', field: 'accessories', title: 'Confirm original accessories',                       reason: 'Buyers frequently ask whether cables are OEM Sony parts.', actionLabel: 'Confirm', status: 'pending' },
    { id: 'r4', priority: 'low',    field: 'title',       title: 'Apply AI-optimised title',                           reason: 'Including "WH-1000XM5" and "Noise Cancelling" improves search discovery.', actionLabel: 'Apply', status: 'pending' },
  ],

  buyerQuestions: [
    { question: 'Is the original packaging included?',     coverage: 'not_specified' },
    { question: 'Are all accessories included?',           coverage: 'covered',       answer: 'Case, USB-C cable, and 3.5mm audio cable included.' },
    { question: 'What is the exact condition?',            coverage: 'covered',       answer: 'Used – Good; minor outer-cup wear, clean cushions.' },
    { question: 'Is the serial/model number visible?',     coverage: 'not_specified' },
    { question: 'How long has the product been used?',     coverage: 'covered',       answer: 'Purchased 12 Mar 2025 per invoice (approx 1–2 months use).' },
  ],

  consistencyChecks: [
    { field: 'Photos ↔ Title',         sellerValue: 'Headphones', aiDetectedValue: 'WH-1000XM5', status: 'consistent', note: 'Photos confirm wireless over-ear noise-cancelling headphones' },
    { field: 'Photos ↔ Category',      sellerValue: 'Electronics > Headphones', aiDetectedValue: 'Headphones', status: 'consistent', note: 'Category matches detected wireless audio equipment' },
    { field: 'Description ↔ Attributes', sellerValue: 'Good condition', aiDetectedValue: 'Used – Good', status: 'consistent', note: 'Condition, brand and color agree with visual attributes' },
    { field: 'Document ↔ Model',       sellerValue: 'Sony WH-1000XM5', aiDetectedValue: 'WH-1000XM5', status: 'consistent', note: 'ABC Electronics invoice matches detected model' },
  ],

  searchMetadata: {
    keywords: ['Sony', 'WH-1000XM5', 'Wireless Headphones', 'Noise Cancelling', 'Bluetooth', 'Over-ear'],
    tags: ['#Sony', '#Headphones', '#Wireless', '#NoiseCancelling', '#BluetoothAudio'],
    searchIntentCoverage: ['brand + model', 'active noise cancellation', 'wireless/bluetooth', 'over-ear'],
    missingIntents: ['warranty remaining', 'retail box included'],
  },

  missingInformation: [
    { id: 'm1', label: 'Condition details',        reason: 'Add visible wear or defects not clear from photos.',            importance: 'Recommended', status: 'pending', actionLabel: 'Add Information' },
    { id: 'm2', label: 'Model / serial label',      reason: 'A clear photo of the model label speeds up authentication.',   importance: 'Optional',    status: 'pending', actionLabel: 'Add Photo' },
    { id: 'm3', label: 'Packaging / retail box',    reason: 'Confirm whether the original retail box is included.',         importance: 'Helpful',     status: 'pending', actionLabel: 'Clarify' },
  ],

  supportingDocuments: [
    { id: 'doc-inv', type: 'Purchase Invoice', name: 'ABC_Electronics_Invoice_March2025.pdf', status: 'verified',  productIdentified: 'Sony WH-1000XM5', retailer: 'ABC Electronics Pvt Ltd', purchaseDate: '12 Mar 2025', amount: '₹29,990', modelDetected: true, notes: 'Tax invoice confirms model; customer name masked.' },
    { id: 'doc-war', type: 'Warranty Card',    name: 'Sony_India_Warranty_Card.jpg',          status: 'uploaded',  productIdentified: 'Sony WH-1000XM5', retailer: 'Sony Authorized Dealer',  purchaseDate: '12 Mar 2025', modelDetected: true, notes: 'Standard 1-year Sony India warranty card identified.' },
  ],

  beforeAfter: {
    beforeTitle: 'Headphones',
    beforeDescription: 'Used headphones in good condition with charger and case.',
    afterTitle: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones – Black',
    afterDescription: 'Structured, factual overview with verified specs, included accessories, and detailed condition evidence.',
  },
};

@Injectable({ providedIn: 'root' })
export class AiAnalysisService {
  private cache = new Map<string, AiAnalysisResult>();

  analyzeListing(listingId: string): Observable<AiAnalysisResult> {
    if (this.cache.has(listingId)) {
      return of(this.cache.get(listingId)!);
    }
    const result: AiAnalysisResult = { ...JSON.parse(JSON.stringify(MOCK)), listingId, analyzedAt: new Date().toISOString() };
    this.cache.set(listingId, result);
    return of(result).pipe(delay(900));
  }

  applyRecommendation(listingId: string, id: string): Observable<Recommendation[]> {
    const r = this.cache.get(listingId);
    if (!r) return of([]);
    const updated = r.recommendations.map(rec => rec.id === id ? { ...rec, status: 'applied' as const } : rec);
    this.cache.set(listingId, { ...r, recommendations: updated });
    return of(updated).pipe(delay(250));
  }

  dismissRecommendation(listingId: string, id: string): Observable<Recommendation[]> {
    const r = this.cache.get(listingId);
    if (!r) return of([]);
    const updated = r.recommendations.map(rec => rec.id === id ? { ...rec, status: 'dismissed' as const } : rec);
    this.cache.set(listingId, { ...r, recommendations: updated });
    return of(updated).pipe(delay(200));
  }

  getCached(listingId: string): AiAnalysisResult | null {
    return this.cache.get(listingId) ?? null;
  }
}
