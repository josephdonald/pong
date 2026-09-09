import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<input type="text" id="turma-curso" required>', '<select id="turma-curso" required></select>')
html = html.replace('<input type="text" id="turma-unidade" required>', '<select id="turma-unidade" required></select>')
html = html.replace('<input type="text" id="disc-curso" required>', '<select id="disc-curso" required></select>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
