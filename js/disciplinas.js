// js/disciplinas.js
// Módulo responsável pelo CRUD de Disciplinas, incluindo notas, turma e horários

var Disciplinas = (function() {
    const tabela = 'disciplinas';
    const $tbody = $('#disciplinas-tbody');
    const $modal = $('#modal-disciplina');
    const $form = $('#form-disciplina');
    const $modalNotas = $('#modal-notas');
    
    let disciplinaAtualId = null;
    let alunosVinculadosIds = [];

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
        const alunos = BD.lerTodos('alunos');
        const cursos = BD.lerTodos('cursos');
        const turmas = BD.lerTodos('turmas');

        const $selectCurso = $('#disc-curso');
        $selectCurso.empty().append('<option value="">Selecione um Curso...</option>');
        cursos.forEach(c => $selectCurso.append(`<option value="${c.id}">${c.nome}</option>`));

        const $selectTurma = $('#disc-turma');
        $selectTurma.empty().append('<option value="">Selecione uma Turma...</option>');
        turmas.forEach(t => $selectTurma.append(`<option value="${t.id}">${t.codigo} - ${t.turno}</option>`));

        $('#disc-aluno-disponivel').empty();
    }

    // Abre o modal de criação/edição
    function abrirModal(id = null) {
        $form[0].reset();
        $('#disc-id').val('');
        $('#modal-disciplina-title').text('Nova Disciplina');
        alunosVinculadosIds = [];
        $('#disc-novo-aluno').prop('hidden', true).find('input').prop('disabled', true).val('');
        $('#disc-toggle-novo-aluno').attr('aria-expanded', 'false');
        carregarSelects();

        if (id) {
            const reg = BD.lerPorId(tabela, id);
            if (reg) {
                $('#disc-id').val(reg.id);
                $('#disc-nome').val(reg.nome);
                $('#disc-curso').val(reg.cursoId);
                $('#disc-turma').val(reg.turmaId);
                $('#disc-sala').val(reg.sala);
                $('#disc-ch').val(reg.cargaHoraria);
                $('#disc-horario-inicio').val(reg.horarioInicio || '');
                $('#disc-horario-fim').val(reg.horarioFim || '');
                $('#disc-descricao').val(reg.descricao || '');
                alunosVinculadosIds = Array.isArray(reg.alunosIds) ? [...reg.alunosIds] : [];
                $('#modal-disciplina-title').text('Editar Disciplina');
            }
        }

        renderizarAlunosVinculados();
        $modal.addClass('active');
    }

    // Fecha o modal de disciplinas
    function fecharModal() {
        $modal.removeClass('active');
    }

    function renderizarAlunosVinculados() {
        const $lista = $('#disc-alunos-vinculados').empty();
        const alunos = BD.lerTodos('alunos');
        const idsVinculados = new Set(alunosVinculadosIds.map(String));
        const alunosVinculados = alunos.filter(aluno => idsVinculados.has(String(aluno.id)));
        const $disponiveis = $('#disc-aluno-disponivel').empty();
        const alunosDisponiveis = alunos.filter(aluno => !idsVinculados.has(String(aluno.id)));

        if (alunosDisponiveis.length === 0) {
            $disponiveis.append('<option value="">Todos os alunos já estão vinculados</option>');
        } else {
            $disponiveis.append('<option value="">Selecione um aluno...</option>');
            alunosDisponiveis.forEach(aluno => {
                $disponiveis.append(`<option value="${aluno.id}">${aluno.matricula} - ${aluno.nome}</option>`);
            });
        }

        if (alunosVinculados.length === 0) {
            $lista.append($('<li>').text('Nenhum aluno vinculado.'));
            return;
        }

        alunosVinculados.forEach(aluno => {
            const alunoId = aluno.id;
            const nomeAluno = `${aluno.matricula} - ${aluno.nome}`;
            const $item = $('<li>').css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '6px 0' });
            const $remover = $('<button>', {
                type: 'button',
                class: 'btn btn-danger',
                title: `Remover ${nomeAluno} apenas desta disciplina`,
                'aria-label': `Remover ${nomeAluno} apenas desta disciplina`
            }).append('<i class="fa-solid fa-user-minus"></i>');

            $item.append($('<span>').text(nomeAluno), $remover);
            $remover.on('click', function() {
                if (!confirm(`Remover ${nomeAluno} apenas desta disciplina? O aluno continuará na lista geral.`)) return;

                alunosVinculadosIds = alunosVinculadosIds.filter(id => id != alunoId);
                renderizarAlunosVinculados();
            });
            $lista.append($item);
        });
    }

    function vincularAlunoExistente() {
        const alunoId = parseInt($('#disc-aluno-disponivel').val());
        if (!alunoId || alunosVinculadosIds.some(id => id == alunoId)) return;

        alunosVinculadosIds.push(alunoId);
        renderizarAlunosVinculados();
    }

    function alternarCadastroAluno() {
        const $cadastro = $('#disc-novo-aluno');
        const mostrar = $cadastro.prop('hidden');
        $cadastro.prop('hidden', !mostrar);
        $cadastro.find('input').prop('disabled', !mostrar);
        $('#disc-toggle-novo-aluno').attr('aria-expanded', String(mostrar));

        if (mostrar) $('#disc-novo-aluno-nome').trigger('focus');
    }

    function adicionarAluno() {
        const $campos = $('#disc-novo-aluno input');
        for (const campo of $campos.toArray()) {
            if (!campo.reportValidity()) return;
        }

        const aluno = BD.criar('alunos', {
            matricula: $('#disc-novo-aluno-matricula').val().trim(),
            nome: $('#disc-novo-aluno-nome').val().trim(),
            email: $('#disc-novo-aluno-email').val().trim(),
            telefone: $('#disc-novo-aluno-telefone').val().trim()
        });

        alunosVinculadosIds.push(aluno.id);
        renderizarAlunosVinculados();

        if (typeof Alunos !== 'undefined') Alunos.atualizarTabela();

        $('#disc-novo-aluno').prop('hidden', true);
        $campos.prop('disabled', true).val('');
        $('#disc-toggle-novo-aluno').attr('aria-expanded', 'false');
    }

    // Salva (cria ou atualiza) uma disciplina
    function salvar(e) {
        e.preventDefault();
        
        const id = $('#disc-id').val();
        const alunosSelecionados = [...alunosVinculadosIds];

        const registroAnterior = id ? BD.lerPorId(tabela, id) : {};

        const dados = {
            nome: $('#disc-nome').val(),
            cursoId: parseInt($('#disc-curso').val()),
            turmaId: parseInt($('#disc-turma').val()),
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
        abrirModalNotas, fecharModalNotas, salvarNotas,
        alternarCadastroAluno, adicionarAluno, vincularAlunoExistente
    };
})();
