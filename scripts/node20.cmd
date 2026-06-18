@echo off
setlocal EnableDelayedExpansion

set "NODE_EXE=%~dp0..\.tools\node-v20.19.0-win-x64\node.exe"

if not exist "%NODE_EXE%" (
    for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node.split('.')[0]" 2^>nul') do set "NODE_MAJOR=%%v"

    if not defined NODE_MAJOR (
        echo Node 20 local nao encontrado em "%NODE_EXE%".
        echo Node do sistema tambem nao foi encontrado no PATH.
        echo Instale Node.js 20+ ou baixe a runtime local em .tools.
        exit /b 1
    )

    if !NODE_MAJOR! LSS 20 (
        echo Node 20 local nao encontrado em "%NODE_EXE%".
        echo Node do sistema esta abaixo da versao 20.
        echo Instale Node.js 20+ ou baixe a runtime local em .tools.
        exit /b 1
    )

    node %*
    exit /b %ERRORLEVEL%
)

"%NODE_EXE%" %*
