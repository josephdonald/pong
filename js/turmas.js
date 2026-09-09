// js/turmas.js

var Turmas = (function() {
    const tabela = 'turmas';
    const $tbody = $('#turmas-tbody');
    const $modal = $('#modal-turma');
    const $form = $('#form-turma');

    function renderizarTabela() {
        const registros = BD.lerTodos(tabela);
        const cursos = BD.lerTodos('cursos');
        const unidades = BD.lerTodos('unidades');
        $tbody.empty();

        if (registros.length === 0) {
            $tbody.append('<tr><td colspan="5" style="text-align:center;">Nenhuma turma cadastrada.</td></tr>');
            return;
        }

        registros.forEach(reg => {
            const cur = cursos.find(c => c.id == reg.cursoId);
            const curNome = cur ? cur.nome : (reg.curso || 'Desconhecido');
            const uni = unidades.find(u => u.id == reg.unidadeId);
            const uniNome = uni ? uni.nome : (reg.unidade || 'Desconhecida');

            $tbody.append(`
                <tr>
                    <td>${reg.codigo}</td>
                    <td>${curNome}</td>
                    <td>${reg.turno}</td>
                    <td>${uniNome}</td>
                    <td class="action-btns">
                        <button class="btn btn-secondary" onclick="Turmas.editar(${reg.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" onclick="Turmas.excluir(${reg.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });

        if(typeof Dashboard !== 'undefined') Dashboard.atualizar();
    }

    function carregarSelects() {
        const cursos = BD.lerTodos('cursos');
        const $selectCurso = $('#turma-curso');
        $selectCurso.empty().append('<option value="">Selecione um Curso...</option>');
        cursos.forEach(c => $selectCurso.append(`<option value="${c.id}">${c.nome}</option>`));

        const unidades = BD.lerTodos('unidades');
        const $selectUnidade = $('#turma-unidade');
        $selectUnidade.empty().append('<option value="">Selecione uma Unidade...</option>');
        unidades.forEach(u => $selectUnidade.append(`<option value="${u.id}">${u.nome} - ${u.cidade}/${u.uf}</option>`));
    }

    function abrirModal(id = null) {
        $form[0].reset();
        $('#turma-id').val('');
        $('#modal-turma-title').text('Nova Turma');
        carregarSelects();

        if (id) {
            const reg = BD.lerPorId(tabela, id);
            if (reg) {
                $('#turma-id').val(reg.id);
                $('#turma-codigo').val(reg.codigo);
                $('#turma-curso').val(reg.cursoId || reg.curso); // fallback string to ID not handled perfectly but good enough for MVP
                $('#turma-turno').val(reg.turno);
                $('#turma-unidade').val(reg.unidadeId || reg.unidade);
                $('#modal-turma-title').text('Editar Turma');
            }
        }

        $modal.addClass('active');
    }

    function fecharModal() {
        $modal.removeClass('active');
    }

    function salvar(e) {
        e.preventDefault();
        
        const id = $('#turma-id').val();
        const dados = {
            codigo: $('#turma-codigo').val(),
            cursoId: parseInt($('#turma-curso').val()),
            turno: $('#turma-turno').val(),
            unidadeId: parseInt($('#turma-unidade').val())
        };

        if (id) {
            BD.atualizar(tabela, id, dados);
        } else {
            BD.criar(tabela, dados);
        }

        fecharModal();
        renderizarTabela();
    }

    function editar(id) {
        abrirModal(id);
    }

    function excluir(id) {
        if (confirm('Tem certeza que deseja excluir esta turma?')) {
            BD.deletar(tabela, id);
            renderizarTabela();
        }
    }

    // Event Listeners
    $form.on('submit', salvar);

    // Inicialização
    renderizarTabela();

    // API pública
    return {
        abrirModal: abrirModal,
        fecharModal: fecharModal,
        editar: editar,
        excluir: excluir
    };
})();
