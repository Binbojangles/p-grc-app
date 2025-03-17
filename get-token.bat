@echo off
curl -X POST -H "Content-Type: application/json" -d @login-payload.json http://localhost:3000/api/auth/login > token-response.json
echo Token saved to token-response.json 