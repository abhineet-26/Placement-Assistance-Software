import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()
    content = content.replace("const draftJobs = jobs?.filter(j => j.status === 'draft').length || 0;\n", "")
    content = content.replace("import React from 'react';\n", "")
    with open(filename, 'w') as f:
        f.write(content)

fix_file('src/pages/company/DashboardPage.tsx')
fix_file('src/pages/company/JobsPage.tsx')
fix_file('src/pages/company/PostJobPage.tsx')
