# API CONTRACTS

Padrão de resposta:

Sucesso:
{
  "success": true,
  "data": {}
}

Erro:
{
  "success": false,
  "message": "Descrição"
}

Todos endpoints devem:
- Validar entrada
- Retornar JSON consistente
- Utilizar status HTTP corretos
