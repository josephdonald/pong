// js/aluno-auth.js
// Tela de auto-registro de presença via QR Code com validação por e-mail (2FA simulado)

$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const discId = urlParams.get('disc');
    const aulaId = urlParams.get('aula');

    const $infoAula = $('#info-aula');
    const $form     = $('#form-auth');
    const $msgBox   = $('#mensagem-box');
    const $btn      = $('#btn-submit');

    if (!discId || !aulaId) {
        mostrarMensagem('URL inválida. Por favor, escaneie o QR Code novamente.', 'error');
        $form.hide();
        $infoAula.text('Dados insuficientes.');
        return;
    }

    const disciplina = BD.lerPorId('disciplinas', discId);
    const aula = BD.lerPorId('planosAula', aulaId);

    if (!disciplina || !aula) {
        mostrarMensagem('Disciplina ou aula não encontrada.', 'error');
        $form.hide();
        $infoAula.text('Erro na validação.');
        return;
    }

    // Formatar a data para PT-BR
    const dataFmt = new Date(aula.data + 'T00:00:00').toLocaleDateString('pt-BR');
    $infoAula.html(`Disciplina: <strong>${disciplina.nome}</strong><br>Aula: <strong>${aula.titulo}</strong><br>Data: <strong>${dataFmt}</strong>`);

    $form.on('submit', function(e) {
        e.preventDefault();
        $btn.prop('disabled', true).text('Validando...');
        $msgBox.hide();

        const matricula = $('#aluno-matricula').val().trim();
        const email = $('#aluno-email').val().trim();

        // Valida as credenciais do aluno no BD Mock
        const aluno = BD.lerTodos('alunos').find(a => a.matricula === matricula && a.email === email);

        if (!aluno) {
            mostrarMensagem('Credenciais inválidas. Verifique sua matrícula e e-mail.', 'error');
            $btn.prop('disabled', false).text('Confirmar Presença');
            return;
        }

        if (!disciplina.alunosIds || !disciplina.alunosIds.includes(aluno.id)) {
            mostrarMensagem('Você não está matriculado nesta disciplina.', 'error');
            $btn.prop('disabled', false).text('Confirmar Presença');
            return;
        }

        // Registra a presença na tabela de frequências (nova estrutura com chave)
        const chave = `${discId}_${aulaId}`;
        let registros = JSON.parse(localStorage.getItem('frequencias')) || [];
        const existenteIdx = registros.findIndex(r => r.chave === chave);

        if (existenteIdx !== -1) {
            registros[existenteIdx].dados[aluno.id] = 'P';
        } else {
            const novoId = registros.length > 0 ? Math.max(...registros.map(r => r.id || 0)) + 1 : 1;
            registros.push({ id: novoId, chave, disciplinaId: parseInt(discId), aulaId: parseInt(aulaId), dados: { [aluno.id]: 'P' } });
        }

        localStorage.setItem('frequencias', JSON.stringify(registros));

        $form.hide();
        mostrarMensagem('<i class="fa-solid fa-circle-check" style="font-size:2rem;margin-bottom:10px;display:block;"></i>Presença registrada com sucesso! Você pode fechar esta tela.', 'success');
    });

    function mostrarMensagem(texto, tipo) {
        $msgBox.removeClass('msg-success msg-error').addClass(`msg-${tipo}`).html(texto).fadeIn();
    }
});
