// Configuration
const config = {
    bodyShape: 'square',
    eyeFrameShape: 'frame0',
    eyeBallShape: 'ball0',
    colorMode: 'single',
    bodyColor: '#000000',
    bgColor: '#ffffff',
    gradientColor1: '#6366f1',
    gradientColor2: '#8b5cf6',
    separateEyeColors: false,
    eyeFrameColor: '#000000',
    eyeBallColor: '#000000',
    errorCorrection: 'M',
    size: 1000,
    format: 'png',
    logoData: null,
    removeBg: false
};

let currentQRData = null;
let currentQRWithoutLogo = null; // Cache QR code without logo for logo adjustments

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
});

// QR Type Change
document.getElementById('qrType').addEventListener('change', (e) => {
    updateDynamicFields(e.target.value);
});

function updateDynamicFields(type) {
    const container = document.getElementById('dynamicFields');
    
    const fields = {
        url: `
            <div class="form-group">
                <label>Website URL</label>
                <input type="url" id="qrData" placeholder="https://example.com" required>
                <small>Enter the full URL including https://</small>
            </div>
        `,
        text: `
            <div class="form-group">
                <label>Text Content</label>
                <textarea id="qrData" placeholder="Enter your text here..." required></textarea>
            </div>
        `,
        email: `
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="emailAddress" placeholder="email@example.com" required>
            </div>
            <div class="form-group">
                <label>Subject (Optional)</label>
                <input type="text" id="emailSubject" placeholder="Email subject">
            </div>
            <div class="form-group">
                <label>Message (Optional)</label>
                <textarea id="emailBody" placeholder="Email message"></textarea>
            </div>
        `,
        phone: `
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="qrData" placeholder="+1234567890" required>
                <small>Include country code (e.g., +1)</small>
            </div>
        `,
        sms: `
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="smsNumber" placeholder="+1234567890" required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="smsMessage" placeholder="SMS message"></textarea>
            </div>
        `,
        vcard: `
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="vcardName" placeholder="John Doe" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" id="vcardPhone" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="vcardEmail" placeholder="email@example.com">
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" id="vcardCompany" placeholder="Company Name">
            </div>
        `,
        wifi: `
            <div class="form-group">
                <label>Network Name (SSID)</label>
                <input type="text" id="wifiSSID" placeholder="MyWiFi" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="text" id="wifiPassword" placeholder="password">
            </div>
            <div class="form-group">
                <label>Security Type</label>
                <select id="wifiSecurity">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                </select>
            </div>
        `
    };
    
    container.innerHTML = fields[type] || fields.url;
}

// Initialize with URL fields
updateDynamicFields('url');

// Custom Color Picker
class ColorPicker {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.inputName = wrapper.dataset.colorInput;
        this.display = wrapper.querySelector('.color-input-display');
        this.popup = wrapper.querySelector('.color-picker-popup');
        this.canvas = wrapper.querySelector('.color-picker-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cursor = wrapper.querySelector('.color-picker-cursor');
        this.hueSlider = wrapper.querySelector('.hue-slider');
        this.hueCtx = this.hueSlider.getContext('2d');
        this.brightnessSlider = wrapper.querySelector('.brightness-slider');
        this.brightnessCtx = this.brightnessSlider.getContext('2d');
        this.hexInput = wrapper.querySelector('.hex-input');
        this.previewBox = wrapper.querySelector('.color-preview-box');
        this.hexValue = wrapper.querySelector('.color-hex-value');
        this.closeBtn = wrapper.querySelector('.color-picker-close');
        this.hueThumb = wrapper.querySelectorAll('.color-slider-thumb')[0];
        this.brightnessThumb = wrapper.querySelectorAll('.color-slider-thumb')[1];
        
        this.hue = 0;
        this.saturation = 100;
        this.brightness = 100;
        this.currentColor = this.hexInput.value;
        
        this.init();
    }
    
