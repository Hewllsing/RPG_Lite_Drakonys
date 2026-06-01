$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeDir = Join-Path $projectRoot ".tools\\node-v20.19.0-win-x64"
$nodeExe = Join-Path $nodeDir "node.exe"

if (-not (Test-Path $nodeExe)) {
    $systemNode = Get-Command node -ErrorAction SilentlyContinue

    if (-not $systemNode) {
        throw "Node 20 local nao encontrado em '$nodeDir' e Node do sistema nao foi encontrado no PATH."
    }

    $majorVersion = [int](& node -p "process.versions.node.split('.')[0]")

    if ($majorVersion -lt 20) {
        throw "Node 20 local nao encontrado em '$nodeDir' e Node do sistema esta abaixo da versao 20."
    }

    Write-Host "Node local nao encontrado. Usando Node do sistema: $(node --version)"
    Write-Host "npm do sistema ativo: $(npm --version)"
    return
}

$env:Path = "$nodeDir;$env:Path"

Write-Host "Node local ativo: $(node --version)"
Write-Host "npm local ativo: $(npm --version)"
Write-Host "Sessao atual apontada para $nodeDir"
