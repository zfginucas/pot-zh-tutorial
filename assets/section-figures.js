import {paperFigure} from './paper-figures.js';
import {spatialFigure} from './spatial-figures.js';
import {chordFigure} from './chord-figures.js';
/*
 * Original, section-specific teaching figures. All numeric examples are either
 * hand-computable or explicitly marked as schematic; no published image is used.
 * sectionFigure(id, index, spec?) is intentionally independent of the app router.
 */
const C = {
  ink: '#29433a', teal: '#26786b', orange: '#d7834d', muted: '#687d70',
  pale: '#e7eee3', line: '#b7c9ba', white: '#ffffff', dark: '#174d43',
};

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

function text(x, y, value, { size = 16, color = C.ink, anchor = 'middle', weight = 400 } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}" font-family="Segoe UI,Microsoft YaHei,sans-serif">${escape(value)}</text>`;
}

function lines(x, y, value, { max = 13, lineHeight = 23, ...options } = {}) {
  const chunks = Array.isArray(value) ? value : String(value).split('\n').flatMap(line => {
    const chars = Array.from(line);
    return chars.length ? Array.from({ length: Math.ceil(chars.length / max) }, (_, i) => chars.slice(i * max, (i + 1) * max).join('')) : [''];
  });
  return chunks.map((line, i) => text(x, y + i * lineHeight, line, options)).join('');
}

const rect = (x, y, w, h, fill = C.pale, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}" ${extra}/>`;
const circle = (x, y, r = 8, fill = C.teal, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, color = C.line, width = 2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;

function arrow(x1, y1, x2, y2, color = C.teal, width = 2) {
  const angle = Math.atan2(y2 - y1, x2 - x1), length = 9;
  const points = [[x2, y2], [x2 - length * Math.cos(angle - .45), y2 - length * Math.sin(angle - .45)], [x2 - length * Math.cos(angle + .45), y2 - length * Math.sin(angle + .45)]];
  return line(x1, y1, x2, y2, color, width) + `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="${color}"/>`;
}

function matrix(values, x, y, { cell = 57, color = C.teal, shade = true, digits = 2 } = {}) {
  const max = Math.max(1e-12, ...values.flat().map(v => Math.abs(v)));
  return values.map((row, i) => row.map((v, j) => {
    const alpha = shade ? .08 + .75 * Math.abs(v) / max : .12;
    const label = typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(digits)) : v;
    return `<rect x="${x + j * cell}" y="${y + i * cell}" width="${cell - 4}" height="${cell - 4}" rx="5" fill="${color}" opacity="${alpha}"/>` +
      text(x + j * cell + (cell - 4) / 2, y + i * cell + cell / 2 + 4, label, { color: shade && Math.abs(v) / max > .65 ? C.white : C.ink, size: 16 });
  }).join('')).join('');
}

function axis(x1, x2, y, labels, { color = C.line } = {}) {
  return line(x1, y, x2, y, color) + labels.map(([fraction, label]) => {
    const x = x1 + fraction * (x2 - x1);
    return line(x, y - 4, x, y + 4, color) + text(x, y + 25, label, { size: 14, color: C.muted });
  }).join('');
}

function figure(body, caption, height = 250, title = '把这一段，画出来') {
  return `<figure class="concept-figure section-figure"><div class="eyebrow">${escape(title)}</div><svg viewBox="0 0 640 ${height}" role="img" aria-label="${escape(caption)}"><title>${escape(caption)}</title>${body}</svg><figcaption>${escape(caption)}</figcaption></figure>`;
}

function couplingMargins() {
  let body = text(254, 30, '计划 P：每格是一条运输流', { weight: 600 });
  body += matrix([[.25, .30, 0], [0, .05, .40]], 145, 60, { cell: 72 });
  body += text(110, 103, '源 1', { size: 14 }) + text(110, 175, '源 2', { size: 14 });
  body += text(435, 82, '按行求和 → a', { color: C.teal }) + text(435, 117, '0.55') + text(435, 189, '0.45');
  body += arrow(365, 96, 390, 96) + arrow(365, 168, 390, 168);
  body += text(250, 244, '按列求和 ↓ b = (0.25, 0.35, 0.40)', { color: C.orange });
  return figure(body, '可核对的 2×3 耦合：行和为 (0.55,0.45)，列和为 (0.25,0.35,0.40)。可行性来自这些质量约束，尚未说明方案是否最优。', 270, '行和、列和：耦合的两张身份证');
}

