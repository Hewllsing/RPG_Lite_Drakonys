$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeDir = Join-Path $projectRoot ".tools\\node-v20.19.0-win-x64"
$nodeExe = Join-Path $nodeDir "node.exe"

if (-not (Test-Path $nodeExe)) {
    throw "Node 20 local nao encontrado em '$nodeDir'."
}

$env:Path = "$nodeDir;$env:Path"

Write-Host "Node local ativo: $(node --version)"
Write-Host "npm local ativo: $(npm --version)"
Write-Host "Sessao atual apontada para $nodeDir"
