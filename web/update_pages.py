import os
import re

def update_file(path, rel_path_to_components):
    with open(path, 'r') as f:
        content = f.read()

    original = content
    
    # 1. Insert import if not exists
    if 'StatusBadge' not in content:
        # find the last import
        import_match = list(re.finditer(r'^import .*;', content, re.MULTILINE))
        if import_match:
            last_import = import_match[-1]
            content = content[:last_import.end()] + f"\nimport StatusBadge from '{rel_path_to_components}/StatusBadge';" + content[last_import.end():]

    # 2. Replace empty states with emoji
    content = content.replace("You haven't applied to any jobs yet.", "📭 You haven't applied to any jobs yet.")
    content = content.replace("No job opportunities match your criteria.", "🔍 No job opportunities match your criteria.")
    content = content.replace("No jobs found.", "🔍 No jobs found.")
    content = content.replace("No placement updates yet.", "🔔 No placement updates yet.")

    # 3. Simplify card classes
    # Just ensure we have hover:shadow-md transition-shadow
    content = re.sub(r'(className="[^"]*bg-surface[^"]*rounded-lg[^"]*shadow-sm)([^"]*)(")', 
                     lambda m: m.group(1) + m.group(2) + (" hover:shadow-md transition-shadow" if "hover:shadow-md" not in m.group(2) else "") + m.group(3), 
                     content)

    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Updated {path}")

# Run for ApplicationsPage
update_file('src/pages/student/ApplicationsPage.tsx', '../../components')
update_file('src/pages/student/OpportunitiesPage.tsx', '../../components')
update_file('src/pages/company/DashboardPage.tsx', '../../components')
update_file('src/pages/admin/AdminJobsPage.tsx', '../../components')
update_file('src/pages/admin/PendingJobsPage.tsx', '../../components')
update_file('src/pages/admin/JobMatchesPage.tsx', '../../components')