function groundCost() {
  let body = text(145, 28, '支撑点只负责确定位置', { weight: 600 }) + text(465, 28, '路线代价写进成本矩阵', { weight: 600 });
  body += axis(45, 265, 155, [[0, '0'], [.25, '1'], [.5, '2'], [.75, '3'], [1, '4']]);
  body += circle(45, 90, 11) + circle(155, 90, 11) + text(100, 66, '源 x = (0,2)', { color: C.teal });
  body += circle(100, 155, 9, C.orange) + circle(210, 155, 9, C.orange) + circle(265, 155, 9, C.orange);
  body += text(150, 215, '目标 y = (1,3,4)', { color: C.orange }) + arrow(282, 125, 330, 125);
  body += matrix([[1, 3, 4], [1, 1, 2]], 365, 62, { cell: 58 });
  body += text(452, 214, 'Cᵢⱼ = |xᵢ − yⱼ|', { color: C.teal });
  return figure(body, '横轴表示真实位置，源点被抬高仅为排版。采用绝对距离时，C=[[1,3,4],[1,1,2]]；换成平方距离，矩阵元素也必须平方。', 245, '坐标 → 地面成本');
}

function empiricalMeasure() {
  let body = text(145, 31, '4 个等权样本', { weight: 600 }) + text(470, 31, '合并重合坐标后的分布', { weight: 600 });
  body += axis(50, 240, 175, [[0, '0'], [.5, '1'], [1, '2']]);
  body += circle(50, 151, 8) + circle(50, 129, 8) + circle(145, 151, 8) + circle(240, 151, 8);
  body += text(143, 225, '每个样本权重 1/4', { color: C.muted }) + arrow(275, 125, 325, 125);
  body += axis(375, 565, 175, [[0, '0'], [.5, '1'], [1, '2']]);
  for (const [x, h, label] of [[375, 90, '1/2'], [470, 45, '1/4'], [565, 45, '1/4']]) {
    body += rect(x - 10, 175 - h, 20, h, C.teal) + text(x, 161 - h, label);
  }
  return figure(body, '样本 (0,0,1,2) 的经验分布等于 ½δ₀+¼δ₁+¼δ₂。点的数量、不同坐标的数量和概率质量是三个不同概念。', 250, '经验分布：数样本，还是数位置？');
}

function normalizeMass() {
  let body = text(155, 32, '原始计数：总量 100', { weight: 600 }) + text(488, 32, '概率质量：总量 1', { weight: 600 });
  const heights = [38, 57, 95];
  heights.forEach((h, i) => {
    const x = 65 + i * 85;
    body += rect(x, 180 - h, 34, h, C.teal) + text(x + 17, 166 - h, [20, 30, 50][i]);
    body += rect(x + 335, 180 - h, 34, h, C.orange) + text(x + 352, 166 - h, ['0.2', '0.3', '0.5'][i]);
  });
  body += arrow(285, 115, 350, 115) + text(320, 87, '÷100', { size: 17 });
  body += line(45, 180, 280, 180) + line(380, 180, 615, 180);
  return figure(body, '归一化保留相对形状，却丢掉总量信息。两组分别归一化后，总计数 100 与 1000 可能给出完全相同的概率分布；这是否合理取决于任务。柱高在两栏使用各自单位。', 220, '归一化：保留比例，改变质量单位');
}

function feasibleSegment() {
  let body = text(320, 28, '等权 2×2 计划只剩一个自由参数 t', { weight: 600 });
  const values = [0, .25, .5];
  values.forEach((v, i) => {
    const x = 47 + i * 211;
    body += matrix([[v, .5 - v], [.5 - v, v]], x, 59, { cell: 62 });
    body += text(x + 60, 211, `t = ${v.toFixed(2)}`) + text(x + 60, 238, `成本 = ${(2 - 2 * v).toFixed(2)}`, { color: C.orange });
    if (i < 2) body += arrow(x + 137, 116, x + 187, 116);
  });
  return figure(body, '手算例子：a=b=(0.5,0.5)，C=[[1,2],[2,1]]。可行域为 0≤t≤0.5，成本 2−2t 随 t 线性下降；最右端 t=0.5 的成本 1 最小。', 265, '可行多面体，在这个例子里是一条线段');
}

function costAndRoot() {
  let body = text(320, 29, '两组等权样本：0 ↔ 1，2 ↔ 5', { weight: 600 });
  const rows = [['每对的移动距离', '1', '3'], ['平方后按质量平均', '(1² + 3²) / 2', '= 5'], ['最后才开平方', 'W₂ = √5', '≈ 2.236']];
  rows.forEach(([label, a, b], i) => {
    const y = 51 + i * 62;
    body += rect(32, y, 575, 51, i === 2 ? '#dceadc' : C.pale) + text(53, y + 32, label, { anchor: 'start', size: 15 }) +
      text(370, y + 32, a, { color: C.teal, size: 18 }) + text(540, y + 32, b, { color: C.orange, size: 18 });
  });
  return figure(body, '这里的一维排序匹配是最优的。W₁=(1+3)/2=2，而 W₂=√5≈2.236；“平均移动距离”与“均方距离开根”反映不同的惩罚偏好。', 255, '成本、幂次与开根，按顺序读');
}

