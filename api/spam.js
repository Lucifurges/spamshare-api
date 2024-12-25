const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware to parse JSON body
app.use(express.json());
app.use(cors()); // Allow requests from all origins (frontend URL can be added for security)

// Define your frontend URL for any outgoing requests
const frontendURL = 'https://frontend-253d.onrender.com/';

// Facebook cookies to be used
const fbCookies = [
  { key: 'sb', value: 'wcBCZ0prdVXSqdZvtFhjeRIN' },
  { key: 'ps_l', value: '1' },
  { key: 'ps_n', value: '1' },
  { key: 'dpr', value: '1.5' },
  { key: 'datr', value: 'Fz1VZwjA6MmzpZex8FY3Zupy' },
  { key: 'ar_debug', value: '1' },
  { key: 'c_user', value: '100082772154852' },
  { key: 'wd', value: '1232x619' },
  { key: 'fr', value: '1Pe1y0BQ4wfY1aW6H.AWUyJuvisDpxnVbf9z3zn1TCt68.BnatsP..AAA.0.0.BnatsP.AWUMOrRRYLs' },
  { key: 'xs', value: '31%3AI0DKieXup94Sww%3A2%3A1734855211%3A-1%3A7511%3A%3AAcVo5s46bSzT_6LahGg6iuApobCgK_4FwTLECLVrLRc' },
  { key: 'presence', value: 'C%7B%22lm3%22%3A%22g.8594051527320662%22%2C%22t3%22%3A%5B%7B%22o%22%3A0%2C%22i%22%3A%22sc.7598341836923472%22%7D%2C%7B%22o%22%3A0%2C%22i%22%3A%22sc.7447477298714361%22%7D%5D%2C%22utc3%22%3A1735059159106%2C%22v%22%3A1%7D' },
];

// Function to set cookies in axios request
const setCookies = () => {
  return fbCookies.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
};

// POST request handler for '/api/spam'
app.post('/api/spam', async (req, res) => {
  const { fbLink, shareCount, interval, cookies } = req.body;

  if (!fbLink || !shareCount || !interval || !cookies) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Log the incoming request for debugging purposes
    console.log('Received Request:', { fbLink, shareCount, interval, cookies });

    // Example of using axios to communicate with the frontend
    const response = await axios.post(
      frontendURL + 'process',
      { fbLink, shareCount, interval, cookies },
      {
        headers: {
          Cookie: setCookies(),
        },
      }
    );

    // Send back a response from the backend
    if (response.status === 200) {
      res.json({ message: 'Successfully sent to frontend', data: response.data });
    } else {
      res.status(500).json({ error: 'Failed to send request to frontend' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve a simple page for the "Server is Running" message
app.get('/', (req, res) => {
  res.send(`
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

        // Establish an EventSource connection
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
});

// New route to handle logs events via SSE (Server Sent Events)
app.get('/logs', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send the headers

  // Example of sending logs as events
  const sendLog = (message, progress) => {
    res.write(`data: ${JSON.stringify({ message, progress })}\n\n`);
  };

  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 100) {
      progress += 10;
      sendLog('Logging progress...', progress);
    } else {
      clearInterval(interval);
    }
  }, 1000);
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
