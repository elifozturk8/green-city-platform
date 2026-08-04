import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

def train_and_save_model():
    print("⏳ Sentetik veri seti oluşturuluyor ve ML modeli eğitiliyor...")
    
    # 1. 1000 örnekli yapay geçmiş veri seti üretimi
    np.random.seed(42)
    n_samples = 1000

    current_aqi = np.random.randint(10, 200, n_samples)
    temperature = np.random.uniform(10, 38, n_samples)
    humidity = np.random.uniform(20, 90, n_samples)
    hour = np.random.randint(0, 24, n_samples)

    # Hedef AQI (Sıcaklık, nem ve saat faktörleriyle simüle edilmiş bağımlı değişken)
    future_aqi = current_aqi + (temperature * 0.25) - (humidity * 0.1) + (hour % 5) + np.random.normal(0, 2, n_samples)
    future_aqi = np.clip(future_aqi, 0, 500)

    df = pd.DataFrame({
        'current_aqi': current_aqi,
        'temperature': temperature,
        'humidity': humidity,
        'hour': hour,
        'future_aqi': future_aqi
    })

    X = df[['current_aqi', 'temperature', 'humidity', 'hour']]
    y = df['future_aqi']

    # 2. Random Forest Regressor Modelini Eğitme
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # 3. Eğitilen Modeli Diske Kaydetme
    joblib.dump(model, 'model.joblib')
    print("✅ ML Modeli eğitildi ve 'model.joblib' olarak kaydedildi!")

if __name__ == "__main__":
    train_and_save_model()