function sameMeanDifferentShape() {
  let body = text(155, 31, '全部质量位于 0', { weight: 600 }) + text(485, 31, '一半在 −1，一半在 +1', { weight: 600 });
  body += axis(45, 265, 170, [[0, '−1'], [.5, '0'], [1, '+1']]);
  body += axis(375, 595, 170, [[0, '−1'], [.5, '0'], [1, '+1']]);
  body += rect(145, 65, 20, 105, C.teal) + text(155, 53, '1');
  body += rect(365, 117.5, 20, 52.5, C.orange) + rect(585, 117.5, 20, 52.5, C.orange);
  body += text(375, 105, '1/2') + text(595, 105, '1/2') + text(320, 220, '均值都为 0，但 W₁ = W₂ = 1', { color: C.teal, weight: 600 });
  return figure(body, '同均值不等于同分布：源点 0 必须把一半质量送到 −1，另一半送到 +1。均值差为零，但运输能看到分散程度的差异。', 245, '只看均值，会丢掉什么？');
}

function dualBounds() {
  let body = text(320, 28, '对偶给下界，原始可行方案给上界', { weight: 600 });
  body += line(75, 120, 565, 120, C.line, 5);
  const positions = [[105, '0.6', '对偶可行值', C.orange], [320, '1.0', '真正最优值', C.teal], [535, '1.4', '原始可行值', C.orange]];
  positions.forEach(([x, v, label, color]) => { body += circle(x, 120, 10, color) + text(x, 88, v, { color, size: 22 }) + text(x, 159, label, { size: 15 }); });
  body += arrow(160, 195, 280, 195, C.orange) + arrow(480, 195, 360, 195, C.orange) + text(320, 225, '两个证书在最优值处相遇', { color: C.muted });
  return figure(body, '可手算例子：a=b=(0.5,0.5)，C=[[1,3],[3,1]]。取 u=v=(0.3,0.3)，对偶值为 0.6；取 P=[[0.4,0.1],[0.1,0.4]]，原始值为 1.4；最优对角计划成本为 1。', 250, '读懂 primal–dual gap');
}

function complementarySlackness() {
  let body = text(168, 31, '最优计划 P', { weight: 600 }) + text(476, 31, '松弛量 Cᵢⱼ − uᵢ − vⱼ', { weight: 600 });
  body += matrix([[.5, 0], [0, .5]], 102, 65, { cell: 68 }) + matrix([[0, 2], [2, 0]], 409, 65, { cell: 68, color: C.orange });
  body += text(320, 219, '正质量边 ⇒ 松弛量为 0；松弛量 > 0 ⇒ 不运输', { color: C.teal, size: 16 });
  return figure(body, '例子 C=[[0,2],[2,0]]、u=v=(0,0)、等权边缘。对角边有正质量且对偶约束取等号，非对角边有正松弛所以质量为零。反向“松弛为零就必有正质量”通常不成立。', 247, '互补松弛，把两张矩阵逐格对照');
}

function alternatingScaling() {
  let body = text(320, 27, '目标边缘 a=(0.6,0.4)，b=(0.5,0.5)', { weight: 600 });
  const panels = [
    { x: 26, title: '核 K', values: [[1, .25], [.25, 1]], note: ['还没有质量约束', '行、列都不匹配'] },
    { x: 244, title: '按行缩放', values: [[.48, .12], [.08, .32]], note: ['行和 0.6、0.4 ✓', '列和 0.56、0.44'] },
    { x: 462, title: '再按列缩放', values: [[3/7, 3/22], [1/14, 4/11]], note: ['列和 0.5、0.5 ✓', '行和约 0.565、0.435'] },
  ];
  panels.forEach(({ x, title, values, note }, i) => {
    body += text(x + 66, 61, title) + matrix(values, x + 9, 78, { cell: 62, digits: 3 });
    body += lines(x + 65, 231, note, { size: 14, color: C.muted, lineHeight: 24 });
    if (i < 2) body += arrow(x + 143, 137, x + 190, 137);
  });
  return figure(body, '一次行更新会精确满足行边缘，一次列更新会精确满足列边缘，但会再次扰动另一边缘。交替迭代才能同时逼近两组约束。右侧数值为显示而舍入，实际列和精确等于 0.5。', 282, 'Sinkhorn 为何要“来回”缩放？');
}

function epsilonScale() {
  let body = text(320, 31, '关键比值是 C / ε', { weight: 600 });
  const panels = [
    { x: 30, cost: '典型成本 1', epsilon: 'ε = 0.1', ratio: 'C/ε = 10' },
    { x: 352, cost: '典型成本 100', epsilon: 'ε = 10', ratio: 'C/ε = 10' },
  ];
  panels.forEach(p => { body += rect(p.x, 60, 258, 123) + text(p.x + 129, 92, p.cost) + text(p.x + 129, 125, p.epsilon, { color: C.orange }) + text(p.x + 129, 159, p.ratio, { color: C.teal, weight: 600 }); });
  body += text(320, 126, '＝', { size: 25 }) + text(320, 223, '同步缩放成本与 ε → 同一个核 K → 同一个最优计划', { size: 15, color: C.teal });
  return figure(body, '平衡 OT 中，将整个成本矩阵和 ε 同乘正数 λ，目标只整体乘以 λ，最优计划不变。只缩放成本、保持 ε 不变，会改变相对正则强度。', 249, 'ε 的大小，必须放在成本单位里理解');
}

