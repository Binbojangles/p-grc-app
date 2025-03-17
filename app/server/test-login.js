const http = require('http');

function testLogin() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: 'admin@example.com',
      password: 'Admin123!'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log('Raw response:', responseData);
          const parsedData = JSON.parse(responseData);
          console.log('Login successful!');
          console.log('Parsed data:', parsedData);
          
          if (parsedData.token) {
            resolve(parsedData.token);
          } else {
            console.error('No token in response');
            reject(new Error('No token in response'));
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Login failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function testGetControls(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/controls',
      method: 'GET',
      headers: {
        'x-auth-token': token
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log('Raw controls response:', responseData);
          const parsedData = JSON.parse(responseData);
          console.log('Controls retrieved successfully!');
          console.log('Parsed controls data:', parsedData);
          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Failed to get controls:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    const token = await testLogin();
    if (token) {
      await testGetControls(token);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests(); 