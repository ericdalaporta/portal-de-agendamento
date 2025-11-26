const AgendaFuncoes = (() => {
    function converterHorarioEmMinutos(horario) {
        if (!horario || typeof horario !== 'string' || !horario.includes(':')) {
            throw new Error('Horário inválido');
        }
        const [hora, minuto] = horario.split(':').map(Number);
        if (Number.isNaN(hora) || Number.isNaN(minuto)) {
            throw new Error('Horário inválido');
        }
        return hora * 60 + minuto;
    }

    function periodosConflitantes(novo, existente) {
        const novoInicio = new Date(novo.periodo.inicio);
        const novoFim = new Date(novo.periodo.fim);
        const inicioExistente = new Date(existente.periodo.inicio);
        const fimExistente = new Date(existente.periodo.fim);
        return !(novoInicio > fimExistente || novoFim < inicioExistente);
    }

    function horariosConflitantes(novo, existente) {
        const novoInicioMin = converterHorarioEmMinutos(novo.horario.inicio);
        const novoFimMin = converterHorarioEmMinutos(novo.horario.fim);
        const inicioExistenteMin = converterHorarioEmMinutos(existente.horario.inicio);
        const fimExistenteMin = converterHorarioEmMinutos(existente.horario.fim);
        return !(novoInicioMin >= fimExistenteMin || novoFimMin <= inicioExistenteMin);
    }

    function diasConflitantes(novo, existente) {
        return novo.diasSemana.some(dia => existente.diasSemana.includes(dia));
    }

    function existeConflito(novoAgendamento, agendamentos) {
        if (!novoAgendamento || !Array.isArray(agendamentos)) {
            throw new Error('Parâmetros inválidos para verificação de conflito');
        }
        return agendamentos.some(registro => {
            if (novoAgendamento.id && novoAgendamento.id === registro.id) {
                return false;
            }
            if (novoAgendamento.salaId !== registro.salaId) {
                return false;
            }
            if (!periodosConflitantes(novoAgendamento, registro)) {
                return false;
            }
            if (!horariosConflitantes(novoAgendamento, registro)) {
                return false;
            }
            return diasConflitantes(novoAgendamento, registro);
        });
    }

    function obterStatusSala(salaId, agendamentos, instanteAtual = new Date()) {
        if (!salaId) {
            throw new Error('Sala inválida');
        }
        if (!Array.isArray(agendamentos)) {
            throw new Error('Lista de agendamentos inválida');
        }
        const ocupadaAgora = agendamentos.some(agendamento => {
            if (agendamento.salaId !== salaId) {
                return false;
            }
            const inicio = new Date(agendamento.periodo.inicio);
            const fim = new Date(agendamento.periodo.fim);
            fim.setDate(fim.getDate() + 1);
            if (!(instanteAtual >= inicio && instanteAtual < fim)) {
                return false;
            }
            if (!agendamento.diasSemana.includes(instanteAtual.getDay())) {
                return false;
            }
            const minutosAtual = instanteAtual.getHours() * 60 + instanteAtual.getMinutes();
            const inicioMinutos = converterHorarioEmMinutos(agendamento.horario.inicio);
            const fimMinutos = converterHorarioEmMinutos(agendamento.horario.fim);
            return minutosAtual >= inicioMinutos && minutosAtual < fimMinutos;
        });
        return { status: ocupadaAgora ? 'Ocupada' : 'Disponível' };
    }

    function filtrarSalas(salas, { termoBusca = '', tipoSelecionado = '', faixaCapacidade = '' } = {}) {
        if (!Array.isArray(salas)) {
            throw new Error('Lista de salas inválida');
        }
        const termoNormalizado = termoBusca.trim().toLowerCase();
        return salas.filter(sala => {
            const correspondeBusca = !termoNormalizado ||
                sala.codigo.toLowerCase().includes(termoNormalizado) ||
                sala.tipo.toLowerCase().includes(termoNormalizado) ||
                sala.localizacao.toLowerCase().includes(termoNormalizado);

            const correspondeTipo = !tipoSelecionado || sala.tipo === tipoSelecionado;

            let correspondeCapacidade = true;
            if (faixaCapacidade === '20') {
                correspondeCapacidade = sala.capacidade <= 20;
            } else if (faixaCapacidade === '40') {
                correspondeCapacidade = sala.capacidade > 20 && sala.capacidade <= 40;
            } else if (faixaCapacidade === '41') {
                correspondeCapacidade = sala.capacidade > 40;
            }

            return correspondeBusca && correspondeTipo && correspondeCapacidade;
        });
    }

    return {
        converterHorarioEmMinutos,
        existeConflito,
        obterStatusSala,
        filtrarSalas
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgendaFuncoes;
} else if (typeof window !== 'undefined') {
    window.AgendaFuncoes = AgendaFuncoes;
}

if (typeof document === 'undefined') {
    // Ambiente de testes (Node): não executa lógica de interface
} else {

(function () {
    'use strict';

    // dados principais do sistema: salas, agendamentos e configs
    const estadoAplicacao = {
        salasCadastradas: [
            { id: 1, codigo: 'C10', tipo: 'Lab. Informática', capacidade: 32, localizacao: 'Bloco C' },
            { id: 2, codigo: 'A205', tipo: 'Sala de Aula', capacidade: 45, localizacao: 'Bloco A' },
            { id: 3, codigo: 'F15', tipo: 'Lab. Física', capacidade: 20, localizacao: 'Bloco F' },
            { id: 4, codigo: 'AUDIT01', tipo: 'Auditório', capacidade: 120, localizacao: 'Bloco Central' }
        ],
        agendamentosRegistrados: [
            { id: 101, salaId: 2, periodo: { inicio: '2025-08-26', fim: '2025-12-26' }, horario: { inicio: '14:00', fim: '16:00' }, diasSemana: [2], disciplina: 'Palestra', professor: 'Dr. Estranho', cpf: '111.111.111-11' },
            { id: 102, salaId: 3, periodo: { inicio: '2025-08-04', fim: '2025-12-12' }, horario: { inicio: '09:00', fim: '11:00' }, diasSemana: [1, 3], disciplina: 'Física Experimental', professor: 'Prof. Santos', cpf: '222.222.222-22' },
            { id: 103, salaId: 4, periodo: { inicio: '2025-09-10', fim: '2025-12-10' }, horario: { inicio: '19:00', fim: '22:00' }, diasSemana: [3], disciplina: 'Formatura', professor: 'Reitoria', cpf: '333.333.333-33' }
        ],
        instanciaCalendario: null,
        mapaDiasSemana: { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sab' },
        coresPorTipo: { 'Lab. Informática': 'lab-info', 'Sala de Aula': 'sala-aula', 'Lab. Física': 'lab-fisica', 'Auditório': 'auditorio' }
    };

    // elementos principais da tela usados pelo sistema
    const elementosTela = {
        gradeSalas: document.getElementById('salas-grid'),
        listaAgendamentos: document.getElementById('agendamentos-list'),
        campoBusca: document.getElementById('searchInput'),
        seletorTipo: document.getElementById('tipoSelect'),
        seletorCapacidade: document.getElementById('capacidadeSelect'),
        contadorAgendamentos: document.getElementById('agendamentos-count'),
        modalAgendarElemento: document.getElementById('modalAgendarSala'),
        modalAgendarInstancia: null,
        modalNovaSalaInstancia: null,
        formularioAgendamento: document.getElementById('formAgendarSala'),
        formularioNovaSala: document.getElementById('formNovaSala')
    };

    // utils, validações e formatações
    const utilitarios = {
        formatarDataBR: (dataIso) => dataIso ? dataIso.split('-').reverse().join('/') : '',
        formatarDataISO: (data) => data ? data.toISOString().split('T')[0] : null,
        converterHorarioEmMinutos: AgendaFuncoes.converterHorarioEmMinutos,
        existeConflito: (novoAgendamento) => AgendaFuncoes.existeConflito(novoAgendamento, estadoAplicacao.agendamentosRegistrados),
        obterStatusSala: (salaId) => AgendaFuncoes.obterStatusSala(salaId, estadoAplicacao.agendamentosRegistrados)
    };

    // função de atualizar cada trecho da interface
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
                .sort((agPrimeiro, agSegundo) => new Date(agPrimeiro.periodo.inicio) - new Date(agSegundo.periodo.inicio));

            elementosTela.listaAgendamentos.innerHTML = agendamentosOrdenados.length === 0
                ? '<p class="text-center text-muted mt-4">Nenhum agendamento encontrado.</p>'
                : agendamentosOrdenados.map(agendamento => {
                    const salaRelacionada = estadoAplicacao.salasCadastradas.find(sala => sala.id === agendamento.salaId);
                    if (!salaRelacionada) {
                        return '';
                    }
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
                                <div>
                                    <button class="btn btn-sm btn-outline-primary btn-edit" data-bs-toggle="modal" data-bs-target="#modalAgendarSala" data-agendamento-id="${agendamento.id}"><i class="bi bi-pencil-square"></i></button>
                                    <button class="btn btn-sm btn-outline-danger btn-delete" data-agendamento-id="${agendamento.id}"><i class="bi bi-trash"></i></button>
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

    // funções que tratam os cliques e formulários do usuário
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
            estadoAplicacao.salasCadastradas.push({
                id: Date.now(),
                codigo: document.getElementById('salaNome').value.trim(),
                capacidade: parseInt(document.getElementById('salaCapacidade').value, 10),
                tipo: document.getElementById('salaTipo').value,
                localizacao: document.getElementById('salaBloco').value.trim(),
            });
            manipuladores.aplicarFiltros();
            renderizadores.filtros();
            evento.target.reset();
            elementosTela.modalNovaSalaInstancia.hide();
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
            if (utilitarios.converterHorarioEmMinutos(horaInicio) >= utilitarios.converterHorarioEmMinutos(horaFim)) {
                return alert('Horário de início deve ser anterior ao de fim.');
            }

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
                cpf: document.getElementById('agendamentoCpf').value.trim()
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
            if (!botaoExcluir) {
                return;
            }

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
            if (!botaoExcluir) {
                return;
            }

            const agendamentoId = parseInt(botaoExcluir.dataset.agendamentoId, 10);
            if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                estadoAplicacao.agendamentosRegistrados = estadoAplicacao.agendamentosRegistrados.filter(agendamento => agendamento.id !== agendamentoId);
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

    // Inicia o sistema e conecta os eventos da tela 
    function inicializarInterface() {
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

        renderizadores.filtros();
        renderizadores.salas();
        renderizadores.agendamentos();
    }

        document.addEventListener('DOMContentLoaded', inicializarInterface);

    })();

    }
