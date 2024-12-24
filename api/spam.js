const puppeteer = require('puppeteer-core');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express app
const app = express();

// Enable CORS for the frontend at Render
app.use(cors({
    origin: 'https://frontend-253d.onrender.com', // Allow your frontend domain
    methods: 'GET,POST', // Allow only GET and POST methods
    allowedHeaders: 'Content-Type,Authorization', // Allow specific headers
    credentials: true // Allow cookies/credentials
}));

// Parse JSON request bodies
app.use(express.json());

// Path to the Chrome executable
const executablePath = '/usr/bin/google-chrome-stable'; // Adjust based on where Chrome is installed in your environment

// Initialize Puppeteer and the server
let browser = null;
async function launchBrowser() {
    if (!browser) {
        // Launch the browser if it's not already running
        browser = await puppeteer.launch({
            executablePath,
            headless: true, // Run in headless mode (no UI)
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // For running in server environments
        });
    }
    return browser;
}

// Function to handle sharing logic
async function sharePost(cookies, url, shareCount, interval) {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    // Set cookies
    for (const cookie of cookies) {
        await page.setCookie(cookie);
    }

    // Go to Facebook URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Simulate shares
    const sharesResults = [];
    for (let i = 0; i < shareCount; i++) {
        try {
            // Example: Click the "Share" button (this may need adjustment based on actual page structure)
            await page.click('[aria-label="Share"]');  // Adjust to the actual selector

            // Wait for the share action to be processed
            await page.waitForTimeout(interval * 1000); // Wait for the specified interval
            sharesResults.push(`Share ${i + 1} completed.`);
        } catch (error) {
            sharesResults.push(`Error with share ${i + 1}: ${error.message}`);
        }
    }

    // Close the browser after the operation
    await page.close();
    return sharesResults;
}

// Endpoint to handle the POST request
app.post('/api/spam', async (req, res) => {
    try {
        const { fbLink, shareCount, interval, cookies } = req.body;

        // Validate input data
        if (!fbLink || !shareCount || !interval || !cookies) {
            return res.status(400).json({ error: 'Invalid input parameters' });
        }

        // Start sharing
        const results = await sharePost(cookies, fbLink, shareCount, interval);

        // Return results
        res.json({ message: `Successfully shared ${shareCount} times`, details: results });
    } catch (error) {
        console.error('Error during sharing process:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

// Test endpoint to check server status
app.get('/api/status', (req, res) => {
    res.json({ message: 'Server is up and running' });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