    init() {
        // Draw hue slider
        this.drawHueSlider();
        
        // Set initial color from hex input
        this.setColorFromHex(this.currentColor);
        
        // Event listeners
        this.display.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        
        // Canvas click
        this.canvas.addEventListener('mousedown', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) this.onCanvasClick(e);
        });
        
        // Hue slider
        this.hueSlider.addEventListener('mousedown', (e) => this.onHueSliderClick(e));
        this.hueSlider.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) this.onHueSliderClick(e);
        });
        
        // Brightness slider
        this.brightnessSlider.addEventListener('mousedown', (e) => this.onBrightnessSliderClick(e));
        this.brightnessSlider.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) this.onBrightnessSliderClick(e);
        });
        
        // Hex input
        this.hexInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9a-fA-F]/g, '');
            if (value.length === 6) {
                this.setColorFromHex(value);
            }
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });
    }
    
    drawHueSlider() {
        const height = this.hueSlider.height;
        const width = this.hueSlider.width;
        
        for (let i = 0; i < height; i++) {
            const hue = (i / height) * 360;
            this.hueCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            this.hueCtx.fillRect(0, i, width, 1);
        }
    }
    
    drawBrightnessSlider() {
        const height = this.brightnessSlider.height;
        const width = this.brightnessSlider.width;
        
        for (let i = 0; i < height; i++) {
            const brightness = 100 - (i / height) * 100;
            this.brightnessCtx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${brightness}%)`;
            this.brightnessCtx.fillRect(0, i, width, 1);
        }
    }
    
    drawCanvas() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Draw saturation-brightness gradient
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const saturation = (x / width) * 100;
                const brightness = 100 - (y / height) * 100;
                this.ctx.fillStyle = `hsl(${this.hue}, ${saturation}%, ${brightness}%)`;
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    onCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.saturation = (x / rect.width) * 100;
        this.brightness = 100 - (y / rect.height) * 100;
        
        this.updateColor();
        this.updateCursor(x, y);
    }
    
    onHueSliderClick(e) {
        const rect = this.hueSlider.getBoundingClientRect();
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        
        this.hue = (y / rect.height) * 360;
        this.updateColor();
        this.drawCanvas();
        this.drawBrightnessSlider();
        this.updateHueThumb(y);
    }
    
    onBrightnessSliderClick(e) {
        const rect = this.brightnessSlider.getBoundingClientRect();
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        
        this.brightness = 100 - (y / rect.height) * 100;
        this.updateColor();
        this.updateBrightnessThumb(y);
    }
    
    updateColor() {
        const hex = this.hslToHex(this.hue, this.saturation, this.brightness);
        this.currentColor = hex;
        this.hexInput.value = hex;
        this.hexValue.textContent = '#' + hex;
        this.previewBox.style.backgroundColor = '#' + hex;
        
        // Update config
        config[this.inputName] = '#' + hex;
        updateDesignPreview();
    }
    
    updateCursor(x, y) {
        this.cursor.style.left = x + 'px';
        this.cursor.style.top = y + 'px';
    }
    
    updateHueThumb(y) {
        this.hueThumb.style.top = y + 'px';
    }
    
    updateBrightnessThumb(y) {
        this.brightnessThumb.style.top = y + 'px';
    }
    
    setColorFromHex(hex) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        this.hue = hsl.h;
        this.saturation = hsl.s;
        this.brightness = hsl.l;
        this.currentColor = hex;
        
        this.hexInput.value = hex;
        this.hexValue.textContent = '#' + hex;
        this.previewBox.style.backgroundColor = '#' + hex;
        
        this.drawCanvas();
        this.drawBrightnessSlider();
        
        // Update cursor and thumbs
        const canvasX = (this.saturation / 100) * this.canvas.width;
        const canvasY = ((100 - this.brightness) / 100) * this.canvas.height;
        this.updateCursor(canvasX, canvasY);
        
        const hueY = (this.hue / 360) * this.hueSlider.height;
        this.updateHueThumb(hueY);
        
        const brightnessY = ((100 - this.brightness) / 100) * this.brightnessSlider.height;
        this.updateBrightnessThumb(brightnessY);
    }
    
    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;
        
        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else if (h >= 300 && h < 360) {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    hexToRgb(hex) {
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }
    
    open() {
        // Close all other pickers
        document.querySelectorAll('.color-picker-popup').forEach(p => p.classList.remove('active'));
        
        this.popup.classList.add('active');
        this.drawCanvas();
        this.drawBrightnessSlider();
    }
    
    close() {
        this.popup.classList.remove('active');
    }
}

// Initialize color pickers
document.querySelectorAll('.color-picker-wrapper').forEach(wrapper => {
    new ColorPicker(wrapper);
});

// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const accordionId = header.dataset.accordion;
        const content = document.getElementById(`${accordionId}Accordion`);
        const isActive = header.classList.contains('active');
        
        // Close all accordions
        document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
        document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
        
        // Open clicked accordion if it wasn't active
        if (!isActive) {
            header.classList.add('active');
            content.classList.add('active');
        }
    });
});

// Shape Selection - Button Grid in Accordions
document.querySelectorAll('[data-shape]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all body shape buttons
        document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        config.bodyShape = btn.dataset.shape;
        document.getElementById('bodyShapeLabel').textContent = btn.textContent;
        updateDesignPreview();
    });
});

document.querySelectorAll('[data-frame]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all eye frame buttons
        document.querySelectorAll('[data-frame]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        config.eyeFrameShape = btn.dataset.frame;
        document.getElementById('eyeFrameLabel').textContent = btn.textContent;
        updateDesignPreview();
    });
});

document.querySelectorAll('[data-ball]').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all eye ball buttons
        document.querySelectorAll('[data-ball]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        config.eyeBallShape = btn.dataset.ball;
        document.getElementById('eyeBallLabel').textContent = btn.textContent;
        updateDesignPreview();
    });
});

// Color Mode
document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
    updateColorControls(e.target.value);
    updateDesignPreview();
});

function updateColorControls(mode) {
    const container = document.getElementById('colorControls');
    
    if (mode === 'single') {
        container.innerHTML = `
            <div class="form-group">
                <label>Body Color</label>
                <div class="color-picker-wrapper" data-color-input="bodyColor">
                    <div class="color-input-display">
                        <div class="color-preview-box" style="background-color: ${config.bodyColor};"></div>
                        <span class="color-hex-value">${config.bodyColor}</span>
                    </div>
                    <div class="color-picker-popup">
                        <div class="color-picker-header">
                            <span>Select Color</span>
                            <button class="color-picker-close">×</button>
                        </div>
                        <div class="color-picker-canvas-wrapper">
                            <canvas class="color-picker-canvas" width="236" height="140"></canvas>
                            <div class="color-picker-cursor"></div>
                        </div>
                        <div class="color-picker-sliders">
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Hue</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas hue-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Brightness</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas brightness-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                        </div>
                        <div class="color-picker-hex-input">
                            <span>#</span>
                            <input type="text" class="hex-input" maxlength="6" value="${config.bodyColor.substring(1)}">
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Background Color</label>
                <div class="color-picker-wrapper" data-color-input="bgColor">
                    <div class="color-input-display">
                        <div class="color-preview-box" style="background-color: ${config.bgColor};"></div>
                        <span class="color-hex-value">${config.bgColor}</span>
                    </div>
                    <div class="color-picker-popup">
                        <div class="color-picker-header">
                            <span>Select Color</span>
                            <button class="color-picker-close">×</button>
                        </div>
                        <div class="color-picker-canvas-wrapper">
                            <canvas class="color-picker-canvas" width="236" height="140"></canvas>
                            <div class="color-picker-cursor"></div>
                        </div>
                        <div class="color-picker-sliders">
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Hue</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas hue-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Brightness</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas brightness-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                        </div>
                        <div class="color-picker-hex-input">
                            <span>#</span>
                            <input type="text" class="hex-input" maxlength="6" value="${config.bgColor.substring(1)}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="form-group">
                <label>Gradient Color 1</label>
                <div class="color-picker-wrapper" data-color-input="gradientColor1">
                    <div class="color-input-display">
                        <div class="color-preview-box" style="background-color: ${config.gradientColor1};"></div>
                        <span class="color-hex-value">${config.gradientColor1}</span>
                    </div>
                    <div class="color-picker-popup">
                        <div class="color-picker-header">
                            <span>Select Color</span>
                            <button class="color-picker-close">×</button>
                        </div>
                        <div class="color-picker-canvas-wrapper">
                            <canvas class="color-picker-canvas" width="236" height="140"></canvas>
                            <div class="color-picker-cursor"></div>
                        </div>
                        <div class="color-picker-sliders">
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Hue</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas hue-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Brightness</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas brightness-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                        </div>
                        <div class="color-picker-hex-input">
                            <span>#</span>
                            <input type="text" class="hex-input" maxlength="6" value="${config.gradientColor1.substring(1)}">
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Gradient Color 2</label>
                <div class="color-picker-wrapper" data-color-input="gradientColor2">
                    <div class="color-input-display">
                        <div class="color-preview-box" style="background-color: ${config.gradientColor2};"></div>
                        <span class="color-hex-value">${config.gradientColor2}</span>
                    </div>
                    <div class="color-picker-popup">
                        <div class="color-picker-header">
                            <span>Select Color</span>
                            <button class="color-picker-close">×</button>
                        </div>
                        <div class="color-picker-canvas-wrapper">
                            <canvas class="color-picker-canvas" width="236" height="140"></canvas>
                            <div class="color-picker-cursor"></div>
                        </div>
                        <div class="color-picker-sliders">
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Hue</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas hue-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Brightness</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas brightness-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                        </div>
                        <div class="color-picker-hex-input">
                            <span>#</span>
                            <input type="text" class="hex-input" maxlength="6" value="${config.gradientColor2.substring(1)}">
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Background Color</label>
                <div class="color-picker-wrapper" data-color-input="bgColor">
                    <div class="color-input-display">
                        <div class="color-preview-box" style="background-color: ${config.bgColor};"></div>
                        <span class="color-hex-value">${config.bgColor}</span>
                    </div>
                    <div class="color-picker-popup">
                        <div class="color-picker-header">
                            <span>Select Color</span>
                            <button class="color-picker-close">×</button>
                        </div>
                        <div class="color-picker-canvas-wrapper">
                            <canvas class="color-picker-canvas" width="236" height="140"></canvas>
                            <div class="color-picker-cursor"></div>
                        </div>
                        <div class="color-picker-sliders">
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Hue</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas hue-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                            <div class="color-slider-wrapper">
                                <span class="color-slider-label">Brightness</span>
                                <div class="color-slider-track">
                                    <canvas class="color-slider-canvas brightness-slider" width="30" height="80"></canvas>
                                    <div class="color-slider-thumb"></div>
                                </div>
                            </div>
                        </div>
                        <div class="color-picker-hex-input">
                            <span>#</span>
                            <input type="text" class="hex-input" maxlength="6" value="${config.bgColor.substring(1)}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Reinitialize color pickers
    container.querySelectorAll('.color-picker-wrapper').forEach(wrapper => {
        new ColorPicker(wrapper);
    });
}

