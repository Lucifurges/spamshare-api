const cors = require('cors');
const express = require('express');

// Create a CORS-enabled Express app
const app = express();
const corsOptions = {
    origin: 'https://frontend-253d.onrender.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve HTML, CSS, and frontend JavaScript
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spam Sharing Server</title>
        <style>
            body {
                background-color: #0d1117;
                color: #c9d1d9;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
            }
            h1 {
                color: #58a6ff;
                text-shadow: 0 0 10px #58a6ff, 0 0 20px #58a6ff;
            }
            .form-container {
                background: #161b22;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px #58a6ff;
                width: 300px;
                text-align: center;
            }
            input, button {
                margin: 10px 0;
                padding: 10px;
                border-radius: 4px;
                border: none;
                width: 100%;
            }
            input {
                background: #0d1117;
                color: #c9d1d9;
                border: 1px solid #58a6ff;
            }
            button {
                background: #238636;
                color: #ffffff;
                cursor: pointer;
            }
            button:hover {
                background: #2ea043;
            }
        </style>
    </head>
    <body>
        <h1>Spam Sharing Server</h1>
        <div class="form-container">
            <form id="spamForm">
                <label for="shares">Number of Shares (Max: 100,000):</label>
                <input type="number" id="shares" min="1" max="100000" required>
                <label for="interval">Interval (0.5 - 60 seconds):</label>
                <input type="number" id="interval" step="0.1" min="0.5" max="60" required>
                <button type="submit">Start Spam Sharing</button>
            </form>
            <p id="status"></p>
        </div>
        <script>
            document.getElementById('spamForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const numberOfShares = parseInt(document.getElementById('shares').value);
                const interval = parseFloat(document.getElementById('interval').value);

                const status = document.getElementById('status');
                status.textContent = "Starting spam sharing...";

                try {
                    const response = await fetch('/api/spam', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ numberOfShares, interval })
                    });

                    const result = await response.json();
                    if (response.ok) {
                        status.textContent = result.message;
                    } else {
                        status.textContent = result.error;
                    }
                } catch (error) {
                    status.textContent = 'An error occurred while starting spam sharing.';
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Spam-sharing endpoint
app.post('/', async (req, res) => {
    const { numberOfShares, interval } = req.body;

    if (numberOfShares > 100000) {
        return res.status(400).send({ error: 'Number of shares exceeds the maximum allowed (100,000).' });
    }

    if (interval < 0.5 || interval > 60) {
        return res.status(400).send({ error: 'Interval must be between 0.5 and 60 seconds.' });
    }

    try {
        for (let i = 0; i < numberOfShares; i++) {
            console.log(`Sharing attempt #${i + 1}`);
            
            // Simulate a delay for the interval
            await new Promise(resolve => setTimeout(resolve, interval * 1000));

            // Simulate spam-sharing (replace with actual request)
            console.log(`Shared successfully! Attempt #${i + 1}`);
        }

        res.status(200).send({ message: 'Spam sharing completed successfully!' });
    } catch (error) {
        console.error('An error occurred:', error.message);
        res.status(500).send({ error: 'An error occurred during spam sharing.' });
    }
});

// Export as Vercel Serverless Function
module.exports = app;