function debiasNumbers() {
  let body = text(320, 29, '同一 ε，计算三次完整正则目标', { weight: 600 });
  const cards = [
    { x: 25, label: '跨分布 Fε(a,b)', value: '−0.0064' },
    { x: 235, label: '½ Fε(a,a)', value: '−0.5032' },
    { x: 445, label: '½ Fε(b,b)', value: '−0.5032' },
  ];
  cards.forEach(p => { body += rect(p.x, 60, 170, 89) + text(p.x + 85, 92, p.label, { size: 15 }) + text(p.x + 85, 128, p.value, { color: C.orange, size: 22 }); });
  body += text(214, 111, '−', { size: 25 }) + text(424, 111, '−', { size: 25 }) + text(320, 204, '去偏后 Sε(a,b) = 1.0000', { weight: 600, size: 22, color: C.teal });
  return figure(body, '可计算例子：两组等权分布分别位于 {0,1} 与 {1,2}，平方成本，ε=1，F=⟨P,C⟩+ΣPlogP。显示值舍入为四位小数。正则目标可能为负，不能直接把它当作距离。', 236, '去偏不只是一串符号：看一次数值抵消');
}

function quantileBarycenter() {
  let body = text(320, 28, '固定同一个分位水平 u，再平均位置', { weight: 600 });
  const x0 = 82, x1 = 565, y = v => 210 - 47 * v, mid = (x0 + x1) / 2;
  body += axis(x0, x1, 219, [[0, '0'], [.5, '0.5'], [1, '1']]) + text(585, 244, 'u', { size: 14 });
  [0, 1, 2, 3].forEach(v => { body += line(x0, y(v), x1, y(v), C.line, 1, 'stroke-dasharray="3 5"') + text(54, y(v) + 5, v, { size: 14, color: C.muted }); });
  const step = (v1, v2, color, extra = '') => `<path d="M ${x0} ${y(v1)} H ${mid} V ${y(v2)} H ${x1}" fill="none" stroke="${color}" stroke-width="3" ${extra}/>`;
  body += step(0, 2, C.teal) + step(1, 3, C.orange) + step(.5, 2.5, C.dark, 'stroke-dasharray="7 5"');
  body += line(108, 277, 133, 277, C.teal, 3) + text(142, 282, '源：0、2', { anchor: 'start', size: 14 });
  body += line(280, 277, 305, 277, C.orange, 3) + text(314, 282, '目标：1、3', { anchor: 'start', size: 14 });
  body += line(455, 277, 480, 277, C.dark, 3, 'stroke-dasharray="6 4"') + text(489, 282, '中点：0.5、2.5', { anchor: 'start', size: 14 });
  return figure(body, '各分布的两个点均带一半质量。离散分位数是阶梯型广义逆；一维 W₂ 重心在每个 u 处平均两端位置，所以中点分布为 ½δ₀.₅+½δ₂.₅。竖直跳跃用于表示阶梯，不表示存在中间质量。', 306, '分位数函数：让分布变成可以平均的坐标');
}

function fixedVersusFree() {
  let body = text(155, 30, '固定支撑只能选 {0,1}', { weight: 600 }) + text(485, 30, '自由支撑可以移到 0.5', { weight: 600 });
  body += axis(50, 260, 155, [[0, '0'], [.5, '0.5'], [1, '1']]) + axis(380, 590, 155, [[0, '0'], [.5, '0.5'], [1, '1']]);
  body += circle(50, 155, 13) + circle(260, 155, 13) + circle(155, 155, 13, 'none', `stroke="${C.muted}" stroke-width="2" stroke-dasharray="4 3"`);
  body += text(155, 102, '中间位置不在候选网格', { size: 14, color: C.muted });
  body += circle(485, 155, 21, C.orange) + text(485, 113, '全部质量放在这里', { size: 14, color: C.orange });
  body += text(155, 218, '最小目标 = 0.5', { color: C.teal }) + text(485, 218, '最小目标 = 0.25', { color: C.orange });
  return figure(body, '输入为 δ₀、δ₁，各占一半重心权重；本图没有熵正则。目标是 ½W₂²(ρ,δ₀)+½W₂²(ρ,δ₁)。固定支撑 {0,1} 上目标恒为 0.5，权重未必唯一；自由支撑 δ₀.₅ 达到 0.25。', 245, '固定网格带来的误差，与熵平滑分开看');
}

