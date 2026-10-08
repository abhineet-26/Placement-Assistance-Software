import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Grid item xs={12} sm={6} md={3} -> Grid size={{ xs: 12, sm: 6, md: 3 }}
    content = content.replace('<Grid item xs={12} sm={6} md={3}>', '<Grid size={{ xs: 12, sm: 6, md: 3 }}>')
    content = content.replace('<Grid item xs={12} key={job.id}>', '<Grid size={{ xs: 12 }} key={job.id}>')

    # Unused imports
    content = content.replace('import React from \'react\';\n', '')
    content = content.replace(' Divider,\n', '\n')

    with open(filename, 'w') as f:
        f.write(content)

fix_file('src/pages/company/DashboardPage.tsx')
