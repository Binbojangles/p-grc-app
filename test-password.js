const crypto = require('crypto');

// The salt and password hash from the database
const userSalt = 'af5ea52252ce31fadf826453058b4241';
const storedHash = '5f22404e830d22cb71a8f7f96bd47897c35370a5747e35d51fbc8b2eff7049f675e9bb344e16ff34a26ba56b07a89cae572c5c9eef5b5883db43f2e5dfa03917';

// Test different passwords
const passwords = [
  'Admin123!',
  'NewPassword123!',
  'admin',
  'password',
  'Password123'
];

console.log('Testing password validation:');
console.log('User salt:', userSalt);
console.log('Stored hash:', storedHash);
console.log('-----------------------------------');

passwords.forEach(password => {
  // Hash the password with the user's salt
  const hash = crypto
    .pbkdf2Sync(password, userSalt, 1000, 64, 'sha512')
    .toString('hex');
  
  // Compare the hashed password with the stored hash
  const isValid = hash === storedHash;
  
  console.log(`Password: ${password}`);
  console.log(`Generated hash: ${hash}`);
  console.log(`Is valid: ${isValid}`);
  console.log('-----------------------------------');
}); 