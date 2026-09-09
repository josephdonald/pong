// js/alunos.js

var Alunos = (function() {
    const tabela = 'alunos';
    const $tbody = $('#alunos-tbody');
    const $modal = $('#modal-aluno');
    const $form = $('#form-aluno');

    function renderizarTabela() {
        const registros = BD.lerTodos(tabela);
        $tbody.empty();

        if (registros.length === 0) {
            $tbody.append('<tr><td colspan="5" style="text-align:center;">Nenhum aluno cadastrado.</td></tr>');
            return;
        }

        registros.forEach(reg => {
            $tbody.append(`
                <tr>
                    <td>${reg.matricula}</td>
                    <td>${reg.nome}</td>
                    <td>${reg.email}</td>
                    <td>${reg.telefone}</td>
                    <td class="action-btns">
                        <button class="btn btn-secondary" onclick="Alunos.editar(${reg.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" onclick="Alunos.excluir(${reg.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });

        if(typeof Dashboard !== 'undefined') Dashboard.atualizar();
    }

    function abrirModal(id = null) {
        $form[0].reset();
        $('#aluno-id').val('');
        $('#modal-aluno-title').text('Novo Aluno');

        if (id) {
            const reg = BD.lerPorId(tabela, id);
            if (reg) {
                $('#aluno-id').val(reg.id);
                $('#aluno-matricula').val(reg.matricula);
                $('#aluno-nome').val(reg.nome);
                $('#aluno-email').val(reg.email);
                $('#aluno-telefone').val(reg.telefone);
                $('#modal-aluno-title').text('Editar Aluno');
            }
        }

        $modal.addClass('active');
    }

    function fecharModal() {
        $modal.removeClass('active');
    }

    function salvar(e) {
        e.preventDefault();
        
        const id = $('#aluno-id').val();
        const dados = {
            matricula: $('#aluno-matricula').val(),
            nome: $('#aluno-nome').val(),
            email: $('#aluno-email').val(),
            telefone: $('#aluno-telefone').val()
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
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
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
