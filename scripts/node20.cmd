@echo off
setlocal

set "NODE_EXE=%~dp0..\.tools\node-v20.19.0-win-x64\node.exe"

if not exist "%NODE_EXE%" (
    echo Node 20 local nao encontrado em "%NODE_EXE%".
    echo Execute o setup do projeto para baixar a runtime local.
    exit /b 1
)

"%NODE_EXE%" %*
