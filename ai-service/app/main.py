from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
import os
import uvicorn

from app.schemas import AIAnalysisRequest, AIAnalysisResponse
from services.llm_service import LLMClient
from services.price_service import PriceService
from services.listing_quality_service import ListingQualityService
from services.ai_analysis_service import AIAnalysisService

app = FastAPI(title="AI Listing Assistant - AI Service")

# Allow Go backend and Angular frontend for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize dependencies
# In a production app, these would come from config/env
groq_api_key = os.getenv("GROQ_API_KEY", "dummy_key")
model_name = os.getenv("GROQ_MODEL", "qwen-vl-max")

llm_client = LLMClient(api_key=groq_api_key, model=model_name)
price_service = PriceService()
quality_service = ListingQualityService()

analysis_service = AIAnalysisService(
    llm_client=llm_client,
    price_service=price_service,
    quality_service=quality_service
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze", response_model=AIAnalysisResponse)
def analyze_listing(request: AIAnalysisRequest):
    try:
        return analysis_service.analyze_listing(request)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Invalid data structure: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
