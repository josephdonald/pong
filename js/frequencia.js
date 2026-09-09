// js/frequencia.js
// Módulo de gestão de frequência vinculado ao Plano de Aula

var Frequencia = (function() {
    const $selectDisc = $('#freq-disciplina');
    const $selectAula = $('#freq-aula');
    const $container  = $('#freq-container');
    const $emptyState = $('#freq-empty-state');
    const $infoAula   = $('#freq-info-aula');
    const $tbody      = $('#frequencia-tbody');
    const $modalQR    = $('#modal-qrcode');

    // Inicializa os selects de disciplina. Chamado toda vez que a view é aberta.
    function inicializar() {
        const disciplinas = BD.lerTodos('disciplinas');

        $selectDisc.empty().append('<option value="">Selecione a disciplina...</option>');
        disciplinas.forEach(d => {
            $selectDisc.append(`<option value="${d.id}">${d.nome}</option>`);
        });

        // Remove listeners antigos antes de adicionar novos para evitar duplicação
        $selectDisc.off('change').on('change', carregarAulas);
        $selectAula.off('change').on('change', carregarChamada);

        // Reseta estado da tela
        $selectAula.empty().append('<option value="">Selecione a disciplina primeiro...</option>');
        $container.hide();
        $emptyState.show();
    }

    function inicializarComDados(discId, aulaId) {
        inicializar();
        $selectDisc.val(discId);
        carregarAulas();
        $selectAula.val(aulaId);
        carregarChamada();
    }

    // Ao escolher a disciplina, carrega as aulas (planos de aula) dela
    function carregarAulas() {
        const discId = $selectDisc.val();
        $selectAula.empty();
        $container.hide();
        $emptyState.show();

        if (!discId) {
            $selectAula.append('<option value="">Selecione a disciplina primeiro...</option>');
            return;
        }

        const planos = BD.lerTodos('planosAula')
            .filter(p => p.disciplinaId == discId)
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        if (planos.length === 0) {
            $selectAula.append('<option value="">Nenhuma aula cadastrada no plano de aula</option>');
            return;
        }

        $selectAula.append('<option value="">Selecione a aula...</option>');
        planos.forEach(p => {
            const dataFmt = new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR');
            $selectAula.append(`<option value="${p.id}">${p.titulo} — ${dataFmt}</option>`);
        });
    }

    // Carrega a chamada da aula selecionada
    function carregarChamada() {
        const discId  = $selectDisc.val();
        const aulaId  = $selectAula.val();

        if (!discId || !aulaId) {
            $container.hide();
            $emptyState.show();
            return;
        }

        const disc  = BD.lerPorId('disciplinas', discId);
        const aula  = BD.lerPorId('planosAula', aulaId);
        const alunos = BD.lerTodos('alunos');

        // Mostra info resumida da aula
        const dataFmt = new Date(aula.data + 'T00:00:00').toLocaleDateString('pt-BR');
        $infoAula.html(`<strong>${aula.titulo}</strong> &mdash; ${dataFmt}`);

        $emptyState.hide();
        $container.show();
        $tbody.empty();

        if (!disc.alunosIds || disc.alunosIds.length === 0) {
            $tbody.append('<tr><td colspan="5" style="text-align:center;">Nenhum aluno matriculado nesta disciplina.</td></tr>');
            return;
        }

        // Frequência salva por chave: disciplinaId_aulaId
        const chave = `${discId}_${aulaId}`;
        const registros = BD.lerTodos('frequencias');
        const chamada = registros.find(r => r.chave === chave);
        const dadosChamada = chamada ? chamada.dados : {};

        disc.alunosIds.forEach(alunoId => {
            const aluno = alunos.find(a => a.id == alunoId);
            if (!aluno) return;
            const status = dadosChamada[alunoId] || '';

            $tbody.append(`
                <tr data-alunoid="${aluno.id}">
                    <td>${aluno.matricula}</td>
                    <td>${aluno.nome}</td>
                    <td style="text-align:center;"><input type="radio" name="freq_${aluno.id}" value="P" ${status === 'P' ? 'checked' : ''} style="transform:scale(1.5);"></td>
                    <td style="text-align:center;"><input type="radio" name="freq_${aluno.id}" value="A" ${status === 'A' ? 'checked' : ''} style="transform:scale(1.5);"></td>
                    <td style="text-align:center;"><input type="radio" name="freq_${aluno.id}" value="J" ${status === 'J' ? 'checked' : ''} style="transform:scale(1.5);"></td>
                </tr>
            `);
        });
    }

    // Salva a chamada oral vinculada à aula específica
    function salvarChamadaOral() {
        const discId = $selectDisc.val();
        const aulaId = $selectAula.val();
        if (!discId || !aulaId) return;

        const chave = `${discId}_${aulaId}`;
        let registros = BD.lerTodos('frequencias');
        const existenteIdx = registros.findIndex(r => r.chave === chave);

        const dadosChamada = {};
        $('#frequencia-tbody tr').each(function() {
            const alunoId = $(this).data('alunoid');
            const status = $(this).find(`input[name="freq_${alunoId}"]:checked`).val();
            if (status) dadosChamada[alunoId] = status;
        });

        const registro = { id: existenteIdx !== -1 ? registros[existenteIdx].id : null, chave, disciplinaId: parseInt(discId), aulaId: parseInt(aulaId), dados: dadosChamada };

        if (existenteIdx !== -1) {
            registros[existenteIdx] = registro;
        } else {
            registro.id = registros.length > 0 ? Math.max(...registros.map(r => r.id || 0)) + 1 : 1;
            registros.push(registro);
        }

        localStorage.setItem('frequencias', JSON.stringify(registros));

        // Atualiza status do plano de aula para "ministrada"
        const plano = BD.lerPorId('planosAula', aulaId);
        if (plano && plano.status !== 'ministrada') {
            plano.status = 'ministrada';
            BD.atualizar('planosAula', aulaId, plano);
        }

        alert('Chamada salva com sucesso!');
        App.navegarPara('planosAula');
    }

    // Gera o QR Code para auto-chamada dos alunos
    function gerarQRCode() {
        const discId = $selectDisc.val();
        const aulaId = $selectAula.val();
        if (!discId || !aulaId) {
            alert('Selecione a disciplina e a aula primeiro.');
            return;
        }

        let urlBase = window.location.href.split('index.html')[0];
        if (!urlBase.endsWith('/')) urlBase += '/';
        const urlCompleta = `${urlBase}aluno-auth.html?disc=${discId}&aula=${aulaId}`;

        $('#link-simulacao-qr').attr('href', urlCompleta).text(urlCompleta);
        $modalQR.addClass('active');
    }

    function fecharModalQRCode() {
        $modalQR.removeClass('active');
        carregarChamada();
    }

    // Inicialização
    inicializar();

    return { inicializar, inicializarComDados, salvarChamadaOral, gerarQRCode, fecharModalQRCode };
})();
