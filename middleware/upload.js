const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const config = require('../config/env');
const { uploadFile } = require('../utils/r2');

// Get project root directory
const projectRoot = path.resolve(__dirname, '..');

// Create required upload directories (only when running locally or on writable FS)
const createUploadDirectories = () => {
    // Avoid creating directories under the function bundle on serverless platforms (read-only)
    if (process.env.VERCEL === '1') return;

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

// Create directories when module is loaded (no-op on Vercel)
createUploadDirectories();

// File filter
const fileFilter = (req, file, cb) => {
    // Enhanced logging for debugging
    console.log('File upload attempt:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
        extension: path.extname(file.originalname).toLowerCase()
    });

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Define allowed file types
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.avif'];
    const allowedVideoTypes = ['.mp4'];
    const allowedModelTypes = ['.glb', '.gltf'];

    // Check if file type is allowed based on field name
    if (file.fieldname === 'logo' || 
        file.fieldname === 'coverImage' || 
        file.fieldname === 'coverImage2' || 
        file.fieldname === 'image' || 
        file.fieldname === 'galleryImages' || 
        file.fieldname.startsWith('featuredModels[')) {
        
        console.log('Checking image file:', {
            extension: ext,
            allowedTypes: allowedImageTypes,
            isAllowed: allowedImageTypes.includes(ext)
        });

        if (allowedImageTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid image format: ${ext}. Only .jpg, .jpeg, .png, and .avif files are allowed.`), false);
        }
    } else if (file.fieldname === 'video' || file.fieldname === 'heroVideo') {
        if (allowedVideoTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid video format: ${ext}. Only .mp4 files are allowed.`), false);
        }
    } else if (file.fieldname === 'model3d') {
        if (allowedModelTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid 3D model format: ${ext}. Only .glb and .gltf files are allowed.`), false);
        }
    } else {
        cb(new Error(`Invalid field name: ${file.fieldname}`), false);
    }
};

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Default to project public/Assets
        let uploadPath = path.join(__dirname, '..', 'public', 'Assets');

        // Determine the appropriate subdirectory based on field name
        if (file.fieldname === 'logo') {
            uploadPath = path.join(uploadPath, 'Brands Logos');
        } else if (file.fieldname === 'coverImage' || file.fieldname === 'coverImage2') {
            uploadPath = path.join(uploadPath, 'Images');
        } else if (file.fieldname === 'heroVideo') {
            uploadPath = path.join(uploadPath, 'Videos');
        } else if (file.fieldname === 'model3d') {
            uploadPath = path.join(uploadPath, '3D Models');
        } else if (file.fieldname === 'image' || file.fieldname === 'galleryImages' || file.fieldname.startsWith('featuredModels[')) {
            uploadPath = path.join(uploadPath, 'Images');
        } else if (file.fieldname === 'video') {
            uploadPath = path.join(uploadPath, 'Videos');
        }

        // Try to create the directory; if that fails (read-only FS), fall back to OS temp directory
        try {
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            return cb(null, uploadPath);
        } catch (err) {
            // Fallback: use OS temp directory which is writable in serverless
            const tempBase = path.join(os.tmpdir(), 'vaultique_uploads');
            let tempPath = tempBase;
            if (file.fieldname === 'logo') {
                tempPath = path.join(tempBase, 'Brands Logos');
            } else if (file.fieldname === 'coverImage' || file.fieldname === 'coverImage2') {
                tempPath = path.join(tempBase, 'Images');
            } else if (file.fieldname === 'heroVideo' || file.fieldname === 'video') {
                tempPath = path.join(tempBase, 'Videos');
            } else if (file.fieldname === 'model3d') {
                tempPath = path.join(tempBase, '3D Models');
            } else {
                tempPath = path.join(tempBase, 'Images');
            }
            try {
                if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath, { recursive: true });
                return cb(null, tempPath);
            } catch (e) {
                // Last resort: return OS tmpdir root
                return cb(null, os.tmpdir());
            }
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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

// Middleware to upload saved files to R2 (if configured) and adjust req.files entries
const uploadToR2Middleware = async (req, res, next) => {
    if (!req.files) return next();

    const publicBase = path.join(__dirname, '..', 'public');

    const promises = [];
    try {
        for (const fieldName of Object.keys(req.files)) {
            for (const file of req.files[fieldName]) {
                // Build a logical key under Assets preserving subdirectory from filename
                // Determine subfolder used by multer destination logic
                let sub = 'Assets/Images';
                if (file.fieldname === 'heroVideo' || file.fieldname === 'video') sub = 'Assets/Videos';
                if (file.fieldname === 'model3d') sub = 'Assets/3D Models';
                if (file.fieldname === 'logo') sub = 'Assets/Brands Logos';

                const key = path.posix.join(sub, file.filename);

                // Attempt upload if R2 client is configured
                const p = (async () => {
                    try {
                        const remote = await uploadFile(file.path, key);
                        // Set file.path to a public-like local path so existing controller logic
                        // that does `.replace(/^.*?public/, '')` produces `/Assets/...` which
                        // will be redirected by the server to the asset base URL.
                        file.path = path.join(publicBase, key).replace(/\\/g, '/');
                        file.remoteUrl = remote;
                        // Remove local file to avoid storing it on the server
                        try { fs.unlinkSync(file.path); } catch (e) {}
                    } catch (err) {
                        console.error('R2 upload failed for', file.path, err.message);
                        // leave file on disk and allow fallback to local serving
                    }
                })();

                promises.push(p);
            }
        }

        await Promise.all(promises);
        return next();
    } catch (err) {
        console.error('Error in uploadToR2Middleware:', err);
        return next();
    }
};

module.exports.uploadToR2Middleware = uploadToR2Middleware;