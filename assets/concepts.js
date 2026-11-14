// Original explanatory figures: only illustrative quantities explicitly stated in captions.
const teal='#26786b',gold='#d7834d',muted='#718477';
const t=(x,y,s,size=14,color='#29433a')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-family="Segoe UI,Microsoft YaHei,sans-serif" text-anchor="middle">${s}</text>`;
const c=(x,y,r,color)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const l=(x,y,xx,yy,color=teal,w=2)=>`<path d="M${x} ${y}L${xx} ${yy}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
const box=(x,y,w,h,color='#e7eee3')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${color}"/>`;
function flow(labels){return labels.map((s,i)=>box(24+i*202,58,185,78)+t(116+i*202,91,s[0],16,teal)+t(116+i*202,116,s[1],11,muted)+(i<2?t(218+i*202,103,'→',22):'')).join('');}
export function concept(id){let body='',caption='';
switch(id){
case '01':body=t(130,36,'一份供给',13,teal)+t(505,36,'两份需求',13,gold)+l(150,110,480,78,teal,14)+l(150,110,480,154,teal,14)+c(140,110,33,teal)+c(495,78,23,gold)+c(495,154,23,gold)+t(140,115,'1',19,'white')+t(495,83,'½',16,'white')+t(495,159,'½',16,'white');caption='质量可以拆分：一份供给分成两条运输流，分别满足两份需求。运输计划记录每条流的质量。';break;
case '02':body=l(55,158,590,158,'#becdbd')+l(140,158,140,111,teal,16)+l(315,158,315,64,teal,16)+l(495,158,495,111,teal,16)+t(140,187,'x₁ = 0')+t(315,187,'x₂ = 1')+t(495,187,'x₃ = 2')+t(140,97,'¼')+t(315,49,'½')+t(495,97,'¼')+t(490,25,'高度 = 质量 aᵢ',12,muted);caption='横向位置表示支撑 xᵢ，柱高表示质量 aᵢ。移动柱子会改变几何，改变柱高会改变权重。';break;
case '03':body=box(25,38,275,145)+box(340,38,275,145)+t(163,65,'Monge：一个点只选一个去处',13)+c(80,115,19,teal)+l(100,115,230,90)+c(250,90,15,gold)+c(250,145,15,gold)+t(478,65,'Kantorovich：允许拆分',13)+c(390,115,19,teal)+l(410,115,545,90)+l(410,115,545,145)+c(565,90,15,gold)+c(565,145,15,gold);caption='单个单位点质量无法用一个确定映射生成两个半质量点。放宽为耦合后，这个离散问题才有可行方案。';break;
case '04':body=flow([['移动距离 3','δ₀ → δ₃'],['平方运输成本 9','使用 C = |x − y|²'],['W₂ 距离 3','对最优成本开平方']]);caption='同一对单点分布：平方成本是 9，W₂ 是 3。函数名里的 “2” 不能替代对成本定义和单位的检查。';break;
case '05':body=flow([['原始：安排运输','可行计划给目标上界'],['最优时，两者相等','primal − dual = 0'],['对偶：设置势函数','uᵢ + vⱼ ≤ Cᵢⱼ']]);caption='在有限可行的离散线性 OT 中，强对偶把运输最小值与对偶最大值连接起来。数值上先检查可行性，再检查 gap。';break;
case '06':for(let k=0;k<2;k++){body+=t(165+k*310,31,k?'较大 ε：偏好分散':'较小 ε：接近尖锐计划',13);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const opacity=k?(i===j?.65:.32):(i===j?.95:.05);body+=`<rect x="${84+j*57+k*310}" y="${49+i*44}" width="52" height="39" rx="4" fill="${teal}" opacity="${opacity}"/>`;}}caption='示意图：固定边缘与成本时，增大 ε 会提高最优计划的熵。具体元素不必逐项单调变化；下方实验可查看真实计算结果。';break;
case '07':body=box(28,58,180,80)+box(237,58,172,80)+box(438,58,172,80)+t(118,93,'两分布的正则目标',13)+t(118,118,'Fε(a,b)',16,teal)+t(220,104,'−',22)+t(323,93,'源分布的自比较',13)+t(323,118,'½ Fε(a,a)',16,teal)+t(423,104,'−',22)+t(524,93,'目标分布的自比较',13)+t(524,118,'½ Fε(b,b)',16,teal);caption='三次求解使用同一 ε、同一地面成本规则和同一正则约定。减去自比较项消除偏差，不代表自动满足三角不等式。';break;
case '08':body=t(150,30,'概率混合',14)+t(480,30,'位移中点',14)+l(50,165,265,165,'#becdbd')+l(375,165,590,165,'#becdbd')+l(70,165,70,108,teal,15)+l(245,165,245,108,gold,15)+l(482,165,482,51,teal,15)+t(70,93,'½')+t(245,93,'½')+t(482,37,'1')+t(70,190,'0')+t(245,190,'1')+t(482,190,'0.5');caption='δ₀ 与 δ₁ 的中点：混合保留两个半高峰，W₂ 重心是位于 0.5 的单个单位质量峰。';break;
case '09':body=flow([['平衡 OT','硬约束：边缘相等'],['非平衡 OT','偏离边缘需要付费'],['部分 OT','规定绝对运输预算 m']]);caption='三种模型有不同约束。部分 OT 的 m 是绝对质量；非平衡 OT 的边缘可大于或小于输入，不是单纯丢弃质量。';break;
case '10':body=flow([['α = 0','纯特征 · 线性 OT'],['0 &lt; α &lt; 1','特征与结构共同参与'],['α = 1','纯结构 · GW']]);caption='POT 的 FGW 约定：(1−α)×特征成本 + α×结构损失。结构相似性来自各自空间内部的距离关系。';break;
case '11':body=flow([['二维 / 高维点云','选择单位投影方向 θ'],['一维排序与配对','每个方向计算 W₂²'],['平均后开根','得到 sliced-W₂ 估计']]);caption='更多方向提高的是对切片距离本身的积分精度。它通常不等于原空间的 Wasserstein 距离。';break;
case '12':body=c(160,105,30,teal)+l(190,105,440,65,teal,3)+l(190,105,440,150,teal,3)+c(460,65,23,'#e3a16f')+c(460,150,23,'#bc653e')+c(550,107,23,'#d08356')+t(162,160,'一个源颜色',13)+t(460,195,'目标颜色',13)+t(550,155,'加权平均',12);caption='重心映射把一行运输质量归一化后，对目标坐标求加权平均。中间色是均值，通常不在目标离散调色板上。';break;
case '13':body=flow([['完整正则目标 F','边缘与 ε 固定'],['微扰一个成本 Mᵢⱼ','重新求解：M ± hEᵢⱼ'],['中心差分核验','∂F / ∂Mᵢⱼ = P*ᵢⱼ']]);caption='这个梯度关系针对完整正则最优值。仅报告线性成本 ⟨P*(M),M⟩ 时，计划随 M 变化产生的导数一般不能忽略。';break;
default:body=flow([['先写可证伪的问题','目标、数据、指标'],['再做受控比较','基线、消融、多次运行'],['最后报告边界','残差、失败例子、复现']]);caption='研究复现不以“做出一张好看的图”为终点。图要对应明确的量、受控的实验和可检查的结论。';}
return `<figure class="concept-figure"><div class="eyebrow">ONE IDEA, ONE PICTURE / 概念速写</div><svg viewBox="0 0 640 210" role="img" aria-label="${caption}">${body}</svg><figcaption>${caption}</figcaption></figure>`;
}
