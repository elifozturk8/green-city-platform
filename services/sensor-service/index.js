const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// PostgreSQL / PostGIS Bağlantısı
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'greencity_admin',
    host: process.env.POSTGRES_HOST || 'postgres-db',
    database: process.env.POSTGRES_DB || 'greencitydb',
    password: process.env.POSTGRES_PASSWORD || 'SuperSecretPass123!',
    port: 5432,
});

// PostGIS Eklentisi, Tablo ve Otomatik Başlangıç Verisi (Seeding)
const initDb = async () => {
    try {
        // 1. PostGIS uzantısını aktif et
        await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');

        // 2. Coğrafi veri tipli sensors tablosunu oluştur
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sensors (
                id SERIAL PRIMARY KEY,
                sensor_name VARCHAR(100) NOT NULL,
                aqi INT NOT NULL,
                location GEOMETRY(Point, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Eğer tablo boşsa PostGIS koordinat fonksiyonu ile başlangıç verisi ekle
        const check = await pool.query('SELECT COUNT(*) FROM sensors;');
        if (parseInt(check.rows[0].count, 10) === 0) {
            await pool.query(`
                INSERT INTO sensors (sensor_name, aqi, location) VALUES
                ('Kızılay Meydanı Sensörü', 42, ST_SetSRID(ST_MakePoint(32.8541, 39.9208), 4326)),
                ('BTK Kampüs Sensörü', 18, ST_SetSRID(ST_MakePoint(32.8122, 39.9081), 4326));
            `);
            console.log('PostGIS tablosuna varsayılan sensörler eklendi.');
        }
        console.log('PostGIS veri tabanı entegrasyonu tamamlandı!');
    } catch (err) {
        console.error('PostGIS başlatma hatası:', err.message);
    }
};

initDb();

// Health Check
app.get('/health', (req, res) => {
    res.json({ service: 'Sensor Service', status: 'UP', timestamp: new Date() });
});

// GET / - PostGIS Veri Tabanından Sensör Verilerini Çekme (ST_X ve ST_Y ile)
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
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'PostGIS veri tabanından veriler çekilemedi.' });
    }
});

// POST / - PostGIS Tablosuna Yeni Coğrafi Sensör Kaydı Ekleme
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
        res.status(500).json({ error: 'Sensör verisi PostGIS tablosuna kaydedilemedi.' });
    }
});

app.listen(PORT, () => {
    console.log(`Sensor Service ${PORT} portunda çalışıyor.`);
});