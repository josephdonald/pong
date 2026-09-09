// js/app.js
// Arquivo principal de controle do layout, tema e roteamento SPA

$(document).ready(function() {

    // ==============================================================
    // 1. Controle de Dark Mode
    // ==============================================================
    const $toggleInput = $('#darkModeToggle');
    const temaSalvo = localStorage.getItem('theme');

    if (temaSalvo) {
        document.documentElement.setAttribute('data-theme', temaSalvo);
        if (temaSalvo === 'dark') $toggleInput.prop('checked', true);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        $toggleInput.prop('checked', true);
    }

    $toggleInput.on('change', function() {
        const novoTema = this.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', novoTema);
        localStorage.setItem('theme', novoTema);
    });

    // ==============================================================
    // 2. Menu Mobile
    // ==============================================================
    $('#mobile-menu-btn').on('click', function() {
        $('#sidebar').toggleClass('active');
    });

    $(document).on('click', function(e) {
        if ($(window).width() <= 768) {
            if (!$(e.target).closest('#sidebar').length && !$(e.target).closest('#mobile-menu-btn').length) {
                $('#sidebar').removeClass('active');
            }
        }
    });

    // Proteção de rota
    if (!localStorage.getItem('sessao_ativa')) {
        window.location.href = 'login.html';
    }

    // ==============================================================
    // 3. Roteamento SPA - cliques no menu lateral
    // ==============================================================
    $('.sidebar-nav a[data-route]').on('click', function(e) {
        e.preventDefault();
        const rota = $(this).data('route');
        App.navegarPara(rota);
    });

    // Evento de Logout
    $('#btn-logout').on('click', function() {
        localStorage.removeItem('sessao_ativa');
        window.location.href = 'login.html';
    });

    // ==============================================================
    // 4. Funções utilitárias globais (window.App)
    // ==============================================================
    window.App = {
        // Navega para uma rota, mostrando a view correspondente
        navegarPara: function(rota) {
            // Atualiza classe active no menu
            $('.sidebar-nav a').removeClass('active');
            $(`.sidebar-nav a[data-route="${rota}"]`).addClass('active');

            // Fecha sidebar mobile
            $('#sidebar').removeClass('active');

            // Mostra a view correta e esconde as demais
            $('.view-section').hide();
            $(`#view-${rota}`).show();

            // Re-inicializa módulos com dados dinâmicos ao navegar para eles
            if (rota === 'frequencia' && typeof Frequencia !== 'undefined') {
                Frequencia.inicializar();
            }
            if (rota === 'planosAula' && typeof PlanosAula !== 'undefined') {
                PlanosAula.inicializar();
            }

            // Atualiza o dashboard sempre que ele for exibido
            if (rota === 'dashboard' && typeof Dashboard !== 'undefined') {
                Dashboard.atualizar();
            }
        }
    };

});

