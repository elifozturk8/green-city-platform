Markdown
# 🌍 GREEN-CITY: Akıllı Çevre İzleme & Kent Risk Yönetim Sistemi

> **Kurumsal Mikroservis, Siber Dayanıklılık ve Sistem İzleme (DevOps) Staj Projesi**

---

## 📌 Proje Hakkında

**GREEN-CITY**, kent genelindeki hava kalitesi sensör verilerinin toplanması, kaçak atık/çevre kirliliği ihbarlarının coğrafi konum (CBS/GIS) bazlı yönetilmesi ve iklim riski analizlerinin yapıldığı **kurumsal düzeyde bir Çevre İzleme & Erken Uyarı Platformu** projesidir.

Bu proje; mikroservis mimarisi, izole Docker ağları, PostGIS tabanlı coğrafi veri işleme, OWASP standartlarında siber güvenlik denetimleri ve Prometheus/Grafana/Loki ile uçtan uca sistem izleme (DevOps & SOC) süreçlerini kapsar.

---

## 🏗️ Mimari ve Sistem Yapısı

Proje, tüm servislerin izole bir Docker ağı (`green-city-net`) üzerinde haberleştiği, dış dünyanın ise sadece **API Gateway (Nginx)** üzerinden sisteme erişebildiği bir mikroservis mimarisine sahiptir.

```text
[ İstemci / Web / Mobil ]
          │
          ▼ (Port 80)
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Nginx / Docker)               │
│  - Reverse Proxy & Port Mapping                         │
│  - Rate Limiting (DoS Koruması)                         │
│  - Dynamic Routing & Security Headers                   │
└──────────────────────────┬──────────────────────────────┘
                           │ (İç Ağ: green-city-net)
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth Service │    │ GIS & Sensor │    │ Analytics &  │
│  (JWT / Auth)│    │   Service    │    │ Data Science │
└──────┬───────┘    └──────┬───────┘    └──────────────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              Veri Katmanı (Docker Inside)               │
│  - PostgreSQL + PostGIS (Geospatial Veri)              │
│  - Redis (Cache & Rate Limit Counter)                   │
└─────────────────────────────────────────────────────────┘
🛠️ Kullanılan Teknolojiler
Backend & API: Java / Spring Boot, Python, Nginx (API Gateway)

Veri Tabanı & Önbellek: PostgreSQL (PostGIS Eklentisi), Redis

Konteynerleştirme & Orkestrasyon: Docker, Docker Compose, Docker Networks

Siber Güvenlik & Test: OWASP ZAP, Burp Suite, SonarQube, JWT, Rate Limiting

DevOps & İzleme (Monitoring): Prometheus, Grafana, Loki (Log Akışı), GitHub Actions (CI/CD)

📂 Proje Dizin Yapısı
Plaintext
green-city-platform/
├── docker/
│   └── nginx/
│       └── default.conf       # Gateway Reverse Proxy & Güvenlik Yapılandırması
├── services/
│   ├── auth-service/          # Kimlik Doğrulama & Yetkilendirme Servisi
│   ├── sensor-service/        # CBS & Sensör Veri Yönetim Servisi
│   └── data-science/          # Tahmin ve Analiz Modelleri (Python)
├── .env                       # Ortam Değişkenleri (İzole/Gizli)
├── .gitignore
├── docker-compose.yml         # Tüm Ekosistemi Ayağa Kaldıran Orkestratör
└── README.md                  # Proje Dokümantasyonu
🚀 Kurulum ve Çalıştırma
Ön Gereksinimler
Docker & Docker Compose

Git

Adım Adım Kurulum
Depoyu Klonlayın:

Bash
git clone [https://github.com/elifozturk8/green-city-platform.git](https://github.com/elifozturk8/green-city-platform.git)
cd green-city-platform
Ortam Değişkenlerini Tanımlayın:
Proje kök dizininde bir .env dosyası oluşturun:

Kod snippet'i
POSTGRES_DB=greencitydb
POSTGRES_USER=greencity_admin
POSTGRES_PASSWORD=SuperSecretPass123!
POSTGRES_PORT=5433
REDIS_PORT=6379
Sistemi Docker ile Ayağa Kaldırın:

Bash
docker compose up -d
PostGIS Eklentisini Doğrulayın:

Bash
docker exec -it greencity-postgres psql -U greencity_admin -d greencitydb -c "CREATE EXTENSION IF NOT EXISTS postgis; SELECT PostGIS_Version();"
Erişim:

API Gateway: http://localhost:80

🛡️ Siber Güvenlik ve DevSecOps Sorumlulukları
API Gateway Güvenliği: Brute-Force ve DoS/DDoS saldırılarına karşı API Gateway seviyesinde Rate Limiting kurallarının uygulanması.

Zafiyet Analizi (DAST): OWASP Top 10 standartlarına göre API uçlarının OWASP ZAP / Burp Suite ile test edilmesi.

Statik Kod Taraması (SAST): Bağımlılıklardaki bilinen güvenlik açıklarının (CVE) SonarQube ve OWASP Dependency-Check ile taranması.

Log İzleme (SOC): Sistemdeki şüpheli erişim ve güvenlik loglarının Loki ve Grafana üzerinden canlı takibi.

🗓️ 4 Haftalık Geliştirme Yol Haritası
[x] 1. Hafta: Temel Mimarinin Kurulması, Gitflow Yapısı, PostgreSQL (PostGIS), Redis ve Nginx Gateway'in Dockerize Edilmesi.

[ ] 2. Hafta: Auth Service (JWT) ve Sensor Service Modüllerinin Geliştirilmesi, API Gateway Rotalaması.

[ ] 3. Hafta: Monitoring Katmanı (Prometheus, Grafana, Loki) Kurulumu ve OWASP Pentest Taramaları.

[ ] 4. Hafta: CI/CD Boru Hattı Entegrasyonu, Dokümantasyon Tamamlama ve Final Sunumu.

👤 Yazar
Elif Öztürk - Siber Güvenlik & DevOps Uzmanı - GitHub Profilim


---

### 📤 Güncellenmiş README'yi GitHub'a Gönderme

Dosyayı kaydedip kapattıktan sonra PowerShell terminaline dönüp şu komutları sırasıyla çalıştır:

```powershell
# 1. README değişikliğini sahneye ekleyelim ve commitleyelim
git add README.md
git commit -m "docs: update README with full system architecture and setup guide"

# 2. develop dalındaki bu güncellemeyi GitHub'a pushlayalım
git push origin develop

# 3. Güncellemeyi main dalına da aktaralım (Depo ana sayfasında görünmesi için)
git checkout main
git merge develop
git push origin main

# 4. Tekrar geliştirme dalımıza (develop) geri dönelim
git checkout develop
