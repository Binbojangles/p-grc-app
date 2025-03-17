const fs = require('fs');
const path = require('path');

// Path to the auth middleware file
const authMiddlewarePath = '/app/middleware/auth.js';

// Read the current file
const authMiddlewareContent = fs.readFileSync(authMiddlewarePath, 'utf8');

// Replace the token extraction logic
const fixedContent = authMiddlewareContent.replace(
  // Find the token extraction code
  /\/\/ Get token from header\n  const token = req\.header\('x-auth-token'\);\n\n  \/\/ Check if no token\n  if \(!token\) \{[\s\S]*?\}\n/,
  // Replace with updated code that supports both header types
  `// Get token from header
  let token = req.header('x-auth-token');
  
  // Check Authorization header if x-auth-token is not present
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied'
    });
  }
`
);

// Write the fixed content back to the file
fs.writeFileSync(authMiddlewarePath, fixedContent);

console.log('Auth middleware updated successfully'); 