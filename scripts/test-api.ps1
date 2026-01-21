# ShadcnForge API Test Script

Write-Host "🧪 Testing ShadcnForge API..." -ForegroundColor Cyan
Write-Host ""

# Test health endpoint
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test registry list
Write-Host "2. Testing registry list..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/registry" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Registry list failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test upload
Write-Host "3. Testing upload endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        name = "test-button"
        type = "registry:ui"
        files = @(
            @{
                path = "components/ui/button.tsx"
                content = "export default function Button() { return <button>Click me</button>; }"
            }
        )
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "http://localhost:3001/upload" -Method Post -Body $body -ContentType "application/json"
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Upload failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ API tests complete!" -ForegroundColor Green
