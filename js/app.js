// 应用主逻辑
(function() {
    'use strict';

    // DOM元素
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    const scanTipSection = document.getElementById('scan-tip-section');
    const deviceDetail = document.getElementById('device-detail');
    const tabItemsBlue = document.querySelectorAll('.tab-item-blue');
    const tabContentsBlue = document.querySelectorAll('.tab-content-blue');

    // 页面切换
    function switchPage(pageName) {
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById('page-' + pageName);
        if (targetPage) targetPage.classList.add('active');

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) item.classList.add('active');
        });

        window.scrollTo(0, 0);
    }

    // 导航栏点击事件
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.dataset.page;
            if (pageName === 'company') {
                window.location.href = 'https://www.hnbofang.com/';
                return;
            }
            switchPage(pageName);
        });
    });

    // Tab切换
    tabItemsBlue.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            tabItemsBlue.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            tabContentsBlue.forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById('tab-' + tabName);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // 显示设备信息
    function displayDeviceInfo(data) {
        document.getElementById('device-id').textContent = data.id || '-';
        document.getElementById('device-name').textContent = data.name || '-';
        document.getElementById('device-model').textContent = data.model || '-';
        document.getElementById('device-project').textContent = data.project || '-';
        document.getElementById('device-contract').textContent = data.contract || '-';
        document.getElementById('device-product').textContent = data.product || '-';
        document.getElementById('device-voltage').textContent = data.voltage || '-';
        document.getElementById('device-current').textContent = data.current || '-';
        document.getElementById('device-frequency').textContent = data.frequency || '-';
        document.getElementById('device-standard').textContent = data.standard || '-';
        document.getElementById('device-protection').textContent = data.protection || '-';
        document.getElementById('device-date').textContent = data.date || '-';

        // 报修页面设备信息
        const repairDeviceId = document.getElementById('repair-device-id');
        const repairDeviceName = document.getElementById('repair-device-name');
        const repairDeviceDesc = document.getElementById('repair-device-desc');
        if (repairDeviceId) repairDeviceId.textContent = 'SN027963';
        if (repairDeviceName) repairDeviceName.textContent = '铭牌编码';
        if (repairDeviceDesc) repairDeviceDesc.textContent = '铭牌编码';

        // 隐藏扫码提示，显示详情
        if (scanTipSection) scanTipSection.style.display = 'none';
        if (deviceDetail) deviceDetail.style.display = 'block';
    }

    // 从URL参数获取设备ID
    function loadDeviceFromURL() {
        const params = new URLSearchParams(window.location.search);
        const deviceId = params.get('id');
        if (deviceId) {
            loadDeviceData(deviceId);
        }
    }

    // 加载设备数据
    function loadDeviceData(deviceId) {
        fetch('data/devices.json')
            .then(response => response.json())
            .then(data => {
                const device = data.devices.find(d => d.id === deviceId);
                if (device) {
                    displayDeviceInfo(device);
                    switchPage('device');
                } else {
                    if (scanTipSection) {
                        scanTipSection.innerHTML = '<p class="scan-tip-text">未找到设备：' + deviceId + '</p>';
                    }
                }
            })
            .catch(err => {
                console.error('加载设备数据失败:', err);
                if (scanTipSection) {
                    scanTipSection.innerHTML = '<p class="scan-tip-text">加载失败，请重试</p>';
                }
            });
    }

    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
        loadDeviceFromURL();
        initFeatureClicks();
        initRepairCharCount();
        initRepairUpload();
        initRepairSave();
    });

    // 功能宫格点击事件
    function initFeatureClicks() {
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach(item => {
            item.addEventListener('click', function() {
                const text = this.querySelector('.feature-text').textContent;
                if (text === '试验报告') {
                    switchPage('report');
                } else if (text === '物料清单') {
                    switchPage('bom');
                } else if (text === '在线报修') {
                    switchPage('repair');
                } else if (text === '正品查验') {
                    switchPage('verify');
                }
            });
        });
    }

    // 报修Tab切换
    function switchRepairTab(tabName) {
        const tabs = document.querySelectorAll('.repair-tab');
        const contents = document.querySelectorAll('.repair-tab-content');
        
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) tab.classList.add('active');
        });
        
        contents.forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById('repair-tab-' + tabName);
        if (targetContent) targetContent.classList.add('active');
        
        if (tabName === 'records') {
            renderRepairRecords();
        }
    }

    // 渲染报修记录
    function renderRepairRecords() {
        const listEl = document.getElementById('repair-record-list');
        if (!listEl) return;
        
        const records = JSON.parse(localStorage.getItem('repairRecords') || '[]');
        
        if (records.length === 0) {
            listEl.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#ccc;font-size:14px;">暂无报修记录</div>';
            return;
        }
        
        listEl.innerHTML = records.map(record => `
            <div class="repair-record-card">
                <div class="repair-record-field">
                    <span class="repair-record-label">报修单号</span>
                    <span class="repair-record-value">${record.orderNo}</span>
                </div>
                <div class="repair-record-field">
                    <span class="repair-record-label">报修人</span>
                    <span class="repair-record-value">${record.person}</span>
                </div>
                <div class="repair-record-field">
                    <span class="repair-record-label">报修电话</span>
                    <span class="repair-record-value">${record.phone}</span>
                </div>
                <div class="repair-record-field">
                    <span class="repair-record-label">报修信息</span>
                    <span class="repair-record-value">${record.info}</span>
                </div>
                <div class="repair-record-field">
                    <span class="repair-record-label">报修日期</span>
                    <span class="repair-record-value">${record.date}</span>
                </div>
            </div>
        `).join('');
    }

    // 保存报修记录
    function saveRepairRecord() {
        const person = document.getElementById('repair-person').value.trim();
        const phone = document.getElementById('repair-phone').value.trim();
        const info = document.getElementById('repair-info').value.trim();
        const personError = document.getElementById('repair-person-error');
        const phoneError = document.getElementById('repair-phone-error');
        const infoError = document.getElementById('repair-info-error');
        
        // 清空之前的错误提示
        personError.textContent = '';
        phoneError.textContent = '';
        infoError.textContent = '';
        
        // 验证必填项
        if (!person) {
            personError.textContent = '请填写报修人';
            if (!phone) {
                phoneError.textContent = '请填写报修电话';
            }
            if (!info) {
                infoError.textContent = '请填写报修信息';
            }
            return;
        }
        if (!phone) {
            phoneError.textContent = '请填写报修电话';
            if (!info) {
                infoError.textContent = '请填写报修信息';
            }
            return;
        }
        if (!info) {
            infoError.textContent = '请填写报修信息';
            return;
        }
        
        const now = new Date();
        const orderNo = 'BX' + now.getFullYear() + 
            String(now.getMonth() + 1).padStart(2, '0') + 
            String(now.getDate()).padStart(2, '0') + 
            String(now.getHours()).padStart(2, '0') + 
            String(now.getMinutes()).padStart(2, '0') + 
            String(now.getSeconds()).padStart(2, '0');
        
        const dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
        
        const record = {
            orderNo: orderNo,
            person: person,
            phone: phone,
            info: info,
            date: dateStr
        };
        
        const records = JSON.parse(localStorage.getItem('repairRecords') || '[]');
        records.unshift(record);
        localStorage.setItem('repairRecords', JSON.stringify(records));
        
        // 清空表单
        document.getElementById('repair-person').value = '';
        document.getElementById('repair-phone').value = '';
        document.getElementById('repair-info').value = '';
        document.getElementById('repair-unit').value = '';
        document.getElementById('repair-address').value = '';
        document.getElementById('repair-char-count').textContent = '0';
        
        alert('报修成功！');
        
        // 切换到报修记录Tab
        switchRepairTab('records');
    }

    // 报修信息字数统计
    function initRepairCharCount() {
        const textarea = document.getElementById('repair-info');
        const countEl = document.getElementById('repair-char-count');
        if (!textarea || !countEl) return;
        
        textarea.addEventListener('input', function() {
            countEl.textContent = this.value.length;
        });
    }

    // 报修图片上传
    function initRepairUpload() {
        const uploadBtn = document.getElementById('repair-upload-btn');
        const fileInput = document.getElementById('repair-file-input');
        if (!uploadBtn || !fileInput) return;
        
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
    }

    // 报修保存按钮
    function initRepairSave() {
        const saveBtn = document.getElementById('repair-btn-save');
        if (!saveBtn) return;
        
        saveBtn.addEventListener('click', saveRepairRecord);
    }

    window.switchPage = switchPage;
    window.loadDeviceData = loadDeviceData;
    window.switchRepairTab = switchRepairTab;

    // ==================== 二维码生成工具 ====================
    function initQRCodeTool() {
        const btn = document.getElementById('generate-qrcodes-btn');
        if (!btn) return;
        btn.addEventListener('click', generateAllDeviceQRCodes);
    }

    /**
     * 读取 devices.json，为每个设备ID生成二维码图片
     */
    function generateAllDeviceQRCodes() {
        const preview = document.getElementById('qrcode-preview');
        if (!preview) return;

        fetch('data/devices.json')
            .then(res => res.json())
            .then(data => {
                preview.innerHTML = '';
                if (!data.devices || data.devices.length === 0) {
                    preview.innerHTML = '<p>暂无设备数据</p>';
                    return;
                }
                data.devices.forEach(device => {
                    const card = document.createElement('div');
                    card.className = 'qrcode-card';
                    const title = document.createElement('p');
                    title.className = 'qrcode-title';
                    title.textContent = '设备ID: ' + device.id;
                    const img = document.createElement('img');
                    img.src = generateQRCode(device.id, {
                        type: 'dataURL',
                        size: 200
                    });
                    const dlBtn = document.createElement('a');
                    dlBtn.className = 'btn btn-secondary';
                    dlBtn.textContent = '下载 ' + device.id + '.png';
                    dlBtn.download = device.id + '.png';
                    dlBtn.href = img.src;
                    card.appendChild(title);
                    card.appendChild(img);
                    card.appendChild(dlBtn);
                    preview.appendChild(card);
                });
            })
            .catch(err => {
                console.error('加载设备数据失败:', err);
                preview.innerHTML = '<p>加载失败：' + err.message + '</p>';
            });
    }

    initQRCodeTool();
    initRepairForm();

    // 在线报修表单交互
    function initRepairForm() {
        const textarea = document.getElementById('repair-info');
        const charCount = document.getElementById('repair-char-count');
        const uploadBtn = document.getElementById('repair-upload-btn');
        const fileInput = document.getElementById('repair-file-input');
        const saveBtn = document.getElementById('repair-btn-save');

        if (textarea && charCount) {
            textarea.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });
        }

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', function() {
                fileInput.click();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                const person = document.getElementById('repair-person').value.trim();
                const phone = document.getElementById('repair-phone').value.trim();
                const info = document.getElementById('repair-info').value.trim();

                if (!person) {
                    alert('请输入报修人');
                    return;
                }
                if (!phone) {
                    alert('请输入报修电话');
                    return;
                }
                if (!info) {
                    alert('请输入报修信息');
                    return;
                }

                alert('保存成功');
            });
        }
    }

    // 登录页面
    window.handleLogin = function() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const usernameError = document.getElementById('usernameError');
        const passwordError = document.getElementById('passwordError');
        const errorBar = document.getElementById('loginErrorBar');
        
        // 清空之前的错误提示
        usernameError.textContent = '';
        passwordError.textContent = '';
        errorBar.style.display = 'none';
        
        // 验证用户名
        if (!username) {
            usernameError.textContent = '请填写用户名';
            if (!password) {
                passwordError.textContent = '请填写密码';
            }
            return;
        }
        
        // 验证密码
        if (!password) {
            passwordError.textContent = '请填写密码';
            return;
        }
        
        // 都填写了，显示错误提示
        errorBar.style.display = 'block';
    }

})();
