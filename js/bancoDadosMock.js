// js/bancoDadosMock.js

/**
 * Serviço responsável por simular um banco de dados utilizando LocalStorage
 * Agora com suporte Multi-tenant (isolamento por usuário)
 */
const BD = {
    tabelasComuns: ['unidades', 'cursos', 'usuarios'], // Tabelas que não são isoladas por usuário

    // Inicializa dados falsos caso não existam no LocalStorage
    inicializar: function() {
        // Se ainda existir a tabela antiga 'professores', fazemos um hard reset para o novo modelo multi-tenant
        if (localStorage.getItem('professores')) {
            localStorage.clear();
        }

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
        
        // Dados de teste para alunos, turmas, etc. não serão gerados no init para evitar bagunça
        // entre os usuários. Cada usuário criará os seus dados.
    },

    getUsuarioAtivo: function() {
        return parseInt(localStorage.getItem('sessao_ativa'));
    },

    // Ler todos os registros de uma tabela
    lerTodos: function(tabela) {
        const registros = JSON.parse(localStorage.getItem(tabela)) || [];
        
        // Se for tabela comum, retorna tudo
        if (this.tabelasComuns.includes(tabela)) {
            return registros;
        }
        
        // Se for tabela isolada, filtra pelo usuário ativo
        const usuarioId = this.getUsuarioAtivo();
        if (!usuarioId) return [];
        
        return registros.filter(reg => reg.usuarioId === usuarioId);
    },

    // Ler um registro por ID (já respeitando o isolamento via lerTodos)
    lerPorId: function(tabela, id) {
        const registros = this.lerTodos(tabela);
        return registros.find(reg => reg.id == id);
    },

    // Criar um novo registro
    criar: function(tabela, dados) {
        // Lê do localStorage inteiro para gerar ID sequencial
        const todosRegistros = JSON.parse(localStorage.getItem(tabela)) || [];
        const novoId = todosRegistros.length > 0 ? Math.max(...todosRegistros.map(r => r.id)) + 1 : 1;
        
        const novoRegistro = { id: novoId, ...dados };
        
        // Se for tabela isolada, injeta o usuarioId
        if (!this.tabelasComuns.includes(tabela)) {
            novoRegistro.usuarioId = this.getUsuarioAtivo();
        }
        
        todosRegistros.push(novoRegistro);
        localStorage.setItem(tabela, JSON.stringify(todosRegistros));
        
        return novoRegistro;
    },

    // Atualizar um registro existente
    atualizar: function(tabela, id, dados) {
        // Lê do localStorage inteiro para salvar corretamente
        let todosRegistros = JSON.parse(localStorage.getItem(tabela)) || [];
        
        // Validação de isolamento: verificar se o ID pertence ao usuário (ou se é tabela comum)
        if (!this.tabelasComuns.includes(tabela)) {
            const usuarioId = this.getUsuarioAtivo();
            const index = todosRegistros.findIndex(reg => reg.id == id && reg.usuarioId === usuarioId);
            if (index !== -1) {
                todosRegistros[index] = { ...todosRegistros[index], ...dados, id: parseInt(id), usuarioId: usuarioId };
                localStorage.setItem(tabela, JSON.stringify(todosRegistros));
                return todosRegistros[index];
            }
        } else {
            const index = todosRegistros.findIndex(reg => reg.id == id);
            if (index !== -1) {
                todosRegistros[index] = { ...todosRegistros[index], ...dados, id: parseInt(id) };
                localStorage.setItem(tabela, JSON.stringify(todosRegistros));
                return todosRegistros[index];
            }
        }
        return null;
    },

    // Deletar um registro
    deletar: function(tabela, id) {
        let todosRegistros = JSON.parse(localStorage.getItem(tabela)) || [];
        
        if (!this.tabelasComuns.includes(tabela)) {
            const usuarioId = this.getUsuarioAtivo();
            todosRegistros = todosRegistros.filter(reg => !(reg.id == id && reg.usuarioId === usuarioId));
        } else {
            todosRegistros = todosRegistros.filter(reg => reg.id != id);
        }
        
        localStorage.setItem(tabela, JSON.stringify(todosRegistros));
    }
};

// Inicializa os dados ao carregar o script
BD.inicializar();
