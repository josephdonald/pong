import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Sidebar Link
html = html.replace(
    '<li><a href="#" data-route="professores"><i class="fa-solid fa-chalkboard-user"></i> Professores</a></li>',
    '<li><a href="#" data-route="perfil"><i class="fa-solid fa-user"></i> Meu Perfil</a></li>'
)

# 2. Dashboard
html = html.replace(
    '''                    <div class="card" style="border-left:4px solid var(--secondary-color);">
                        <h3>Professores</h3>
                        <p id="dash-professores" style="font-size:2.5rem;font-weight:bold;color:var(--secondary-color);">0</p>
                    </div>\n''',
    ''
)
html = html.replace(
    '''<div class="card" onclick="App.navegarPara('professores')"><i class="fa-solid fa-chalkboard-user"></i><h3>Professores</h3></div>''',
    '''<div class="card" onclick="App.navegarPara('perfil')"><i class="fa-solid fa-user"></i><h3>Meu Perfil</h3></div>'''
)

# 3. View Professores -> View Perfil
perfil_html = '''
            <!-- ================================================ -->
            <!-- VIEW: PERFIL                                      -->
            <!-- ================================================ -->
            <div class="view-section" id="view-perfil" style="display:none;">
                <div class="page-header">
                    <h2><i class="fa-solid fa-user"></i> Meu Perfil</h2>
                </div>
                <div class="card" style="max-width: 600px; margin: 0 auto; padding: 25px;">
                    <form id="form-perfil">
                        <div class="form-group"><label>Nome Completo</label><input type="text" id="perfil-nome" required></div>
                        <div class="form-group"><label>E-mail</label><input type="email" id="perfil-email" required></div>
                        <div class="form-group"><label>Telefone</label><input type="text" id="perfil-telefone" required></div>
                        <div style="text-align:right;margin-top:25px;">
                            <button type="submit" class="btn btn-primary" style="padding: 12px 24px; font-size: 1.1rem;">Salvar Perfil</button>
                        </div>
                    </form>
                </div>
            </div><!-- /view-perfil -->
'''

# Use regex to find and replace the whole view-professores section
pattern = r'<!-- ================================================ -->\s*<!-- VIEW: PROFESSORES\s*-->\s*<!-- ================================================ -->\s*<div class="view-section" id="view-professores".*?</div><!-- /view-professores -->'
html = re.sub(pattern, perfil_html, html, flags=re.DOTALL)

# 4. Disciplinas - Table Header
html = html.replace(
    '<th>Professor</th><th>C/H</th><th>Horário</th><th>Ações</th>',
    '<th>C/H</th><th>Horário</th><th>Ações</th>'
)

# 5. Disciplinas - Modal (remove professor select)
html = html.replace(
    '''                                <div class="form-group"><label>Professor</label><select id="disc-prof" required></select></div>''',
    ''
)
# Adjust grid template columns if necessary, but actually let's just make the C/H take full width or adjust the div
html = html.replace(
    '''<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">\n                                \n                                <div class="form-group"><label>Carga Horária (h)</label><input type="number" id="disc-ch" required min="1"></div>\n                            </div>''',
    '''<div class="form-group"><label>Carga Horária (h)</label><input type="number" id="disc-ch" required min="1"></div>'''
)
# Note: The above replace might be fragile. I'll use regex for the specific block.
disc_ch_pattern = r'<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">\s*<div class="form-group"><label>Professor</label><select id="disc-prof" required></select></div>\s*<div class="form-group"><label>Carga Horária \(h\)</label><input type="number" id="disc-ch" required min="1"></div>\s*</div>'
html = re.sub(disc_ch_pattern, r'<div class="form-group"><label>Carga Horária (h)</label><input type="number" id="disc-ch" required min="1"></div>', html)

# 6. Scripts update
html = html.replace('<script src="js/professores.js"></script>', '<script src="js/perfil.js"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
