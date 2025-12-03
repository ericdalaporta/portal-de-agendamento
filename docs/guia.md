# Guia de Uso

## Pré-requisitos

| Item               | Versão mínima |
|--------------------|---------------|
| Navegador moderno  | Chrome, Firefox, Edge ou Safari |
| Node.js (opcional) | 18.x (necessário apenas para lint/testes) |

## Instalação

```bash
git clone https://github.com/ericdalaporta/portal-de-agendamento.git
cd portal-de-agendamento
npm install   # opcional, usado para ESLint e QUnit
```

## Execução

1. Abra `index.html` no navegador ou utilize a extensão **Live Server** do VS Code.
2. Na tela inicial escolha um perfil:
   - **Sou Servidor** → abre `principal.html` com painel de gestão.
   - **Sou Aluno** → abre `aluno.html` com a visão de aulas.
3. Principais ações do Servidor:
   - Filtrar salas por código, tipo ou capacidade.
   - Cadastrar/editar salas via modal "Nova Sala".
   - Criar, editar ou excluir agendamentos pelo modal "Agendar Sala".
4. Principais ações do Aluno:
   - Visualizar aulas do dia.
   - Conferir próximas aulas previstas.

## Recomendações

- Utilize o botão **+ Nova Sala** antes de agendar quando precisar de um ambiente novo.
- Sempre selecione pelo menos um dia da semana e um período válido no Flatpickr.
- No modo mobile, utilize o botão "Sair" no topo para retornar ao login.