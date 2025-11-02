@echo off
echo Starting K-hub Static Server...
echo.
echo 🚀 Server running at http://localhost:8080
echo 📱 Press Ctrl+C to stop the server
echo.
cd public
python -m http.server 8080 2>nul || (
    echo Python not found, trying Node.js...
    node -e "
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    const server = http.createServer((req, res) => {
        let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml'
        }[ext] || 'text/plain';
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                fs.readFile('index.html', (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end(data);
                    }
                });
            } else {
                res.writeHead(200, {'Content-Type': contentType});
                res.end(data);
            }
        });
    });
    server.listen(8080, () => console.log('Server running at http://localhost:8080'));
    "
)