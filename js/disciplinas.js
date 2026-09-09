// js/disciplinas.js
// Módulo responsável pelo CRUD de Disciplinas, incluindo notas, turma e horários

var Disciplinas = (function() {
    const tabela = 'disciplinas';
    const $tbody = $('#disciplinas-tbody');
    const $modal = $('#modal-disciplina');
    const $form = $('#form-disciplina');
    const $modalNotas = $('#modal-notas');
    
    let disciplinaAtualId = null;

    // Renderiza a tabela de disciplinas com dados relacionados
    function renderizarTabela() {
        const registros = BD.lerTodos(tabela);
        const professores = BD.lerTodos('professores');
        const cursos = BD.lerTodos('cursos');
        const turmas = BD.lerTodos('turmas');
        
        $tbody.empty();

        if (registros.length === 0) {
            $tbody.append('<tr><td colspan="8" style="text-align:center;">Nenhuma disciplina cadastrada.</td></tr>');
            return;
        }

        registros.forEach(reg => {
            const prof = professores.find(p => p.id == reg.professorId);
            const profNome = prof ? prof.nome : 'Desconhecido';
            
            const cur = cursos.find(c => c.id == reg.cursoId);
            const curNome = cur ? cur.nome : (reg.curso || 'Desconhecido');

            const tur = turmas.find(t => t.id == reg.turmaId);
            const turNome = tur ? tur.codigo : '-';

            const horario = (reg.horarioInicio && reg.horarioFim) ? `${reg.horarioInicio} - ${reg.horarioFim}` : '-';

            $tbody.append(`
                <tr>
                    <td>${reg.id}</td>
                    <td>${reg.nome}</td>
                    <td>${curNome}</td>
                    <td>${turNome}</td>
                    <td>${profNome}</td>
                    <td>${reg.cargaHoraria}h</td>
                    <td>${horario}</td>
                    <td class="action-btns">
                        <button class="btn btn-secondary" onclick="Disciplinas.editar(${reg.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-primary" onclick="Disciplinas.abrirModalNotas(${reg.id})" title="Lançar Notas"><i class="fa-solid fa-star-half-stroke"></i></button>
                        <button class="btn btn-danger" onclick="Disciplinas.excluir(${reg.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });

        if (typeof Dashboard !== 'undefined') Dashboard.atualizar();
    }

    // Carrega todos os selects do formulário com dados do BD Mock
    function carregarSelects() {
        const profs = BD.lerTodos('professores');
        const alunos = BD.lerTodos('alunos');
        const cursos = BD.lerTodos('cursos');
        const turmas = BD.lerTodos('turmas');

        const $selectProf = $('#disc-prof');
        $selectProf.empty().append('<option value="">Selecione um Professor...</option>');
        profs.forEach(p => $selectProf.append(`<option value="${p.id}">${p.nome}</option>`));
        
        const $selectCurso = $('#disc-curso');
        $selectCurso.empty().append('<option value="">Selecione um Curso...</option>');
        cursos.forEach(c => $selectCurso.append(`<option value="${c.id}">${c.nome}</option>`));

        const $selectTurma = $('#disc-turma');
        $selectTurma.empty().append('<option value="">Selecione uma Turma...</option>');
        turmas.forEach(t => $selectTurma.append(`<option value="${t.id}">${t.codigo} - ${t.turno}</option>`));

        const $selectAlunos = $('#disc-alunos');
        $selectAlunos.empty();
        alunos.forEach(a => $selectAlunos.append(`<option value="${a.id}">${a.matricula} - ${a.nome}</option>`));
    }

    // Abre o modal de criação/edição
    function abrirModal(id = null) {
        $form[0].reset();
        $('#disc-id').val('');
        $('#modal-disciplina-title').text('Nova Disciplina');
        carregarSelects();

        if (id) {
            const reg = BD.lerPorId(tabela, id);
            if (reg) {
                $('#disc-id').val(reg.id);
                $('#disc-nome').val(reg.nome);
                $('#disc-curso').val(reg.cursoId);
                $('#disc-turma').val(reg.turmaId);
                $('#disc-prof').val(reg.professorId);
                $('#disc-sala').val(reg.sala);
                $('#disc-ch').val(reg.cargaHoraria);
                $('#disc-horario-inicio').val(reg.horarioInicio || '');
                $('#disc-horario-fim').val(reg.horarioFim || '');
                $('#disc-descricao').val(reg.descricao || '');
                $('#disc-alunos').val(reg.alunosIds || []);
                $('#modal-disciplina-title').text('Editar Disciplina');
            }
        }

        $modal.addClass('active');
    }

    // Fecha o modal de disciplinas
    function fecharModal() {
        $modal.removeClass('active');
    }

    // Salva (cria ou atualiza) uma disciplina
    function salvar(e) {
        e.preventDefault();
        
        const id = $('#disc-id').val();
        const alunosSelecionados = ($('#disc-alunos').val() || []).map(val => parseInt(val));

        const registroAnterior = id ? BD.lerPorId(tabela, id) : {};

        const dados = {
            nome: $('#disc-nome').val(),
            cursoId: parseInt($('#disc-curso').val()),
            turmaId: parseInt($('#disc-turma').val()),
            professorId: parseInt($('#disc-prof').val()),
            sala: $('#disc-sala').val(),
            cargaHoraria: parseInt($('#disc-ch').val()),
            horarioInicio: $('#disc-horario-inicio').val(),
            horarioFim: $('#disc-horario-fim').val(),
            descricao: $('#disc-descricao').val(),
            alunosIds: alunosSelecionados,
            notas: registroAnterior.notas || {}
        };

        if (id) {
            BD.atualizar(tabela, id, dados);
        } else {
            BD.criar(tabela, dados);
        }

        fecharModal();
        renderizarTabela();
    }

    function editar(id) { abrirModal(id); }

    function excluir(id) {
        if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
            // Remove também os planos de aula vinculados
            let planos = BD.lerTodos('planosAula').filter(p => p.disciplinaId != id);
            localStorage.setItem('planosAula', JSON.stringify(planos));
            BD.deletar(tabela, id);
            renderizarTabela();
        }
    }

    // ==================== NOTAS ====================

    function abrirModalNotas(id) {
        disciplinaAtualId = id;
        const disc = BD.lerPorId(tabela, id);
        const todosAlunos = BD.lerTodos('alunos');
        
        $('#notas-disc-nome').text(disc.nome);
        const $tbodyNotas = $('#notas-tbody');
        $tbodyNotas.empty();

        if (!disc.alunosIds || disc.alunosIds.length === 0) {
            $tbodyNotas.append('<tr><td colspan="5" style="text-align:center;">Nenhum aluno matriculado.</td></tr>');
        } else {
            disc.alunosIds.forEach(alunoId => {
                const aluno = todosAlunos.find(a => a.id == alunoId);
                if (aluno) {
                    const notas = (disc.notas && disc.notas[alunoId]) ? disc.notas[alunoId] : { av1: '', av2: '', reposicao: '', final: '' };
                    $tbodyNotas.append(`
                        <tr data-alunoid="${alunoId}">
                            <td>${aluno.nome}</td>
                            <td><input type="number" step="0.1" min="0" max="10" class="input-nota av1" value="${notas.av1 ?? ''}" style="width:100%;padding:5px;"></td>
                            <td><input type="number" step="0.1" min="0" max="10" class="input-nota av2" value="${notas.av2 ?? ''}" style="width:100%;padding:5px;"></td>
                            <td><input type="number" step="0.1" min="0" max="10" class="input-nota reposicao" value="${notas.reposicao ?? ''}" style="width:100%;padding:5px;"></td>
                            <td><input type="number" step="0.1" min="0" max="10" class="input-nota final" value="${notas.final ?? ''}" style="width:100%;padding:5px;"></td>
                        </tr>
                    `);
                }
            });
        }

        $modalNotas.addClass('active');
    }

    function fecharModalNotas() {
        $modalNotas.removeClass('active');
        disciplinaAtualId = null;
    }

    function salvarNotas() {
        if (!disciplinaAtualId) return;

        const disc = BD.lerPorId(tabela, disciplinaAtualId);
        if (!disc.notas) disc.notas = {};

        $('#notas-tbody tr[data-alunoid]').each(function() {
            const alunoId = $(this).data('alunoid');
            disc.notas[alunoId] = {
                av1: $(this).find('.av1').val() !== '' ? parseFloat($(this).find('.av1').val()) : null,
                av2: $(this).find('.av2').val() !== '' ? parseFloat($(this).find('.av2').val()) : null,
                reposicao: $(this).find('.reposicao').val() !== '' ? parseFloat($(this).find('.reposicao').val()) : null,
                final: $(this).find('.final').val() !== '' ? parseFloat($(this).find('.final').val()) : null
            };
        });

        BD.atualizar(tabela, disciplinaAtualId, disc);
        alert('Notas salvas com sucesso!');
        fecharModalNotas();
    }

    // Event Listeners
    $form.on('submit', salvar);

    // Inicialização
    renderizarTabela();

    return {
        abrirModal, fecharModal, editar, excluir,
        abrirModalNotas, fecharModalNotas, salvarNotas
    };
})();
