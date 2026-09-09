var Dashboard = (function() {
    // Atualiza os contadores do dashboard com os dados do BD Mock
    function atualizar() {
        $('#dash-alunos').text(BD.lerTodos('alunos').length);
        $('#dash-professores').text(BD.lerTodos('professores').length);
        $('#dash-turmas').text(BD.lerTodos('turmas').length);
        $('#dash-disciplinas').text(BD.lerTodos('disciplinas').length);
        $('#dash-cursos').text(BD.lerTodos('cursos').length);
        $('#dash-unidades').text(BD.lerTodos('unidades').length);
    }

    // Inicializa ao carregar a página
    $(document).ready(function() {
        atualizar();
    });

    return { atualizar: atualizar };
})();
