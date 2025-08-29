/**
 * Simple standalone test server to check connectivity
 * This server has no dependencies and can help isolate network/firewall issues
 */

const http = require('http');
const PORT = 3001;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Test API endpoint
  if (req.url === '/api/test') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ 
      message: 'Test server is working!',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Root path
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          .success { color: green; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <h1>Test Server Running!</h1>
        <p>This confirms the server is running correctly on port ${PORT}</p>
        
        <h2>Test API Connection</h2>
        <button id="testBtn">Test API Connection</button>
        <div id="result" style="margin-top: 10px;"></div>
        
        <script>
          document.getElementById('testBtn').addEventListener('click', async () => {
            const resultEl = document.getElementById('result');
            resultEl.innerHTML = 'Testing connection...';
            
            try {
              const response = await fetch('/api/test');
              const data = await response.json();
              resultEl.innerHTML = '<span class="success">✓ Connection successful!</span><pre>' + 
                JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
              resultEl.innerHTML = '<span class="error">✗ Connection failed: ' + error.message + '</span>';
            }
          });
        </script>
      </body>
      </html>
    `);
    return;
  }

  // Default 404 response
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n---------------------------------------------`);
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`🔗 Access in browser: http://localhost:${PORT}`);
  console.log(`🔗 Test API endpoint: http://localhost:${PORT}/api/test`);
  
  // Log network interfaces
  const networkInterfaces = require('os').networkInterfaces();
  console.log('\n📡 Available network interfaces:');
  Object.keys(networkInterfaces).forEach(interfaceName => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach(iface => {
      if (iface.family === 'IPv4') {
        console.log(`   - ${interfaceName}: ${iface.address} (${iface.internal ? 'internal' : 'external'})`);
        if (!iface.internal) {
          console.log(`     Try accessing: http://${iface.address}:${PORT}`);
        }
      }
    });
  });
  console.log(`\n💡 If you can access this server but not the main server, it may indicate an issue with the main server's configuration rather than network/firewall issues.`);
  console.log(`\n💡 Press Ctrl+C to stop the server`);
  console.log(`---------------------------------------------\n`);
});

// Handle errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. The main server might be running.`);
    console.log(`📝 Try stopping the main server first or use a different port.`);
  } else {
    console.error(`❌ Server error:`, error);
  }
});