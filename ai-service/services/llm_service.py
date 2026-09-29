import json
import base64
import httpx
from typing import Dict, Any, List
from groq import Groq

from app.schemas import (
    ProductAttribute, AttributeEvidence, GeneratedContent,
    ConditionSuggestion, MissingInformation, SearchDiscovery,
    ImageIntelligence
)

ANALYSIS_SYSTEM_PROMPT = """You are an expert AI assistant for a marketplace platform.
Your job is to analyze product images and seller notes to extract structured product information.

You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no code fences.
Follow this exact schema:

{
  "attributes": [
    {
      "name": "string (e.g. Brand, Model, Color, Storage)",
      "value": "string",
      "status": "CONFIRMED | LIKELY | INFERRED",
      "confidence": float (0.0 - 1.0),
      "evidence": [
        { "sourceType": "IMAGE | SELLER_NOTE | INFERRED", "description": "string" }
      ]
    }
  ],
  "condition": {
    "suggestedCondition": "New | Like New | Good Used | Fair | Poor",
    "confidence": float,
    "observations": ["string", ...]
  },
  "generatedContent": {
    "title": "string (SEO-optimised, max 80 chars)",
    "description": "string (2-3 sentences, factual, no hype)",
    "alternativeTitles": ["string", "string"]
  },
  "imageIntelligence": {
    "overallQuality": "EXCELLENT | GOOD | FAIR | POOR",
    "resolution": "EXCELLENT | GOOD | FAIR | POOR",
    "brightness": "EXCELLENT | GOOD | FAIR | POOR",
    "blur": "LOW | MEDIUM | HIGH",
    "coverage": "COMPLETE | PARTIAL | MINIMAL",
    "centering": "EXCELLENT | GOOD | FAIR | POOR"
  },
  "missingInformation": [
    {
      "field": "string",
      "reason": "string",
      "severity": "HIGH | MEDIUM | LOW",
      "recommendedAction": "string"
    }
  ],
  "searchDiscovery": {
    "keywords": ["string", ...],
    "tags": ["#string", ...],
    "highlights": ["string", ...]
  }
}"""


