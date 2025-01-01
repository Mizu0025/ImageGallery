const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const app = express();
const PORT = 8080;

// Static folders for images and thumbnails
const DOMAIN_PATH = '/var/www/magical-hayate.net';
const IMAGE_FOLDER = path.join(DOMAIN_PATH, 'artbot');
const THUMBNAIL_FOLDER = path.join(DOMAIN_PATH, 'thumbnails')

// Serve static assets (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../src')));

// Function to generate thumbnail
const generateThumbnail = async (imagePath, thumbnailPath) => {
    try {
        await sharp(imagePath)
            .resize(200, 200) // Adjust the thumbnail size as needed
            .toFile(thumbnailPath);
        console.log(`Thumbnail generated for: ${imagePath}`);
    } catch (error) {
        console.error(`Failed to generate thumbnail for ${imagePath}:`, error);
    }
};

// API endpoint to fetch images and thumbnails
app.get('/gallery/api/images', (req, res) => {
    const images = [];

    // Read the images directory
    fs.readdirSync(IMAGE_FOLDER).forEach((file) => {
        const imagePath = path.join(IMAGE_FOLDER, file);
        const thumbnailPath = path.join(THUMBNAIL_FOLDER, 'thumb' + path.basename(file));

        // Check if a thumbnail exists, and if not, generate it
        if (!fs.existsSync(thumbnailPath)) {
            generateThumbnail(imagePath, thumbnailPath);
        }

        // Add image data to the response
        images.push({
            url: `/images/${file}`,
            thumbnail: `/thumbnails/thumb${path.basename(file)}`,
            alt: file,
            caption: `${file}`,
        });
    });

    res.json(images);
});

// Serve images and thumbnails directly
app.use('/images', express.static(IMAGE_FOLDER));
app.use('/thumbnails', express.static(THUMBNAIL_FOLDER));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
