const corsAnywhere = require('cors-anywhere');

const host = 'localhost';
const port = 8070;

const server = corsAnywhere.createServer({
    originWhitelist: ['http://127.0.0.1:5500'],  // Make sure this matches your frontend URL
    requireHeaders: ['Authorization'],
    removeHeaders: ['cookie', 'cookies'],
})

server.listen(port, host, () => {
    console.log(`CORS Anywhere server is running at http://${host}:${port}`);
});

// Adding error handling
server.on('error', (err) => {
    console.error('CORS Anywhere server encountered an error:', err);
});