const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Use JSON body parser with a large limit for base64 images
app.use(express.json({ limit: '50mb' }));

app.post('/api/upload', (req, res) => {
    try {
        const { path: imagePath, image } = req.body;
        console.log(`[Local API] Uploading image to ${imagePath}`);
        const targetPath = path.join(__dirname, imagePath);
        
        // Strip out the data url prefix if it exists
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(targetPath, buffer);
        res.json({ success: true, path: imagePath });
    } catch (e) {
        console.error('[Local API] Error uploading image:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/menu', (req, res) => {
    try {
        const { items } = req.body;
        console.log(`[Local API] Updating menu.json with ${items.length} items`);
        const targetPath = path.join(__dirname, 'data', 'menu.json');
        
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(targetPath, JSON.stringify({ items }, null, 2));
        res.json({ success: true });
    } catch (e) {
        console.error('[Local API] Error updating menu:', e.message);
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Local development server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`Main Site: http://localhost:${PORT}/index.html`);
});