function attachColorListeners() {
    // No longer needed - color pickers handle their own events
}

// Separate Eye Colors Toggle
document.getElementById('separateEyeColors').addEventListener('change', (e) => {
    config.separateEyeColors = e.target.checked;
    const eyeColorControls = document.getElementById('eyeColorControls');
    eyeColorControls.style.display = e.target.checked ? 'block' : 'none';
    
    // Initialize color pickers for eye colors when shown
    if (e.target.checked) {
        eyeColorControls.querySelectorAll('.color-picker-wrapper').forEach(wrapper => {
            new ColorPicker(wrapper);
        });
    }
    
    updateDesignPreview();
});

// Initialize eye color pickers if already visible
if (document.getElementById('separateEyeColors').checked) {
    document.getElementById('eyeColorControls').querySelectorAll('.color-picker-wrapper').forEach(wrapper => {
        new ColorPicker(wrapper);
    });
}

// Design Preview Update
let previewTimeout;
let isPreviewLoading = false;

async function updateDesignPreview() {
    // Debounce preview updates
    clearTimeout(previewTimeout);
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('previewLoading');
    const previewImage = document.getElementById('designPreviewImage');
    
    if (loadingIndicator && !isPreviewLoading) {
        loadingIndicator.style.display = 'flex';
        isPreviewLoading = true;
    }
    
    previewTimeout = setTimeout(async () => {
        try {
            const previewData = 'https://example.com'; // Sample data for preview
            const qrUrl = await createQRCode(previewData);
            
            // Add watermark to preview
            const qrWithWatermark = await addWatermarkToQR(qrUrl);
            
            const placeholder = document.querySelector('.preview-placeholder');
            
            previewImage.src = qrWithWatermark;
            previewImage.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
            
        } catch (error) {
            console.error('Error updating preview:', error);
            showToast('Failed to update preview. Please try again.', 'error');
            
            // Show placeholder on error
            const placeholder = document.querySelector('.preview-placeholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
                previewImage.style.display = 'none';
            }
        } finally {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
                isPreviewLoading = false;
            }
        }
    }, 300); // Wait 300ms after last change for faster response
}

