const fs = require('fs');
const path = require('path');

// Path to the auth routes file
const authRoutesPath = path.join(__dirname, 'routes', 'auth.js');

try {
  // Read the current auth routes file
  let authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');
  
  // Find the password change code that's generating a new salt
  const passwordChangeCode = /\/\/ Update password directly instead of using setPassword\n\s+user\.salt = crypto\.randomBytes\(16\)\.toString\('hex'\);\n\s+user\.password = crypto\n\s+\.pbkdf2Sync\(newPassword, user\.salt, 1000, 64, 'sha512'\)\n\s+\.toString\('hex'\);/;
  
  // Replace with code that keeps the existing salt
  const fixedCode = `// Update password using existing salt
    user.password = crypto
      .pbkdf2Sync(newPassword, user.salt, 1000, 64, 'sha512')
      .toString('hex');`;
  
  // Make the replacement
  const updatedContent = authRoutesContent.replace(passwordChangeCode, fixedCode);
  
  // Write the updated content back to the file
  fs.writeFileSync(authRoutesPath, updatedContent);
  
  console.log('Password change endpoint fixed successfully!');
  console.log('The endpoint now reuses the existing salt instead of generating a new one.');
  
} catch (error) {
  console.error('Error fixing password change endpoint:', error);
} 