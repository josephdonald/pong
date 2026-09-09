// js/professores.js

var Professores = (function() {
    const tabela = 'professores';
    const $tbody = $('#professores-tbody');
    const $modal = $('#modal-professor');
    const $form = $('#form-professor');

    function renderizarTabela() {
        const registros = BD.lerTodos(tabela);
        $tbody.empty();

        if (registros.length === 0) {
            $tbody.append('<tr><td colspan="5" style="text-align:center;">Nenhum professor cadastrado.</td></tr>');
            return;
        }

        registros.forEach(reg => {
            $tbody.append(`
                <tr>
                    <td>${reg.id}</td>
                    <td>${reg.nome}</td>
                    <td>${reg.email}</td>
                    <td>${reg.telefone}</td>
                    <td class="action-btns">
                        <button class="btn btn-secondary" onclick="Professores.editar(${reg.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" onclick="Professores.excluir(${reg.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });

        if(typeof Dashboard !== 'undefined') Dashboard.atualizar();
    }

    function abrirModal(id = null) {
        $form[0].reset();
        $('#prof-id').val('');
        $('#modal-professor-title').text('Novo Professor');

        if (id) {
            const reg = BD.lerPorId(tabela, id);
            if (reg) {
                $('#prof-id').val(reg.id);
                $('#prof-nome').val(reg.nome);
                $('#prof-email').val(reg.email);
                $('#prof-telefone').val(reg.telefone);
                $('#modal-professor-title').text('Editar Professor');
            }
        }

        $modal.addClass('active');
    }

    function fecharModal() {
        $modal.removeClass('active');
    }

    function salvar(e) {
        e.preventDefault();
        
        const id = $('#prof-id').val();
        const dados = {
            nome: $('#prof-nome').val(),
            email: $('#prof-email').val(),
            telefone: $('#prof-telefone').val()
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
        if (confirm('Tem certeza que deseja excluir este professor?')) {
            BD.deletar(tabela, id);
            renderizarTabela();
        }
    }

    // Event Listeners
    $form.on('submit', salvar);

    // Inicialização
    renderizarTabela();

    // API pública do módulo
    return {
        abrirModal: abrirModal,
        fecharModal: fecharModal,
        editar: editar,
        excluir: excluir
    };
})();
