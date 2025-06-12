const http = require('http');
const https = require('https');

// Configuration
const config = {
    url: process.env.POLL_URL || '', // URL to poll
    interval: parseInt(process.env.POLL_INTERVAL || '5000'), // Polling interval in milliseconds
    timeout: parseInt(process.env.POLL_TIMEOUT || '5000'), // Request timeout in milliseconds
};

function pollUrl() {
    const url = new URL(config.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.post(url, {
        timeout: config.timeout
    }, (res) => {
        console.log(`[${new Date().toISOString()}] Success: ${res.statusCode} - ${res.statusMessage}`);
        res.resume(); // Consume response data to free up memory
    });

    req.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    });

    req.on('timeout', () => {
        req.destroy();
        console.error(`[${new Date().toISOString()}] Error: Request timed out after ${config.timeout}ms`);
    });
}

// Start polling
console.log(`Starting to poll ${config.url} every ${config.interval}ms`);
setInterval(pollUrl, config.interval);

// Initial poll
pollUrl(); 