function unbalancedMass() {
  let body = text(320, 29, '单点例子：a=1，b=0.5，运输单位成本=1', { weight: 600 });
  const baseline = 204, scale = 165;
  body += line(65, baseline, 590, baseline) + line(65, baseline - .5 * scale, 590, baseline - .5 * scale, C.orange, 2, 'stroke-dasharray="6 5"') + text(583, 103, '目标参考质量 0.5', { anchor: 'end', size: 14, color: C.orange });
  body += rect(130, baseline - .004764 * scale, 56, .004764 * scale, C.teal) + circle(158, baseline - .004764 * scale, 3, C.teal) + text(158, 239, 'ρ=0.1') + text(158, 182, 'p≈0.0048', { size: 15 });
  body += rect(399, baseline - .672621 * scale, 56, .672621 * scale, C.teal) + text(427, 239, 'ρ=10') + text(427, 77, 'p≈0.6726', { size: 15 });
  return figure(body, '无计划熵正则时，最小化 p+ρKL(p|1)+ρKL(p|0.5)，得 p=√0.5·exp[−1/(2ρ)]。较大 ρ 下 p 可以超过参考目标质量 0.5，说明 KL 软约束并非“只能丢弃质量”的硬上界。', 268, '非平衡模型允许质量增减，不只是少运一点');
}

function partialBudget() {
  let body = text(320, 29, '上界 a=(0.6,0.4)，b=(0.5,0.5)，预算 m=0.7', { weight: 600 });
  body += matrix([[.5, .1], [0, .1]], 84, 66, { cell: 71 });
  body += text(388, 85, '实际行和 = (0.6,0.1)', { size: 16 }) + text(388, 122, '实际列和 = (0.5,0.2)', { size: 16 }) +
    text(388, 159, '计划总量 = 0.7', { color: C.teal, weight: 600 }) + text(388, 196, '两侧各有 0.3 未参与匹配', { size: 15, color: C.muted });
  body += text(320, 246, '行和 ≤ a，列和 ≤ b，总和 = m', { color: C.orange, weight: 600 });
  return figure(body, '这是一个满足部分传输约束的可行计划，不声称在某个成本下最优。m=0.7 表示绝对运输质量；只有总质量都为 1 时，它才同时是 70%。', 273, '部分 OT：容量上界，加一个硬预算');
}

function pairwiseStructure() {
  let body = text(320, 27, '一次结构比较，涉及两对匹配', { weight: 600 });
  body += line(112, 83, 112, 193, C.teal, 4) + line(528, 83, 528, 193, C.orange, 4);
  body += circle(112, 83, 17) + circle(112, 193, 17) + circle(528, 83, 17, C.orange) + circle(528, 193, 17, C.orange);
  body += text(112, 88, 'i', { color: C.white }) + text(112, 198, 'k', { color: C.white }) + text(528, 88, 'j', { color: C.white }) + text(528, 198, 'l', { color: C.white });
  body += line(143, 83, 496, 83, C.muted, 2, 'stroke-dasharray="7 5"') + line(143, 193, 496, 193, C.muted, 2, 'stroke-dasharray="7 5"');
  body += text(52, 144, '2', { size: 22, color: C.teal }) + text(589, 144, '3', { size: 22, color: C.orange });
  body += text(320, 132, '内部距离失配', { size: 16 }) + text(320, 165, '(2 − 3)² = 1', { size: 23, color: C.teal });
  return figure(body, 'GW 比较源空间的 Cᵢₖ 与目标空间的 Dⱼₗ，并乘以匹配质量 TᵢⱼTₖₗ。图中边的长度为排版示意，旁边的 2、3 才是输入的内部相异度；跨空间虚线不是地面成本。', 246, 'GW 为什么需要四个下标？');
}

function fgwWeights() {
  let body = text(320, 28, 'FGW = (1−α) × 特征项 + α × 结构项', { weight: 600 });
  [0, .5, 1].forEach((a, i) => {
    const y = 66 + i * 62, x = 175, width = 385;
    body += text(95, y + 24, `α = ${a}`);
    if (a < 1) body += rect(x, y, width * (1 - a), 36, C.orange);
    if (a > 0) body += rect(x + width * (1 - a), y, width * a, 36, C.teal);
    body += text(368, y + 24, a === 0 ? '只比较可比特征' : a === 1 ? '只比较内部结构' : '两项各取一半权重', { color: C.white, size: 15 });
  });
  return figure(body, '这是 POT 的 α 约定。条形长度表示系数，不代表两个损失实际贡献的比例；若结构项数值大一个数量级，α=0.5 也未必实现数值上的“各占一半”。', 267, '权重方向，与损失尺度一起检查');
}

function projectionDirection() {
  let body = text(320, 28, '同一组二维点，换个方向看到的差异不同', { weight: 600 });
  body += text(146, 62, '原空间：目标整体向上 1', { size: 15 }) + line(73, 174, 235, 174) + line(73, 174, 73, 82);
  body += circle(100, 160, 9) + circle(200, 160, 9) + circle(100, 93, 9, C.orange) + circle(200, 93, 9, C.orange);
  body += arrow(245, 130, 302, 130) + text(462, 69, '投影到横轴：完全重合', { size: 15 });
  body += line(370, 109, 560, 109) + circle(407, 109, 11, C.orange) + circle(407, 109, 6) + circle(520, 109, 11, C.orange) + circle(520, 109, 6);
  body += text(462, 158, '投影到纵轴：相距 1', { size: 15 }) + line(370, 196, 560, 196) + circle(407, 196, 9) + circle(520, 196, 9, C.orange) + text(462, 226, '单个方向可能看不见位移', { size: 15, color: C.muted });
  return figure(body, '源点为 (0,0)、(1,0)，目标点为 (0,1)、(1,1)，各点等权。横轴投影的一维 W₂=0，纵轴投影为 1，原空间 W₂=1。二维所有单位方向均匀平均后 SW₂=1/√2，而不是 1。', 254, '切片：方向可以揭示，也可以遮住差异');
}

