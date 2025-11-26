# Arquitetura

## Casos de Uso

```mermaid
flowchart LR
    Servidor((Servidor))
    Aluno((Aluno))

    subgraph Portal_de_Agendamento [Portal de Agendamento]
        UCLoginServidor([Fazer Login - Servidor])
        UCFiltrar([Filtrar Salas])
        UCCriarSala([Criar Sala])
        UCExcluirSala([Excluir Sala])
        UCCriarAg([Criar Agendamento])
        UCEditarAg([Editar Agendamento])
        UCExcluirAg([Excluir Agendamento])

        UCLoginAluno([Fazer Login - Aluno])
        UCProximas([Visualizar Próximas Aulas])
        UCHoje([Visualizar Aulas de Hoje])
    end

    Servidor --> UCLoginServidor
    Servidor --> UCFiltrar
    Servidor --> UCCriarSala
    Servidor --> UCExcluirSala
    Servidor --> UCCriarAg
    Servidor --> UCEditarAg
    Servidor --> UCExcluirAg

    Aluno --> UCLoginAluno
    Aluno --> UCProximas
    Aluno --> UCHoje
```

## Diagrama de Classes

```mermaid
classDiagram
    direction TB

    class AgendaFuncoes {
        +converterHorarioEmMinutos(hhmm)
        +existeConflito(novoAgendamento, lista)
        +obterStatusSala(salaId, lista, instante?)
        +filtrarSalas(listaSalas, filtros)
    }

    class EstadoAplicacao {
        +Sala[] salasCadastradas
        +Agendamento[] agendamentosRegistrados
        +Flatpickr instanciaCalendario
        +mapaDiasSemana: Record<int,string>
        +coresPorTipo: Record<string,string>
    }

    class Renderizadores {
        +salas(salasFiltradas?)
        +agendamentos()
        +filtros()
    }

    class Manipuladores {
        +aplicarFiltros()
        +submeterNovaSala(event)
        +submeterAgendamento(event)
        +cliqueGradeSalas(event)
        +cliqueListaAgendamentos(event)
        +exibirModalAgendamento(event)
    }

    class inicializarInterface {
        +DOM refs (gradeSalas, listaAgendamentos, formulários…)
        +bootstrap.Modal modalAgendarInstancia
        +bootstrap.Modal modalNovaSalaInstancia
        +document.addEventListener('DOMContentLoaded', inicializarInterface)
    }

    class Sala {
        +number id
        +string codigo
        +string tipo
        +number capacidade
        +string localizacao
    }

    class Agendamento {
        +number id
        +number salaId
        +Periodo periodo
        +Horario horario
        +number[] diasSemana
        +string disciplina
        +string professor
        +string cpf
    }

    class Horario {
        +string inicio
        +string fim
    }

    class Periodo {
        +string inicio
        +string fim
    }

    class DadosAcademicosAluno {
        +Sala[] salas
        +Agendamento[] agendamentos
    }

    class FuncoesAlunoJS {
        +criarCartaoAgendamento(agendamento, exibirDiasSeparados?)
        +renderizarAulas()
    }

    class LoginJS {
        +processarLoginAluno()
        +processarLoginServidor()
    }

    EstadoAplicacao *-- Sala
    EstadoAplicacao *-- Agendamento
    Agendamento --> Periodo
    Agendamento --> Horario

    Renderizadores --> EstadoAplicacao : lê
    Manipuladores --> EstadoAplicacao : altera
    inicializarInterface --> Renderizadores
    inicializarInterface --> Manipuladores
    inicializarInterface --> AgendaFuncoes : usa

    FuncoesAlunoJS --> DadosAcademicosAluno
    FuncoesAlunoJS --> AgendaFuncoes : reaproveita
    LoginJS --> FuncoesAlunoJS : direciona para aluno.html
    LoginJS --> inicializarInterface : direciona para principal.html
```

## Estrutura dos Scripts

- `js/script.js` contém `AgendaFuncoes`, `estadoAplicacao`, `renderizadores`, `manipuladores` e o `inicializarInterface`, que integra Bootstrap e Flatpickr.
- `js/aluno.js` possui o módulo de dados acadêmicos e funções de renderização para o painel do aluno.
- `js/login.js` lida apenas com os formulários de autenticação simulada.