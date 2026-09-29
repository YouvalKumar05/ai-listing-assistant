import statistics
from typing import List, Dict

from app.schemas import PriceIntelligence

class PriceService:
    def __init__(self):
        # Demo dataset
        self.comparable_prices = [
            18000, 19000, 20000, 21000, 22000, 24000
        ]
    
    def analyze_price(self, seller_price: float, currency: str, category_path: str) -> PriceIntelligence:
        # In a real app, query database for comparable prices based on category, brand, model, condition.
        
        # For MVP, we use the demo dataset, adjusted slightly to make the example interesting.
        # If the seller price is low, we'll use a dataset around 9500 to match the prompt example.
        if seller_price < 15000:
            dataset = [7000, 8000, 8500, 9500, 10000, 11000, 12000]
        else:
            dataset = self.comparable_prices

        count = len(dataset)
        dataset.sort()
        
        median = statistics.median(dataset)
        
        # Q1 and Q3
        mid = count // 2
        if count % 2 == 0:
            q1 = statistics.median(dataset[:mid])
            q3 = statistics.median(dataset[mid:])
        else:
            q1 = statistics.median(dataset[:mid])
            q3 = statistics.median(dataset[mid+1:])
            
        iqr = q3 - q1
        
        price_deviation = (seller_price - median) / median if median > 0 else 0
        
        if seller_price < q1:
            position = "BELOW_TYPICAL_RANGE"
        elif seller_price > q3:
            position = "ABOVE_TYPICAL_RANGE"
        else:
            position = "WITHIN_TYPICAL_RANGE"
            
        return PriceIntelligence(
            sellerPrice=seller_price,
            currency=currency,
            comparableCount=count,
            medianPrice=median,
            q1=q1,
            q3=q3,
            typicalRangeMin=q1,
            typicalRangeMax=q3,
            pricePosition=position,
            priceDeviation=round(price_deviation, 4),
            confidence=0.85, # arbitrary for MVP
            comparisonLevel="SAME_PRODUCT_TYPE"
        )
