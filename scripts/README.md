# Scripts auxiliares

Os comandos `npm run` do frontend e do backend usam o Node do sistema (20+), via binarios em `node_modules`. Isso funciona em macOS, Linux e Windows.

## Windows (opcional)

Se voce mantiver um Node 20 empacotado em `.tools/node-v20.19.0-win-x64/`:

- `use-node20.ps1` — coloca esse Node no `PATH` da sessao atual do PowerShell
- `node20.cmd` — executa um comando com esse Node (ou cai no Node do sistema se for 20+)

Exemplo:

```powershell
.\scripts\use-node20.ps1
npm run install:all
```
