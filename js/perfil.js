// js/perfil.js
// Módulo de gestão do Perfil único do Professor

var Perfil = (function() {
    const $form = $('#form-perfil');
    
    function inicializar() {
        const usuarioId = BD.getUsuarioAtivo();
        const prof = BD.lerPorId('usuarios', usuarioId);
        if (prof) {
            $('#perfil-nome').val(prof.nome);
            $('#perfil-email').val(prof.email);
            $('#perfil-telefone').val(prof.telefone || '');
            
            // Atualiza Topbar
            $('.user-name').text(prof.nome);
        }
    }

    function salvar(e) {
        e.preventDefault();
        
        const dados = {
            nome: $('#perfil-nome').val(),
            email: $('#perfil-email').val(),
            telefone: $('#perfil-telefone').val()
        };

        const usuarioId = BD.getUsuarioAtivo();
        BD.atualizar('usuarios', usuarioId, dados);
        alert('Perfil atualizado com sucesso!');
        
        // Atualiza a Topbar instantaneamente
        $('.user-name').text(dados.nome);
    }

    $form.on('submit', salvar);

    // Inicializa ao carregar
    inicializar();

    return {
        inicializar: inicializar
    };
})();
