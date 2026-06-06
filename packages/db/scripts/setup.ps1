# Local database setup: Docker postgres -> migrate -> supplementary -> seed
# For Neon production, use setup-neon.ps1 instead.
$ErrorActionPreference = "Stop"
$DbRoot = Split-Path -Parent $PSScriptRoot
$MonorepoRoot = Split-Path -Parent (Split-Path -Parent $DbRoot)
$DockerDir = Join-Path $MonorepoRoot "infrastructure\docker"

Write-Host "Starting PostgreSQL..."
docker compose -f (Join-Path $DockerDir "docker-compose.yml") --profile local up -d postgres

Write-Host "Waiting for PostgreSQL to be ready..."
$retries = 30
while ($retries -gt 0) {
    $health = docker inspect --format='{{.State.Health.Status}}' limbu-postgres 2>$null
    if ($health -eq "healthy") { break }
    Start-Sleep -Seconds 2
    $retries--
}
if ($retries -eq 0) {
    Write-Error "PostgreSQL did not become healthy in time. Is Docker Desktop running?"
}

Set-Location $DbRoot
Write-Host "Running migrations..."
npm run db:migrate:deploy
Write-Host "Applying supplementary SQL..."
npm run db:supplementary
Write-Host "Seeding database..."
npm run db:seed
Write-Host "Database setup complete."
