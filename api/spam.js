import puppeteer from 'puppeteer-core';
import cors from 'cors';

// CORS middleware
const corsMiddleware = cors({
  origin: 'https://frontend-253d.onrender.com', // Allow only this frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
});

// In-memory log storage (for demonstration purposes)
let logs = [];
let progress = 0; // Track the progress of the process

// Function to log messages (in-memory for this example)
function logMessage(message) {
  logs.push({ timestamp: new Date().toISOString(), message });
  if (logs.length > 100) logs.shift(); // Keep only the latest 100 logs
}

// Function to update progress
function updateProgress(value) {
  progress = value;
}

// A function to launch Puppeteer with the correct executable path
async function launchBrowser() {
  const executablePath = process.env.CHROME_BIN || '/usr/bin/chromium'; // Ensure correct path to Chromium binary
  return puppeteer.launch({
    headless: true,
    executablePath: executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process'],
  });
}

export default async function handler(req, res) {
  // Apply CORS middleware
  corsMiddleware(req, res, async () => {
    if (req.method === 'GET') {
      // Check if the request is for the logs endpoint
      if (req.url === '/logs') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Send the logs as Server-Sent Events (SSE)
        const sendLogs = () => {
          logs.forEach((log) => {
            res.write(`data: ${JSON.stringify(log)}\n\n`);
          });
          res.write(`data: {"progress": ${progress}}\n\n`);
          setTimeout(sendLogs, 1000); // Keep sending the logs and progress every second
        };

        sendLogs();
        return;
      }

      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Server is Running</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f4f4f4;
              color: #333;
              text-align: center;
            }
            h1 {
              color: #4CAF50;
              font-size: 3rem;
              margin-bottom: 20px;
            }
            .dropdown {
              position: relative;
              display: inline-block;
              cursor: pointer;
              font-size: 1.2rem;
              margin-top: 20px;
              background-color: #4CAF50;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 4px;
            }
            .dropdown-content {
              display: none;
              position: absolute;
              background-color: #f9f9f9;
              min-width: 160px;
              box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
              z-index: 1;
              border-radius: 4px;
              font-size: 1rem;
            }
            .dropdown-content a {
              color: black;
              padding: 10px 20px;
              text-decoration: none;
              display: block;
            }
            .dropdown-content a:hover {
              background-color: #ddd;
            }
            .dropdown:hover .dropdown-content {
              display: block;
            }
            .progress-bar-container {
              width: 100%;
              background-color: #ddd;
              margin-top: 30px;
              height: 30px;
              border-radius: 5px;
            }
            .progress-bar {
              height: 100%;
              width: 0;
              background-color: #4CAF50;
              text-align: center;
              line-height: 30px;
              color: white;
              font-size: 1.2rem;
              border-radius: 5px;
            }
            .logs {
              margin-top: 20px;
              max-height: 300px;
              overflow-y: auto;
              border: 1px solid #ddd;
              padding: 10px;
              background-color: #f9f9f9;
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
              font-size: 0.9rem;
              color: #444;
            }
          </style>
        </head>
        <body>
          <h1>Server is Up and Running!</h1>
          <button class="dropdown">Logs</button>
          <div class="dropdown-content">
            <a href="#" id="logs-link">Show Logs</a>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="progress-bar">0%</div>
          </div>
          <div class="logs" id="logs-container"></div>
          <script>
            // Real-time log updates
            const logsLink = document.getElementById('logs-link');
            const logsContainer = document.getElementById('logs-container');
            const progressBar = document.getElementById('progress-bar');

            const eventSource = new EventSource('/logs');

            eventSource.onmessage = function(event) {
              const data = JSON.parse(event.data);

              if (data.progress !== undefined) {
                progressBar.style.width = data.progress + '%';
                progressBar.innerHTML = data.progress + '%';
              }

              if (data.message) {
                logsContainer.innerHTML = logsContainer.innerHTML + '<br>' + data.message;
              }
            };

            logsLink.addEventListener('click', () => {
              logsContainer.style.display = logsContainer.style.display === 'none' ? 'block' : 'none';
            });
          </script>
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
          browser = await launchBrowser();
          const page = await browser.newPage();

          // Set cookies
          await page.context().addCookies(formattedCookies);

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
              updateProgress((sharedCount / shareCount) * 100); // Update progress

              logMessage(`Sharing post... ${sharedCount} of ${shareCount} completed`);

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
