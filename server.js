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
app.get('/', async (req, res) => {
  const currentYear = new Date().getFullYear();
  try {
    const result = await pool.query(
      'SELECT * FROM blog_posts ORDER BY date_posted DESC LIMIT 4'
    );

    const blogImages = await getGoogleDriveBlogImages();

    const recentPosts = result.rows.map(post => {
      const match = blogImages.find(img => img.alt.startsWith(post.image_url));
      return {
        ...post,
        image_url: match ? match.src : null
      };
    });

    res.render('index', { year: currentYear, recentPosts });
  } catch (err) {
    console.error('Error loading recent blog posts:', err);
    res.render('index', { year: currentYear, recentPosts: [] });
  }
});



/* ########################################################################################################################
                                                    BLOG GOOGLE API CODE 
#########################################################################################################################*/
app.get('/blog', async (req, res) => {
  const currentYear = new Date().getFullYear();

  try {
    const result = await pool.query('SELECT * FROM blog_posts ORDER BY date_posted DESC');
    const posts = result.rows;

    // Get all blog images from Drive
    const blogImages = await getGoogleDriveBlogImages(); // returns [{ alt: 'IMG_8003.jpeg', src, id }]

    // Match blog post image_url (e.g., 'IMG_8003') to Drive image by stripping extension
    const enrichedPosts = posts.map(post => {
      const match = blogImages.find(img => img.alt.startsWith(post.image_url));
      return {
        ...post,
        image_url: match ? match.src : null
      };
    });

    res.render('blog', { posts: enrichedPosts, year: currentYear });
  } catch (err) {
    console.error("Error loading blog posts:", err);
    res.status(500).send("Failed to load blog posts.");
  }
});

app.get('/blog/:slug', async (req, res) => {
  const post = await getPostBySlug(req.params.slug);   // your helper
  res.render('blogPost', { post });
});

// Function to fetch blog images from a separate Google Drive folder
async function getGoogleDriveBlogImages() {
  const blogFolderId = process.env.GOOGLE_DRIVE_BLOG_FOLDER_ID;

  try {
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files?q='${blogFolderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType)`
    );

    const files = response.data.files;

    if (!files || files.length === 0) {
      console.log("No blog images found in Google Drive.");
      return [];
    }

    return files
      .filter(file => file.mimeType.startsWith("image/"))
      .map(file => ({
        src: `https://lh3.googleusercontent.com/d/${file.id}=w1000`,
        alt: file.name,
        id: file.id
      }));

  } catch (error) {
    console.error("Error fetching blog images from Google Drive:", error.response ? error.response.data : error);
    return [];
  }
}

/* ########################################################################################################################
                                                  TRAIL CAM GOOGLE API CODE 
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


