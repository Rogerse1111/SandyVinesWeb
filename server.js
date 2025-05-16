require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render connections
  },
});

module.exports = pool;


const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the styles directory
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// Serve static files from the "scripts" directory
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// Serve static files from the image directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Define routes
app.get('/', (req, res) => {
  const currentYear = new Date().getFullYear();
  res.render('index', { year: currentYear });
});

/* ########################################################################################################################
                                                          GOOGLE API CODE 
#########################################################################################################################*/
// Function to fetch images from Google Drive folder
async function getGoogleDriveImages() {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType)`
    );

    const files = response.data.files;

    if (!files || files.length === 0) {
      console.log("No images found in Google Drive.");
      return [];
    }

    // Filter only image files (JPG, PNG, etc.) and apply correct URL format
    return files
      .filter(file => file.mimeType.startsWith("image/"))
      .map(file => ({
        src: `https://lh3.googleusercontent.com/d/${file.id}=w1000`, // Corrected URL
        alt: file.name,
      }));

  } catch (error) {
    console.error("Error fetching images from Google Drive:", error.response ? error.response.data : error);
    return [];
  }
}

// Define the Gallery Route
app.get('/gallery', async (req, res) => {
  const currentYear = new Date().getFullYear();
  const galleryImages = await getGoogleDriveImages(); // Fetch images from Google Drive

  res.render('gallery', { year: currentYear, galleryImages });
});
/* ########################################################################################################################
                                                             OTHER 
#########################################################################################################################*/
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Handle 404 Errors
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

