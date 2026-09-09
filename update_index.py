import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Navigation
nav_insert = '''
                    <li><a href="#" data-route="unidades"><i class="fa-solid fa-building"></i> Unidades Educacionais</a></li>
                    <li><a href="#" data-route="cursos"><i class="fa-solid fa-graduation-cap"></i> Cursos</a></li>'''

if 'data-route="unidades"' not in html:
    html = html.replace('<li><a href="#" data-route="frequencia"><i class="fa-solid fa-clipboard-user"></i> Frequência</a></li>',
                        '<li><a href="#" data-route="frequencia"><i class="fa-solid fa-clipboard-user"></i> Frequência</a></li>' + nav_insert)


# 2. Update Dashboard View
dashboard_new = '''
<div class="view-section" id="view-dashboard">
    <div class="page-header">
        <h2><i class="fa-solid fa-chart-line"></i> Dashboard</h2>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div class="card" style="border-left: 4px solid var(--primary-color);">
            <h3>Alunos</h3>
            <p id="dash-alunos" style="font-size: 2.5rem; font-weight: bold; color: var(--primary-color);">0</p>
        </div>
        <div class="card" style="border-left: 4px solid var(--secondary-color);">
            <h3>Professores</h3>
            <p id="dash-professores" style="font-size: 2.5rem; font-weight: bold; color: var(--secondary-color);">0</p>
        </div>
        <div class="card" style="border-left: 4px solid var(--warning);">
            <h3>Turmas</h3>
            <p id="dash-turmas" style="font-size: 2.5rem; font-weight: bold; color: var(--warning);">0</p>
        </div>
        <div class="card" style="border-left: 4px solid var(--danger);">
            <h3>Disciplinas</h3>
            <p id="dash-disciplinas" style="font-size: 2.5rem; font-weight: bold; color: var(--danger);">0</p>
        </div>
    </div>
    
    <h3>Acesso Rápido</h3>
    <div class="dashboard-cards" style="margin-top: 15px;">
        <div class="card" onclick="$('[data-route=\\'unidades\\']').click()"><i class="fa-solid fa-building"></i><h3>Unidades</h3></div>
        <div class="card" onclick="$('[data-route=\\'cursos\\']').click()"><i class="fa-solid fa-graduation-cap"></i><h3>Cursos</h3></div>
        <div class="card" onclick="$('[data-route=\\'frequencia\\']').click()"><i class="fa-solid fa-clipboard-user"></i><h3>Frequência</h3></div>
    </div>
</div>
'''

import re
# Remove the old dashboard section and replace with the new one
html = re.sub(r'<div class="view-section" id="view-dashboard">.*?</div>\s*</div>', dashboard_new + '\n</div>', html, flags=re.DOTALL)


# 3. Inject new views
views_to_inject = ['unidades', 'cursos']

all_views_html = ''
for view in views_to_inject:
    if f'id="view-{view}"' not in html:
        # Load from views folder (I need to create them first or just define them here)
        pass

# I'll define the HTML for the new views directly here to avoid multiple file reads/writes
unidades_html = '''
<div class="page-header">
    <h2><i class="fa-solid fa-building"></i> Gestão de Unidades Educacionais</h2>
    <button class="btn btn-primary" onclick="Unidades.abrirModal()"><i class="fa-solid fa-plus"></i> Nova Unidade</button>
</div>

<div class="table-container">
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Nome da Unidade</th>
                <th>Cidade/UF</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody id="unidades-tbody"></tbody>
    </table>
</div>

<div class="modal-overlay" id="modal-unidade">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modal-unidade-title">Nova Unidade</h3>
            <button class="close-modal" onclick="Unidades.fecharModal()">&times;</button>
        </div>
        <form id="form-unidade">
            <input type="hidden" id="uni-id">
            <div class="form-group">
                <label for="uni-nome">Nome da Unidade</label>
                <input type="text" id="uni-nome" required>
            </div>
            <div class="form-group">
                <label for="uni-endereco">Endereço</label>
                <input type="text" id="uni-endereco" required>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label for="uni-cidade">Cidade</label>
                    <input type="text" id="uni-cidade" required>
                </div>
                <div class="form-group">
                    <label for="uni-uf">UF</label>
                    <input type="text" id="uni-uf" maxlength="2" required style="text-transform: uppercase;">
                </div>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button type="button" class="btn" onclick="Unidades.fecharModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    </div>
</div>
'''

cursos_html = '''
<div class="page-header">
    <h2><i class="fa-solid fa-graduation-cap"></i> Gestão de Cursos</h2>
    <button class="btn btn-primary" onclick="Cursos.abrirModal()"><i class="fa-solid fa-plus"></i> Novo Curso</button>
</div>

<div class="table-container">
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Nome do Curso</th>
                <th>Coordenador</th>
                <th>Unidade Educacional</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody id="cursos-tbody"></tbody>
    </table>
</div>

<div class="modal-overlay" id="modal-curso">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modal-curso-title">Novo Curso</h3>
            <button class="close-modal" onclick="Cursos.fecharModal()">&times;</button>
        </div>
        <form id="form-curso">
            <input type="hidden" id="cur-id">
            <div class="form-group">
                <label for="cur-nome">Nome do Curso</label>
                <input type="text" id="cur-nome" required>
            </div>
            <div class="form-group">
                <label for="cur-coord">Nome do Coordenador</label>
                <input type="text" id="cur-coord" required>
            </div>
            <div class="form-group">
                <label for="cur-unidade">Unidade Educacional</label>
                <select id="cur-unidade" required></select>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button type="button" class="btn" onclick="Cursos.fecharModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    </div>
</div>
'''

if 'id="view-unidades"' not in html:
    start_idx = html.find('            </div>\n        </main>')
    inject = f'<div class="view-section" id="view-unidades" style="display: none;">\n{unidades_html}\n</div>\n<div class="view-section" id="view-cursos" style="display: none;">\n{cursos_html}\n</div>\n'
    html = html[:start_idx] + inject + html[start_idx:]

# 4. Inject script tags
scripts_to_add = ['js/dashboard.js', 'js/unidades.js', 'js/cursos.js']
for script in scripts_to_add:
    if script not in html:
        html = html.replace('</body>', f'    <script src="{script}"></script>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
