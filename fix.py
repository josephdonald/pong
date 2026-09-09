import os

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

dashboard_content = '''
                <div class="view-section" id="view-dashboard">
                    <div class="dashboard-welcome">
                        <h1>Bem-vindo ao PONG</h1>
                        <p>Sistema de Gestão de Alunos e Aulas MVP</p>
                        <div class="dashboard-cards">
                            <div class="card" onclick="$('[data-route=\\\'professores\\\']').click()">
                                <i class="fa-solid fa-chalkboard-user"></i>
                                <h3>Gerenciar Professores</h3>
                            </div>
                            <div class="card" onclick="$('[data-route=\\\'alunos\\\']').click()">
                                <i class="fa-solid fa-user-graduate"></i>
                                <h3>Gerenciar Alunos</h3>
                            </div>
                            <div class="card" onclick="$('[data-route=\\\'turmas\\\']').click()">
                                <i class="fa-solid fa-people-group"></i>
                                <h3>Gerenciar Turmas</h3>
                            </div>
                            <div class="card" onclick="$('[data-route=\\\'disciplinas\\\']').click()">
                                <i class="fa-solid fa-book"></i>
                                <h3>Gerenciar Disciplinas</h3>
                            </div>
                        </div>
                    </div>
                </div>
'''

views_to_inject = ['professores', 'alunos', 'turmas', 'disciplinas', 'frequencia']
all_views_html = dashboard_content

for view in views_to_inject:
    with open(f'views/{view}.html', 'r', encoding='utf-8') as f:
        content = f.read()
    all_views_html += f'\n<div class="view-section" id="view-{view}" style="display: none;">\n{content}\n</div>\n'

start_idx = index_content.find('<div id="content-area" class="content-area">') + len('<div id="content-area" class="content-area">')
end_idx = index_content.find('            </div>\n        </main>')
new_index = index_content[:start_idx] + '\n' + all_views_html + index_content[end_idx:]

script_tags = '\n'.join([f'    <script src="js/{view}.js"></script>' for view in views_to_inject])
script_insertion_point = new_index.find('</body>')
new_index = new_index[:script_insertion_point] + script_tags + '\n' + new_index[script_insertion_point:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_index)

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

new_carregar_view = '''
    function carregarView(nomeView) {
        $('.view-section').hide();
        $('#view-' + nomeView).show();
    }
'''

start_cv = app_js.find('function carregarView(nomeView) {')
end_cv = app_js.find('    // Variáveis globais para funções utilitárias')

if start_cv != -1 and end_cv != -1:
    new_app_js = app_js[:start_cv] + new_carregar_view + '\n' + app_js[end_cv:]
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(new_app_js)
else:
    print('Failed to find carregarView in app.js')