// Initialize preview on page load
window.addEventListener('DOMContentLoaded', () => {
    updateDesignPreview();
});

// Logo Upload
document.getElementById('logoUpload').addEventListener('change', async (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
        showToast('Please upload a valid image file (JPEG, PNG, GIF, or SVG)', 'error');
        e.target.value = '';
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        e.target.value = '';
        return;
    }
    
    try {
        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('logoPreviewImage').src = event.target.result;
            document.getElementById('logoPreviewContainer').style.display = 'block';
        };
        reader.onerror = () => {
            showToast('Failed to read file', 'error');
        };
        reader.readAsDataURL(file);
        
        // Upload logo to server
        const formData = new FormData();
        formData.append('file', file);
        
        showToast('Uploading logo...', 'info', 2000);
        
        const uploadResponse = await fetch('/api/upload-logo', {
            method: 'POST',
            body: formData
        });
        
        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(errorData.error || 'Failed to upload logo');
        }
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadData.success || !uploadData.filename) {
            throw new Error('Invalid response from server');
        }
        
        config.logoData = uploadData.filename;
        showToast('Logo uploaded! Click "Generate QR Code" to create QR code with logo.', 'success');
        
    } catch (error) {
        console.error('Error uploading logo:', error);
        showToast(error.message || 'Failed to upload logo. Please try again.', 'error');
        
        // Reset file input and preview
        e.target.value = '';
        document.getElementById('logoPreviewContainer').style.display = 'none';
        config.logoData = null;
    }
});

