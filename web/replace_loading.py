import os
import re

skeleton = '(<div className="animate-pulse space-y-4"><div className="h-6 bg-border rounded w-1/3" /><div className="h-4 bg-border rounded w-2/3" /><div className="h-4 bg-border rounded w-1/2" /></div>)'

pages_dir = 'src/pages'

for root, _, files in os.walk(pages_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.jsx'):
            path = os.path.join(root, f)
            with open(path, 'r') as file:
                content = file.read()
            
            # regex for `return <div>Loading...</div>;`
            # or `return <div ...>Loading...</div>;`
            new_content = re.sub(r'return\s*<div[^>]*>Loading[^<]*</div>;', f'return {skeleton};', content)
            
            # check for {isLoading ? <div>Loading...</div> : ...}
            # which is harder. I'll just look for return first.
            
            if new_content != content:
                with open(path, 'w') as file:
                    file.write(new_content)
                print(f"Updated {path}")
