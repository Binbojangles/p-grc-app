const fs = require('fs');
const https = require('http');

const token = fs.readFileSync('./token.txt', 'utf8').trim();

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:');
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

req.end(); 