const C={t:'#26786b',o:'#d7834d',ink:'#29433a',pale:'#e8f0e4',gray:'#b7c9ba'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tx=(x,y,s,size=16,fill=C.ink)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="middle" font-family="Segoe UI,Microsoft YaHei,sans-serif">${esc(s)}</text>`;
const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${C.pale}"/>`;
const arrow=(a,b,x,y,color=C.t)=>`<path d="M${a} ${b}L${x} ${y}" stroke="${color}" stroke-width="3" fill="none"/><circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`;
const fig=(body,caption,h=260)=>`<figure class="concept-figure section-figure"><div class="eyebrow">CHORDEDIT / 逐式读图</div><svg viewBox="0 0 640 ${h}" role="img" aria-label="${esc(caption)}"><title>${esc(caption)}</title>${body}</svg><figcaption>${esc(caption)}</figcaption></figure>`;
export function chordFigure(spec){
  if(!spec?.type?.startsWith('chord-'))return '';
  let body='',caption=spec.caption||'';
  switch(spec.type){
    case 'chord-state':
      body=box(20,35,230,165)+box(390,35,230,165)+tx(135,65,'源条件：棕色 → 白色')+tx(505,65,'目标：改语义、保背景')+`<rect x="65" y="95" width="140" height="65" fill="#b9d2b5"/><circle cx="135" cy="122" r="25" fill="#9d684b"/><rect x="435" y="95" width="140" height="65" fill="#b9d2b5"/><circle cx="505" cy="122" r="25" fill="#fff" stroke="#a7b4a3"/>`+arrow(260,120,380,120)+tx(320,100,'潜变量更新',14)+tx(320,236,'二维教学轴：横向=编辑语义，纵向=背景扰动',14);
      caption=caption||'图像是原创示意，圆形代表被编辑主体。真正运算发生在 VAE 潜空间，不是沿 RGB 像素直线换色。';break;
    case 'chord-query':
      body=tx(320,25,'同一锚点、共享噪声，查询两提示 × 两时刻',17)+box(20,45,270,155)+box(350,45,270,155)+tx(155,74,'时刻 t−δ')+tx(485,74,'时刻 t')+tx(155,108,'源输出 Qₛ → 目标输出 Qₜ',14)+tx(485,108,'源输出 Qₛ → 目标输出 Qₜ',14)+tx(155,143,'ΔQ₋ 经 Bₜ₋δ 换到同一单位',13)+tx(485,143,'ΔQ₊ 经 Bₜ 换到同一单位',13)+tx(155,179,'R₋ = (1, 0)',18,C.t)+tx(485,179,'R₊ = (1, 4)',18,C.o)+tx(320,235,'四组条件可合并成一个批次，仍是四组输入',14);
      caption=caption||'右侧向量是教学数值。B 的作用是统一模型参数化的单位；噪声预测与速度预测不能直接混减。';break;
    case 'chord-energy':
      body=tx(320,25,'相同起终点，弯路需要更高的平方速度积分',17)+`<path d="M55 180L585 180" stroke="${C.t}" stroke-width="4"/><path d="M55 180C180 15 400 15 585 180" stroke="${C.o}" stroke-width="4" fill="none"/>`+tx(320,207,'直线路径：速度保持一致',16,C.t)+tx(320,83,'偏离后再回来：移动更大',16,C.o)+tx(60,239,'源')+tx(585,239,'目标');
      caption=caption||'这是固定端点的动态 OT 直觉。ChordEdit 的实际算法求局部代理方向，并未精确解出完整分布动态 OT。';break;
    case 'chord-quadratic': {
      body=tx(320,25,'固定 uₓ=1，只看 uᵧ：两个二次项相加',17)+`<path d="M45 55V220H600" stroke="${C.gray}" fill="none"/>`;
      const points=Array.from({length:101},(_,i)=>{const y=-1+i*.06;const f=.75*y*y+.25*(y-4)**2;return `${70+(y+1)*80},${217-f*8}`;}).join(' ');
      body+=`<polyline points="${points}" stroke="${C.t}" stroke-width="3" fill="none"/>`+`<circle cx="230" cy="193" r="7" fill="${C.o}"/>`+tx(232,176,'最小点 uᵧ=1',15)+tx(150,241,'0')+tx(230,241,'1')+tx(470,241,'4')+tx(495,45,'Φ̄(uᵧ)=¾uᵧ²+¼(uᵧ−4)²',14);
      caption=caption||'t=0.75、δ=0.25。导数为 2uᵧ−2，令其为零得 uᵧ=1；二阶导为 2，因此解唯一。';break;}
    case 'chord-weights':
      body=box(20,40,180,120)+box(230,40,180,120)+box(440,40,180,120)+tx(110,73,'R₋=(1,0)',20,C.t)+tx(110,111,'权重 0.75',15)+tx(320,73,'R₊=(1,4)',20,C.o)+tx(320,111,'权重 0.25',15)+tx(530,73,'û=(1,1)',20,C.t)+tx(530,111,'先平均向量',15)+tx(215,105,'+')+tx(425,105,'=')+tx(320,206,'‖û‖² = 2    ≤    0.75×1 + 0.25×17 = 5',17);
      caption=caption||'Jensen 界比较平滑向量能量与加权输入能量，不是仅与当前 R₊ 的能量比较。';break;
    case 'chord-counter':
      body=tx(320,25,'反例：R₋=(1,4)，R₊=(1,0)',18)+box(25,55,180,120)+box(230,55,180,120)+box(435,55,180,120)+tx(115,90,'当前能量',15)+tx(115,135,'1',26,C.o)+tx(320,90,'平滑能量',15)+tx(320,135,'10',26,C.t)+tx(525,90,'加权能量上界',15)+tx(525,135,'13',26)+tx(320,225,'1 < 10 ≤ 13：当前更稳定时，平滑可以变差',17);
      caption=caption||'沿用权重 0.75、0.25，û=(1,3)。不能从凸性推出“每次都比当前估计好”。';break;
    case 'chord-compute':
      body=tx(320,25,'一次运输更新，与可选语义增强分别计费',17)+box(20,55,185,110)+box(235,55,180,110)+box(445,55,175,110)+tx(112,86,'四组查询打包',16)+tx(112,123,'1 次批量 UNet',16,C.t)+tx(325,86,'xpred=xsrc+λû',15)+tx(325,123,'运输更新 1 次',16,C.t)+tx(532,86,'可选 predict-x₀',15)+tx(532,123,'再一次网络调用',15,C.o)+arrow(208,109,230,109)+arrow(420,109,440,109)+tx(320,225,'论文默认含增强：报告 NFE=2；仅运输：NFE=1',16);
      caption=caption||'一次批量调用不等于一组条件求值。作者称“prox”的增强步骤，不应自动解释为严格近端优化算子的闭式解。';break;
    default:return '';
  }
  return fig(body,caption);
}
