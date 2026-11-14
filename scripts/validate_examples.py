"""Execute each independent example, reject errors and collect numerical warnings."""
import json, os, subprocess, sys
from pathlib import Path
from build import read_lessons, ROOT

results=[]
(ROOT/'.work').mkdir(exist_ok=True)
for l in read_lessons():
    p=subprocess.run([sys.executable,'-c',l['code']],cwd=ROOT/'.work',capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=90,env={**os.environ,'PYTHONIOENCODING':'utf-8','MPLBACKEND':'Agg','OPENBLAS_NUM_THREADS':'1'})
    results.append({'chapter':l['id'],'title':l['title'],'passed':p.returncode==0,'stdout':p.stdout,'stderr':p.stderr})
    print(l['id'], 'PASS' if p.returncode==0 else 'FAIL',l['title'])
    if p.stderr:print(p.stderr[-2500:])
    if p.returncode:print(p.stdout[-1000:])
(ROOT/'.work/example-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
assert all(r['passed'] for r in results), 'One or more examples failed'
print('All 14 independent POT examples passed.')
