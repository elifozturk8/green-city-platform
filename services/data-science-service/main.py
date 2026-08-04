from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(
    title="GreenCity Data Science API",
    description="Hava kalitesi tahmini gerçekleştiren ML servisi",
    version="1.0.0"
)

# Gelen isteklerin veri tipini doğrulama modeli
class PredictionRequest(BaseModel):
    current_aqi: int
    latitude: float
    longitude: float

@app.get("/health")
def health_check():
    return {"service": "Data Science Service", "status": "UP"}

@app.post("/predict")
def predict_aqi(data: PredictionRequest):
    # Gelecek adımda buraya Scikit-Learn ML modelimizi bağlayacağız
    variation = random.randint(-5, 8)
    predicted_aqi = max(0, min(500, data.current_aqi + variation))
    
    trend = "iyileşiyor" if variation < 0 else ("kötüleşiyor" if variation > 0 else "durağan")
    
    return {
        "location": {"lat": data.latitude, "lng": data.longitude},
        "currentAqi": data.current_aqi,
        "predictedAqiIn1Hour": predicted_aqi,
        "trend": trend,
        "recommendation": "Hava kalitesi iyi." if predicted_aqi < 50 else "Hassas gruplar için hava kalitesi olumsuz olabilir."
    }