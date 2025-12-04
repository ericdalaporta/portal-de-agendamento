// aqui tem a lógica da tela do SERVIDOR (lista de salas + agendamentos)

(function () {
    'use strict';

    const estadoAplicacao = {
        // Horários de funcionamento das salas (configuração global)
        horarioFuncionamento: {
            inicio: '07:00',
            fim: '22:00',
            duracaoSlotMinutos: 60 // slots de 1 hora
        },
        salasCadastradas: [
            { id: 1, codigo: 'C10', tipo: 'Lab. Informática', capacidade: 32, localizacao: 'Bloco C' },
            { id: 2, codigo: 'A205', tipo: 'Sala de Aula', capacidade: 45, localizacao: 'Bloco A' },
            { id: 3, codigo: 'F15', tipo: 'Lab. Física', capacidade: 20, localizacao: 'Bloco F' },
            { id: 4, codigo: 'AUDIT01', tipo: 'Auditório', capacidade: 120, localizacao: 'Bloco Central' }
        ],
        agendamentosRegistrados: [
            { id: 101, salaId: 1, periodo: { inicio: '2025-12-01', fim: '2025-12-20' }, horario: { inicio: '08:00', fim: '10:00' }, diasSemana: [1, 3, 5], disciplina: 'Programação Web', professor: 'Prof. Silva', cpf: '111.111.111-11' },
            { id: 102, salaId: 2, periodo: { inicio: '2025-12-01', fim: '2025-12-15' }, horario: { inicio: '14:00', fim: '16:00' }, diasSemana: [2, 4], disciplina: 'Cálculo I', professor: 'Prof. Santos', cpf: '222.222.222-22' }
        ],
        instanciaCalendario: null,
        mapaDiasSemana: { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sab' },
        coresPorTipo: { 'Lab. Informática': 'lab-info', 'Sala de Aula': 'sala-aula', 'Lab. Física': 'lab-fisica', 'Auditório': 'auditorio' }
    };

    // elementos usados pelo js (serão preenchidos na inicialização)
    const elementosTela = {
        gradeSalas: null,
        listaAgendamentos: null,
        campoBusca: null,
        seletorTipo: null,
        seletorCapacidade: null,
        contadorAgendamentos: null,
        modalAgendarElemento: null,
        modalAgendarInstancia: null,
        modalNovaSalaInstancia: null,
        formularioAgendamento: null,
        formularioNovaSala: null,
        campoCpfAgendamento: null
    };

    // formatadores e validadores
    const utilitarios = {
        formatarDataBR: (dataIso) => dataIso ? dataIso.split('-').reverse().join('/') : '',
        formatarDataISO: (data) => data ? data.toISOString().split('T')[0] : null,
        existeConflito: (novoAgendamento) => AgendaFuncoes.existeConflito(novoAgendamento, estadoAplicacao.agendamentosRegistrados),
        obterStatusSala: (salaId) => AgendaFuncoes.obterStatusSala(salaId, estadoAplicacao.agendamentosRegistrados, estadoAplicacao.horarioFuncionamento),

        aplicarMascaraCpf: (valorBruto) => {
            const numeros = (valorBruto || '').replace(/\D/g, '').slice(0, 11);
            let formatado = '';
            for (let i = 0; i < numeros.length; i++) {
                if (i === 3 || i === 6) formatado += '.';
                if (i === 9) formatado += '-';
                formatado += numeros[i];
            }
            return formatado;
        },

        validarCpf: (cpfBruto) => {
            if (!cpfBruto) return false;
            const cpf = cpfBruto.replace(/\D/g, '');
            return cpf.length === 11;
        },

        validarHorario: (valor) => {
            return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor || '');
        }
    };

    // "desenhar" salas e agendamentos na tela
    const renderizadores = {
        salas: (salasFiltradas = estadoAplicacao.salasCadastradas) => {
            elementosTela.gradeSalas.innerHTML = salasFiltradas.length === 0
                ? '<div class="col-12"><p class="text-center text-muted mt-4">Nenhuma sala encontrada.</p></div>'
                : salasFiltradas.map(sala => {
                    const statusInfo = utilitarios.obterStatusSala(sala.id);
                    const corTipo = estadoAplicacao.coresPorTipo[sala.tipo] || 'dark';
                    const statusHtml = statusInfo.status === 'Disponível'
                        ? '<p><i class="bi bi-check-circle-fill text-success"></i> <span class="status-disponivel">Disponível</span></p>'
                        : '<p><i class="bi bi-x-circle-fill text-danger"></i> <span class="status-ocupada">Ocupada</span></p>';
                    return `
                        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 d-flex">
                            <div class="card cartao-sala w-100">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0 fw-bold">${sala.codigo}</h5>
                                    <div class="acoes-cartao-sala">
                                        <span class="badge bg-${corTipo}">${sala.tipo}</span>
                                        <button class="btn btn-sm btn-outline-primary btn-editar-sala" data-sala-id="${sala.id}" data-bs-toggle="modal" data-bs-target="#modalNovaSala" title="Editar Sala"><i class="bi bi-pencil"></i></button>
                                        <button class="btn btn-sm btn-outline-danger btn-excluir-sala" data-sala-id="${sala.id}" title="Excluir Sala"><i class="bi bi-trash"></i></button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <p><i class="bi bi-people"></i> ${sala.capacidade} pessoas</p>
                                    <p><i class="bi bi-geo-alt"></i> ${sala.localizacao}</p>
                                    ${statusHtml}
                                </div>
                                <div class="card-footer d-grid">
                                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAgendarSala" data-sala-id="${sala.id}" data-sala-codigo="${sala.codigo}">Agendar Sala</button>
                                </div>
                            </div>
                        </div>`;
                }).join('');
        },
        agendamentos: () => {
            const agendamentosOrdenados = [...estadoAplicacao.agendamentosRegistrados]
                .sort((a, b) => new Date(a.periodo.inicio) - new Date(b.periodo.inicio));

            elementosTela.listaAgendamentos.innerHTML = agendamentosOrdenados.length === 0
                ? '<p class="text-center text-muted mt-4">Nenhum agendamento encontrado.</p>'
                : agendamentosOrdenados.map(agendamento => {
                    const salaRelacionada = estadoAplicacao.salasCadastradas.find(sala => sala.id === agendamento.salaId);
                    if (!salaRelacionada) return '';

                    const diasHtml = agendamento.diasSemana
                        .map(dia => `<span class="dias-semana-badge">${estadoAplicacao.mapaDiasSemana[dia]}</span>`)
                        .join('');

                    const periodoFmt = agendamento.periodo.inicio === agendamento.periodo.fim
                        ? utilitarios.formatarDataBR(agendamento.periodo.inicio)
                        : `${utilitarios.formatarDataBR(agendamento.periodo.inicio)} até ${utilitarios.formatarDataBR(agendamento.periodo.fim)}`;

                    return `
                        <div class="cartao-agendamento">
                            <div class="cabecalho-agendamento">
                                <h5><i class="bi bi-building"></i> Sala ${salaRelacionada.codigo}</h5>
                                <div class="acoes-agendamento">
                                    <button class="btn btn-sm btn-outline-primary btn-edit" data-bs-toggle="modal" data-bs-target="#modalAgendarSala" data-agendamento-id="${agendamento.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger btn-delete" data-agendamento-id="${agendamento.id}" title="Excluir"><i class="bi bi-trash"></i></button>
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Período:</strong> ${periodoFmt}</p>
                                    <p class="mb-2"><strong>Horário:</strong> ${agendamento.horario.inicio} - ${agendamento.horario.fim}</p>
                                    <div class="mt-3 dias-computador">${diasHtml}</div>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Disciplina:</strong> ${agendamento.disciplina}</p>
                                    <p class="mb-1"><strong>Professor:</strong> ${agendamento.professor}</p>
                                </div>
                            </div>
                            <div class="dias-celular">${diasHtml}</div>
                        </div>`;
                }).join('');

            elementosTela.contadorAgendamentos.textContent = estadoAplicacao.agendamentosRegistrados.length;
        },
        filtros: () => {
            const tiposUnicos = [...new Set(estadoAplicacao.salasCadastradas.map(sala => sala.tipo))];
            elementosTela.seletorTipo.innerHTML = '<option value="">Todos os Tipos</option>' +
                tiposUnicos.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('');
        }
    };

    // clicks e submits do usuário
    const manipuladores = {
        aplicarFiltros: () => {
            const termoBusca = elementosTela.campoBusca.value.toLowerCase();
            const tipoSelecionado = elementosTela.seletorTipo.value;
            const faixaCapacidade = elementosTela.seletorCapacidade.value;
            const salasFiltradas = AgendaFuncoes.filtrarSalas(estadoAplicacao.salasCadastradas, {
                termoBusca,
                tipoSelecionado,
                faixaCapacidade
            });
            renderizadores.salas(salasFiltradas);
        },
        submeterNovaSala: (evento) => {
            evento.preventDefault();
            const idEdicao = parseInt(document.getElementById('salaEditId').value, 10) || 0;
            const dadosSala = {
                id: idEdicao || Date.now(),
                codigo: document.getElementById('salaNome').value.trim(),
                capacidade: parseInt(document.getElementById('salaCapacidade').value, 10),
                tipo: document.getElementById('salaTipo').value,
                localizacao: document.getElementById('salaBloco').value.trim(),
            };

            if (idEdicao) {
                // Editar sala existente
                const indiceSala = estadoAplicacao.salasCadastradas.findIndex(sala => sala.id === idEdicao);
                if (indiceSala !== -1) {
                    estadoAplicacao.salasCadastradas[indiceSala] = dadosSala;
                }
            } else {
                // Adicionar nova sala
                estadoAplicacao.salasCadastradas.push(dadosSala);
            }

            manipuladores.aplicarFiltros();
            renderizadores.filtros();
            renderizadores.agendamentos();
            evento.target.reset();
            document.getElementById('salaEditId').value = '';
            elementosTela.modalNovaSalaInstancia.hide();
        },
        exibirModalNovaSala: (evento) => {
            const botaoAcionado = evento.relatedTarget;
            const salaId = botaoAcionado?.dataset?.salaId ? parseInt(botaoAcionado.dataset.salaId, 10) : null;
            
            const tituloModal = document.getElementById('modalNovaSalaLabel');
            const btnSubmit = document.getElementById('btnSubmitSala');
            
            if (salaId) {
                // Modo edição
                const sala = estadoAplicacao.salasCadastradas.find(s => s.id === salaId);
                if (sala) {
                    tituloModal.textContent = 'Editar Sala';
                    btnSubmit.textContent = 'Salvar Alterações';
                    document.getElementById('salaEditId').value = sala.id;
                    document.getElementById('salaNome').value = sala.codigo;
                    document.getElementById('salaCapacidade').value = sala.capacidade;
                    document.getElementById('salaTipo').value = sala.tipo;
                    document.getElementById('salaBloco').value = sala.localizacao;
                }
            } else {
                // Modo criação
                tituloModal.textContent = 'Adicionar Nova Sala';
                btnSubmit.textContent = 'Adicionar Sala';
                document.getElementById('salaEditId').value = '';
                elementosTela.formularioNovaSala.reset();
            }
        },
        submeterAgendamento: (evento) => {
            evento.preventDefault();
            if (!estadoAplicacao.instanciaCalendario || estadoAplicacao.instanciaCalendario.selectedDates.length < 1) {
                return alert('Selecione um período válido.');
            }
            const [dataInicio, dataFim] = estadoAplicacao.instanciaCalendario.selectedDates;

            const diasSemanaSelecionados = Array.from(
                estadoAplicacao.instanciaCalendario.calendarContainer.querySelectorAll('.day-of-week-button.active')
            ).map(botao => parseInt(botao.dataset.day, 10));
            if (diasSemanaSelecionados.length === 0) {
                return alert('Selecione pelo menos um dia da semana.');
            }

            const horaInicio = document.getElementById('agendamentoHoraInicio').value;
            const horaFim = document.getElementById('agendamentoHoraFim').value;

            if (!utilitarios.validarHorario(horaInicio) || !utilitarios.validarHorario(horaFim)) {
                return alert('Informe horários válidos no formato HH:MM (ex: 08:30).');
            }
            if (horaInicio >= horaFim) {
                return alert('Horário de início deve ser anterior ao de fim.');
            }

            const campoCpf = document.getElementById('agendamentoCpf');
            const cpf = campoCpf.value.trim();
            if (!utilitarios.validarCpf(cpf)) {
                campoCpf.classList.add('is-invalid');
                return alert('CPF inválido. Verifique o número digitado.');
            }
            campoCpf.classList.remove('is-invalid');

            const idEdicao = parseInt(document.getElementById('agendamentoEditId').value, 10) || 0;
            const dadosAgendamento = {
                id: idEdicao || Date.now(),
                salaId: parseInt(document.getElementById('agendamentoSalaId').value, 10),
                periodo: {
                    inicio: utilitarios.formatarDataISO(dataInicio),
                    fim: utilitarios.formatarDataISO(dataFim || dataInicio)
                },
                horario: { inicio: horaInicio, fim: horaFim },
                diasSemana: diasSemanaSelecionados,
                disciplina: document.getElementById('agendamentoDisciplina').value.trim(),
                professor: document.getElementById('agendamentoProfessor').value.trim(),
                cpf
            };

            if (utilitarios.existeConflito(dadosAgendamento)) {
                return alert('Conflito de horário! Já existe um agendamento para esta sala no período, dia e horário selecionados.');
            }

            if (idEdicao) {
                const indiceAgendamento = estadoAplicacao.agendamentosRegistrados.findIndex(agendamento => agendamento.id === idEdicao);
                if (indiceAgendamento !== -1) {
                    estadoAplicacao.agendamentosRegistrados[indiceAgendamento] = dadosAgendamento;
                }
            } else {
                estadoAplicacao.agendamentosRegistrados.push(dadosAgendamento);
            }

            renderizadores.salas();
            renderizadores.agendamentos();
            elementosTela.modalAgendarInstancia.hide();
        },
        cliqueGradeSalas: (evento) => {
            const botaoExcluir = evento.target.closest('.btn-excluir-sala');
            if (!botaoExcluir) return;

            const salaId = parseInt(botaoExcluir.dataset.salaId, 10);
            if (confirm('Tem certeza que deseja excluir esta sala? Todos os agendamentos associados serão removidos.')) {
                estadoAplicacao.salasCadastradas = estadoAplicacao.salasCadastradas.filter(sala => sala.id !== salaId);
                estadoAplicacao.agendamentosRegistrados = estadoAplicacao.agendamentosRegistrados.filter(agendamento => agendamento.salaId !== salaId);
                manipuladores.aplicarFiltros();
                renderizadores.agendamentos();
                renderizadores.filtros();
            }
        },
        cliqueListaAgendamentos: (evento) => {
            const botaoExcluir = evento.target.closest('.btn-delete');
            if (!botaoExcluir) return;

            const agendamentoId = parseInt(botaoExcluir.dataset.agendamentoId, 10);
            if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                estadoAplicacao.agendamentosRegistrados = estadoAplicacao.agendamentosRegistrados.filter(agendamento => agendamento.id === agendamentoId ? false : true);
                renderizadores.agendamentos();
                renderizadores.salas();
            }
        },
        exibirModalAgendamento: (evento) => {
            elementosTela.formularioAgendamento.reset();
            if (estadoAplicacao.instanciaCalendario) {
                estadoAplicacao.instanciaCalendario.destroy();
            }

            const botaoAcionado = evento.relatedTarget;
            const agendamentoId = botaoAcionado.dataset.agendamentoId ? parseInt(botaoAcionado.dataset.agendamentoId, 10) : null;

            let salaSelecionada;
            let agendamentoParaEditar;
            let datasPadrao = [];
            let diasSemanaAtivos = [];

            if (agendamentoId) {
                agendamentoParaEditar = estadoAplicacao.agendamentosRegistrados.find(ag => ag.id === agendamentoId);
                if (!agendamentoParaEditar) {
                    return;
                }
                salaSelecionada = estadoAplicacao.salasCadastradas.find(sala => sala.id === agendamentoParaEditar.salaId);
                document.getElementById('modalAgendarSalaLabel').textContent = `Editar Agendamento da Sala ${salaSelecionada.codigo}`;
                document.getElementById('modalAgendarSubtitulo').textContent = 'Altere os dados do agendamento.';
                Object.entries({
                    agendamentoEditId: agendamentoParaEditar.id,
                    agendamentoSalaId: agendamentoParaEditar.salaId,
                    agendamentoHoraInicio: agendamentoParaEditar.horario.inicio,
                    agendamentoHoraFim: agendamentoParaEditar.horario.fim,
                    agendamentoDisciplina: agendamentoParaEditar.disciplina,
                    agendamentoProfessor: agendamentoParaEditar.professor,
                    agendamentoCpf: agendamentoParaEditar.cpf
                }).forEach(([identificador, valorCampo]) => {
                    document.getElementById(identificador).value = valorCampo;
                });
                datasPadrao = [agendamentoParaEditar.periodo.inicio, agendamentoParaEditar.periodo.fim];
                diasSemanaAtivos = agendamentoParaEditar.diasSemana;
            } else {
                salaSelecionada = estadoAplicacao.salasCadastradas.find(sala => sala.id == botaoAcionado.dataset.salaId);
                document.getElementById('modalAgendarSalaLabel').textContent = `Agendar Sala ${salaSelecionada.codigo}`;
                document.getElementById('modalAgendarSubtitulo').textContent = `${salaSelecionada.capacidade} pessoas • ${salaSelecionada.localizacao}`;
                document.getElementById('agendamentoSalaId').value = salaSelecionada.id;
            }

            estadoAplicacao.instanciaCalendario = flatpickr('#agendamentoPeriodo', {
                mode: 'range',
                locale: 'pt',
                dateFormat: 'd/m/Y',
                defaultDate: datasPadrao,
                onReady: (_, __, instanciaCalendario) => {
                    const containerCalendario = instanciaCalendario.calendarContainer;
                    const containerDiasSemana = document.createElement('div');
                    containerDiasSemana.className = 'flatpickr-weekdays-container p-2 border-top';
                    Object.entries(estadoAplicacao.mapaDiasSemana).forEach(([valorDia, nomeDia]) => {
                        const botaoDia = document.createElement('span');
                        botaoDia.className = `btn btn-sm btn-outline-secondary day-of-week-button ${diasSemanaAtivos.includes(parseInt(valorDia, 10)) ? 'active' : ''}`;
                        botaoDia.textContent = nomeDia;
                        botaoDia.dataset.day = valorDia;
                        botaoDia.addEventListener('click', (eventoClique) => eventoClique.currentTarget.classList.toggle('active'));
                        containerDiasSemana.appendChild(botaoDia);
                    });
                    containerCalendario.appendChild(containerDiasSemana);
                }
            });
        }
    };

    // iniciar a tela do servidor
    function inicializarInterface() {
        // Capturar elementos do DOM
        elementosTela.gradeSalas = document.getElementById('salas-grid');
        elementosTela.listaAgendamentos = document.getElementById('agendamentos-list');
        elementosTela.campoBusca = document.getElementById('searchInput');
        elementosTela.seletorTipo = document.getElementById('tipoSelect');
        elementosTela.seletorCapacidade = document.getElementById('capacidadeSelect');
        elementosTela.contadorAgendamentos = document.getElementById('agendamentos-count');
        elementosTela.modalAgendarElemento = document.getElementById('modalAgendarSala');
        elementosTela.formularioAgendamento = document.getElementById('formAgendarSala');
        elementosTela.formularioNovaSala = document.getElementById('formNovaSala');
        elementosTela.campoCpfAgendamento = document.getElementById('agendamentoCpf');

        if (!elementosTela.gradeSalas) {
            return;
        }

        elementosTela.modalAgendarInstancia = new bootstrap.Modal(elementosTela.modalAgendarElemento);
        elementosTela.modalNovaSalaInstancia = new bootstrap.Modal(document.getElementById('modalNovaSala'));

        ['input', 'change'].forEach(evento => {
            elementosTela.campoBusca.addEventListener(evento, manipuladores.aplicarFiltros);
            elementosTela.seletorTipo.addEventListener(evento, manipuladores.aplicarFiltros);
            elementosTela.seletorCapacidade.addEventListener(evento, manipuladores.aplicarFiltros);
        });

        elementosTela.formularioNovaSala.addEventListener('submit', manipuladores.submeterNovaSala);
        elementosTela.formularioAgendamento.addEventListener('submit', manipuladores.submeterAgendamento);
        elementosTela.gradeSalas.addEventListener('click', manipuladores.cliqueGradeSalas);
        elementosTela.listaAgendamentos.addEventListener('click', manipuladores.cliqueListaAgendamentos);
        elementosTela.modalAgendarElemento.addEventListener('show.bs.modal', manipuladores.exibirModalAgendamento);
        document.getElementById('modalNovaSala').addEventListener('show.bs.modal', manipuladores.exibirModalNovaSala);

        // máscara e feedback visual do CPF enquanto o usuário digita
        if (elementosTela.campoCpfAgendamento) {
            elementosTela.campoCpfAgendamento.addEventListener('input', (evento) => {
                const campo = evento.target;
                const valorMascarado = utilitarios.aplicarMascaraCpf(campo.value);
                campo.value = valorMascarado;
                const somenteNumeros = campo.value.replace(/\D/g, '');

                if (somenteNumeros.length === 0) {
                    campo.classList.remove('is-invalid');
                    return;
                }

                if (somenteNumeros.length !== 11) {
                    campo.classList.add('is-invalid');
                    return;
                }

                const ehValido = utilitarios.validarCpf(campo.value);
                campo.classList.toggle('is-invalid', !ehValido);
            });
        }

        // flatpickr apenas para horário (sem digitação manual)
        const campoHoraInicio = document.getElementById('agendamentoHoraInicio');
        const campoHoraFim = document.getElementById('agendamentoHoraFim');
        if (campoHoraInicio && campoHoraFim && typeof flatpickr !== 'undefined') {
            flatpickr(campoHoraInicio, {
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                time_24hr: true,
                allowInput: false
            });

            flatpickr(campoHoraFim, {
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                time_24hr: true,
                allowInput: false
            });
        }

        renderizadores.filtros();
        renderizadores.salas();
        renderizadores.agendamentos();
    }

    document.addEventListener('DOMContentLoaded', inicializarInterface);

})();