function matrixMemory() {
  let body = text(320, 29, '仅一张 float64 成本矩阵：8 × n × m 字节', { weight: 600 });
  const rows = [[1000, 8], [5000, 200], [10000, 800]];
  rows.forEach(([n, mb], i) => {
    const y = 66 + i * 58;
    body += text(23, y + 22, `${n}²`, { anchor: 'start', size: 15 }) + rect(130, y, Math.max(5, mb / 800 * 390), 30, C.teal) + text(545, y + 22, `${mb} MB`, { anchor: 'start', color: C.orange, size: 16 });
  });
  return figure(body, '这里使用十进制 MB（10⁶ 字节）。n=m=10000 时一张矩阵为 800 MB；若同时存储计划，还要再加同量级存储，优化器与自动微分图可能继续增加开销。', 258, '先做内存算术，再谈大规模算法');
}

function barycentricVariance() {
  let body = text(155, 31, '目标：两处各一半质量', { weight: 600 }) + text(485, 31, '重心映射：所有质量到均值', { weight: 600 });
  body += axis(55, 255, 162, [[0, '0'], [.5, '1'], [1, '2']]) + axis(385, 585, 162, [[0, '0'], [.5, '1'], [1, '2']]);
  body += rect(45, 112, 20, 50, C.orange) + rect(245, 112, 20, 50, C.orange) + rect(475, 62, 20, 100, C.teal);
  body += text(55, 98, '1/2') + text(255, 98, '1/2') + text(485, 48, '1');
  body += arrow(285, 124, 345, 124) + text(320, 95, '取均值', { size: 14 });
  body += text(155, 220, '均值 1，方差 1', { color: C.orange }) + text(485, 220, '均值 1，方差 0', { color: C.teal });
  return figure(body, '一行计划把单位质量分别送到 0 与 2，重心映射却只输出平均位置 1。它保留加权均值，但压缩了分散程度；映射后的确定性分布一般不等于目标分布。', 247, '从完整计划到一个均值，会丢掉什么？');
}

function gradientObjects() {
  let body = text(320, 28, '一次求解可以产生不同形状的数学对象', { weight: 600 });
  const panels = [
    { x: 22, title: '输入成本 M', label: 'n × m 矩阵', detail: '改变一个成本元素' },
    { x: 238, title: '最优计划 P*(M)', label: 'n × m 矩阵', detail: '计划本身会跟着变' },
    { x: 454, title: '完整最优值 F(M)', label: '一个标量', detail: '包含运输成本与熵项' },
  ];
  panels.forEach((p, i) => {
    body += rect(p.x, 58, 163, 113) + text(p.x + 81, 89, p.title, { size: 15, color: C.teal }) + text(p.x + 81, 119, p.label, { size: 15 }) + text(p.x + 81, 149, p.detail, { size: 14, color: C.muted });
    if (i < 2) body += arrow(p.x + 171, 114, p.x + 204, 114);
  });
  body += text(172, 219, '∂F/∂M：n × m', { color: C.teal }) + text(474, 219, '∂P/∂M：n × m × n × m', { color: C.orange });
  return figure(body, '固定边缘与 ε 时，完整正则最优值的梯度等于 P*。计划对成本的导数则描述“每个成本扰动如何改变每个计划元素”，是高一阶的对象。', 249, '先问：你要对哪个输出求导？');
}

function finiteDifference() {
  let body = text(320, 28, '同一元素做正、负两次微扰，并重新求解', { weight: 600 });
  const x0 = 85, x1 = 564, baseline = 209;
  const point = s => [x0 + (x1 - x0) * s, 185 - 115 * (s - .25 * s * s)];
  const points = Array.from({ length: 51 }, (_, i) => point(i / 50));
  body += line(x0, baseline, x1, baseline) + `<polyline points="${points.map(p => p.join(',')).join(' ')}" fill="none" stroke="${C.teal}" stroke-width="3"/>`;
  const low = point(.37), high = point(.63);
  body += line(low[0], low[1], high[0], high[1], C.orange, 3) + circle(low[0], low[1], 7, C.orange) + circle(high[0], high[1], 7, C.orange);
  body += line(low[0], low[1], low[0], baseline, C.muted, 1, 'stroke-dasharray="4 5"') + line(high[0], high[1], high[0], baseline, C.muted, 1, 'stroke-dasharray="4 5"');
  body += text(low[0] - 13, 237, 'Mᵢⱼ − h', { size: 14 }) + text(high[0] + 13, 237, 'Mᵢⱼ + h', { size: 14 }) + text(452, 75, '割线斜率 ≈ P*ᵢⱼ', { color: C.orange, size: 16 });
  return figure(body, '示意曲线，不是某个数据集的测量值。中心差分用 [F(M+hEᵢⱼ)−F(M−hEᵢⱼ)]/(2h) 近似完整正则最优值的导数。步长缩小与求解精度必须一起检查。', 266, '有限差分，是求导公式的一次独立核验');
}

