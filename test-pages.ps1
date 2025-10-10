# Script de test des pages du dashboard
$baseUrl = "http://localhost:3000"

$pages = @(
    "/",
    "/dashboard",
    "/dashboard/mini-jeu",
    "/dashboard/classement",
    "/dashboard/events",
    "/dashboard/admin",
    "/dashboard/boutique",
    "/dashboard/profil"
)

Write-Host "🚀 Test des pages du NyxBot Dashboard..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow

foreach ($page in $pages) {
    try {
        Write-Host "`n📄 Test de $page..." -ForegroundColor Green
        $response = Invoke-WebRequest -Uri "$baseUrl$page" -TimeoutSec 10 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $page - OK (200)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $page - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $page - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Test terminé!" -ForegroundColor Cyan