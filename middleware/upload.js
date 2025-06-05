const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get project root directory
const projectRoot = path.resolve(__dirname, '..');

// Create required upload directories
const createUploadDirectories = () => {
    const baseDir = path.join(projectRoot, 'public', 'Assets');
    const subDirs = ['Images', 'Videos', '3D Models'];

    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    // Create subdirectories
    subDirs.forEach(dir => {
        const fullPath = path.join(baseDir, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
};

// Create directories when module is loaded
createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = path.join(projectRoot, 'public', 'Assets');
        
        // Determine subdirectory based on file type (case-insensitive)
        if (file.mimetype.toLowerCase().startsWith('image/')) {
            uploadPath = path.join(uploadPath, 'Images');
        } else if (file.mimetype.toLowerCase().startsWith('video/')) {
            uploadPath = path.join(uploadPath, 'Videos');
        } else if (file.originalname.endsWith('.glb')) {
            uploadPath = path.join(uploadPath, '3D Models');
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Log file information for debugging
    console.log('Processing file:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: (file.size / (1024 * 1024)).toFixed(2) + 'MB' // Log file size in MB
    });

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Define allowed file types
    const allowedImageTypes = ['.jpg', '.jpeg', '.png'];
    const allowedVideoTypes = ['.mp4'];
    const allowedModelTypes = ['.glb'];

    // Check if file type is allowed based on field name
    if (file.fieldname === 'image' || file.fieldname === 'galleryImages') {
        if (allowedImageTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid image format. Only .jpg, .jpeg, and .png files are allowed.`), false);
        }
    } else if (file.fieldname === 'video') {
        if (allowedVideoTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid video format. Only .mp4 files are allowed.`), false);
        }
    } else if (file.fieldname === 'model3D') {
        if (allowedModelTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid 3D model format. Only .glb files are allowed.`), false);
        }
    } else {
        cb(new Error(`Invalid field name: ${file.fieldname}`), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            console.log('File size error:', {
                code: err.code,
                message: err.message,
                field: err.field,
                limit: err.limit / (1024 * 1024) + 'MB'
            });
            return res.status(400).json({
                success: false,
                message: `File size too large. Maximum size is 100MB.`
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

module.exports = { upload, handleMulterError }; 