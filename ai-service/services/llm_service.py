import json
from typing import Dict, Any

from app.schemas import (
    ProductAttribute, AttributeEvidence, GeneratedContent, 
    ConditionSuggestion, MissingInformation, SearchDiscovery, 
    ImageIntelligence
)

class LLMClient:
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
    
    def analyze_multimodal(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        In a real implementation, this would call the Groq Qwen Multimodal model
        with the images and texts. For this MVP, we return a deterministic
        simulated structured output based on the category and seller notes.
        """
        category = request_data.get("category", {}).get("path", "")
        seller_notes = request_data.get("seller_notes", "").lower()
        
        # Simulate product attributes
        attributes = [
            ProductAttribute(
                name="Brand",
                value="Sony" if "sony" in category.lower() or "sony" in seller_notes else "Unknown",
                status="CONFIRMED" if "sony" in seller_notes else "LIKELY",
                confidence=0.94 if "sony" in seller_notes else 0.70,
                evidence=[AttributeEvidence(sourceType="IMAGE", description="Brand logo visible on product")]
            ),
            ProductAttribute(
                name="Model",
                value="WH-1000XM5",
                status="LIKELY",
                confidence=0.82,
                evidence=[
                    AttributeEvidence(sourceType="IMAGE", description="Design matches WH-1000XM5"),
                    AttributeEvidence(sourceType="SELLER_NOTE", description="Seller mentions model")
                ]
            ),
            ProductAttribute(
                name="Color",
                value="Black",
                status="CONFIRMED",
                confidence=0.97,
                evidence=[AttributeEvidence(sourceType="IMAGE", description="Product is black in images")]
            )
        ]
        
        # Condition
        is_used = "used" in seller_notes or "good condition" in seller_notes
        condition = ConditionSuggestion(
            suggestedCondition="Good Used" if is_used else "Like New",
            confidence=0.84,
            observations=[
                "Minor visible surface wear" if is_used else "No visible wear",
                "No obvious structural damage"
            ]
        )
        
        # Content Generation
        gen_content = GeneratedContent(
            title="Sony WH-1000XM5 Wireless Over-Ear Headphones - Black",
            description=f"Wireless over-ear headphones in black. The product appears to be in {condition.suggestedCondition.lower()} condition. The available images show the headphones. Additional packaging/accessory details were not clearly visible.",
            alternativeTitles=[
                "Sony WH-1000XM5 Noise Cancelling Headphones",
                "Black Sony WH-1000XM5 Wireless Over-Ear Headphones"
            ]
        )
        
        # Image Intelligence
        image_intel = ImageIntelligence(
            overallQuality="GOOD",
            resolution="GOOD",
            brightness="GOOD",
            blur="LOW",
            coverage="PARTIAL",
            centering="GOOD"
        )
        
        # Missing Info
        missing_info = [
            MissingInformation(
                field="accessories",
                reason="Original accessories (cables, case) are not clearly shown in images",
                severity="MEDIUM",
                recommendedAction="Upload a photo showing all included accessories"
            )
        ]
        
        search_discovery = SearchDiscovery(
            keywords=["Sony", "WH-1000XM5", "Wireless Headphones", "Noise Cancelling", "Over-ear", "Bluetooth"],
            tags=["#Sony", "#Headphones", "#Wireless", "#NoiseCancelling"],
            highlights=[
                "Wireless over-ear design",
                "Black finish",
                "Noise cancellation capability",
                "Model identified from available evidence",
                f"{condition.suggestedCondition} condition"
            ]
        )

        return {
            "attributes": attributes,
            "condition": condition,
            "generatedContent": gen_content,
            "imageIntelligence": image_intel,
            "missingInformation": missing_info,
            "searchDiscovery": search_discovery
        }
