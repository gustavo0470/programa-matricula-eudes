const https = require('https');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3443; // HTTPS port

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Try to use SSL certificates if available
  let server;
  
  try {
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.key')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.cert')),
    };
    
    server = https.createServer(httpsOptions, async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });
    
    console.log('🔒 Using HTTPS server');
  } catch (err) {
    console.log('⚠️  SSL certificates not found, falling back to HTTP');
    console.log('💡 Run generate-ssl.bat to create certificates for HTTPS');
    
    server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });
    
    // Use HTTP port if HTTPS fails
    port = 3008;
  }

  server.listen(port, (err) => {
    if (err) throw err;
    
    const protocol = server instanceof https.Server ? 'https' : 'http';
    console.log(`🚀 Ready on ${protocol}://${hostname}:${port}`);
    console.log('📱 PWA should be installable on HTTPS');
    
    if (protocol === 'https') {
      console.log('⚠️  You may need to accept the self-signed certificate');
    }
  });
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