function evaluationProtocol() {
  let body = text(320, 28, '每种数据，只承担它应承担的职责', { weight: 600 });
  const panels = [
    { x: 27, title: '训练集', details: ['拟合预处理', '训练模型 / 耦合规则'], color: C.teal },
    { x: 239, title: '验证集', details: ['选择 ε、α、方向数', '比较候选设置'], color: C.orange },
    { x: 451, title: '测试集', details: ['冻结设置后评估', '报告成功与失败'], color: C.teal },
  ];
  panels.forEach((p, i) => {
    body += rect(p.x, 60, 162, 119) + text(p.x + 81, 92, p.title, { weight: 600, color: p.color }) + lines(p.x + 81, 124, p.details, { size: 14, color: C.muted, lineHeight: 25 });
    if (i < 2) body += arrow(p.x + 173, 120, p.x + 202, 120);
  });
  body += text(320, 223, '转导式任务若允许使用无标签目标特征，应在协议中写明。', { size: 15, color: C.muted });
  return figure(body, '普通泛化评估中，预处理在训练数据上拟合，超参数用验证集选择，测试集用于最终报告。无监督域适应或转导任务可能允许使用无标签目标特征，但不能据此使用目标测试标签调参。', 251, '应用论文的结果，离不开评估协议');
}

/** Support newly added application/patent sections without coupling to content IDs. */
function pipeline(spec) {
  const labels = Array.isArray(spec.labels) && spec.labels.length ? spec.labels : [['输入', '数据与假设'], ['OT 建模', '质量、成本和约束'], ['解释输出', '对应关系或分布分数']];
  const vertical = labels.length > 4;
  const n = labels.length, margin = 25, gap = vertical ? 27 : 30;
  const width = vertical ? 510 : (640 - 2 * margin - gap * (n - 1)) / n;
  const wrap = (value, max) => String(value ?? '').split('\n').flatMap(part => {
    const chars = Array.from(part);
    return chars.length ? Array.from({ length: Math.ceil(chars.length / max) }, (_, i) => chars.slice(i * max, (i + 1) * max).join('')) : [''];
  });
  const cards = labels.map(item => {
    const pair = Array.isArray(item) ? item : [item, ''];
    const title = wrap(pair[0], Math.max(5, Math.floor((width - 28) / 17)));
    const detail = wrap(pair[1], Math.max(6, Math.floor((width - 28) / 14)));
    return { title, detail, height: Math.max(105, 45 + title.length * 24 + detail.length * 22) };
  });
  const commonHeight = Math.max(...cards.map(card => card.height));
  let body = '', nextY = 20;
  cards.forEach((card, i) => {
    const x = vertical ? 65 : margin + i * (width + gap);
    const y = vertical ? nextY : 25, height = vertical ? card.height : commonHeight;
    body += rect(x, y, width, height) + lines(x + width / 2, y + 31, card.title, { size: 17, color: C.teal, weight: 600, lineHeight: 24 });
    body += lines(x + width / 2, y + 44 + card.title.length * 24, card.detail, { size: 14, lineHeight: 22, color: C.muted });
    if (i < n - 1) body += vertical ? arrow(320, y + height + 5, 320, y + height + gap - 5) : arrow(x + width + 5, y + height / 2, x + width + gap - 5, y + height / 2);
    nextY = y + height + gap;
  });
  const height = vertical ? nextY - gap + 20 : commonHeight + 50;
  return figure(body, spec.caption || '按步骤阅读：先明确输入与假设，再写出 OT 问题，最后解释输出及其适用边界。', height, spec.title || '从数据到结果：方法流程');
}

function patentFlow(spec) {
  return pipeline({
    ...spec,
    title: spec.title || '发明专利的一般程序：术语示意',
    labels: spec.labels || [
      ['递交申请', '申请材料进入专利审查程序'],
      ['受理', '确认申请可被接收；仍非授权'],
      ['初步审查', '核对进入后续程序的条件'],
      ['申请公布', '公开申请文本；不等于权利已获授权'],
      ['实质审查', '审查申请是否符合授权要求'],
      ['审查结果', '可能授权，也可能驳回、撤回或其他结案'],
    ],
    caption: spec.caption || '一般程序的教学示意，不标记任何具体申请目前处于哪一阶段。申请号、公布号和授权公告号代表不同信息，具体状态需以公开登记和正式文书核对。',
  });
}

