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

    function obterStatusSala(salaId, agendamentos, horarioFuncionamento = null, instanteAtual = new Date()) {
        // Configuração de funcionamento: 7h às 22h
        const config = horarioFuncionamento || { inicio: '07:00', fim: '22:00' };
        
        // Horário atual formatado
        const horaAtual = String(instanteAtual.getHours()).padStart(2, '0');
        const minAtual = String(instanteAtual.getMinutes()).padStart(2, '0');
        const horarioAtual = `${horaAtual}:${minAtual}`;
        
        // Verifica se está fora do horário de funcionamento
        if (horarioAtual < config.inicio || horarioAtual >= config.fim) {
            return { status: 'Disponível', motivo: 'Fora do horário de funcionamento' };
        }

        // Verifica se existe algum agendamento ocupando a sala agora
        const ocupadaAgora = Array.isArray(agendamentos) && agendamentos.some(ag => {
            if (ag.salaId !== salaId) return false;
            
            // Verifica período
            const inicio = new Date(ag.periodo.inicio);
            const fim = new Date(ag.periodo.fim);
            fim.setHours(23, 59, 59);
            if (instanteAtual < inicio || instanteAtual > fim) return false;
            
            // Verifica dia da semana
            if (!ag.diasSemana.includes(instanteAtual.getDay())) return false;
            
            // Verifica horário
            const agInicio = ag.horario.inicio || '00:00';
            const agFim = ag.horario.fim || '23:59';
            return horarioAtual >= agInicio && horarioAtual < agFim;
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
