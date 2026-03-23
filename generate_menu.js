const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'public', 'images');
const dataFile = path.join(__dirname, 'data', 'menu.json');

const files = fs.readdirSync(imageDir);

// Categories
// dishes, kebabs, drinks, sides, desserts, salads, appetizers, hookah

const items = [];
let idCounter = 1;

files.forEach(file => {
    if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return; // Only process images

    const nameWithoutExt = file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").replace(/^\d+\.?\s*/, "");
    const formattedName = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);

    let categoryId = 'dishes';
    
    // Simple heuristic to assign category based on filename
    const lowerName = file.toLowerCase();
    if (lowerName.includes('shashlik') || lowerName.includes('kabob') || lowerName.includes('kovirga')) categoryId = 'kebabs';
    else if (lowerName.includes('salat')) categoryId = 'salads';
    else if (lowerName.includes('tiramisu') || lowerName.includes('dessert')) categoryId = 'desserts';
    else if (lowerName.includes('cocktail') || lowerName.includes('drink')) categoryId = 'drinks';
    else if (lowerName.includes('kalyan')) categoryId = 'hookah';

    items.push({
        id: idCounter.toString(),
        categoryId,
        price: '0 сум',
        image: `images/${file}`,
        name: {
            en: formattedName,
            ru: formattedName,
            uz: formattedName
        },
        desc: {
            en: 'Description pending.',
            ru: 'Описание ожидается.',
            uz: 'Tavsif kutumoqda.'
        }
    });
    idCounter++;
});

const data = { items };

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log(`Successfully generated data/menu.json with ${items.length} items.`);
