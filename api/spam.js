import puppeteer from 'puppeteer-core';
import cors from 'cors';

const corsMiddleware = cors({
  origin: 'https://frontend-253d.onrender.com', // Allow only this frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
});

let logs = [];
let progress = 0;

function logMessage(message) {
  logs.push({ timestamp: new Date().toISOString(), message });
  if (logs.length > 100) logs.shift();
}

function updateProgress(value) {
  progress = value;
}

async function launchBrowser() {
  const executablePath = process.env.CHROME_BIN || '/usr/bin/chromium';
  return puppeteer.launch({
    headless: true,
    executablePath: executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process'],
  });
}

const facebookCookies = [
  { "key": "sb", "value": "wcBCZ0prdVXSqdZvtFhjeRIN", "domain": "facebook.com", "path": "/" },
  { "key": "ps_l", "value": "1", "domain": "facebook.com", "path": "/" },
  { "key": "ps_n", "value": "1", "domain": "facebook.com", "path": "/" },
  { "key": "dpr", "value": "1.5", "domain": "facebook.com", "path": "/" },
  { "key": "datr", "value": "Fz1VZwjA6MmzpZex8FY3Zupy", "domain": "facebook.com", "path": "/" },
  { "key": "ar_debug", "value": "1", "domain": "facebook.com", "path": "/" },
  { "key": "c_user", "value": "100082772154852", "domain": "facebook.com", "path": "/" },
  { "key": "wd", "value": "1232x619", "domain": "facebook.com", "path": "/" },
  { "key": "fr", "value": "1Pe1y0BQ4wfY1aW6H.AWUyJuvisDpxnVbf9z3zn1TCt68.BnatsP..AAA.0.0.BnatsP.AWUMOrRRYLs", "domain": "facebook.com", "path": "/" },
  { "key": "xs", "value": "31%3AI0DKieXup94Sww%3A2%3A1734855211%3A-1%3A7511%3A%3AAcVo5s46bSzT_6LahGg6iuApobCgK_4FwTLECLVrLRc", "domain": "facebook.com", "path": "/" },
  { "key": "presence", "value": "C%7B%22lm3%22%3A%22g.8594051527320662%22%2C%22t3%22%3A%5B%7B%22o%22%3A0%2C%22i%22%3A%22sc.7598341836923472%22%7D%2C%7B%22o%22%3A0%2C%22i%22%3A%22sc.7447477298714361%22%7D%5D%2C%22utc3%22%3A1735056299428%2C%22v%22%3A1%7D", "domain": "facebook.com", "path": "/" }
];

export default async function handler(req, res) {
  corsMiddleware(req, res, async () => {
    if (req.method === 'GET') {
      if (req.url === '/logs') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const sendLogs = () => {
          logs.forEach((log) => {
            res.write(`data: ${JSON.stringify(log)}\n\n`);
          });
          res.write(`data: {"progress": ${progress}}\n\n`);
          setTimeout(sendLogs, 1000);
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
            /* Dark Theme */
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #181818;
              color: white;
              text-align: center;
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 20px;
            }
            .container {
              text-align: center;
              max-width: 600px;
              margin: 0 auto;
            }
            .dropdown {
              position: relative;
              display: inline-block;
              cursor: pointer;
              font-size: 1.2rem;
              margin-top: 20px;
              background-color: #444;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 4px;
            }
            .dropdown-content {
              display: none;
              position: absolute;
              background-color: #222;
              min-width: 160px;
              box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
              z-index: 1;
              border-radius: 4px;
              font-size: 1rem;
            }
            .dropdown-content a {
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              display: block;
            }
            .dropdown-content a:hover {
              background-color: #333;
            }
            .dropdown:hover .dropdown-content {
              display: block;
            }
            .progress-bar-container {
              width: 100%;
              background-color: #444;
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
              border: 1px solid #444;
              padding: 10px;
              background-color: #222;
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
              font-size: 0.9rem;
              color: #ddd;
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Server is Up and Running!</h1>
            <div>
              <button class="dropdown">Logs</button>
              <div class="dropdown-content">
                <a href="#" id="logs-link">Show Logs</a>
              </div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" id="progress-bar">0%</div>
            </div>
            <div class="logs" id="logs-container"></div>
          </div>
          <script>
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

        if (!fbLink || !shareCount || !interval || !Array.isArray(cookies)) {
          return res.status(400).json({ error: 'Missing or invalid parameters' });
        }

        if (interval < 0.5 || interval > 60) {
          return res.status(400).json({ error: 'Interval must be between 0.5 and 60 seconds' });
        }

        if (shareCount > 100000) {
          return res.status(400).json({ error: 'Share count cannot exceed 100,000' });
        }

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

          // Set cookies for Facebook login
          await page.context().addCookies(formattedCookies);

          // Go to the Facebook post link
          await page.goto(fbLink, { waitUntil: 'domcontentloaded' });

          let sharedCount = 0;
          while (sharedCount < shareCount) {
            try {
              await page.waitForSelector('div[data-testid="share_button"]', { timeout: 10000 });
              await page.click('div[data-testid="share_button"]');
              await page.waitForSelector('button[data-testid="share_dialog_button"]', { timeout: 10000 });
              await page.click('button[data-testid="share_dialog_button"]');
              sharedCount++;
              updateProgress((sharedCount / shareCount) * 100);
              logMessage(`Spamming... ${sharedCount} of ${shareCount} completed`);
              await page.waitForTimeout(interval * 1000);
            } catch (err) {
              console.error('Error during sharing:', err);
              break;
            }
          }

          return res.status(200).json({ message: `${sharedCount} spams completed successfully!` });
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