function fourLocationGeneDistribution(spec) {
  const raw = Array.isArray(spec.expression) && spec.expression.length === 4 ? spec.expression.map(Number) : [1, 1, 5, 1];
  const total = raw.reduce((a, b) => a + b, 0);
  if (!(total > 0) || raw.some(v => !Number.isFinite(v) || v < 0)) return '';
  const normalized = raw.map(v => v / total), max = Math.max(...raw);
  const xs = [90, 245, 400, 555];
  let body = text(320, 28, '把一个基因的表达量，放回组织位置', { weight: 600 });
  raw.forEach((v, i) => {
    const r = 11 + 20 * Math.sqrt(v / max);
    body += circle(xs[i], 94, r, C.orange) + text(xs[i], 159, `位置 ${i + 1}`, { size: 14 }) + text(xs[i], 187, `表达 ${v}`, { size: 14, color: C.orange }) + text(xs[i], 219, `质量 ${normalized[i].toFixed(3)}`, { size: 14, color: C.teal });
    if (i < 3) body += line(xs[i] + 38, 94, xs[i + 1] - 38, 94, C.line, 1, 'stroke-dasharray="4 5"');
  });
  return figure(body, spec.caption || '教学示意：四个组织位置的表达计数为 (1,1,5,1)，总量归一化后形成位置上的概率质量 (0.125,0.125,0.625,0.125)。这只展示一种建模步骤，不代表任何指定专利或论文的完整算法；位置之间的地面成本需另行定义。', 247, spec.title || '表达向量 → 空间分布');
}

function geneDistribution(spec) {
  // Optional explicit four-location input retains the simpler normalization view.
  if (Array.isArray(spec.expression) && spec.expression.length === 4) {
    return fourLocationGeneDistribution(spec);
  }
  let body = text(320, 28, '表达值完全相同，放在组织里的排列可以不同', { weight: 600 });
  const panels = [
    { x: 75, title: '左半区域聚集', high: (row, col) => col < 2 },
    { x: 420, title: '棋盘式分散', high: (row, col) => (row + col) % 2 === 0 },
  ];
  panels.forEach(panel => {
    body += text(panel.x + 67.5, 63, panel.title, { color: C.teal, weight: 600 });
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const high = panel.high(row, col), x = panel.x + col * 45, y = 96 + row * 45;
        body += circle(x, y, 17, high ? C.orange : '#dbe6d8') +
          text(x, y + 5, high ? '1' : '0', { size: 14, color: high ? C.white : C.muted });
      }
    }
  });
  body += text(320, 279, '每组都是：8 个高表达值 1 ＋ 8 个零值', { color: C.orange, size: 16 });
  body += text(320, 307, '总表达量 8；均值 0.5；总体方差 0.25', { color: C.teal, size: 15 });
  body += text(320, 335, '只看表达直方图无法区分；空间位置提供额外信息。', { color: C.muted, size: 15 });
  return figure(body, spec.caption || '纯教学示意：两组数据位于同一个 4×4 位置网格，每组都包含 8 个表达值 1 与 8 个零值，归一化前的总表达量为 8，归一化后每个非零位置质量为 1/8。两组原始表达值的均值均为 0.5、总体方差均为 0.25，但高表达的位置不同。这个例子不代表指定专利的公式，也不单凭图示证明统计显著性。', 360, spec.title || '表达直方图相同，空间模式仍可不同');
}

const SECTION_FIGURES = new Map([
  ['01:1', couplingMargins], ['01:2', groundCost],
  ['02:1', empiricalMeasure], ['02:3', normalizeMass],
  ['03:3', feasibleSegment],
  ['04:0', costAndRoot], ['04:3', sameMeanDifferentShape],
  ['05:1', dualBounds], ['05:3', complementarySlackness],
  ['06:2', alternatingScaling], ['06:3', epsilonScale],
  ['07:2', debiasNumbers],
  ['08:1', quantileBarycenter], ['08:3', fixedVersusFree],
  ['09:1', unbalancedMass], ['09:3', partialBudget],
  ['10:0', pairwiseStructure], ['10:3', fgwWeights],
  ['11:1', projectionDirection], ['11:3', matrixMemory],
  ['12:1', barycentricVariance],
  ['13:1', gradientObjects], ['13:2', finiteDifference],
  ['14:2', evaluationProtocol],
]);

export function sectionFigure(chapterId, sectionIndex, figureSpec) {
  if (figureSpec && typeof figureSpec === 'object') {
    if (figureSpec.type?.startsWith('paper-')) return paperFigure(figureSpec);
    if (figureSpec.type?.startsWith('spatial-')) return spatialFigure(figureSpec);
    if (figureSpec.type?.startsWith('chord-')) return chordFigure(figureSpec);
    if (figureSpec.type === 'pipeline') return pipeline(figureSpec);
    if (figureSpec.type === 'patent-flow') return patentFlow(figureSpec);
    if (figureSpec.type === 'gene-distribution') return geneDistribution(figureSpec);
  }
  return SECTION_FIGURES.get(`${String(chapterId).padStart(2, '0')}:${sectionIndex}`)?.() || '';
}

export const sectionFigureCount = SECTION_FIGURES.size;
