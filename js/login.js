// js/login.js

// Verifica se já está logado
if (localStorage.getItem('sessao_ativa')) {
    window.location.href = 'index.html';
}

function showPane(paneId) {
    $('.auth-pane').removeClass('active');
    $(`#${paneId}`).addClass('active');
    $('#msg-box').hide();
    $('form').trigger("reset");
}

function showMsg(text, type) {
    $('#msg-box').removeClass('error success').addClass(type).text(text).fadeIn();
}

$(document).ready(function() {
    
    // Login
    $('#form-login').on('submit', function(e) {
        e.preventDefault();
        const email = $('#login-email').val().trim();
        const senha = $('#login-senha').val();
        
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const user = usuarios.find(u => u.email === email && u.senha === senha);
        
        if (user) {
            localStorage.setItem('sessao_ativa', user.id);
            window.location.href = 'index.html';
        } else {
            showMsg('E-mail ou senha inválidos.', 'error');
        }
    });

    // Cadastro
    $('#form-cadastro').on('submit', function(e) {
        e.preventDefault();
        const nome = $('#cad-nome').val().trim();
        const email = $('#cad-email').val().trim();
        const senha = $('#cad-senha').val();
        
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        
        if (usuarios.find(u => u.email === email)) {
            showMsg('Este e-mail já está em uso.', 'error');
            return;
        }
        
        const novoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        const novoUser = { id: novoId, nome, email, senha, telefone: '' };
        
        usuarios.push(novoUser);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Loga automaticamente
        localStorage.setItem('sessao_ativa', novoId);
        window.location.href = 'index.html';
    });

    // Recuperar
    $('#form-recuperar').on('submit', function(e) {
        e.preventDefault();
        const email = $('#rec-email').val().trim();
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const user = usuarios.find(u => u.email === email);
        
        if (user) {
            // Em um sistema real, enviaria e-mail. Aqui exibimos na tela para simular.
            showMsg(`Simulação: Sua senha é "${user.senha}"`, 'success');
        } else {
            showMsg('E-mail não encontrado.', 'error');
        }
    });
});
