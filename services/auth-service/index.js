const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'GreenCitySuperSecretKey2026!';

// Basit bellek içi kullanıcı deposu (DB bağlantısı öncesi hızlı test için)
const users = [];

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ service: 'Auth Service', status: 'UP', timestamp: new Date() });
});

// 1. KULLANICI KAYIT (Register) - Password Hashing (Secured)
app.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Kullanıcı adı ve parola zorunludur.' });
        }

        // Güvenlik: Parolayı Düz Metin Saklama! (Bcrypt Hashing)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            role: role || 'CITIZEN' // Varsayılan rol: Vatandaş
        };

        users.push(newUser);
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.', userId: newUser.id });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

// 2. KULLANICI GİRİŞ (Login) - JWT Generation
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ error: 'Hatalı kullanıcı adı veya parola.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Hatalı kullanıcı adı veya parola.' });
        }

        // Güvenlik: JWT Token Üretimi (1 saat geçerli)
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Giriş başarılı', token });
    } catch (err) {
        res.status(500).json({ error: 'Giriş işlemi başarısız.' });
    }
});

// 3. TOKEN DOĞRULAMA (Verify) - API Gateway için
app.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false, error: 'Token bulunamadı.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(403).json({ valid: false, error: 'Geçersiz veya süresi dolmuş token.' });
    }
});

app.listen(PORT, () => {
    console.log(`Auth Service ${PORT} portunda çalışıyor.`);
});