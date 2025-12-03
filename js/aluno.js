(function () {
    'use strict';

    // dados de salas e agendamentos exibidos na página do aluno
    const dadosAcademicos = {
        salas: [
            { id: 1, codigo: 'C10', tipo: 'Lab. Informática', capacidade: 32, localizacao: 'Bloco C' },
            { id: 2, codigo: 'A205', tipo: 'Sala de Aula', capacidade: 45, localizacao: 'Bloco A' },
            { id: 3, codigo: 'F15', tipo: 'Lab. Física', capacidade: 20, localizacao: 'Bloco F' },
            { id: 4, codigo: 'AUDIT01', tipo: 'Auditório', capacidade: 120, localizacao: 'Bloco Central' }
        ],
        agendamentos: [
            { id: 101, salaId: 2, periodo: { inicio: '2025-08-26', fim: '2025-12-26' }, horario: { inicio: '14:00', fim: '16:00' }, diasSemana: [2], disciplina: 'Palestra', professor: 'Dr. Estranho' },
            { id: 102, salaId: 3, periodo: { inicio: '2025-08-04', fim: '2025-12-12' }, horario: { inicio: '09:00', fim: '11:00' }, diasSemana: [1, 3], disciplina: 'Física Experimental', professor: 'Prof. Santos' },
            { id: 103, salaId: 1, periodo: { inicio: '2025-09-02', fim: '2025-09-30' }, horario: { inicio: '19:00', fim: '22:00' }, diasSemana: [2, 4], disciplina: 'Algoritmos Avançados', professor: 'Profa. Ada' }
        ]
    };

    // elementos da tela onde aparecem as listas de aulas
    const elementosTela = {
        listaAulasHoje: document.getElementById('aulas-hoje-list'),
        listaProximasAulas: document.getElementById('proximas-aulas-list')
    };

    function criarCartaoAgendamento(agendamento, exibirDiasSeparados = false) {
        const salaEncontrada = dadosAcademicos.salas.find(sala => sala.id === agendamento.salaId);
        if (!salaEncontrada) {
            return '';
        }

        const diasSemanaMapeados = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const diasHtml = agendamento.diasSemana
            .map(dia => `<span class="dias-semana-badge">${diasSemanaMapeados[dia]}</span>`)
            .join('');

        const formatarDataBrasileira = (dataIso) => {
            if (!dataIso) {
                return 'Data indefinida';
            }
            const [ano, mes, dia] = dataIso.split('-');
            return `${dia}/${mes}/${ano}`;
        };

        const periodoFormatado = `${formatarDataBrasileira(agendamento.periodo.inicio)} até ${formatarDataBrasileira(agendamento.periodo.fim)}`;

        return `
            <div class="cartao-agendamento">
                <div class="cabecalho-agendamento">
                    <h5><i class="bi bi-building"></i> ${salaEncontrada.codigo}</h5>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Período:</strong> ${periodoFormatado}</p>
                        <p class="mb-2"><strong>Horário:</strong> ${agendamento.horario.inicio} - ${agendamento.horario.fim}</p>
                        ${exibirDiasSeparados ? '' : diasHtml}
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Disciplina:</strong> ${agendamento.disciplina}</p>
                        <p class="mb-1"><strong>Professor:</strong> ${agendamento.professor}</p>
                    </div>
                </div>
                ${exibirDiasSeparados ? `<div class="mt-3">${diasHtml}</div>` : ''}
            </div>`;
    }

    function renderizarAulas() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const diaDaSemanaHoje = hoje.getDay();

        const aulasHoje = dadosAcademicos.agendamentos.filter(agendamento => {
            const inicio = new Date(`${agendamento.periodo.inicio}T00:00:00`);
            const fim = new Date(`${agendamento.periodo.fim}T00:00:00`);
            return hoje >= inicio && hoje <= fim && agendamento.diasSemana.includes(diaDaSemanaHoje);
        });

        const proximasAulas = dadosAcademicos.agendamentos.filter(agendamento => {
            const inicio = new Date(`${agendamento.periodo.inicio}T00:00:00`);
            return inicio > hoje;
        });

        elementosTela.listaAulasHoje.innerHTML = aulasHoje.length > 0
            ? aulasHoje.map(agendamento => criarCartaoAgendamento(agendamento)).join('')
            : '<p class="text-center text-muted">Nenhuma aula agendada para hoje.</p>';

        elementosTela.listaProximasAulas.innerHTML = proximasAulas.length > 0
            ? proximasAulas.map(agendamento => criarCartaoAgendamento(agendamento, true)).join('')
            : '<p class="text-center text-muted">Nenhuma aula futura encontrada.</p>';
    }

    document.addEventListener('DOMContentLoaded', renderizarAulas);

})();
