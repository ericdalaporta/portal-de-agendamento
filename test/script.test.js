const AgendaFuncoes = require("../js/script.js");

QUnit.module("AgendaFuncoes", () => {
  QUnit.test("converterHorarioEmMinutos converte e valida entradas", assert => {
    assert.equal(AgendaFuncoes.converterHorarioEmMinutos("14:30"), 14 * 60 + 30, "Converte horário no formato HH:MM");
    assert.equal(AgendaFuncoes.converterHorarioEmMinutos("00:05"), 5, "Aceita horários com zero à esquerda");
    assert.throws(() => AgendaFuncoes.converterHorarioEmMinutos("14-30"), /Horário inválido/, "Lança erro para formato incorreto");
  });

  QUnit.test("existeConflito detecta sobreposição de horários e dias", assert => {
    const agendamentos = [
      {
        id: 1,
        salaId: 10,
        periodo: { inicio: "2025-08-01", fim: "2025-08-31" },
        horario: { inicio: "10:00", fim: "12:00" },
        diasSemana: [1, 3]
      }
    ];

    const novoSemConflito = {
      id: 2,
      salaId: 10,
      periodo: { inicio: "2025-08-01", fim: "2025-08-31" },
      horario: { inicio: "12:00", fim: "13:00" },
      diasSemana: [4]
    };

    const novoComConflito = {
      id: 3,
      salaId: 10,
      periodo: { inicio: "2025-08-10", fim: "2025-08-20" },
      horario: { inicio: "11:00", fim: "12:30" },
      diasSemana: [1]
    };

    assert.false(AgendaFuncoes.existeConflito(novoSemConflito, agendamentos), "Dias distintos não conflitam");
    assert.true(AgendaFuncoes.existeConflito(novoComConflito, agendamentos), "Sobreposição gera conflito");
  });

  QUnit.test("obterStatusSala analisa ocupação no instante informado", assert => {
    const agendamentos = [
      {
        id: 1,
        salaId: 7,
        periodo: { inicio: "2025-01-01", fim: "2025-01-31" },
        horario: { inicio: "08:00", fim: "10:00" },
        diasSemana: [1, 2]
      }
    ];

    const instanteOcupado = new Date("2025-01-06T08:30:00");  
    const instanteLivre = new Date("2025-01-06T11:00:00");

    assert.strictEqual(AgendaFuncoes.obterStatusSala(7, agendamentos, instanteOcupado).status, "Ocupada");
    assert.strictEqual(AgendaFuncoes.obterStatusSala(7, agendamentos, instanteLivre).status, "Disponível");
  });

  QUnit.test("filtrarSalas aplica busca, tipo e capacidade", assert => {
    const salas = [
      { id: 1, codigo: "A101", tipo: "Sala de Aula", capacidade: 30, localizacao: "Bloco A" },
      { id: 2, codigo: "LAB1", tipo: "Lab. Informática", capacidade: 25, localizacao: "Bloco C" },
      { id: 3, codigo: "AUD2", tipo: "Auditório", capacidade: 120, localizacao: "Bloco Central" }
    ];

    const resultado = AgendaFuncoes.filtrarSalas(salas, {
      termoBusca: "lab",
      tipoSelecionado: "Lab. Informática",
      faixaCapacidade: "40"
    });

    assert.equal(resultado.length, 1, "Apenas uma sala combina todos os filtros");
    assert.equal(resultado[0].codigo, "LAB1", "Retorna a sala de laboratório");
  });
});
