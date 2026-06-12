/**
 * 通用二维码生成工具
 * 基于 qrcode.js 库封装
 */

/**
 * 通用二维码生成函数
 * @param {string} text - 要生成二维码的字符串内容
 * @param {Object} options - 配置项
 * @param {number} options.size - 二维码尺寸（像素），默认 200
 * @param {string} options.colorDark - 前景色，默认 '#000000'
 * @param {string} options.colorLight - 背景色，默认 '#ffffff'
 * @param {number} options.margin - 边距（模块数），默认 2
 * @param {string} options.type - 返回类型 'canvas' | 'dataURL' | 'svg'，默认 'canvas'
 * @param {string} options.targetId - 渲染到指定ID的容器（div/img）
 * @returns {HTMLCanvasElement|string|void} 根据 type 返回
 */
function generateQRCode(text, options = {}) {
    if (!text || typeof text !== 'string') {
        console.error('generateQRCode: 请传入有效的字符串');
        return null;
    }

    const config = Object.assign({
        size: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        margin: 2,
        type: 'canvas',
        correctLevel: 'M'
    }, options);

    // 计算 QR 码版本（根据文本长度自动选择）
    const len = text.length;
    let typeNumber = 1;
    if (len > 17) typeNumber = 2;
    if (len > 32) typeNumber = 3;
    if (len > 53) typeNumber = 4;
    if (len > 78) typeNumber = 5;
    if (len > 106) typeNumber = 6;
    if (len > 134) typeNumber = 7;
    if (len > 154) typeNumber = 8;
    if (len > 192) typeNumber = 9;
    if (len > 230) typeNumber = 10;
    if (len > 271) typeNumber = 20;
    if (len > 321) typeNumber = 40;

    // 使用 qrcode-generator 算法生成矩阵
    const qr = createQRMatrix(text, typeNumber, config.correctLevel);

    if (!qr) return null;

    if (config.type === 'dataURL') {
        return matrixToDataURL(qr, config);
    } else if (config.type === 'svg') {
        return matrixToSVG(qr, config);
    } else {
        const canvas = matrixToCanvas(qr, config);
        if (config.targetId) {
            const target = document.getElementById(config.targetId);
            if (target) {
                target.innerHTML = '';
                if (target.tagName === 'IMG') {
                    target.src = canvas.toDataURL('image/png');
                } else {
                    target.appendChild(canvas);
                }
            }
        }
        return canvas;
    }
}

/**
 * 简化版二维码生成：直接渲染到 DOM 元素
 * @param {string} text - 二维码内容
 * @param {HTMLElement|string} target - DOM元素或元素ID
 * @param {Object} options - 配置项
 */
function generateQRCodeSimple(text, target, options = {}) {
    if (!window.QRCode) {
        console.error('qrcode 库未加载，请先引入 https://cdn.jsdelivr.net/npm/qrcode@1.5.3');
        return;
    }

    const opts = Object.assign({
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
    }, options);

    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) {
        console.error('目标元素不存在');
        return;
    }

    // 清空目标元素
    if (el.tagName === 'IMG') {
        window.QRCode.toDataURL(text, opts).then(dataUrl => {
            el.src = dataUrl;
        });
    } else {
        el.innerHTML = '';
        new window.QRCode(el, Object.assign({ text: text }, opts));
    }
}

// ==================== 内部辅助函数 ====================

/**
 * 生成 QR 码矩阵（调用 qrcode 库）
 */
function createQRMatrix(text, typeNumber, correctLevel) {
    if (typeof window.QRCode === 'undefined') {
        console.error('请先引入 qrcode 库：<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3"></script>');
        return null;
    }

    const level = window.QRCode.CorrectLevel[correctLevel] || window.QRCode.CorrectLevel.M;
    const qr = window.QRCode.create(text, { errorCorrectionLevel: correctLevel });
    return qr.modules;
}

/**
 * 矩阵转 Canvas
 */
function matrixToCanvas(matrix, config) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const moduleCount = matrix.size;
    const cellSize = Math.floor(config.size / (moduleCount + config.margin * 2));
    const actualSize = cellSize * (moduleCount + config.margin * 2);

    canvas.width = actualSize;
    canvas.height = actualSize;

    // 背景
    ctx.fillStyle = config.colorLight;
    ctx.fillRect(0, 0, actualSize, actualSize);

    // 模块
    ctx.fillStyle = config.colorDark;
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (matrix.data[row * moduleCount + col]) {
                ctx.fillRect(
                    (col + config.margin) * cellSize,
                    (row + config.margin) * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }
    }
    return canvas;
}

/**
 * 矩阵转 DataURL
 */
function matrixToDataURL(matrix, config) {
    const canvas = matrixToCanvas(matrix, config);
    return canvas.toDataURL('image/png');
}

/**
 * 矩阵转 SVG
 */
function matrixToSVG(matrix, config) {
    const moduleCount = matrix.size;
    const cellSize = config.size / (moduleCount + config.margin * 2);
    const size = config.size;
    let path = '';
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (matrix.data[row * moduleCount + col]) {
                const x = (col + config.margin) * cellSize;
                const y = (row + config.margin) * cellSize;
                path += `M${x},${y} h${cellSize} v${cellSize} h${-cellSize}z `;
            }
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><path d="${path}" fill="${config.colorDark}"/></svg>`;
}

// 暴露到全局
window.generateQRCode = generateQRCode;
window.generateQRCodeSimple = generateQRCodeSimple;
