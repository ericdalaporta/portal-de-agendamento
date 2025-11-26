# Testes e Qualidade

## ESLint 9 (flat config)

```bash
npm install   # apenas na primeira vez
npm run lint
```

- Analisa todos os arquivos em `js/`.
- Permite `console.log` e ignora `node_modules`, `site` e `assets`.
- Reporta problemas diretamente no terminal.

## Testes Unitários com QUnit + NYC

```bash
npm install   # se ainda não fez
npm test
```

- Executa `test/script.test.js`, cobrindo as funções de `AgendaFuncoes`.
- Gera saída TAP no terminal e relatório de cobertura textual.
- Salva um relatório HTML em `coverage/index.html` (pode ser removido a qualquer momento; é regenerado em cada execução).

### Funções testadas

1. `converterHorarioEmMinutos` – valida formato HH:MM.
2. `existeConflito` – detecta colisões de sala/período/horário/dia.
3. `obterStatusSala` – determina se uma sala está ocupada em um instante.
4. `filtrarSalas` – aplica filtros combinados de busca, tipo e capacidade.