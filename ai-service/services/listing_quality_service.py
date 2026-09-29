from app.schemas import ListingQuality

class ListingQualityService:
    def calculate_quality(self, llm_result: dict, image_count: int) -> ListingQuality:
        # Simple heuristic calculation for MVP
        
        # Image quality (0-100)
        img_qual = min(100.0, image_count * 20.0) 
        
        # Attribute completeness (0-100)
        attrs = llm_result.get("attributes", [])
        confirmed_count = sum(1 for a in attrs if a.status == "CONFIRMED")
        attr_comp = min(100.0, confirmed_count * 33.3) if attrs else 50.0
        
        # Description quality (0-100)
        desc = llm_result.get("generatedContent", {}).description if hasattr(llm_result.get("generatedContent"), "description") else ""
        desc_qual = min(100.0, len(desc) / 5.0) if desc else 0.0
        
        # Condition clarity (0-100)
        cond = llm_result.get("condition")
        cond_clarity = cond.confidence * 100.0 if cond else 0.0
        
        # Category consistency (0-100)
        cat_cons = 95.0 # Stubbed for MVP
        
        # Information completeness (0-100)
        missing = len(llm_result.get("missingInformation", []))
        info_comp = max(0.0, 100.0 - (missing * 20.0))
        
        # Weighted overall
        overall = (
            0.20 * img_qual +
            0.20 * attr_comp +
            0.15 * desc_qual +
            0.15 * cond_clarity +
            0.15 * cat_cons +
            0.15 * info_comp
        )
        
        return ListingQuality(
            imageQuality=round(img_qual, 2),
            attributeCompleteness=round(attr_comp, 2),
            descriptionQuality=round(desc_qual, 2),
            conditionClarity=round(cond_clarity, 2),
            categoryConsistency=round(cat_cons, 2),
            informationCompleteness=round(info_comp, 2),
            overallScore=round(overall, 2)
        )
