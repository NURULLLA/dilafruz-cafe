const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'dilafruz_fallback_secret_key';

// Admin credentials (using environment variables for security)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH 
    ? bcrypt.hashSync(process.env.ADMIN_PASSWORD_HASH, 10) 
    : bcrypt.hashSync('admin123', 10);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dataPath = path.join(__dirname, 'data', 'menu.json');

const readData = () => {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { items: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'images'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ===== AUTH MIDDLEWARE =====
const authenticateToken = (req, res, next) => {
    const token = req.cookies.adminToken || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// ===== API ROUTES =====

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '24h' });
        res.cookie('adminToken', token, { httpOnly: true, secure: false });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ success: true });
});

app.get('/api/check-auth', authenticateToken, (req, res) => {
    res.json({ success: true });
});

app.get('/api/menu', (req, res) => {
    const data = readData();
    res.json(data.items);
});

app.post('/api/menu', authenticateToken, upload.single('image'), (req, res) => {
    const data = readData();
    const newItem = {
        id: Date.now().toString(),
        categoryId: req.body.categoryId,
        price: req.body.price,
        image: req.file ? `images/${req.file.filename}` : '',
        name: {
            en: req.body['name.en'] || 'New Item',
            ru: req.body['name.ru'] || 'Новое блюдо',
            uz: req.body['name.uz'] || 'Yangi taom'
        },
        desc: {
            en: req.body['desc.en'] || '',
            ru: req.body['desc.ru'] || '',
            uz: req.body['desc.uz'] || ''
        }
    };
    data.items.push(newItem);
    writeData(data);
    res.json({ success: true, item: newItem });
});

app.put('/api/menu/:id', authenticateToken, upload.single('image'), (req, res) => {
    const data = readData();
    const index = data.items.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Item not found' });

    const item = data.items[index];
    item.categoryId = req.body.categoryId || item.categoryId;
    item.price = req.body.price || item.price;
    if (req.file) {
        item.image = `images/${req.file.filename}`;
    }
    
    // Update translations
    ['en', 'ru', 'uz'].forEach(lang => {
        if (req.body[`name.${lang}`] !== undefined) item.name[lang] = req.body[`name.${lang}`];
        if (req.body[`desc.${lang}`] !== undefined) item.desc[lang] = req.body[`desc.${lang}`];
    });

    writeData(data);
    res.json({ success: true, item });
});

app.delete('/api/menu/:id', authenticateToken, (req, res) => {
    const data = readData();
    data.items = data.items.filter(item => item.id !== req.params.id);
    writeData(data);
    res.json({ success: true });
});

// Admin Route (Protected for API but html will just redirect)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
