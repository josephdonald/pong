// js/planosAula.js
// Módulo responsável pelo CRUD de Planos de Aula de cada disciplina

var PlanosAula = (function() {
    const tabela = 'planosAula';
    const $selectDisc = $('#plano-disciplina');
    const $tbody = $('#planosAula-tbody');
    const $modal = $('#modal-plano-aula');
    const $form = $('#form-plano-aula');

    // Popula o select de disciplinas e inicializa os eventos
    function inicializar() {
        const disciplinas = BD.lerTodos('disciplinas');

        $selectDisc.empty().append('<option value="">Selecione uma disciplina...</option>');
        disciplinas.forEach(d => {
            $selectDisc.append(`<option value="${d.id}">${d.nome}</option>`);
        });

        // Listener do select para recarregar tabela
        $selectDisc.off('change').on('change', function() {
            renderizarTabela($(this).val());
        });

        // Se já havia uma disciplina selecionada, mantém
        if ($selectDisc.val()) {
            renderizarTabela($selectDisc.val());
        } else {
            $tbody.empty();
            $tbody.append('<tr><td colspan="5" style="text-align:center;">Selecione uma disciplina acima.</td></tr>');
        }
    }

    // Renderiza a lista de aulas da disciplina selecionada
    function renderizarTabela(discId) {
        $tbody.empty();
        if (!discId) return;

        const planos = BD.lerTodos(tabela).filter(p => p.disciplinaId == discId);

        if (planos.length === 0) {
            $tbody.append('<tr><td colspan="5" style="text-align:center;">Nenhuma aula cadastrada. Clique em "Nova Aula".</td></tr>');
            return;
        }

        // Ordena por data
        planos.sort((a, b) => new Date(a.data) - new Date(b.data));

        planos.forEach((plano, idx) => {
            const dataFormatada = new Date(plano.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const badgeClass = plano.status === 'ministrada' ? 'color:var(--success)' : plano.status === 'cancelada' ? 'color:var(--danger)' : 'color:var(--secondary-color)';
            const badgeIcone = plano.status === 'ministrada' ? 'fa-circle-check' : plano.status === 'cancelada' ? 'fa-circle-xmark' : 'fa-circle-dot';

            $tbody.append(`
                <tr>
                    <td>${idx + 1}</td>
                    <td>${plano.titulo}</td>
                    <td>${dataFormatada}</td>
                    <td><i class="fa-solid ${badgeIcone}" style="${badgeClass}"></i> ${plano.status.charAt(0).toUpperCase() + plano.status.slice(1)}</td>
                    <td class="action-btns">
                        <button class="btn btn-primary" onclick="PlanosAula.abrirModalRegistrar(${plano.id})" title="Registrar Aula"><i class="fa-solid fa-check-to-slot"></i></button>
                        <button class="btn btn-secondary" onclick="PlanosAula.editar(${plano.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" onclick="PlanosAula.excluir(${plano.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    }

    // Abre modal de criação/edição de aula
    function abrirModal(id = null) {
        const discId = $selectDisc.val();
        if (!discId && !id) {
            alert('Selecione uma disciplina primeiro.');
            return;
        }

        $form[0].reset();
        $('#plano-id').val('');
        $('#plano-disc-id').val(discId);
        $('#modal-plano-title').text('Nova Aula');
        // Data padrão: hoje
        $('#plano-data').val(new Date().toISOString().split('T')[0]);

        if (id) {
            const plano = BD.lerPorId(tabela, id);
            if (plano) {
                $('#plano-id').val(plano.id);
                $('#plano-disc-id').val(plano.disciplinaId);
                $('#plano-titulo').val(plano.titulo);
                $('#plano-descricao').val(plano.descricao);
                $('#plano-data').val(plano.data);
                $('#plano-status').val(plano.status);
                $('#modal-plano-title').text('Editar Aula');
            }
        }

        $modal.addClass('active');
    }

    function fecharModal() {
        $modal.removeClass('active');
    }

    // Salva (cria ou atualiza) uma aula no plano
    function salvar(e) {
        e.preventDefault();
        const id = $('#plano-id').val();
        const dados = {
            disciplinaId: parseInt($('#plano-disc-id').val()),
            titulo: $('#plano-titulo').val(),
            descricao: $('#plano-descricao').val(),
            data: $('#plano-data').val(),
            status: $('#plano-status').val()
        };

        if (id) {
            BD.atualizar(tabela, id, dados);
        } else {
            BD.criar(tabela, dados);
        }

        fecharModal();
        renderizarTabela(dados.disciplinaId);
    }

    function editar(id) { abrirModal(id); }

    function excluir(id) {
        if (confirm('Deseja excluir esta aula do plano?')) {
            const plano = BD.lerPorId(tabela, id);
            BD.deletar(tabela, id);
            renderizarTabela(plano ? plano.disciplinaId : $selectDisc.val());
        }
    }

    // Modal Registrar Aula
    const $modalRegistrar = $('#modal-registrar-aula');
    
    function abrirModalRegistrar(id) {
        $('#registrar-aula-id').val(id);
        $modalRegistrar.addClass('active');
    }

    function fecharModalRegistrar() {
        $modalRegistrar.removeClass('active');
    }

    function cancelarAula() {
        if(confirm('Tem certeza que deseja cancelar esta aula?')) {
            const id = $('#registrar-aula-id').val();
            const plano = BD.lerPorId(tabela, id);
            if (plano) {
                plano.status = 'cancelada';
                BD.atualizar(tabela, id, plano);
                renderizarTabela(plano.disciplinaId);
                fecharModalRegistrar();
            }
        }
    }

    function irParaFrequencia() {
        const id = $('#registrar-aula-id').val();
        const plano = BD.lerPorId(tabela, id);
        if (plano) {
            fecharModalRegistrar();
            // Pass the parameters to the Frequencia module directly
            App.navegarPara('frequencia');
            if(typeof Frequencia !== 'undefined') {
                Frequencia.inicializarComDados(plano.disciplinaId, plano.id);
            }
        }
    }

    // Event Listeners
    $form.on('submit', salvar);

    // Inicialização
    inicializar();

    return { 
        inicializar, abrirModal, fecharModal, editar, excluir,
        abrirModalRegistrar, fecharModalRegistrar, cancelarAula, irParaFrequencia
    };
})();
