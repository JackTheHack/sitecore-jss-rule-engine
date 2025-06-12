///
/// Polling script for testing scheduled task runner
/// In Vercel or Netlify env use the Cron job feature instead
///

// Configuration
const config = {
    url: process.env.POLL_URL || '', // URL to poll
    interval: parseInt(process.env.POLL_INTERVAL || '5000'), // Polling interval in milliseconds
    timeout: parseInt(process.env.POLL_TIMEOUT || '5000'), // Request timeout in milliseconds
};

async function pollUrl() {
    try {

        console.log('\x1b[32m%s\x1b[0m', 'Triggering scheduled tasks.');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(config.url, {
            method: 'POST',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`[${new Date().toISOString()}] Success: ${response.status} - ${response.statusText}`);
        const data = await response.text();
        console.log(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`[${new Date().toISOString()}] Error: Request timed out after ${config.timeout}ms`);
        } else {
            console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
        }
    }
}

// Start polling
console.log(`Starting to poll ${config.url} every ${config.interval}ms`);
setInterval(pollUrl, config.interval);

// Initial poll
pollUrl();