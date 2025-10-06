# Bem-vindo à documentação do Portal de Agendamento

Este site contém a documentação técnica e de usuário para o projeto **Portal de Agendamento**, um sistema web front-end desenvolvido para o gerenciamento de ambientes universitários como salas e laboratórios.

Aqui você encontrará informações sobre os requisitos, a arquitetura e o modo de uso da aplicação.

## Pré-requisitos

O projeto é uma aplicação front-end que utiliza apenas HTML, CSS e JavaScript, não exigindo um ambiente de back-end. A configuração mínima para visualização é um navegador de internet moderno.

| Configuração | Valor Mínimo |
| :--- | :--- |
| Sistema operacional | Windows, macOS ou Linux |
| Navegador | Google Chrome, Firefox, Safari ou Edge |
| Memória RAM | 2GB |
| Necessita rede? | Sim (para carregar fontes e bibliotecas externas) |

## Instalação

Como o projeto não possui dependências de pacotes, não há um processo de instalação complexo. Siga os passos abaixo.

**1. Clone o repositório**

```bash
git clone https://github.com/ericdalaporta/portal-de-agendamento.git
```

**2. Navegue até a pasta do projeto**

```bash
cd portal-de-agendamento
```

**3. Abra o projeto**

Não há mais nada para instalar. Simplesmente **abra o arquivo `index.html`** no seu navegador para começar a usar a aplicação.

## Instruções de Uso

Para testar a aplicação, siga os passos:

1.  **Acesse a tela de login** (que já estará aberta se você seguiu o passo 3 da instalação).

2.  **Simule o acesso** com um dos perfis disponíveis:
    * **Sou Servidor:** Representa o perfil de administrador. Ao clicar em "Entrar", você será levado ao painel principal (`principal.html`) com acesso a todas as funcionalidades de gerenciamento.
    * **Sou Aluno:** Representa o perfil de usuário final. Ao clicar em "Entrar", você será levado a uma página (`aluno.html`) que exibe os agendamentos realizados.

3.  **No painel do Servidor, você pode:**
    * Visualizar todos os ambientes cadastrados.
    * Utilizar os filtros para buscar salas por tipo ou data.
    * Clicar em **"Adicionar Sala"** para cadastrar um novo ambiente.
    * Clicar em **"Agendar"** em um dos cards para marcar um horário.

## Contato

O repositório foi originalmente desenvolvido por **Eric Dala Porta**.

* **Email:** `ericdasilvadalaporta@gmail.com`
