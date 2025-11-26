# Portal de Agendamento 

Sistema web front-end para agendamento e gerenciamento de ambientes universitários - salas e laboratórios.

![PrintSalasDisponiveisECadastro](/assets/Print.png)

## Antes de tudo

Para uma documentação completa e bem formatada, clique no link abaixo:

[**Documentação Completa do Projeto**](https://ericdalaporta.github.io/portal-de-agendamento/docs/)

## Sumário

- [Pré-requisitos](#pré-requisitos)  
- [Instalação](#instalação)  
- [Instruções de Uso](#instruções-de-uso)  
- [Fluxograma do Sistema](#fluxograma-do-sistema)  
- [Contato](#contato)  
- [Bibliografia](#bibliografia)  

## Pré-requisitos

O projeto é uma aplicação front-end que utiliza apenas HTML, CSS e JavaScript, não exigindo um ambiente de back-end. A configuração mínima para visualização é um navegador de internet moderno.

| Configuração       | Valor Mínimo                               |
|-------------------|--------------------------------------------|
| Sistema operacional | Windows, macOS ou Linux                    |
| Navegador          | Google Chrome, Firefox, Safari ou Edge     |
| Memória RAM        | 2GB                                        |
| Necessita rede?    | Sim (para carregar fontes e bibliotecas externas) |

## Instalação

1.  Como o projeto é estático, basta clonar o repositório para visualizá-lo em um navegador. Para executar ferramentas de desenvolvimento (como o ESLint), é necessário ter **Node.js 18+** instalado.

    Clone o repositório na sua máquina local:

    ```bash
    git clone https://github.com/ericdalaporta/portal-de-agendamento.git
    ```

2. **Navegue até a pasta do projeto:**
    ```bash
    cd portal-de-agendamento
    ```

3.  **Instale as dependências de desenvolvimento (opcional, apenas se for usar o ESLint):**

    ```bash
    npm install
    ```

4.  **Abra o projeto:**
    * Abra o arquivo `index.html` diretamente no seu navegador ou use a extensão **Live Server** no Visual Studio Code.
    * As dependências Node não são necessárias para visualizar o site; elas servem apenas para executar ferramentas de qualidade de código.

## Instruções de Uso

Para executar e testar a aplicação, siga os passos:

1.  Abra o arquivo `index.html` no seu navegador. A tela de login será exibida.

2.  Simule o acesso com um dos perfis disponíveis:
    * **Sou Servidor:** Representa o perfil de administrador. Ao clicar em "Entrar", você será levado ao painel principal (`principal.html`) com acesso a todas as funcionalidades de gerenciamento, assim como ver os próprios agendamentos.
    * **Sou Aluno:** Representa o perfil de usuário final. Ao clicar em "Entrar", você será levado a uma página (`aluno.html`) que exibe os agendamentos de ambientes universitários realizados por seus professores, assim como a disciplina, horário e nome do professor.

3.  **No painel do Servidor, você pode:**
    * Visualizar todos os ambientes cadastrados.
    * Utilizar os filtros para buscar salas por tipo ou data.
    * Clicar em **"Adicionar Sala"** para cadastrar um novo ambiente.
    * Clicar em **"Agendar"** em um dos cards para marcar um horário, definindo período, dias da semana e disciplina.

## Verificação com ESLint

Para garantir a padronização do código JavaScript, o projeto inclui uma configuração do **ESLint 9**.

1. Instale as dependências (caso ainda não tenha feito):

    ```bash
    npm install
    ```

2. Execute a análise estática:

    ```bash
    npm run lint
    ```

O comando avalia todos os arquivos em `js/` e ignora diretórios de build como `site/`. Ajuste os alertas gerados para manter o código limpo.

## Testes Automatizados (QUnit + NYC)

Foram adicionados testes unitários para as funções centrais de agendamento utilizando **QUnit** com cobertura gerada pelo **NYC**.

1. Instale as dependências (caso ainda não tenha feito):

    ```bash
    npm install
    ```

2. Rode toda a suíte de testes e gere o relatório de cobertura:

    ```bash
    npm test
    ```

O console exibirá os resultados TAP do QUnit e um resumo textual de cobertura. Um relatório HTML completo é salvo em `coverage/index.html` toda vez que o comando é executado.

## Fluxograma do Sistema

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

## Contato

O repositório foi originalmente desenvolvido por Eric Dala Porta, Email para contato: ericdasilvadalaporta@gmail.com

## Bibliografia
- [ESLint](https://eslint.org/)

A documentação das principais ferramentas e bibliotecas utilizadas no projeto pode ser encontrada nos links abaixo:

- [Documentação Bootstrap 5.3](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Documentação Bootstrap Icons](https://icons.getbootstrap.com/) 
- [Documentação Flatpickr (Calendário)](https://flatpickr.js.org/)
- [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter)
