import datetime

from app.schemas import (
    AIAnalysisRequest, AIAnalysisResponse, AISummary, 
    AIRecommendation
)
from services.llm_service import LLMClient
from services.price_service import PriceService
from services.listing_quality_service import ListingQualityService

class AIAnalysisService:
    def __init__(self, llm_client: LLMClient, price_service: PriceService, quality_service: ListingQualityService):
        self.llm_client = llm_client
        self.price_service = price_service
        self.quality_service = quality_service
        
    def analyze_listing(self, request: AIAnalysisRequest) -> AIAnalysisResponse:
        start_time = datetime.datetime.now(datetime.timezone.utc)
        
        # 1. Multimodal LLM analysis
        llm_result = self.llm_client.analyze_multimodal(request.model_dump())
        
        # 2. Price Intelligence
        price_intel = self.price_service.analyze_price(
            seller_price=request.selling_price,
            currency=request.currency,
            category_path=request.category.path
        )
        
        # 3. Listing Quality
        quality = self.quality_service.calculate_quality(
            llm_result=llm_result, 
            image_count=len(request.images)
        )
        
        # 4. Generate Recommendations
        recommendations = []
        for missing in llm_result.get("missingInformation", []):
            recommendations.append(AIRecommendation(
                type="CONTENT",
                priority=missing.severity,
                reason=missing.reason,
                action=missing.recommendedAction
            ))
            
        if price_intel.pricePosition == "BELOW_TYPICAL_RANGE":
            recommendations.append(AIRecommendation(
                type="PRICE",
                priority="MEDIUM",
                reason="Price is below the reference range",
                action="Review comparable products to ensure optimal pricing."
            ))

        end_time = datetime.datetime.now(datetime.timezone.utc)
        
        summary = AISummary(
            provider="groq",
            modelName=self.llm_client.model,
            promptVersion="v1.0",
            startedAt=start_time.isoformat(),
            completedAt=end_time.isoformat()
        )
        
        return AIAnalysisResponse(
            listingId=request.listing_id,
            status="COMPLETED",
            summary=summary,
            attributes=llm_result.get("attributes", []),
            generatedContent=llm_result.get("generatedContent"),
            condition=llm_result.get("condition"),
            missingInformation=llm_result.get("missingInformation", []),
            imageIntelligence=llm_result.get("imageIntelligence"),
            searchDiscovery=llm_result.get("searchDiscovery"),
            priceIntelligence=price_intel,
            listingQuality=quality,
            recommendations=recommendations
        )
