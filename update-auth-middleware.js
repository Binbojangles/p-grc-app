const fs = require('fs');
const path = require('path');

// Path to the auth middleware file
const authMiddlewarePath = path.join(__dirname, 'middleware', 'auth.js');

try {
  // Read the current auth middleware file
  const content = fs.readFileSync(authMiddlewarePath, 'utf8');
  
  // Replace the token extraction logic
  const updatedContent = content.replace(
    // Get token from header
    `// Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied'
    });
  }`,
    // Updated token extraction logic
    `// Get token from header (support both x-auth-token and Authorization Bearer)
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
  }`
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(authMiddlewarePath, updatedContent);
  
  console.log('Auth middleware updated successfully to support both x-auth-token and Authorization Bearer token.');
} catch (error) {
  console.error('Error updating auth middleware:', error);
} 