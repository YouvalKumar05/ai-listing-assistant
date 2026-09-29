from typing import List, Optional
from pydantic import BaseModel, Field

class CategoryInfo(BaseModel):
    id: int
    name: str
    path: str

class ImagePayload(BaseModel):
    image_id: str
    url: str
    width: int
    height: int

class DocumentPayload(BaseModel):
    document_id: str
    type: str

class AIAnalysisRequest(BaseModel):
    listing_id: str
    category: CategoryInfo
    selling_price: float
    currency: str
    seller_notes: Optional[str] = ""
    images: List[ImagePayload] = []
    documents: List[DocumentPayload] = []

# Outputs

class AISummary(BaseModel):
    provider: str
    modelName: str
    promptVersion: str
    startedAt: str
    completedAt: str

class AttributeEvidence(BaseModel):
    sourceType: str
    sourceId: Optional[str] = None
    description: str

class ProductAttribute(BaseModel):
    name: str
    value: str
    status: str
    confidence: float
    evidence: List[AttributeEvidence] = []

class GeneratedContent(BaseModel):
    title: str
    description: str
    alternativeTitles: List[str]

class ConditionSuggestion(BaseModel):
    suggestedCondition: str
    confidence: float
    observations: List[str]

class MissingInformation(BaseModel):
    field: str
    reason: str
    severity: str
    recommendedAction: str

class ImageIntelligence(BaseModel):
    overallQuality: str
    resolution: str
    brightness: str
    blur: str
    coverage: str
    centering: str

class SearchDiscovery(BaseModel):
    keywords: List[str]
    tags: List[str]
    highlights: List[str]

class PriceIntelligence(BaseModel):
    sellerPrice: float
    currency: str
    comparableCount: int
    medianPrice: float
    q1: float
    q3: float
    typicalRangeMin: float
    typicalRangeMax: float
    pricePosition: str
    priceDeviation: float
    confidence: float
    comparisonLevel: str

class ListingQuality(BaseModel):
    imageQuality: float
    attributeCompleteness: float
    descriptionQuality: float
    conditionClarity: float
    categoryConsistency: float
    informationCompleteness: float
    overallScore: float

class AIRecommendation(BaseModel):
    type: str
    priority: str
    reason: str
    action: str

class AIAnalysisResponse(BaseModel):
    listingId: str
    status: str
    summary: AISummary
    attributes: List[ProductAttribute]
    generatedContent: GeneratedContent
    condition: ConditionSuggestion
    missingInformation: List[MissingInformation]
    imageIntelligence: ImageIntelligence
    searchDiscovery: SearchDiscovery
    priceIntelligence: PriceIntelligence
    listingQuality: ListingQuality
    recommendations: List[AIRecommendation]
