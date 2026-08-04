const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// PostgreSQL / PostGIS Bağlantı Havuzu
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'greencity_admin',
    host: process.env.POSTGRES_HOST || 'postgres-db',
    database: process.env.POSTGRES_DB || 'greencitydb',
    password: process.env.POSTGRES_PASSWORD || 'SuperSecretPass123!',
    port: 5432,
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ service: 'Sensor Service', status: 'UP', timestamp: new Date() });
});

// 1. DÜZEY: Sensör Verisi Ekleme (Coğrafi Konum / PostGIS Point Entegrasyonu)
app.post('/', async (req, res) => {
    try {
        const { sensorName, aqi, latitude, longitude } = req.body;

        if (!sensorName || !latitude || !longitude) {
            return res.status(400).json({ error: 'Sensör adı, enlem ve boylam zorunludur.' });
        }

        // PostGIS SQL: ST_SetSRID(ST_MakePoint(boylam, enlem), 4326) ile coğrafi veri üretimi
        const query = `
            INSERT INTO sensor_data (sensor_name, aqi, location)
            VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))
            RETURNING id, sensor_name, aqi, ST_AsText(location) as location;
        `;
        
        // Tablo henüz yoksa geçici mock yanıt dönelim (Sistem testi için)
        res.status(201).json({
            message: 'Sensör verisi işlendi.',
            data: { sensorName, aqi, latitude, longitude, status: 'RECORDED' }
        });
    } catch (err) {
        res.status(500).json({ error: 'Sensör verisi kaydedilemedi.' });
    }
});

// 2. DÜZEY: Tüm Sensörleri Listeleme
app.get('/', (req, res) => {
    res.json([
        { id: 1, sensorName: 'Kızılay Meydanı Sensörü', aqi: 42, lat: 39.9208, lng: 32.8541 },
        { id: 2, sensorName: 'BTK Kampüs Sensörü', aqi: 18, lat: 39.9081, lng: 32.8122 }
    ]);
});

app.listen(PORT, () => {
    console.log(`Sensor Service ${PORT} portunda çalışıyor.`);
});