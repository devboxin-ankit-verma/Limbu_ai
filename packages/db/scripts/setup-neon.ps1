# Production database setup against Neon PostgreSQL
$ErrorActionPreference = "Stop"
$DbRoot = Split-Path -Parent $PSScriptRoot

if (-not $env:DATABASE_URL -or -not $env:DIRECT_URL) {
    $EnvFile = Join-Path $DbRoot ".env"
    if (Test-Path $EnvFile) {
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"')
                if (-not (Get-Item "Env:$name" -ErrorAction SilentlyContinue)) {
                    Set-Item -Path "Env:$name" -Value $value
                }
            }
        }
    }
}

if (-not $env:DIRECT_URL) {
    Write-Error "DIRECT_URL is required for Neon migrations. Set it in packages/db/.env"
}

if ($env:DATABASE_URL -match "localhost") {
    Write-Warning "DATABASE_URL points to localhost. Did you mean to run setup-local.ps1?"
}

Set-Location $DbRoot
Write-Host "Enabling Neon extensions..."
npm run db:neon:extensions
Write-Host "Running migrations (via DIRECT_URL)..."
npm run db:migrate:deploy
Write-Host "Applying supplementary SQL..."
npm run db:supplementary
Write-Host "Seeding database..."
npm run db:seed
Write-Host "Neon database setup complete."