// Remove Logo
document.getElementById('removeLogo').addEventListener('click', () => {
    config.logoData = null;
    document.getElementById('logoUpload').value = '';
    document.getElementById('logoPreviewContainer').style.display = 'none';
    
    showToast('Logo removed! Click "Generate QR Code" to create QR code without logo.', 'info');
});

// Remove Background Checkbox
document.getElementById('removeBg').addEventListener('change', (e) => {
    config.removeBg = e.target.checked;
    if (e.target.checked) {
        showToast('Background removal enabled. Regenerate QR code to apply.', 'info', 2000);
    }
});

// Advanced Settings
document.getElementById('errorCorrection').addEventListener('change', (e) => {
    config.errorCorrection = e.target.value;
});

document.getElementById('qrSize').addEventListener('input', (e) => {
    config.size = parseInt(e.target.value);
    document.getElementById('qrSizeValue').textContent = `${config.size}px`;
});

document.getElementById('downloadFormat').addEventListener('change', (e) => {
    config.format = e.target.value;
});

// Generate QR Code
document.getElementById('generateBtn').addEventListener('click', generateQRCode);

async function generateQRCode() {
    const qrType = document.getElementById('qrType').value;
    const data = getQRData(qrType);
    
    if (!data) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    const generateBtn = document.getElementById('generateBtn');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    try {
        const qrUrl = await createQRCode(data);
        
        // Add watermark to QR code
        const qrWithWatermark = await addWatermarkToQR(qrUrl);
        
        displayQRCode(qrWithWatermark);
        currentQRData = qrWithWatermark;
        currentQRWithoutLogo = qrWithWatermark;
        
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('copyBtn').disabled = false;
        
        showToast('QR code generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating QR code:', error);
        
        let errorMessage = 'Failed to generate QR code';
        if (error.message) {
            errorMessage = error.message;
        }
        
        // Handle specific error cases
        if (errorMessage.includes('Image is not existing')) {
            errorMessage = 'Logo upload failed. Please try uploading the logo again.';
            config.logoData = null;
            document.getElementById('logoUpload').value = '';
            document.getElementById('logoPreviewContainer').style.display = 'none';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        }
        
        showToast(errorMessage, 'error', 5000);
    } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

function getQRData(type) {
    switch(type) {
        case 'url':
        case 'text':
        case 'phone':
            const input = document.getElementById('qrData');
            return input ? input.value : null;
            
        case 'email':
            const email = document.getElementById('emailAddress').value;
            const subject = document.getElementById('emailSubject').value;
            const body = document.getElementById('emailBody').value;
            return email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null;
            
        case 'sms':
            const smsNumber = document.getElementById('smsNumber').value;
            const smsMessage = document.getElementById('smsMessage').value;
            return smsNumber ? `sms:${smsNumber}?body=${encodeURIComponent(smsMessage)}` : null;
            
        case 'vcard':
            const name = document.getElementById('vcardName').value;
            const phone = document.getElementById('vcardPhone').value;
            const vcardEmail = document.getElementById('vcardEmail').value;
            const company = document.getElementById('vcardCompany').value;
            return name ? `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${vcardEmail}\nORG:${company}\nEND:VCARD` : null;
            
        case 'wifi':
            const ssid = document.getElementById('wifiSSID').value;
            const password = document.getElementById('wifiPassword').value;
            const security = document.getElementById('wifiSecurity').value;
            return ssid ? `WIFI:T:${security};S:${ssid};P:${password};;` : null;
            
        default:
            return null;
    }
}

async function createQRCode(data) {
    const apiUrl = '/api/generate-qr';
    
    // Determine eye colors based on settings
    let eyeFrameColor, eyeBallColor;
    
    if (config.separateEyeColors) {
        // Use separate eye colors
        eyeFrameColor = config.eyeFrameColor;
        eyeBallColor = config.eyeBallColor;
    } else {
        // Use body colors for eyes
        if (config.colorMode === 'single') {
            eyeFrameColor = config.bodyColor;
            eyeBallColor = config.bodyColor;
        } else {
            eyeFrameColor = config.gradientColor1;
            eyeBallColor = config.gradientColor2;
        }
    }
    
    // Build config object based on color mode
    const apiConfig = {
        body: config.bodyShape,
        eye: config.eyeFrameShape,
        eyeBall: config.eyeBallShape,
        erf1: [],
        erf2: [],
        erf3: [],
        brf1: [],
        brf2: [],
        brf3: [],
        bodyColor: config.bodyColor,
        bgColor: config.bgColor,
        eye1Color: eyeFrameColor,
        eye2Color: eyeFrameColor,
        eye3Color: eyeFrameColor,
        eyeBall1Color: eyeBallColor,
        eyeBall2Color: eyeBallColor,
        eyeBall3Color: eyeBallColor
    };
    
    // Only add gradient parameters if not in single color mode
    if (config.colorMode !== 'single') {
        apiConfig.gradientColor1 = config.gradientColor1;
        apiConfig.gradientColor2 = config.gradientColor2;
        apiConfig.gradientType = config.colorMode === 'gradient' ? 'linear' : 'radial';
        apiConfig.gradientOnEyes = false;
        apiConfig.bodyColor = config.gradientColor1; // Override bodyColor with gradient start
    }
    
    // Add logo if available
    if (config.logoData) {
        apiConfig.logo = config.logoData;
        apiConfig.logoMode = config.removeBg ? 'clean' : 'default';
    }
    
    const requestBody = {
        data: data,
        config: apiConfig,
        size: config.size,
        download: false,
        file: config.format
    };
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = 'Failed to generate QR code';
            
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
                
                // Handle specific error cases
                if (errorData.details) {
                    if (typeof errorData.details === 'object') {
                        if (errorData.details.errorMessage) {
                            errorMessage = errorData.details.errorMessage;
                        }
                    }
                }
            }
            
            throw new Error(errorMessage);
        }
        
        const blob = await response.blob();
        
        if (blob.size === 0) {
            throw new Error('Received empty response from server');
        }
        
        const qrUrl = URL.createObjectURL(blob);
        return qrUrl;
        
    } catch (error) {
        console.error('QR generation error:', error);
        throw error;
    }
}

