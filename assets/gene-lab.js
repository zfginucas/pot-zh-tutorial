// Exact equal-mass assignment for a deliberately tiny synthetic tissue example.
// Each active spot has mass 1/8; split it into two mass-1/16 particles.
export function assignment(M) {
  const n=M.length,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
  for(let i=1;i<=n;i++){
    p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
    do{
      used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
      for(let j=1;j<=n;j++)if(!used[j]){const cur=M[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0;}if(minv[j]<delta){delta=minv[j];j1=j;}}
      for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;}
      j0=j1;
    }while(p[j0]!==0);
    do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
  }
  const match=Array(n);for(let j=1;j<=n;j++)match[p[j]-1]=j-1;
  return {match,cost:match.reduce((s,j,i)=>s+M[i][j],0)/n};
}
export const tissue=Array.from({length:16},(_,i)=>[i%4,Math.floor(i/4)]);
export const genePatterns={cluster:tissue.map(([x])=>+(x<2)),checker:tissue.map(([x,y])=>+((x+y)%2===0)),stripe:tissue.map(([,y])=>+(y<2))};
export function geneScore(values,power=2,scale=1){
  const particles=values.flatMap((v,i)=>Array(v*2).fill(i));
  const M=particles.map(i=>tissue.map(z=>Math.hypot((tissue[i][0]-z[0])*scale,(tissue[i][1]-z[1])*scale)**power));
  const r=assignment(M);return {...r,particles};
}
export function mountGeneLab(el){
  el.innerHTML=`<h3>同样的表达直方图，不同的空间排列</h3><p class="lab-description">4×4 合成组织：8 个高表达点、8 个零表达点。比较基因质量分布与均匀组织背景。</p><div class="lab-controls"><label>基因排列 <select data-pattern aria-label="基因空间排列"><option value="cluster">左半区聚集</option><option value="checker">棋盘状分散</option><option value="stripe">上半区聚集</option></select></label><label>成本 <select data-power aria-label="空间距离幂次"><option value="2">平方欧氏距离</option><option value="1">欧氏距离</option></select></label><label>坐标缩放 <input data-scale aria-label="组织坐标缩放" type="range" min="1" max="3" value="1" step="1"><output data-value>1</output></label></div><div data-gene-chart></div><div class="lab-metrics" data-gene-metrics></div><p class="lab-message">此处精确求解小规模分配问题。OT 箭头是计算上的质量分配，不代表 RNA 分子真实移动；分数不是 p 值，也不是这项专利的复现。</p>`;
  const draw=()=>{
    const values=genePatterns[el.querySelector('[data-pattern]').value],power=+el.querySelector('[data-power]').value,scale=+el.querySelector('[data-scale]').value,r=geneScore(values,power,scale);
    let drawing='<text x="155" y="25" text-anchor="middle">基因表达位置（绿 = 高，灰 = 零）</text><text x="480" y="25" text-anchor="middle">均匀背景与最优运输连线</text>';
    tissue.forEach(([x,y],i)=>{drawing+=`<circle cx="${65+x*59}" cy="${65+y*53}" r="17" fill="${values[i]?'#26786b':'#d5dfd0'}"/><text x="${65+x*59}" y="${70+y*53}" text-anchor="middle" fill="${values[i]?'white':'#52664f'}">${values[i]}</text>`;});
    r.particles.forEach((i,k)=>{const j=r.match[k],[x,y]=tissue[i],[xx,yy]=tissue[j];drawing+=`<line x1="${390+x*58}" y1="${65+y*53}" x2="${390+xx*58}" y2="${65+yy*53}" stroke="#26786b" stroke-width="2.5" opacity=".45"/>`;});
    tissue.forEach(([x,y])=>drawing+=`<circle cx="${390+x*58}" cy="${65+y*53}" r="6" fill="#d7834d"/>`);
    el.querySelector('[data-gene-chart]').innerHTML=`<svg class="chart gene-chart" viewBox="0 0 640 265" role="img" aria-label="合成基因表达空间图和向均匀背景运输的最优连线"><g font-family="Microsoft YaHei,Segoe UI,sans-serif" font-size="13" fill="#29433a">${drawing}</g></svg>`;
    el.querySelector('[data-value]').value=scale;
    el.querySelector('[data-gene-metrics]').innerHTML=[['表达均值 / 方差','0.5 / 0.25'],[power===2?'W₂² 空间运输分数':'W₁ 空间运输分数',r.cost.toFixed(4)],['阳性点数 / 总点数','8 / 16']].map(([a,b])=>`<div class="metric"><small>${a}</small><strong>${b}</strong></div>`).join('');
  };
  el.querySelectorAll('select,input').forEach(e=>e.addEventListener('input',draw));draw();
}
