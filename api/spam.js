<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spam Share App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Spam Share App</h1>
    
    <!-- Registration Form -->
    <div id="registration-form">
      <h2>Register</h2>
      <form id="register-form">
        <input type="text" id="username" placeholder="Username" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Register</button>
      </form>
    </div>

    <!-- Login Form -->
    <div id="login-form">
      <h2>Login</h2>
      <form id="login-form">
        <input type="text" id="login-username" placeholder="Username" required>
        <input type="password" id="login-password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
    </div>

    <!-- Spam Share Form -->
    <div id="spam-share-form" style="display:none;">
      <h2>Spam Share</h2>
      <form id="spam-form">
        <input type="text" id="link" placeholder="Spam Link" required>
        <input type="text" id="cookies" placeholder="Cookies" required>
        <input type="number" id="shares" placeholder="Shares" required>
        <input type="number" id="interval" placeholder="Interval in ms" required>
        <button type="submit">Start Sharing</button>
      </form>
      <div id="progress" class="status"></div>
    </div>
  </div>

  <script>
    let token = '';

    document.getElementById('register-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const res = await fetch('https://your-backend-url/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      alert(data.message);
    });

    document.getElementById('login-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      const res = await fetch('https://your-backend-url/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.token) {
        token = data.token;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('spam-share-form').style.display = 'block';
      }
      alert(data.message);
    });

    document.getElementById('spam-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const link = document.getElementById('link').value;
      const cookies = document.getElementById('cookies').value;
      const shares = document.getElementById('shares').value;
      const interval = document.getElementById('interval').value;

      const res = await fetch('https://your-backend-url/api/spam', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ link, cookies, shares, interval, token }),
      });

      const data = await res.json();
      document.getElementById('progress').innerText = data.message;
    });
  </script>
</body>
</html>
