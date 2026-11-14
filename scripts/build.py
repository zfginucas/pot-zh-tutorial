"""Build a self-contained static course, notebooks and a printable Markdown book."""
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

def read_lessons():
    lessons = [json.loads(p.read_text(encoding='utf-8-sig')) for p in sorted((ROOT/'content').glob('*.json'))]
    assert len(lessons) == 14, f'Expected 14 chapters; got {len(lessons)}'
    required = {'id','slug','title','subtitle','stage','minutes','prerequisites','goals','sections','lab','labTask','code','codeNotes','pitfalls','quiz','exercise','references'}
    for i,l in enumerate(lessons,1):
        assert required <= l.keys(), (l.get('id'), required-l.keys())
        assert l['id'] == f'{i:02d}'
        assert len(l['sections']) >= 4
        assert len(''.join(p for s in l['sections'] for p in s['paragraphs'])) >= 900
        assert 0 <= l['quiz']['answer'] < len(l['quiz']['options'])
        assert all(r['url'].startswith('https://') for r in l['references'])
        compile(l['code'], l['id']+'.py', 'exec')
    assert len({l['slug'] for l in lessons}) == 14
    return lessons

def markdown(l):
    chunks=[f"# {l['id']} {l['title']}",l['subtitle'],'## 学习目标',*[f'- {g}' for g in l['goals']]]
    for s in l['sections']:
        chunks += ['## '+s['title'],*s['paragraphs']]
        if s.get('formula'): chunks += ['$$\n'+s['formula']+'\n$$']
        if s.get('caption'): chunks += [s['caption']]
    chunks += ['## 动手实验',l['labTask'],'## POT 代码','```python\n'+l['code']+'\n```',l['codeNotes'],'## 常见误区',*[f'- {p}' for p in l['pitfalls']],'## 自测',l['quiz']['question'],*[f'{i+1}. {o}' for i,o in enumerate(l['quiz']['options'])],f"答案：{l['quiz']['answer']+1}。{l['quiz']['explanation']}",'## 推导练习',l['exercise']['question'],l['exercise']['answer'],'## 参考资料',*[f"- [{r['title']}]({r['url']})" for r in l['references']]]
    return '\n\n'.join(chunks)

def build():
    lessons=read_lessons()
    DIST.mkdir(exist_ok=True)
    shutil.copy2(ROOT/'index.html',DIST/'index.html')
    shutil.copytree(ROOT/'assets',DIST/'assets',dirs_exist_ok=True)
    shutil.copytree(ROOT/'node_modules/katex/dist',DIST/'vendor/katex',dirs_exist_ok=True)
    shutil.copy2(ROOT/'node_modules/katex/LICENSE',DIST/'vendor/katex/LICENSE')
    (DIST/'assets/lessons.js').write_text('window.LESSONS = '+json.dumps(lessons,ensure_ascii=False)+';\n',encoding='utf-8')
    download=DIST/'downloads'; download.mkdir(exist_ok=True)
    for l in lessons:
        stem=l['id']+'-'+l['slug']
        (download/(stem+'.py')).write_text('# -*- coding: utf-8 -*-\n'+l['code']+'\n',encoding='utf-8')
        intro=markdown(l).split('## POT 代码')[0]
        nb={'cells':[{'cell_type':'markdown','metadata':{},'source':[intro]}, {'cell_type':'markdown','metadata':{},'source':['安装依赖：`pip install -r requirements.txt`。代码验证基线 POT 0.9.6.post1。']},{'cell_type':'code','execution_count':None,'metadata':{},'outputs':[],'source':(l['code'].replace("matplotlib.use('Agg')\n",'') + ('\nplt.show()\n' if 'import matplotlib.pyplot' in l['code'] else '')).splitlines(keepends=True)},{'cell_type':'markdown','metadata':{},'source':['## 结果解读\n'+l['codeNotes']+'\n\n## 练习\n'+l['exercise']['question']+'\n\n'+l['exercise']['answer']]}],'metadata':{'kernelspec':{'display_name':'Python 3','language':'python','name':'python3'},'language_info':{'name':'python','version':'3.13'}},'nbformat':4,'nbformat_minor':5}
        for i,c in enumerate(nb['cells']):c['id']=stem+'-'+str(i)
        (download/(stem+'.ipynb')).write_text(json.dumps(nb,ensure_ascii=False,indent=2),encoding='utf-8')
    (download/'handbook.md').write_text('# 看见最优传输 · 中文学习手册\n\n基于 POT 的原创中文教程。交互版：https://zfginucas.github.io/pot-zh-tutorial/\n\n'+'\n\n---\n\n'.join(markdown(l) for l in lessons),encoding='utf-8')
    shutil.copy2(ROOT/'requirements.txt',download/'requirements.txt')
    for name in ['PLAN.md','AUDIT.md']:
        if (ROOT/'docs'/name).exists():shutil.copy2(ROOT/'docs'/name,download/name)
    with zipfile.ZipFile(download/'pot-zh-notebooks.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(download.iterdir()):
            if p.suffix in ['.py','.ipynb','.txt','.md']:z.write(p,p.name)
    (DIST/'.nojekyll').touch()
    print(f'Built {len(lessons)} chapters, {len(lessons)} notebooks and 5 interactive labs in {DIST}')
if __name__=='__main__':build()
