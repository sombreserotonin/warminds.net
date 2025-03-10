// Simple CORS proxy for Prometheus
// Run with: node proxy.js
// Then update the prometheusUrl in script.js to: http://localhost:3001/proxy

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const PORT = 3001;
const PROMETHEUS_HOST = '192.168.86.24';
const PROMETHEUS_PORT = 9090;
const PROMETHEUS_PATH = '/api/v1/query';

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Only handle GET requests to /proxy
    if (req.method !== 'GET' || !req.url.startsWith('/proxy')) {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }
    
    // Parse the query from the URL
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query.query;
    
    if (!query) {
        res.writeHead(400);
        res.end('Missing query parameter');
        return;
    }
    
    // Prepare the request to Prometheus
    const options = {
        hostname: PROMETHEUS_HOST,
        port: PROMETHEUS_PORT,
        path: `${PROMETHEUS_PATH}?query=${encodeURIComponent(query)}`,
        method: 'GET'
    };
    
    // Make the request to Prometheus
    const prometheusReq = http.request(options, (prometheusRes) => {
        // Set content type
        res.setHeader('Content-Type', 'application/json');
        
        // Forward status code
        res.writeHead(prometheusRes.statusCode);
        
        // Forward data
        prometheusRes.pipe(res);
    });
    
    prometheusReq.on('error', (error) => {
        console.error('Error making request to Prometheus:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ 
            status: 'error',
            errorType: 'proxy_error',
            error: 'Error connecting to Prometheus server'
        }));
    });
    
    prometheusReq.end();
});

server.listen(PORT, () => {
    console.log(`CORS Proxy running at http://localhost:${PORT}/proxy`);
    console.log(`Proxying requests to http://${PROMETHEUS_HOST}:${PROMETHEUS_PORT}${PROMETHEUS_PATH}`);
    console.log('To use this proxy, update the prometheusUrl in script.js to:');
    console.log(`  http://localhost:${PORT}/proxy`);
});
