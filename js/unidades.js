// js/unidades.js

var Unidades = (function() {
    const tabela = 'unidades';
    const $tbody = $('#unidades-tbody');
    const $modal = $('#modal-unidade');
    const $form = $('#form-unidade');

    function renderizarTabela() {
        const registros = BD.lerTodos(tabela);
        $tbody.empty();

        if (registros.length === 0) {
            $tbody.append('<tr><td colspan="4" style="text-align:center;">Nenhuma unidade cadastrada.</td></tr>');
            return;
        }

        registros.forEach(reg => {
            $tbody.append(`
                <tr>
                    <td>${reg.id}</td>
                    <td>${reg.nome}</td>
                    <td>${reg.cidade}/${reg.uf}</td>
                    <td class="action-btns">
                        <button class="btn btn-secondary" onclick="Unidades.editar(${reg.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" onclick="Unidades.excluir(${reg.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
        
        // Atualiza dashboard se estiver visível
        if(typeof Dashboard !== 'undefined') Dashboard.atualizar();
    }

    function abrirModal(id = null) {
        $form[0].reset();
        $('#uni-id').val('');
        $('#modal-unidade-title').text('Nova Unidade');

        if (id) {
            const reg = BD.lerPorId(tabela, id);
            if (reg) {
                $('#uni-id').val(reg.id);
                $('#uni-nome').val(reg.nome);
                $('#uni-endereco').val(reg.endereco);
                $('#uni-cidade').val(reg.cidade);
                $('#uni-uf').val(reg.uf);
                $('#modal-unidade-title').text('Editar Unidade');
            }
        }

        $modal.addClass('active');
    }

    function fecharModal() {
        $modal.removeClass('active');
    }

    function salvar(e) {
        e.preventDefault();
        
        const id = $('#uni-id').val();
        const dados = {
            nome: $('#uni-nome').val(),
            endereco: $('#uni-endereco').val(),
            cidade: $('#uni-cidade').val(),
            uf: $('#uni-uf').val().toUpperCase()
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
        if (confirm('Tem certeza que deseja excluir esta unidade?')) {
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