class LLMClient:
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self.client = Groq(api_key=api_key)

    def _encode_image_url(self, url: str) -> Dict[str, Any]:
        """Return a Groq-compatible image_url content block."""
        return {
            "type": "image_url",
            "image_url": {"url": url}
        }

    def _build_user_message(self, request_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        content: List[Dict[str, Any]] = []

        # Attach images
        images = request_data.get("images", [])
        for img in images[:5]:  # Groq supports up to 5 images per request
            url = img.get("url", "")
            if url:
                content.append(self._encode_image_url(url))

        # Build text prompt
        category = request_data.get("category", {})
        seller_notes = request_data.get("seller_notes", "").strip()
        selling_price = request_data.get("selling_price", 0)
        currency = request_data.get("currency", "INR")
        docs = request_data.get("documents", [])

        text_parts = [
            f"Category: {category.get('path', 'Unknown')}",
            f"Seller's Asking Price: {currency} {selling_price}",
        ]
        if seller_notes:
            text_parts.append(f"Seller Notes: {seller_notes}")
        if docs:
            doc_types = [d.get("type", "unknown") for d in docs]
            text_parts.append(f"Supporting Documents: {', '.join(doc_types)}")

        text_parts.append(
            "\nAnalyze the product shown in the images and the seller's notes. "
            "Return structured JSON following the schema provided in the system prompt exactly."
        )

        content.append({"type": "text", "text": "\n".join(text_parts)})
        return content

    def analyze_multimodal(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call the Groq multimodal LLM to analyze a product listing.
        Falls back to a deterministic mock if the API key is missing/invalid.
        """
        if not self.api_key or self.api_key in ("dummy_key", "your_groq_api_key_here"):
            return self._mock_response(request_data)

        try:
            messages = [
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": self._build_user_message(request_data)},
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.1,
                max_tokens=2048,
            )

            raw_text = response.choices[0].message.content.strip()

            # Strip markdown code fences if the model added them
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
                raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            return self._hydrate_response(parsed)

        except json.JSONDecodeError as e:
            print(f"[LLMClient] JSON parse error: {e}. Falling back to mock.")
            return self._mock_response(request_data)
        except Exception as e:
            print(f"[LLMClient] Groq API error: {e}. Falling back to mock.")
            return self._mock_response(request_data)

    def _hydrate_response(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Convert raw parsed dict into typed Pydantic objects."""
        attributes = [
            ProductAttribute(
                name=a.get("name", ""),
                value=a.get("value", ""),
                status=a.get("status", "INFERRED"),
                confidence=float(a.get("confidence", 0.5)),
                evidence=[
                    AttributeEvidence(
                        sourceType=e.get("sourceType", "INFERRED"),
                        sourceId=e.get("sourceId"),
                        description=e.get("description", "")
                    )
                    for e in a.get("evidence", [])
                ]
            )
            for a in parsed.get("attributes", [])
        ]

        raw_cond = parsed.get("condition", {})
        condition = ConditionSuggestion(
            suggestedCondition=raw_cond.get("suggestedCondition", "Unknown"),
            confidence=float(raw_cond.get("confidence", 0.5)),
            observations=raw_cond.get("observations", [])
        )

        raw_content = parsed.get("generatedContent", {})
        gen_content = GeneratedContent(
            title=raw_content.get("title", ""),
            description=raw_content.get("description", ""),
            alternativeTitles=raw_content.get("alternativeTitles", [])
        )

        raw_img = parsed.get("imageIntelligence", {})
        image_intel = ImageIntelligence(
            overallQuality=raw_img.get("overallQuality", "FAIR"),
            resolution=raw_img.get("resolution", "FAIR"),
            brightness=raw_img.get("brightness", "FAIR"),
            blur=raw_img.get("blur", "MEDIUM"),
            coverage=raw_img.get("coverage", "PARTIAL"),
            centering=raw_img.get("centering", "FAIR")
        )

        missing_info = [
            MissingInformation(
                field=m.get("field", ""),
                reason=m.get("reason", ""),
                severity=m.get("severity", "LOW"),
                recommendedAction=m.get("recommendedAction", "")
            )
            for m in parsed.get("missingInformation", [])
        ]

        raw_search = parsed.get("searchDiscovery", {})
        search_discovery = SearchDiscovery(
            keywords=raw_search.get("keywords", []),
            tags=raw_search.get("tags", []),
            highlights=raw_search.get("highlights", [])
        )

        return {
            "attributes": attributes,
            "condition": condition,
            "generatedContent": gen_content,
            "imageIntelligence": image_intel,
            "missingInformation": missing_info,
            "searchDiscovery": search_discovery,
        }

    def _mock_response(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Deterministic fallback when no valid API key is set."""
        category = request_data.get("category", {}).get("path", "")
        seller_notes = request_data.get("seller_notes", "").lower()

        is_used = "used" in seller_notes or "good condition" in seller_notes
        has_sony = "sony" in category.lower() or "sony" in seller_notes

        attributes = [
            ProductAttribute(
                name="Brand",
                value="Sony" if has_sony else "Unknown",
                status="CONFIRMED" if has_sony else "INFERRED",
                confidence=0.94 if has_sony else 0.50,
                evidence=[AttributeEvidence(sourceType="SELLER_NOTE" if has_sony else "INFERRED",
                                            description="Brand identified from seller notes or category")]
            ),
            ProductAttribute(
                name="Color", value="Black", status="CONFIRMED", confidence=0.97,
                evidence=[AttributeEvidence(sourceType="IMAGE", description="Product appears black")]
            ),
        ]

        condition = ConditionSuggestion(
            suggestedCondition="Good Used" if is_used else "Like New",
            confidence=0.84,
            observations=["Minor surface wear" if is_used else "No visible wear", "No structural damage"]
        )

        gen_content = GeneratedContent(
            title=f"{'Sony ' if has_sony else ''}Product - {'Used' if is_used else 'Like New'}",
            description="Product available for purchase. Please review all images for condition details.",
            alternativeTitles=["Quality Used Item", "Verified Listing"]
        )

        image_intel = ImageIntelligence(
            overallQuality="GOOD", resolution="GOOD", brightness="GOOD",
            blur="LOW", coverage="PARTIAL", centering="GOOD"
        )

        missing_info = [
            MissingInformation(
                field="accessories", reason="Accessories not clearly shown",
                severity="MEDIUM", recommendedAction="Upload photo showing all included accessories"
            )
        ]

        search_discovery = SearchDiscovery(
            keywords=["product", "quality", "used" if is_used else "new"],
            tags=["#marketplace", "#verified"],
            highlights=["Good condition", "Fast shipping"]
        )

        return {
            "attributes": attributes,
            "condition": condition,
            "generatedContent": gen_content,
            "imageIntelligence": image_intel,
            "missingInformation": missing_info,
            "searchDiscovery": search_discovery,
        }
