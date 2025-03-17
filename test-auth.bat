@echo off
set /p TOKEN=<token.txt
curl -H "Authorization: Bearer %TOKEN%" http://localhost:3000/api/auth/me 