async function addLogoToQR(qrUrl) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const qrImage = new Image();
        qrImage.crossOrigin = 'anonymous';
        
        qrImage.onload = () => {
            canvas.width = qrImage.width;
            canvas.height = qrImage.height;
            
            // Draw QR code
            ctx.drawImage(qrImage, 0, 0);
            
            // Load and draw logo
            const logoImage = new Image();
            logoImage.onload = () => {
                const logoSize = canvas.width * config.logoSize;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                
                // Draw background for logo if needed
                const padding = logoSize * 0.1;
                if (config.logoBackground !== 'transparent') {
                    ctx.fillStyle = config.logoBackground === 'white' ? '#ffffff' : config.logoBgColor;
                    ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);
                }
                
                // Draw logo
                ctx.drawImage(logoImage, x, y, logoSize, logoSize);
                
                resolve(canvas.toDataURL('image/png'));
            };
            
            logoImage.onerror = () => reject(new Error('Failed to load logo image'));
            logoImage.src = config.logoData;
        };
        
        qrImage.onerror = () => reject(new Error('Failed to load QR code image'));
        qrImage.src = qrUrl;
    });
}

// Add watermark to QR code
async function addWatermarkToQR(qrUrl) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const qrImage = new Image();
        qrImage.crossOrigin = 'anonymous';
        
        qrImage.onload = () => {
            canvas.width = qrImage.width;
            canvas.height = qrImage.height;
            
            // Draw QR code
            ctx.drawImage(qrImage, 0, 0);
            
            // Add watermark text at bottom right
            const watermarkText = 'cebutech.it';
            const fontSize = Math.max(12, canvas.width * 0.050); // Smaller, responsive font size
            const padding = fontSize * 0.4;
            
            ctx.font = `600 ${fontSize}px Arial, sans-serif`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            
            // Measure text
            const textMetrics = ctx.measureText(watermarkText);
            const textWidth = textMetrics.width;
            const textHeight = fontSize * 1.2;
            
            // Position at bottom right
            const x = canvas.width - padding;
            const y = canvas.height - padding;
            
            // Get the background color from the QR code at this position
            const bgImageData = ctx.getImageData(
                canvas.width - textWidth - padding * 2,
                canvas.height - textHeight - padding,
                textWidth + padding * 2,
                textHeight + padding
            );
            
            // Calculate average brightness to determine text color
            let totalBrightness = 0;
            for (let i = 0; i < bgImageData.data.length; i += 4) {
                const r = bgImageData.data[i];
                const g = bgImageData.data[i + 1];
                const b = bgImageData.data[i + 2];
                totalBrightness += (r + g + b) / 3;
            }
            const avgBrightness = totalBrightness / (bgImageData.data.length / 4);
            
            // Use contrasting color based on background with subtle opacity
            const textColor = avgBrightness > 128 ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 1)';
            
            // Draw watermark text with subtle opacity to blend with QR code
            ctx.fillStyle = textColor;
            ctx.fillText(watermarkText, x, y);
            
            resolve(canvas.toDataURL('image/png'));
        };
        
        qrImage.onerror = () => reject(new Error('Failed to load QR code image'));
        qrImage.src = qrUrl;
    });
}

