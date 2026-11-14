"""Check that exported books and notebooks retain their referenced illustrations."""
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from build import ROOT, read_lessons

manifest=json.loads((ROOT/'assets/generated-figures/manifest.json').read_text(encoding='utf-8'))
figure_count=sum(len(figures) for figures in manifest.values())
for figures in manifest.values():
    for figure in figures.values():
        ET.parse(ROOT/'assets/generated-figures'/figure['filename'])
book=(ROOT/'dist/downloads/handbook.md').read_text(encoding='utf-8')
images=re.findall(r'!\[.*?\]\((figures/[^)]+)\)',book)
assert len(images)==figure_count
with zipfile.ZipFile(ROOT/'dist/downloads/pot-zh-notebooks.zip') as archive:
    names=archive.namelist()
    assert all(image in names for image in images)
    assert len([name for name in names if name.endswith('.ipynb')])==len(read_lessons())
    for name in names:
        if name.endswith('.ipynb'):
            nb=json.loads(archive.read(name))
            intro=''.join(nb['cells'][0]['source'])
            links=re.findall(r'!\[.*?\]\((figures/[^)]+)\)',intro)
            assert links and all(link in names for link in links)
print(f'Validated {figure_count} SVGs and all figure references in the handbook and notebooks.')
