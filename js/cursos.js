// js/cursos.js

var Cursos = (function() {
    const tabela = 'cursos';
    const $tbody = $('#cursos-tbody');
    const $modal = $('#modal-curso');
    const $form = $('#form-curso');

    function carregarSelectUnidades() {
        const unidades = BD.lerTodos('unidades');
        const $select = $('#cur-unidade');
        $select.empty().append('<option value="">Selecione uma Unidade...</option>');
        unidades.forEach(u => {
            $select.append(`<option value="${u.id}">${u.nome} - ${u.cidade}/${u.uf}</option>`);
        });
    }

    function renderizarTabela() {
        const registros = BD.lerTodos(tabela);
        const unidades = BD.lerTodos('unidades');
        $tbody.empty();

        if (registros.length === 0) {
            $tbody.append('<tr><td colspan="5" style="text-align:center;">Nenhum curso cadastrado.</td></tr>');
            return;
        }

        registros.forEach(reg => {
            const uni = unidades.find(u => u.id == reg.unidadeId);
            const uniNome = uni ? uni.nome : 'Desconhecida';

            $tbody.append(`
                <tr>
                    <td>${reg.id}</td>
                    <td>${reg.nome}</td>
                    <td>${reg.coordenador}</td>
                    <td>${uniNome}</td>
                    <td class="action-btns">
                        <button class="btn btn-secondary" onclick="Cursos.editar(${reg.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" onclick="Cursos.excluir(${reg.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });

        if(typeof Dashboard !== 'undefined') Dashboard.atualizar();
    }

    function abrirModal(id = null) {
        $form[0].reset();
        $('#cur-id').val('');
        $('#modal-curso-title').text('Novo Curso');
        carregarSelectUnidades();

        if (id) {
            const reg = BD.lerPorId(tabela, id);
            if (reg) {
                $('#cur-id').val(reg.id);
                $('#cur-nome').val(reg.nome);
                $('#cur-coord').val(reg.coordenador);
                $('#cur-unidade').val(reg.unidadeId);
                $('#modal-curso-title').text('Editar Curso');
            }
        }

        $modal.addClass('active');
    }

    function fecharModal() {
        $modal.removeClass('active');
    }

    function salvar(e) {
        e.preventDefault();
        
        const id = $('#cur-id').val();
        const dados = {
            nome: $('#cur-nome').val(),
            coordenador: $('#cur-coord').val(),
            unidadeId: parseInt($('#cur-unidade').val())
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
        if (confirm('Tem certeza que deseja excluir este curso?')) {
            BD.deletar(tabela, id);
            renderizarTabela();
        }
    }

    $form.on('submit', salvar);
    renderizarTabela();

    return {
        abrirModal: abrirModal,
        fecharModal: fecharModal,
        editar: editar,
        excluir: excluir
    };
})();