function displayQRCode(imageUrl) {
    const preview = document.getElementById('qrPreview');
    preview.innerHTML = `<img src="${imageUrl}" alt="Generated QR Code">`;
}

// Download QR Code
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (currentQRData) {
        const link = document.createElement('a');
        link.href = currentQRData;
        link.download = `qrcode.${config.format}`;
        link.click();
    }
});

// Copy QR Code
document.getElementById('copyBtn').addEventListener('click', async () => {
    if (currentQRData) {
        try {
            const response = await fetch(currentQRData);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            
            showToast('QR code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            showToast('Failed to copy QR code to clipboard', 'error');
        }
    }
});

// Presets
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        // Add loading state
        btn.classList.add('loading');
        
        // Apply preset
        await applyPreset(btn.dataset.preset);
        
        // Remove loading state after a short delay
        setTimeout(() => {
            btn.classList.remove('loading');
        }, 800);
    });
});

async function applyPreset(preset) {
    const presets = {
        facebook: {
            bodyShape: 'square',
            eyeFrameShape: 'frame0',
            eyeBallShape: 'ball0',
            colorMode: 'single',
            bodyColor: '#1877f2',
            bgColor: '#ffffff',
            separateEyeColors: true,
            eyeFrameColor: '#1877f2',
            eyeBallColor: '#1877f2'
        },
        youtube: {
            bodyShape: 'dot',
            eyeFrameShape: 'frame0',
            eyeBallShape: 'ball0',
            colorMode: 'single',
            bodyColor: '#ff0000',
            bgColor: '#ffffff',
            separateEyeColors: true,
            eyeFrameColor: '#ff0000',
            eyeBallColor: '#ff0000'
        },
        instagram: {
            bodyShape: 'rounded-pointed',
            eyeFrameShape: 'frame13',
            eyeBallShape: 'ball14',
            colorMode: 'gradient',
            gradientColor1: '#833ab4',
            gradientColor2: '#fd1d1d',
            bgColor: '#ffffff',
            separateEyeColors: true,
            eyeFrameColor: '#833ab4',
            eyeBallColor: '#fd1d1d'
        },
        twitter: {
            bodyShape: 'circle',
            eyeFrameShape: 'frame13',
            eyeBallShape: 'ball14',
            colorMode: 'single',
            bodyColor: '#1da1f2',
            bgColor: '#ffffff',
            separateEyeColors: true,
            eyeFrameColor: '#1da1f2',
            eyeBallColor: '#1da1f2'
        },
        linkedin: {
            bodyShape: 'square',
            eyeFrameShape: 'frame0',
            eyeBallShape: 'ball0',
            colorMode: 'single',
            bodyColor: '#0a66c2',
            bgColor: '#ffffff',
            separateEyeColors: true,
            eyeFrameColor: '#0a66c2',
            eyeBallColor: '#0a66c2'
        },
        whatsapp: {
            bodyShape: 'rounded-in-smooth',
            eyeFrameShape: 'frame13',
            eyeBallShape: 'ball14',
            colorMode: 'single',
            bodyColor: '#25d366',
            bgColor: '#ffffff',
            separateEyeColors: true,
            eyeFrameColor: '#25d366',
            eyeBallColor: '#25d366'
        }
    };
    
    const presetConfig = presets[preset];
    if (presetConfig) {
        Object.assign(config, presetConfig);
        
        // Update UI - Buttons
        document.querySelectorAll('[data-shape]').forEach(btn => {
            const isActive = btn.dataset.shape === presetConfig.bodyShape;
            btn.classList.toggle('active', isActive);
            if (isActive) document.getElementById('bodyShapeLabel').textContent = btn.textContent;
        });
        
        document.querySelectorAll('[data-frame]').forEach(btn => {
            const isActive = btn.dataset.frame === presetConfig.eyeFrameShape;
            btn.classList.toggle('active', isActive);
            if (isActive) document.getElementById('eyeFrameLabel').textContent = btn.textContent;
        });
        
        document.querySelectorAll('[data-ball]').forEach(btn => {
            const isActive = btn.dataset.ball === presetConfig.eyeBallShape;
            btn.classList.toggle('active', isActive);
            if (isActive) document.getElementById('eyeBallLabel').textContent = btn.textContent;
        });
        
        document.getElementById('colorMode').value = presetConfig.colorMode;
        document.getElementById('separateEyeColors').checked = presetConfig.separateEyeColors;
        document.getElementById('eyeColorControls').style.display = presetConfig.separateEyeColors ? 'block' : 'none';
        
        // Initialize eye color pickers if shown
        if (presetConfig.separateEyeColors) {
            const eyeColorControls = document.getElementById('eyeColorControls');
            eyeColorControls.querySelectorAll('.color-picker-wrapper').forEach(wrapper => {
                new ColorPicker(wrapper);
            });
        }
        
        updateColorControls(presetConfig.colorMode);
        
        // Wait a bit before updating preview to show loading animation
        await new Promise(resolve => setTimeout(resolve, 300));
        updateDesignPreview();
    }
}
