const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads with validation
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, svg)'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Logo upload endpoint
app.post('/api/upload-logo', upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            error: 'No file uploaded' 
        });
    }

    console.log(`📤 Uploading logo: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)}KB)`);
    
    try {
        // Create form data for QRCode Monkey API
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Upload to QRCode Monkey API
        const response = await fetch('https://api.qrcode-monkey.com/qr/uploadimage', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Upload API Error:', errorText);
            return res.status(response.status).json({ 
                success: false,
                error: 'Failed to upload logo to QRCode Monkey',
                details: errorText 
            });
        }

        const result = await response.json();
        console.log('✓ Logo uploaded successfully:', result.file);

        res.json({ 
            success: true,
            filename: result.file 
        });

    } catch (error) {
        console.error('❌ Error uploading logo:', error.message);
        throw error;
    }
}));

// QR Code generation endpoint
app.post('/api/generate-qr', asyncHandler(async (req, res) => {
    const { data, config, size, download, file } = req.body;
    
    // Validate required fields
    if (!data) {
        return res.status(400).json({ 
            success: false,
            error: 'QR code data is required' 
        });
    }

    if (!config) {
        return res.status(400).json({ 
            success: false,
            error: 'QR code configuration is required' 
        });
    }

    console.log('🔄 Generating QR code...');
    console.log(`   Data: ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}`);
    console.log(`   Has logo: ${!!config.logo}`);
    console.log(`   Size: ${size || 1000}px`);
    console.log(`   Format: ${file || 'png'}`);
    
    try {
        // Forward request to QRCode Monkey API
        const response = await fetch('https://api.qrcode-monkey.com/qr/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'image/png, image/svg+xml, application/pdf, application/postscript',
            },
            body: JSON.stringify({
                data,
                config,
                size: size || 1000,
                download: download || false,
                file: file || 'png'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            
            console.error('❌ API Error:', errorData);
            return res.status(response.status).json({ 
                success: false,
                error: 'QRCode Monkey API error',
                details: errorData 
            });
        }

        // Get the image buffer
        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        console.log(`✓ QR code generated successfully (${(buffer.length / 1024).toFixed(2)}KB)`);

        // Send the image back to client
        res.set('Content-Type', contentType);
        res.send(buffer);

    } catch (error) {
        console.error('❌ Error generating QR code:', error.message);
        throw error;
    }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok',
        message: 'QR Code Generator API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    // Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false,
                error: 'File too large. Maximum size is 5MB' 
            });
        }
        return res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
    
    // Custom file filter errors
    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
    
    // Generic errors
    res.status(err.status || 500).json({ 
        success: false,
        error: err.message || 'Internal server error' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 QR Code Generator Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ API endpoint: http://localhost:${PORT}/api/generate-qr`);
    console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
});
