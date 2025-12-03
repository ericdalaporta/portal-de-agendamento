const AgendaFuncoes = (() => {
    function periodosConflitantes(novo, existente) {
        const novoInicio = new Date(novo.periodo.inicio);
        const novoFim = new Date(novo.periodo.fim);
        const inicioExistente = new Date(existente.periodo.inicio);
        const fimExistente = new Date(existente.periodo.fim);
        return !(novoInicio > fimExistente || novoFim < inicioExistente);
    }

    function horariosConflitantes(novo, existente) {
        const inicioNovo = novo.horario.inicio || '00:00';
        const fimNovo = novo.horario.fim || '00:00';
        const inicioExistente = existente.horario.inicio || '00:00';
        const fimExistente = existente.horario.fim || '00:00';

        // não tem conflito se um intervalo termina antes do outro começar
        const naoConflita = fimNovo <= inicioExistente || fimExistente <= inicioNovo;
        return !naoConflita;
    }

    function diasConflitantes(novo, existente) {
        return novo.diasSemana.some(dia => existente.diasSemana.includes(dia));
    }

    function existeConflito(novoAgendamento, agendamentos) {
        return Array.isArray(agendamentos) && agendamentos.some(registro => {
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
        const ocupadaAgora = Array.isArray(agendamentos) && agendamentos.some(agendamento => {
            if (agendamento.salaId !== salaId) {
                return false;
            }
            const inicioPeriodo = new Date(agendamento.periodo.inicio);
            const fimPeriodo = new Date(agendamento.periodo.fim);
            fimPeriodo.setDate(fimPeriodo.getDate() + 1);
            if (!(instanteAtual >= inicioPeriodo && instanteAtual < fimPeriodo)) {
                return false;
            }
            if (!agendamento.diasSemana.includes(instanteAtual.getDay())) {
                return false;
            }
            const horas = String(instanteAtual.getHours()).padStart(2, '0');
            const minutos = String(instanteAtual.getMinutes()).padStart(2, '0');
            const horarioAtual = `${horas}:${minutos}`;
            const inicioHorario = agendamento.horario.inicio || '00:00';
            const fimHorario = agendamento.horario.fim || '00:00';
            return horarioAtual >= inicioHorario && horarioAtual < fimHorario;
        });
        return { status: ocupadaAgora ? 'Ocupada' : 'Disponível' };
    }

    function filtrarSalas(salas, { termoBusca = '', tipoSelecionado = '', faixaCapacidade = '' } = {}) {
        if (!Array.isArray(salas)) {
            return [];
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
