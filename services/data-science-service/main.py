import os
from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import numpy as np
from datetime import datetime
from train import train_and_save_model

app = FastAPI(
    title="GreenCity Data Science API",
    description="Scikit-Learn Random Forest Makine Öğrenmesi destekli Hava Kalitesi Tahmin Servisi",
    version="2.0.0"
)

MODEL_PATH = "model.joblib"
model = None

# Servis başlarken modeli otomatik yükle veya eğit
@app.on_event("startup")
def startup_event():
    global model
    if not os.path.exists(MODEL_PATH):
        train_and_save_model()
    model = joblib.load(MODEL_PATH)
    print("🤖 ML Modeli başarıyla hafızaya yüklendi!")

# İstek Veri Şeması (Sıcaklık ve Nem parametreleri eklendi)
class PredictionRequest(BaseModel):
    current_aqi: int = Field(..., example=42, description="Anlık AQI Değeri")
    temperature: float = Field(default=24.5, example=25.0, description="Ortam Sıcaklığı (°C)")
    humidity: float = Field(default=55.0, example=50.0, description="Nem Oranı (%)")
    latitude: float = Field(..., example=39.9208)
    longitude: float = Field(..., example=32.8541)

@app.get("/health")
def health_check():
    return {
        "service": "Data Science Service",
        "status": "UP",
        "model_loaded": model is not None
    }

@app.post("/predict")
def predict_aqi(data: PredictionRequest):
    current_hour = datetime.now().hour
    
    # Model Girdisi: [current_aqi, temperature, humidity, hour]
    features = np.array([[data.current_aqi, data.temperature, data.humidity, current_hour]])
    
    # ML Modeli ile Gelecek Saat Tahmini
    predicted_val = model.predict(features)[0]
    predicted_aqi = int(round(max(0, min(500, float(predicted_val)))))
    
    diff = predicted_aqi - data.current_aqi
    trend = "kötüleşiyor" if diff > 1 else ("iyileşiyor" if diff < -1 else "durağan")
    
    if predicted_aqi <= 50:
        rec = "Hava kalitesi mükemmel, açık hava etkinlikleri için ideal."
    elif predicted_aqi <= 100:
        rec = "Hava kalitesi kabul edilebilir seviyede."
    else:
        rec = "Hassas gruplar (astım, yaşlılar) için riskli hava kalitesi!"

    return {
        "location": {"lat": data.latitude, "lng": data.longitude},
        "input": {
            "currentAqi": data.current_aqi,
            "temperature": data.temperature,
            "humidity": data.humidity
        },
        "predictedAqiIn1Hour": predicted_aqi,
        "trend": trend,
        "modelType": "RandomForestRegressor",
        "recommendation": rec
    }