const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to the user model file
const userModelPath = '/app/models/user.js';

// Read the current file
const userModelContent = fs.readFileSync(userModelPath, 'utf8');

// Replace the beforeUpdate hook with a fixed version
const fixedContent = userModelContent.replace(
  // Find the beforeUpdate hook
  /User\.beforeUpdate\(async \(user\) => \{[\s\S]*?\}\);/,
  // Replace with fixed version
  `User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      // Check if the password is already hashed (64 bytes hex = 128 chars)
      if (user.password.length !== 128) {
        console.log('Hashing password in beforeUpdate hook');
        // Only hash the password without changing the salt
        user.password = crypto
          .pbkdf2Sync(user.password, user.salt, 1000, 64, 'sha512')
          .toString('hex');
      } else {
        console.log('Password already hashed, skipping hash in beforeUpdate');
      }
    }
  });`
);

// Write the fixed content back to the file
fs.writeFileSync(userModelPath, fixedContent);

console.log('User model updated successfully'); 