import {permutations} from './math.js';
const T='#26786b',O='#d7834d',K='#29433a';
const txt=(x,y,s,size=13,color=K)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-family="Segoe UI,Microsoft YaHei,sans-serif">${s}</text>`;
const svg=(body,label,h=290)=>`<svg class="chart" viewBox="0 0 640 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const metric=items=>`<div class="lab-metrics">${items.map(([a,b])=>`<div class="metric"><small>${a}</small><strong>${b}</strong></div>`).join('')}</div>`;
export const FGW_M=[[1,0,.25],[0,1,.25],[.25,.25,0]];
const dist=x=>x.map(a=>x.map(b=>Math.abs(a-b)));
export const FGW_A=dist([0,1,3]),FGW_B=dist([0,1,3]);
export function fgwTerms(P,alpha){let feature=0,structure=0;for(let i=0;i<3;i++)for(let j=0;j<3;j++){feature+=P[i][j]*FGW_M[i][j];for(let k=0;k<3;k++)for(let l=0;l<3;l++)structure+=P[i][j]*P[k][l]*(FGW_A[i][k]-FGW_B[j][l])**2;}return {feature,structure,total:(1-alpha)*feature+alpha*structure};}
export function fgwStep(P,alpha){
  const gradient=P.map((row,i)=>row.map((_,j)=>{let v=0;for(let k=0;k<3;k++)for(let l=0;l<3;l++)v+=P[k][l]*(FGW_A[i][k]-FGW_B[j][l])**2;return (1-alpha)*FGW_M[i][j]+2*alpha*v;}));
  const candidates=permutations([0,1,2]).map(p=>({p,value:p.reduce((s,j,i)=>s+gradient[i][j]/3,0)}));candidates.sort((a,b)=>a.value-b.value);
  const S=P.map((row,i)=>row.map((_,j)=>+(j===candidates[0].p[i])/3));
  const at=g=>P.map((row,i)=>row.map((v,j)=>(1-g)*v+g*S[i][j]));
  const f0=fgwTerms(P,alpha).total,f1=fgwTerms(S,alpha).total,fh=fgwTerms(at(.5),alpha).total;
  const a=2*(f1-2*fh+f0),b=f1-f0-a;
  const choices=[0,1];if(a>1e-12)choices.push(Math.max(0,Math.min(1,-b/(2*a))));
  const gamma=choices.sort((g,h)=>fgwTerms(at(g),alpha).total-fgwTerms(at(h),alpha).total)[0];
  return {P:at(gamma),S,gradient,gamma,gap:Math.max(0,-P.flatMap((r,i)=>r.map((v,j)=>gradient[i][j]*(S[i][j]-v))).reduce((s,v)=>s+v,0))};
}
function matrix(P,label){return `<div class="lab-matrix"><small>${label}</small><div class="heatmap" style="grid-template-columns:repeat(3,1fr)">${P.flat().map(v=>`<span style="background:rgba(38,120,107,${.05+Math.min(Math.abs(v),1)*.8});color:${Math.abs(v)>.65?'white':K}">${v.toFixed(3)}</span>`).join('')}</div></div>`;}
export function mountFGW(el){
  el.innerHTML=`<h3>看一次真正的 FGW 更新</h3><p class="lab-description">与第16章相同的三点数据。表达偏好交换前两点；空间结构偏好保持编号。起点为乘积计划，每格 1/9。</p><div class="lab-controls"><label>结构权重 α <input type="range" aria-label="FGW结构权重" data-alpha min="0" max="1" step="0.05" value="0.5"><output data-value>0.50</output></label><button class="primary" data-step>做一次条件梯度</button><button data-reset>重置</button></div><div data-fgw-chart></div><div data-fgw-metrics></div><div class="optimization-matrices"><div data-p></div><div data-gradient></div><div data-corner></div></div><p class="lab-message" data-state></p><details><summary>成本矩阵与优化目标</summary><p>M=[[1,0,¼],[0,1,¼],[¼,¼,0]]；源、目标坐标均为(0,1,3)，结构代价使用片内绝对距离之差的平方。F=(1−α)⟨P,M⟩+αΣ(PᵢⱼPₖₗ)(Aᵢₖ−Bⱼₗ)²。</p></details>`;
  let P=Array.from({length:3},()=>Array(3).fill(1/9)),iteration=0,last=null,history=[];
  const draw=()=>{const alpha=+el.querySelector('[data-alpha]').value,terms=fgwTerms(P,alpha);el.querySelector('[data-value]').textContent=alpha.toFixed(2);
    let body=txt(30,25,'当前计划：线宽表示匹配质量')+txt(360,25,'目标值随迭代变化');const sx=[50,110,230],tx=[50,110,230];
    P.forEach((row,i)=>row.forEach((v,j)=>{if(v>1e-8)body+=`<path d="M${sx[i]} 73 C${sx[i]} 123,${tx[j]} 145,${tx[j]} 195" fill="none" stroke="${T}" stroke-width="${v*30+1}" opacity=".4"/>`;}));
    sx.forEach((x,i)=>body+=`<circle cx="${x}" cy="73" r="10" fill="${T}"/>`+txt(x-4,52,i+1));tx.forEach((x,i)=>body+=`<circle cx="${x}" cy="195" r="10" fill="${O}"/>`+txt(x-4,224,i+1));
    const max=Math.max(...history,terms.total,1e-5);body+=`<path d="M350 55V225H610" fill="none" stroke="#bdcdbf"/>`;const curve=history.map((v,i)=>`${350+i*250/Math.max(history.length-1,1)},${220-150*v/max}`).join(' ');body+=`<polyline points="${curve}" stroke="${T}" fill="none" stroke-width="3"/>`+txt(350,252,'每次更新不增加当前目标',12);
    el.querySelector('[data-fgw-chart]').innerHTML=svg(body,'FGW软匹配及条件梯度目标值曲线',270);
    el.querySelector('[data-fgw-metrics]').innerHTML=metric([['表达项 ⟨P,M⟩',terms.feature.toFixed(4)],['结构项 GW(P)',terms.structure.toFixed(4)],['加权目标 F(P)',terms.total.toFixed(4)]]);
    el.querySelector('[data-p]').innerHTML=matrix(P,'当前计划 P');el.querySelector('[data-gradient]').innerHTML=matrix(last?.gradient||fgwStep(P,alpha).gradient,'更新前的梯度 G');el.querySelector('[data-corner]').innerHTML=matrix(last?.S||fgwStep(P,alpha).S,'线性 OT 候选 S');
    el.querySelector('[data-state]').textContent=`第 ${iteration} 次更新。${last?`线搜索 γ=${last.gamma.toFixed(4)}，更新前的 Frank–Wolfe gap=${last.gap.toExponential(2)}。`:''}行和、列和始终为 1/3。条件梯度给出局部数值解，不提供全局最优保证。`;
  };
  const reset=()=>{P=Array.from({length:3},()=>Array(3).fill(1/9));iteration=0;last=null;history=[fgwTerms(P,+el.querySelector('[data-alpha]').value).total];draw();};
  el.querySelector('[data-alpha]').oninput=reset;el.querySelector('[data-reset]').onclick=reset;el.querySelector('[data-step]').onclick=()=>{last=fgwStep(P,+el.querySelector('[data-alpha]').value);P=last.P;iteration++;history.push(fgwTerms(P,+el.querySelector('[data-alpha]').value).total);draw();};reset();
}
export function chordEstimate(previous,current,t,delta){return previous.map((v,i)=>(t*v+delta*current[i])/(t+delta));}
export function chordObjective(u,previous,current,t,delta){return t*u.reduce((s,v,i)=>s+(v-previous[i])**2,0)+delta*u.reduce((s,v,i)=>s+(v-current[i])**2,0);}
export function mountChord(el){
  el.innerHTML=`<h3>亲手求出 ChordEdit 的局部控制方向</h3><p class="lab-description">合成残差 R₋=(1,a)、R₊=(1,b)。横轴代表编辑语义，纵轴代表背景扰动；不运行图像模型。</p><div class="lab-controls"><label>前一时刻 a <input data-previous aria-label="前一时刻残差" type="range" min="-4" max="4" step="0.5" value="0"><output data-av></output></label><label>当前时刻 b <input data-current aria-label="当前时刻残差" type="range" min="-4" max="4" step="0.5" value="4"><output data-bv></output></label><label>窗口 δ <input data-delta aria-label="Chord平滑窗口" type="range" min="0" max="0.75" step="0.05" value="0.25"><output data-dv></output></label><button data-counter>反例：当前已稳定</button><button data-reset>重置</button></div><div data-chord-chart></div><div data-chord-metrics></div><p data-chord-state class="lab-message"></p>`;
  const t=.75,draw=()=>{const b=+el.querySelector('[data-current]').value,delta=+el.querySelector('[data-delta]').value,previousInput=el.querySelector('[data-previous]');previousInput.disabled=delta===0;if(delta===0)previousInput.value=b;const a=+previousInput.value,u=chordEstimate([1,a],[1,b],t,delta),alpha=t/(t+delta),norm=v=>v.reduce((s,x)=>s+x*x,0),weighted=alpha*norm([1,a])+(1-alpha)*norm([1,b]);
    el.querySelector('[data-av]').textContent=a.toFixed(1);el.querySelector('[data-bv]').textContent=b.toFixed(1);el.querySelector('[data-dv]').textContent=delta.toFixed(2);
    let body=txt(20,25,'① 先平均向量，再更新位置')+txt(350,25,'② 二次目标在 uᵧ 处取最小');body+=`<path d="M30 140H205M60 35V245" fill="none" stroke="#a9bdac"/>`;
    const arrows=[[a,'#8aa88c','R₋'],[b,O,'R₊'],[u[1],T,'û']].map(([y,col,name],i)=>({endY:140-y*22,col,name,i}));let labelY=0;for(const arrow of [...arrows].sort((x,y)=>x.endY-y.endY)){arrow.labelY=Math.max(arrow.endY+4,labelY+19);labelY=arrow.labelY;}arrows.forEach(({endY,col,name,i,labelY})=>{body+=`<path d="M60 140L200 ${endY}" stroke="${col}" stroke-width="${i===2?4:2}" fill="none"/><circle cx="200" cy="${endY}" r="5" fill="${col}"/><path d="M205 ${endY}L215 ${labelY-4}" stroke="${col}" fill="none"/>`+txt(220,labelY,name,14,col);});
    const vals=Array.from({length:81},(_,i)=>{const y=-4+i*.1;return {y,f:chordObjective([1,y],[1,a],[1,b],t,delta)};}),max=Math.max(...vals.map(v=>v.f),1);const pos=y=>365+(y+4)/8*240;body+=`<path d="M355 45V238H615" fill="none" stroke="#a9bdac"/><polyline points="${vals.map(v=>`${pos(v.y)},${230-v.f/max*170}`).join(' ')}" stroke="${T}" stroke-width="3" fill="none"/><circle cx="${pos(u[1])}" cy="${230-chordObjective(u,[1,a],[1,b],t,delta)/max*170}" r="6" fill="${O}"/>`+txt(pos(-4)-8,258,'−4',12)+txt(pos(0)-3,258,'0',12)+txt(pos(4)-3,258,'4',12);
    el.querySelector('[data-chord-chart]').innerHTML=svg(body,'两个残差向量的加权平均，以及对应凸二次目标的最小点',280);
    el.querySelector('[data-chord-metrics]').innerHTML=metric([['加权结果 û',`(1, ${u[1].toFixed(3)})`],['当前残差能量 ‖R₊‖²',norm([1,b]).toFixed(3)],['平滑能量 ‖û‖²',norm(u).toFixed(3)]]);
    el.querySelector('[data-chord-state]').textContent=`t=0.75；权重 ${alpha.toFixed(3)} 与 ${(1-alpha).toFixed(3)}。可核验：‖û‖²=${norm(u).toFixed(3)} ≤ 加权能量 ${weighted.toFixed(3)}。${norm(u)>norm([1,b])+1e-9?'这个反例中，平滑能量反而高于当前残差；Jensen 界仍成立。':(Math.abs(norm(u)-norm([1,b]))<1e-9?'该组数值中，两者能量相等。':'该组数值中，平滑能量低于当前残差。')}${delta===0?'δ=0 时两查询时刻重合，R₋与R₊已同步。':''}取步长 λ=1，更新为 x新=x源+û。`;
  };el.querySelectorAll('input').forEach(e=>e.oninput=draw);el.querySelector('[data-counter]').onclick=()=>{el.querySelector('[data-previous]').value=4;el.querySelector('[data-current]').value=0;el.querySelector('[data-delta]').value=.25;draw();};el.querySelector('[data-reset]').onclick=()=>{el.querySelector('[data-previous]').value=0;el.querySelector('[data-current]').value=4;el.querySelector('[data-delta]').value=.25;draw();};draw();
}
