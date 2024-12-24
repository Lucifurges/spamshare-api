import puppeteer from 'puppeteer';
import cors from 'cors';

// CORS middleware
const corsMiddleware = cors({
  origin: 'https://frontend-253d.onrender.com', // Allow only this frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
});

export default async function handler(req, res) {
  // Apply CORS middleware
  corsMiddleware(req, res, async () => {
    if (req.method === 'GET') {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Server is Running</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background-color: #121212;
              color: #fff;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              text-align: center;
              background: linear-gradient(135deg, #2e2e2e, #1e1e1e);
            }

            .container {
              background-color: #1c1c1c;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
              max-width: 400px;
              width: 100%;
              text-align: center;
            }

            h1 {
              font-size: 2rem;
              margin-bottom: 20px;
            }

            .status {
              font-size: 1.25rem;
              color: #4caf50; /* Green for active status */
            }

            .status.error {
              color: #f44336; /* Red for error */
            }

            .status.loading {
              color: #ff9800; /* Yellow for loading */
            }

            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              animation: spin 1s linear infinite;
              margin-top: 20px;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            footer {
              margin-top: 30px;
              font-size: 0.875rem;
              color: #bbb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Server is Up and Running!</h1>
            <p class="status loading">Initializing...</p>
            <div class="spinner"></div>
            <footer>
              <p>&copy; 2024 Your Application</p>
            </footer>
          </div>
        </body>
        </html>
      `);
    }

    if (req.method === 'POST') {
      try {
        const { fbLink, shareCount, interval, cookies } = req.body;

        // Validate required fields
        if (!fbLink || !shareCount || !interval || !Array.isArray(cookies)) {
          return res.status(400).json({ error: 'Missing or invalid parameters' });
        }

        if (interval < 0.5 || interval > 60) {
          return res.status(400).json({ error: 'Interval must be between 0.5 and 60 seconds' });
        }

        if (shareCount > 100000) {
          return res.status(400).json({ error: 'Share count cannot exceed 100,000' });
        }

        // Map cookies into Puppeteer-compatible format
        const formattedCookies = cookies.map(({ key, value, domain, path }) => ({
          name: key,
          value,
          domain,
          path,
        }));

        let browser;
        try {
          browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process'],
          });

          const page = await browser.newPage();

          // Set cookies
          await page.setCookie(...formattedCookies);

          // Navigate to Facebook post
          await page.goto(fbLink, { waitUntil: 'domcontentloaded' });

          // Share the post
          let sharedCount = 0;
          while (sharedCount < shareCount) {
            try {
              await page.waitForSelector('div[data-testid="share_button"]', { timeout: 10000 });
              await page.click('div[data-testid="share_button"]');

              await page.waitForSelector('button[data-testid="share_dialog_button"]', { timeout: 10000 });
              await page.click('button[data-testid="share_dialog_button"]');

              sharedCount++;
              await page.waitForTimeout(interval * 1000);
            } catch (err) {
              console.error('Error during sharing:', err);
              break;
            }
          }

          return res.status(200).json({ message: `${sharedCount} shares completed successfully!` });
        } catch (err) {
          console.error('Puppeteer error:', err);
          return res.status(500).json({ error: 'Automation failed' });
        } finally {
          if (browser) await browser.close();
        }
      } catch (err) {
        console.error('General error:', err);
        return res.status(500).json({ error: 'Server error' });
      }
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  });
}
