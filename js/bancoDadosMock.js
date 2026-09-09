// js/bancoDadosMock.js

/**
 * Serviço responsável por simular um banco de dados utilizando LocalStorage
 */
const BD = {
    // Inicializa dados falsos caso não existam no LocalStorage
    inicializar: function() {
        if (!localStorage.getItem('unidades')) {
            localStorage.setItem('unidades', JSON.stringify([
                { id: 1, nome: 'Campus Central', endereco: 'Av. Principal, 1000', cidade: 'São Paulo', uf: 'SP' },
                { id: 2, nome: 'Campus Norte', endereco: 'Rua do Saber, 500', cidade: 'São Paulo', uf: 'SP' }
            ]));
        }

        if (!localStorage.getItem('cursos')) {
            localStorage.setItem('cursos', JSON.stringify([
                { id: 1, nome: 'Ciência da Computação', coordenador: 'Alan Turing', unidadeId: 1 },
                { id: 2, nome: 'Sistemas de Informação', coordenador: 'Ada Lovelace', unidadeId: 1 }
            ]));
        }

        if (!localStorage.getItem('professores')) {
            localStorage.setItem('professores', JSON.stringify([
                { id: 1, nome: 'João Silva', email: 'joao.silva@pong.edu', telefone: '(11) 98765-4321' },
                { id: 2, nome: 'Maria Santos', email: 'maria.santos@pong.edu', telefone: '(11) 91234-5678' }
            ]));
        }
        
        if (!localStorage.getItem('alunos')) {
            localStorage.setItem('alunos', JSON.stringify([
                { id: 1, nome: 'Pedro Álvares', matricula: '2023001', email: 'pedro@aluno.edu', telefone: '(11) 99999-1111' },
                { id: 2, nome: 'Ana Costa', matricula: '2023002', email: 'ana@aluno.edu', telefone: '(11) 98888-2222' }
            ]));
        }

        if (!localStorage.getItem('turmas')) {
            localStorage.setItem('turmas', JSON.stringify([
                { id: 1, turno: 'Matutino', codigo: 'TMA01', curso: 'Ciência da Computação', unidade: 'Campus Central' },
                { id: 2, turno: 'Noturno', codigo: 'TNO01', curso: 'Sistemas de Informação', unidade: 'Campus Central' }
            ]));
        }

        if (!localStorage.getItem('disciplinas')) {
            localStorage.setItem('disciplinas', JSON.stringify([
                { 
                    id: 1, 
                    nome: 'Lógica de Programação', 
                    cursoId: 1,
                    turmaId: 1,
                    professorId: 1, 
                    alunosIds: [1, 2],
                    descricao: 'Introdução aos Algoritmos e Estruturas de Controle',
                    cargaHoraria: 60,
                    sala: 'Lab 01',
                    horarioInicio: '08:00',
                    horarioFim: '10:00',
                    notas: {
                        '1': { av1: 8.5, av2: 7.0, reposicao: null, final: 7.75 },
                        '2': { av1: 6.0, av2: 5.5, reposicao: 8.0, final: 7.0 }
                    }
                }
            ]));
        }

        if (!localStorage.getItem('planosAula')) {
            localStorage.setItem('planosAula', JSON.stringify([
                { id: 1, disciplinaId: 1, titulo: 'Aula 01 - Introdução a Algoritmos', descricao: 'Conceitos básicos de lógica de programação e algoritmos.', data: '2026-09-10', status: 'agendada' },
                { id: 2, disciplinaId: 1, titulo: 'Aula 02 - Variáveis e Tipos',        descricao: 'Estudo de variáveis, tipos de dados e operadores.',           data: '2026-09-17', status: 'agendada' }
            ]));
        }
    },

    // Ler todos os registros de uma tabela
    lerTodos: function(tabela) {
        return JSON.parse(localStorage.getItem(tabela)) || [];
    },

    // Ler um registro por ID
    lerPorId: function(tabela, id) {
        const registros = this.lerTodos(tabela);
        return registros.find(reg => reg.id == id);
    },

    // Criar um novo registro
    criar: function(tabela, dados) {
        const registros = this.lerTodos(tabela);
        const novoId = registros.length > 0 ? Math.max(...registros.map(r => r.id)) + 1 : 1;
        const novoRegistro = { id: novoId, ...dados };
        registros.push(novoRegistro);
        localStorage.setItem(tabela, JSON.stringify(registros));
        return novoRegistro;
    },

    // Atualizar um registro existente
    atualizar: function(tabela, id, dados) {
        let registros = this.lerTodos(tabela);
        const index = registros.findIndex(reg => reg.id == id);
        if (index !== -1) {
            registros[index] = { ...registros[index], ...dados, id: parseInt(id) };
            localStorage.setItem(tabela, JSON.stringify(registros));
            return registros[index];
        }
        return null;
    },

    // Deletar um registro
    deletar: function(tabela, id) {
        let registros = this.lerTodos(tabela);
        registros = registros.filter(reg => reg.id != id);
        localStorage.setItem(tabela, JSON.stringify(registros));
    }
};

// Inicializa os dados ao carregar o script
BD.inicializar();
