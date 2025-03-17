$response = Get-Content -Raw -Path .\token-response.json | ConvertFrom-Json
$token = $response.data.token
$token | Out-File -FilePath .\token.txt
Write-Host "Token extracted and saved to token.txt"
Write-Host "Now testing API with token..."
curl -H "Authorization: Bearer $token" http://localhost:3000/api/auth/me 