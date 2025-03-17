const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Enhanced debugging
console.log('Initializing file upload middleware...');

// Use absolute path to ensure it works in Docker container
const uploadDir = '/app/uploads/evidence';
console.log(`Using absolute upload directory: ${uploadDir}`);

if (!fs.existsSync(uploadDir)) {
  console.log(`Creating upload directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log(`Upload directory exists: ${uploadDir}`);
}

// Defines allowed MIME types for security
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/jpeg',
  'image/png',
  'text/plain',
];

console.log('Allowed MIME types:', allowedMimeTypes);

// Maximum file size (5MB)
const maxFileSize = 5 * 1024 * 1024;

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Setting destination to: ${uploadDir}`);
    // Double check directory exists before upload
    if (!fs.existsSync(uploadDir)) {
      console.log(`Creating upload directory on demand: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate secure filename to prevent path traversal attacks
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeFileName = uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    console.log(`Processing file: ${file.originalname}, MIME: ${file.mimetype}, generating filename: ${safeFileName}`);
    cb(null, safeFileName);
  }
});

// Enhanced file filter with better PDF handling
const fileFilter = function (req, file, cb) {
  console.log(`Validating file: ${file.originalname}, Reported MIME type: ${file.mimetype}`);
  
  // Special handling for PDF files - some users might encounter MIME type issues
  const isPdfByExtension = file.originalname.toLowerCase().endsWith('.pdf');
  
  if (isPdfByExtension) {
    console.log(`PDF file detected by extension: ${file.originalname}`);
    
    // For PDF files we'll accept any MIME type as long as the extension is .pdf
    // This fixes issues where browsers or systems report incorrect MIME types
    console.log(`Accepting PDF file regardless of reported MIME type: ${file.mimetype}`);
    
    // Mutate the file object to ensure consistent handling downstream
    file.mimetype = 'application/pdf';
    
    return cb(null, true);
  }
  
  // For non-PDF files, check the MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    console.error(`File type not allowed: ${file.mimetype}`);
    return cb(new Error('File type not allowed'), false);
  }
  
  console.log(`File validation passed for: ${file.originalname}`);
  cb(null, true);
};

// Configure multer with our settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: fileFilter
});

// Create middleware for handling single file uploads with improved error handling
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    console.log(`Processing upload for field: ${fieldName}`);
    const middleware = upload.single(fieldName);
    
    middleware(req, res, (err) => {
      if (err) {
        console.error(`File upload error: ${err.message}`);
        
        // Handle Multer errors
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: `File size exceeds the 5MB limit`,
              message: 'File validation failed'
            });
          }
          return res.status(400).json({
            error: `Upload error: ${err.message}`,
            message: 'File upload failed'
          });
        }
        
        // Handle custom errors from our fileFilter
        return res.status(400).json({
          error: err.message,
          message: 'File validation failed'
        });
      }
      
      // If no file was uploaded and it's required
      if (!req.file && req.method === 'POST') {
        console.log('No file uploaded during POST request');
      } else if (req.file) {
        console.log(`File upload successful: ${req.file.filename}, size: ${req.file.size} bytes`);
      }
      
      next();
    });
  };
};

module.exports = {
  uploadSingle
}; 