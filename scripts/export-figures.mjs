import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {concept} from '../assets/concepts.js';
import {sectionFigure} from '../assets/section-figures.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets','generated-figures');fs.mkdirSync(out,{recursive:true});
const manifest={};
for(const name of fs.readdirSync(path.join(root,'content')).filter(n=>n.endsWith('.json')).sort()){
  const lesson=JSON.parse(fs.readFileSync(path.join(root,'content',name),'utf8'));
  const figures=[{key:'overview',html:concept(lesson.id)},...lesson.sections.map((s,i)=>({key:String(i),html:sectionFigure(lesson.id,i,s.figure)}))];
  manifest[lesson.id]={};
  for(const {key,html} of figures){
    if(!html)continue;
    const svg=html.match(/<svg[\s\S]*?<\/svg>/)?.[0];if(!svg)continue;
    const filename=`${lesson.id}-${key}.svg`;
    fs.writeFileSync(path.join(out,filename),svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
    const caption=html.match(/<figcaption>([\s\S]*?)<\/figcaption>/)?.[1]?.replace(/<[^>]*>/g,'')||'';
    manifest[lesson.id][key]={filename,caption};
  }
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(`Exported ${Object.values(manifest).reduce((n,figs)=>n+Object.keys(figs).length,0)} original SVG figures.`);
