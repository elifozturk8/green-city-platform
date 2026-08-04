const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DS_SERVICE_URL = process.env.DS_SERVICE_URL || 'http://data-science-service:5000';

// PostgreSQL / PostGIS Bağlantısı
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'greencity_admin',
    host: process.env.POSTGRES_HOST || 'postgres-db',
    database: process.env.POSTGRES_DB || 'greencitydb',
    password: process.env.POSTGRES_PASSWORD || 'SuperSecretPass123!',
    port: 5432,
});

// PostGIS Eklentisi, Tablo ve Otomatik Başlangıç Verisi
const initDb = async () => {
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sensors (
                id SERIAL PRIMARY KEY,
                sensor_name VARCHAR(100) NOT NULL,
                aqi INT NOT NULL,
                location GEOMETRY(Point, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const check = await pool.query('SELECT COUNT(*) FROM sensors;');
        if (parseInt(check.rows[0].count, 10) === 0) {
            await pool.query(`
                INSERT INTO sensors (sensor_name, aqi, location) VALUES
                ('Kızılay Meydanı Sensörü', 42, ST_SetSRID(ST_MakePoint(32.8541, 39.9208), 4326)),
                ('BTK Kampüs Sensörü', 18, ST_SetSRID(ST_MakePoint(32.8122, 39.9081), 4326));
            `);
        }
        console.log('PostGIS veri tabanı hazır!');
    } catch (err) {
        console.error('PostGIS başlatma hatası:', err.message);
    }
};

initDb();

// Health Check
app.get('/health', (req, res) => {
    res.json({ service: 'Sensor Service', status: 'UP', timestamp: new Date() });
});

// GET / - Sensör Verilerini Çek ve Python ML Servisinden Tahminleri Ekleyerek Dön
app.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                sensor_name AS "sensorName", 
                aqi, 
                ST_Y(location::geometry) AS lat, 
                ST_X(location::geometry) AS lng,
                created_at AS "createdAt"
            FROM sensors ORDER BY id ASC;
        `);

        // Node 18+ Nativ Fetch kullanarak Data Science servisine istek atan yardımcı fonksiyon
        const enrichedSensors = await Promise.all(
            result.rows.map(async (sensor) => {
                try {
                    const response = await fetch(`${DS_SERVICE_URL}/predict`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            current_aqi: sensor.aqi,
                            latitude: sensor.lat,
                            longitude: sensor.lng
                        })
                    });

                    if (response.ok) {
                        const predictionData = await response.json();
                        return {
                            ...sensor,
                            prediction: {
                                predictedAqiIn1Hour: predictionData.predictedAqiIn1Hour,
                                trend: predictionData.trend,
                                recommendation: predictionData.recommendation,
                                modelType: predictionData.modelType
                            }
                        };
                    }
                } catch (dsErr) {
                    console.error(`Data Science servisine erişilemedi (Sensör ID: ${sensor.id}):`, dsErr.message);
                }

                return {
                    ...sensor,
                    prediction: null // ML servisine erişilemezse uygulamanın çökmesini engeller
                };
            })
        );

        res.json(enrichedSensors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sensör verileri çekilirken bir hata oluştu.' });
    }
});

// POST / - PostGIS Tablosuna Yeni Sensör Ekleme
app.post('/', async (req, res) => {
    try {
        const { sensorName, aqi, latitude, longitude } = req.body;
        if (!sensorName || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'sensorName, latitude ve longitude parametreleri zorunludur.' });
        }

        const query = `
            INSERT INTO sensors (sensor_name, aqi, location)
            VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))
            RETURNING id, sensor_name AS "sensorName", aqi, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng;
        `;

        const values = [sensorName, aqi || 0, longitude, latitude];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Sensör verisi PostGIS tablosuna başarıyla kaydedildi.',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sensör verisi kaydedilemedi.' });
    }
});

app.listen(PORT, () => {
    console.log(`Sensor Service ${PORT} portunda çalışıyor.`);
});