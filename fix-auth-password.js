const fs = require('fs');
const path = require('path');

// Function to fix the User model
function fixUserModel() {
  console.log('Fixing User model...');
  const userModelPath = path.join(__dirname, 'models', 'user.js');
  
  try {
    let userModelContent = fs.readFileSync(userModelPath, 'utf8');
    
    // Remove the beforeUpdate hook that's generating a new salt
    const beforeUpdateRegex = /User\.beforeUpdate\(async \(user\) => \{[\s\S]*?if \(user\.changed\('password'\)\) \{[\s\S]*?\}\n  \}\);\n/m;
    
    // Create a new beforeUpdate that doesn't change the salt
    const newBeforeUpdate = `User.beforeUpdate(async (user) => {
    if (user.changed('password') && !user.changed('salt')) {
      // Only hash the password without changing the salt
      user.password = crypto
        .pbkdf2Sync(user.password, user.salt, 1000, 64, 'sha512')
        .toString('hex');
    }
  });

`;
    
    // Replace the beforeUpdate hook
    const updatedUserModel = userModelContent.replace(beforeUpdateRegex, newBeforeUpdate);
    
    // Write the updated content back to the file
    fs.writeFileSync(userModelPath, updatedUserModel);
    
    console.log('User model updated successfully!');
  } catch (error) {
    console.error('Error updating User model:', error);
  }
}

// Function to fix the auth route
function fixAuthRoute() {
  console.log('Fixing auth route...');
  const authRoutesPath = path.join(__dirname, 'routes', 'auth.js');
  
  try {
    let authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');
    
    // Find the password change code that's generating a new salt
    const passwordChangeCode = /\/\/ Update password directly instead of using setPassword\n\s+user\.salt = crypto\.randomBytes\(16\)\.toString\('hex'\);\n\s+user\.password = crypto\n\s+\.pbkdf2Sync\(newPassword, user\.salt, 1000, 64, 'sha512'\)\n\s+\.toString\('hex'\);/;
    
    // Replace with code that keeps the existing salt
    const fixedCode = `// Update password using existing salt
    user.password = crypto
      .pbkdf2Sync(newPassword, user.salt, 1000, 64, 'sha512')
      .toString('hex');`;
    
    // Make the replacement
    const updatedAuthRoute = authRoutesContent.replace(passwordChangeCode, fixedCode);
    
    // Write the updated content back to the file
    fs.writeFileSync(authRoutesPath, updatedAuthRoute);
    
    console.log('Auth route updated successfully!');
  } catch (error) {
    console.error('Error updating auth route:', error);
  }
}

// Run both fixes
fixUserModel();
fixAuthRoute();

console.log('Password handling fixed. The system will now preserve the salt when updating passwords.'); 