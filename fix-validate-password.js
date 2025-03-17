const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to the User model file
const userModelPath = path.join(__dirname, 'models', 'user.js');

// Read the current User model file
try {
  let userModelContent = fs.readFileSync(userModelPath, 'utf8');
  
  // Create a test password and hash to verify the validatePassword method
  const testPassword = 'Admin123!';
  const testSalt = '0f9e2e272552ab5bcb1320f6042ff389';
  const testHash = crypto
    .pbkdf2Sync(testPassword, testSalt, 1000, 64, 'sha512')
    .toString('hex');
  
  console.log('Test password:', testPassword);
  console.log('Test salt:', testSalt);
  console.log('Test hash:', testHash);
  
  // Replace the validatePassword method with a fixed version
  const oldValidatePasswordMethod = /User\.prototype\.validatePassword = function\(password\) \{[\s\S]*?\};/;
  const newValidatePasswordMethod = `User.prototype.validatePassword = function(password) {
    // For debugging
    console.log('Validating password...');
    console.log('Input password:', password);
    console.log('User salt:', this.salt);

    // Hash the input password with the user's salt
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
      .toString('hex');
    
    console.log('Generated hash:', hash);
    console.log('Stored hash:', this.password);
    
    // Compare the hashed input password with the stored password
    return this.password === hash;
  };`;
  
  // Replace the method in the file content
  const updatedContent = userModelContent.replace(oldValidatePasswordMethod, newValidatePasswordMethod);
  
  // Write the updated content back to the file
  fs.writeFileSync(userModelPath, updatedContent);
  
  console.log('User model updated successfully!');
  console.log('The validatePassword method now includes additional logging for debugging.');
  
} catch (error) {
  console.error('Error updating User model:', error);
} 