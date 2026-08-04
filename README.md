# 🌍 GREEN-CITY: Akıllı Çevre İzleme & Kent Risk Yönetim Sistemi

> **Kurumsal Mikroservis, Siber Dayanıklılık ve Sistem İzleme (DevOps) Staj Projesi**

---

## 📌 Proje Hakkında

**GREEN-CITY**, kent genelindeki hava kalitesi sensör verilerinin toplanması, kaçak atık/çevre kirliliği ihbarlarının coğrafi konum (CBS/GIS) bazlı yönetilmesi ve iklim riski analizlerinin yapıldığı **kurumsal düzeyde bir Çevre İzleme & Erken Uyarı Platformu** projesidir.

Bu proje; mikroservis mimarisi, izole Docker ağları, PostGIS tabanlı coğrafi veri işleme, OWASP standartlarında siber güvenlik denetimleri ve interaktif CBS (Leaflet.js) + Yapay Zeka (ML) tahmin paneli süreçlerini kapsar.

---

## 🏗️ Mimari ve Sistem Yapısı

Proje, tüm servislerin izole bir Docker ağı (`green-city-net`) üzerinde haberleştiği, dış dünyadan erişimin ise sadece **API Gateway (Nginx)** üzerinden sağlandığı bir mikroservis mimarisine sahiptir.

```text
[ İstemci / Web / Mobil ]
          │
          ▼ (Port 80)
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Nginx / Docker)               │
│  - Reverse Proxy & Port Mapping                         │
│  - Static Dashboard Hosting (/usr/share/nginx/html)     │
│  - Rate Limiting & Dynamic Routing                      │
└──────────────────────────┬──────────────────────────────┘
                           │ (İç Ağ: green-city-net)
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Auth Service │   │ Sensor & GIS │   │ Data Science │
│   (Node.js)  │   │  (Node.js)   │   │  (FastAPI)   │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       │        ┌─────────┴──────────────────┘
       │        │ (Service-to-Service ML Call)
       ▼        ▼
┌─────────────────────────────────────────────────────────┐
│              Veri Katmanı (Docker Inside)               │
│  - PostgreSQL 16 + PostGIS (Geospatial Veri saklama)    │
│  - Redis 7 (Cache & Rate Limit Counter)                 │
└─────────────────────────────────────────────────────────┘

🛠️ Kullanılan Teknolojiler
Backend & API: Node.js (Express.js), Python (FastAPI), Nginx (API Gateway)

Yapay Zeka & ML: Scikit-Learn (RandomForestRegressor), Pandas, NumPy, Joblib

Veri Tabanı & Önbellek: PostgreSQL 16 (PostGIS Eklentisi), Redis 7

Ön Yüz & CBS (GIS): HTML5, Tailwind CSS, Leaflet.js (CartoDB Dark Matter / OpenStreetMap)

Konteynerleştirme & Orkestrasyon: Docker, Docker Compose, Docker Networks

Siber Güvenlik & Test: OWASP ZAP, Burp Suite, JWT, Rate Limiting

DevOps & İzleme: Prometheus, Grafana, Loki, GitHub Actions (CI/CD)

📂 Proje Dizin Yapısı
green-city-platform/
├── docker/
│   └── nginx/
│       ├── default.conf         # Reverse Proxy & Routing Yapılandırması
│       └── public/
│           └── index.html       # Interaktif Leaflet Harita Paneli & UI
├── services/
│   ├── auth-service/            # Kimlik Doğrulama & JWT Servisi (Node.js)
│   ├── sensor-service/          # PostGIS & Sensör Veri Yönetim Servisi (Node.js)
│   └── data-science-service/    # ML Tahmin ve Analiz Servisi (FastAPI)
├── .env                         # Ortam Değişkenleri (İzole/Gizli)
├── .gitignore
├── docker-compose.yml           # Tüm Ekosistemi Ayağa Kaldıran Orkestratör
└── README.md                    # Proje Dokümantasyonu

🚀 Kurulum ve Çalıştırma
Ön Gereksinimler
Docker & Docker Compose

Git

Adım Adım Kurulum
1-Depoyu Klonlayın:
git clone [https://github.com/elifozturk8/green-city-platform.git](https://github.com/elifozturk8/green-city-platform.git)
cd green-city-platform

2-Ortam Değişkenlerini Tanımlayın:
Proje kök dizininde .env dosyasını kontrol edin/oluşturun:
POSTGRES_DB=greencitydb
POSTGRES_USER=greencity_admin
POSTGRES_PASSWORD=SuperSecretPass123!
POSTGRES_PORT=5432
REDIS_PORT=6379

3-Sistemi Docker ile Ayağa Kaldırın:
docker compose up -d --build

4-PostGIS Eklentisini Doğrulayın:
docker exec -it greencity-postgres psql -U greencity_admin -d greencitydb -c "CREATE EXTENSION IF NOT EXISTS postgis; SELECT PostGIS_Version();"

5-Erişim Noktaları:
-Canlı Harita Dashboard: http://localhost
-FastAPI ML Swagger UI: http://localhost:5000/docs

🛡️ Siber Güvenlik ve DevSecOps Sorumlulukları
API Gateway Güvenliği: Brute-Force ve DoS/DDoS saldırılarına karşı API Gateway seviyesinde Rate Limiting kurallarının uygulanması.

Zafiyet Analizi (DAST): OWASP Top 10 standartlarına göre API uçlarının OWASP ZAP / Burp Suite ile test edilmesi.

Statik Kod Taraması (SAST): Bağımlılıklardaki bilinen güvenlik açıklarının (CVE) SonarQube ve OWASP Dependency-Check ile taranması.

Log İzleme (SOC): Sistemdeki şüpheli erişim ve güvenlik loglarının Loki ve Grafana üzerinden canlı takibi.

🗓️ 4 Haftalık Geliştirme Yol Haritası
[x] 1. Hafta: Temel Mimarinin Kurulması, Gitflow Yapısı, PostgreSQL (PostGIS), Redis ve Nginx Gateway'in Dockerize Edilmesi.

[x] 2. Hafta: Auth Service (JWT) ve Sensor Service Modüllerinin Geliştirilmesi, API Gateway Rotalaması.

[x] 3. Hafta: Python FastAPI ML Modelinin (Scikit-Learn) Eğitilmesi, Servisler Arası (Sensor <-> ML) Entegrasyon ve PostGIS Sorguları.

[x] 4. Hafta: Interaktif Leaflet Harita Dashboard'unun Yayına Alınması, Haritadan Tıklayarak Sensör Ekleme, CI/CD ve Final Dokümantasyonu.

👤 Yazar
Elif Öztürk - Siber Güvenlik & DevOps Uzmanı- GitHub Profilim