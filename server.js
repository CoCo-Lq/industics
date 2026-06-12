const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    let fallbackIP = '127.0.0.1';
    
    // 优先选择的网卡名称关键词（中文和英文）
    const preferredNames = ['WLAN', '无线', 'WiFi', 'wifi', '以太网', 'Ethernet', 'Local Area Connection'];
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // 检查是否是169.254开头的自动配置地址（不可用）
                if (iface.address.startsWith('169.254.')) {
                    continue;
                }
                // 检查是否是首选网卡
                const isPreferred = preferredNames.some(prefName => 
                    name.toLowerCase().includes(prefName.toLowerCase())
                );
                if (isPreferred) {
                    return iface.address;
                }
                // 保存非169.254的IP作为备用
                if (fallbackIP === '127.0.0.1') {
                    fallbackIP = iface.address;
                }
            }
        }
    }
    return fallbackIP;
}

const server = http.createServer((req, res) => {
    // 解析请求路径，移除查询参数
    let requestPath = req.url.split('?')[0];
    
    // 处理根路径
    if (requestPath === '/' || requestPath === '') {
        requestPath = '/index.html';
    }
    
    // 使用 __dirname 确保路径正确
    const filePath = path.join(__dirname, requestPath);

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // 添加日志以便调试
    console.log(`Request: ${req.url} -> File: ${filePath}`);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`404 Not Found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                console.log(`Server Error: ${error.code}`);
                res.writeHead(500);
                res.end('Server Error: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const localIP = getLocalIP();
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Server running at http://${localIP}:${PORT}/`);
    console.log(`\n二维码生成命令示例：`);
    console.log(`  node generate-qrcodes.js http://${localIP}:${PORT}/index.html`);
});