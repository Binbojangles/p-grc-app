const jwt = require('jsonwebtoken');
const { authMiddleware } = require('./middleware/auth');

// Create a mock request with the Authorization header
const mockRequest = {
  header: (name) => {
    if (name === 'Authorization') {
      return 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdhM2JjNjdlLTllNWItNDhlYy04MjM4LWZiNmFjZDcwODQ2MyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MjE3MzIwOCwiZXhwIjoxNzQyMTc2ODA4fQ.uRpM62uGP9RtroCATJfgQVxxHoXBhQWWRSA2hj7ZVBc';
    }
    return null;
  }
};

// Create a mock response
const mockResponse = {
  status: (code) => {
    console.log('Response status:', code);
    return {
      json: (data) => {
        console.log('Response data:', data);
      }
    };
  }
};

// Create a mock next function
const mockNext = () => {
  console.log('Next function called');
  console.log('User in request:', mockRequest.user);
};

// Test the auth middleware
console.log('Testing auth middleware...');
authMiddleware(mockRequest, mockResponse, mockNext); 