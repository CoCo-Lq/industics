/**
 * Node.js 脚本：读取 devices.json，为每个设备ID生成二维码 PNG，保存到 img 目录
 * 二维码内容为：当前页URL?id=设备ID，微信扫描后自动打开对应设备信息页
 * 使用方法：
 *   1. node generate-qrcodes.js http://your-server-ip:3000/index.html
 *   2. QR_BASE_URL=http://your-server-ip:3000/index.html node generate-qrcodes.js
 * 依赖：qrcode 库 (npm install qrcode)
 */
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'devices.json');
const OUTPUT_DIR = path.join(__dirname, 'img');

// 二维码扫码后打开的URL前缀（优先级：命令行参数 > 环境变量 > 默认值）
const BASE_URL = process.argv[2] 
    || process.env.QR_BASE_URL 
    || process.env.BASE_URL
    || 'http://localhost:3000/index.html';

/**
 * 检查URL是否为手机可访问地址
 */
function isMobileAccessible(url) {
    const localhostPatterns = [
        /^http:\/\/localhost/,
        /^http:\/\/127\.0\.0\.1/,
        /^http:\/\/0\.0\.0\.0/
    ];
    return !localhostPatterns.some(pattern => pattern.test(url));
}

async function generateAllQRCodes() {
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 读取设备数据
    if (!fs.existsSync(DATA_FILE)) {
        console.error(`✗ 设备数据文件不存在: ${DATA_FILE}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        console.error(`✗ 设备数据文件格式错误: ${err.message}`);
        process.exit(1);
    }

    if (!data.devices || data.devices.length === 0) {
        console.log('暂无设备数据');
        return;
    }

    // 警告：如果使用localhost，手机无法访问
    if (!isMobileAccessible(BASE_URL)) {
        console.warn(`⚠️  警告：当前BASE_URL(${BASE_URL})使用localhost/127.0.0.1，手机扫码将无法访问！`);
        console.warn(`   请使用局域网IP，例如：node generate-qrcodes.js http://192.168.1.100:3000/index.html`);
    }

    console.log(`\n========== 二维码生成配置 ==========`);
    console.log(`基础URL: ${BASE_URL}`);
    console.log(`输出目录: ${OUTPUT_DIR}`);
    console.log(`设备数量: ${data.devices.length}`);
    console.log(`====================================\n`);

    let successCount = 0;
    let failCount = 0;

    for (const device of data.devices) {
        const filename = `${device.id}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        // 二维码内容：URL?id=设备ID（确保URL稳定不变）
        const qrContent = `${BASE_URL}?id=${encodeURIComponent(device.id)}`;
        
        try {
            // 如果文件已存在，先删除确保覆盖（避免缓存问题）
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }

            await QRCode.toFile(filepath, qrContent, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });
            
            console.log(`✓ ${filename}`);
            successCount++;
        } catch (err) {
            console.error(`✗ ${filename} 生成失败: ${err.message}`);
            failCount++;
        }
    }

    console.log(`\n========== 生成结果 ==========`);
    console.log(`成功: ${successCount} 个`);
    console.log(`失败: ${failCount} 个`);
    console.log(`\n提示：生成的二维码内容格式为 ${BASE_URL}?id=设备ID`);
    console.log(`      只要保持此URL格式不变，后续页面调整二维码依然有效`);
}

generateAllQRCodes().catch(err => {
    console.error('执行失败:', err);
    process.exit(1);
});
