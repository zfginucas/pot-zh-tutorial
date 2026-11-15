// Original figures for the spatial-omics chapter. Numeric examples are synthetic.
const colors = {
  ink: '#29433a', muted: '#667b6e', teal: '#26786b', orange: '#d7834d',
  red: '#b75b4a', pale: '#e5ede0', line: '#aabfac', white: '#ffffff', gray: '#ced8ca',
};

function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function text(x, y, label, size = 15, color = colors.ink, anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" font-family="Segoe UI,Microsoft YaHei,sans-serif">${escape(label)}</text>`;
}

function line(x1, y1, x2, y2, color = colors.line, width = 2, dash = false) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash ? ' stroke-dasharray="5 5"' : ''}/>`;
}

function arrow(x1, y1, x2, y2, color = colors.teal, width = 2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const points = [
    [x2, y2],
    [x2 - 9 * Math.cos(angle - .45), y2 - 9 * Math.sin(angle - .45)],
    [x2 - 9 * Math.cos(angle + .45), y2 - 9 * Math.sin(angle + .45)],
  ];
  return line(x1, y1, x2, y2, color, width)
    + `<polygon points="${points.map(point => point.join(',')).join(' ')}" fill="${color}"/>`;
}

function dot(x, y, label, color = colors.teal, radius = 14) {
  return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`
    + text(x, y + 5, label, 14, colors.white);
}

function panel(x, y, width, height) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="9" fill="${colors.white}" stroke="${colors.line}"/>`;
}

function matrix(values, x, y, cell = 47, color = colors.teal) {
  return values.map((row, rowIndex) => row.map((value, columnIndex) => {
    const fill = value === 0 ? colors.white : colors.pale;
    return `<rect x="${x + columnIndex * cell}" y="${y + rowIndex * cell}" width="${cell - 3}" height="${cell - 3}" rx="4" fill="${fill}" stroke="${colors.line}"/>`
      + text(x + columnIndex * cell + (cell - 3) / 2, y + rowIndex * cell + cell / 2 + 4, value, 14, color);
  }).join('')).join('');
}

function chart(body, caption, height) {
  return `<figure class="concept-figure section-figure spatial-figure"><svg viewBox="0 0 640 ${height}" role="img" aria-label="${escape(caption)}"><title>${escape(caption)}</title>${body}</svg><figcaption>${escape(caption)}</figcaption></figure>`;
}

function spatialData() {
  let body = text(132, 27, '三个 spot 的组织位置', 17)
    + text(416, 27, '同一索引的表达与坐标', 17);
  body += line(42, 156, 248, 156);
  const positions = [60, 120, 240];
  positions.forEach((x, index) => {
    body += dot(x, 128, index + 1) + text(x, 181, `x = ${[0, 1, 3][index]}`, 14);
  });
  body += text(305, 65, 'spot', 14) + text(388, 65, '基因 g₁', 14)
    + text(470, 65, '基因 g₂', 14) + text(552, 65, '坐标', 14);
  [[3, 1, 0], [1, 3, 1], [2, 2, 3]].forEach((row, index) => {
    const y = 98 + index * 41;
    body += text(305, y, index + 1) + text(388, y, row[0])
      + text(470, y, row[1]) + text(552, y, `(${row[2]}, 0)`);
    body += line(279, y + 13, 596, y + 13);
  });
  body += text(320, 229, '本章设 a = (⅓, ⅓, ⅓)，每个 spot 占同等概率质量', 15);
  return { body, height: 251, caption: '合成数据贯穿本章。三行表达与三个坐标按 spot 索引相连，每个 spot 的权重为三分之一。' };
}

function spatialChannels() {
  let body = text(114, 27, '跨切片表达成本 M', 17)
    + text(335, 27, 'A 片内部距离 Dᴬ', 17)
    + text(540, 27, 'B 片内部距离 Dᴮ', 17);
  body += matrix([['1', '0', '¼'], ['0', '1', '¼'], ['¼', '¼', '0']], 45, 62, 46);
  body += matrix([[0, 1, 3], [1, 0, 2], [3, 2, 0]], 267, 62, 46);
  body += matrix([[0, 1, 3], [1, 0, 2], [3, 2, 0]], 472, 62, 46, colors.orange);
  body += text(115, 225, '行 i 对 A，列 j 对 B', 14)
    + text(335, 225, '行列都在 A 片', 14) + text(540, 225, '行列都在 B 片', 14);
  body += text(320, 267, 'M₁₂ = 0 偏好 A₁ → B₂，结构距离却同时约束其他配对', 15);
  return { body, height: 287, caption: 'M 由两基因表达平方差除以 8 得到。B 的前两行表达交换，但位置仍在 0、1、3。Dᴬ 与 Dᴮ 编码各自片内距离。' };
}

function spatialPairCost() {
  let body = text(166, 27, '结构保持的候选计划', 17)
    + text(479, 27, '交换前两点的候选计划', 17);
  body += panel(24, 45, 282, 207) + panel(334, 45, 282, 207);
  for (const offset of [0, 310]) {
    const source = [65, 124, 242].map(x => x + offset);
    source.forEach((x, index) => { body += dot(x, 89, `A${index + 1}`); });
    source.forEach((x, index) => { body += dot(x, 192, `B${index + 1}`, colors.orange); });
    const target = offset === 0 ? [0, 1, 2] : [1, 0, 2];
    source.forEach((x, index) => {
      body += arrow(x, 105, source[target[index]], 174, colors.teal, 2);
    });
    body += line(source[0], 62, source[2], 62, colors.teal, 3);
    body += text((source[0] + source[2]) / 2, 54, 'A₁ 到 A₃ 距离 3', 13);
  }
  body += text(165, 236, 'P₁₁ = P₂₂ = P₃₃ = ⅓', 14)
    + text(476, 236, 'P₁₂ = P₂₁ = P₃₃ = ⅓', 14);
  body += text(165, 282, '表达成本 E = ⅔，结构成本 Q = 0', 15)
    + text(476, 282, '表达成本 E = 0，结构成本 Q = 4/9', 15);
  return { body, height: 308, caption: '右侧配对中 A₁→B₂、A₃→B₃ 将长度 3 对应为长度 2。一个有序点对贡献 (3−2)²×⅓×⅓=1/9，反向点对也贡献 1/9。两组失配合计 4/9。' };
}

function spatialAlpha() {
  const px = alpha => 65 + alpha * 500;
  const py = value => 248 - value * 255;
  let body = text(320, 25, '同一输入，只改变 α', 17);
  body += line(65, 248, 578, 248) + line(65, 248, 65, 55);
  for (const alpha of [0, .3, .6, 1]) body += text(px(alpha), 272, alpha, 14);
  for (const value of [0, .2, .4, .6]) body += text(43, py(value) + 5, value.toFixed(1), 13);
  body += line(px(0), py(2 / 3), px(1), py(0), colors.teal, 4);
  body += line(px(0), py(0), px(1), py(4 / 9), colors.orange, 4);
  body += line(px(.6), 248, px(.6), py(4 / 15), colors.muted, 1, true);
  body += `<circle cx="${px(.6)}" cy="${py(4 / 15)}" r="5" fill="${colors.ink}"/>`;
  body += text(180, 48, '结构保持计划 F = (1−α)×⅔', 14, colors.teal)
    + text(412, 228, '表达匹配计划 F = α×4/9', 14, colors.orange)
    + text(410, 143, 'α = 0.6，两者均为 4/15', 14);
  body += text(320, 310, 'α = 0.2 时更偏好表达匹配，α = 0.8 时更偏好结构保持', 15);
  return { body, height: 332, caption: '这里只比较上一图两份给定候选计划。α=0.6 是这两条目标曲线的交点，完整 FGW 还会搜索其他可行计划。' };
}

function spatialFrankWolfe() {
  let body = text(105, 27, '当前计划 P⁽⁰⁾', 17) + text(320, 27, '梯度 G', 17)
    + text(535, 27, '线性 OT 候选 S', 17);
  body += matrix([['1/9', '1/9', '1/9'], ['1/9', '1/9', '1/9'], ['1/9', '1/9', '1/9']], 39, 55, 46);
  body += matrix([['3.61', '2.33', '3.35'], ['2.33', '1.83', '2.79'], ['3.35', '2.79', '3.11']], 253, 55, 46);
  body += matrix([['0', '⅓', '0'], ['⅓', '0', '0'], ['0', '0', '⅓']], 467, 55, 46);
  body += arrow(185, 118, 233, 118) + arrow(399, 118, 449, 118);
  body += text(106, 220, 'α = 0.5，F = 1.5', 14)
    + text(320, 220, '按当前 P 重新计算', 14) + text(535, 220, 'EMD 精确解子问题', 14);
  body += text(320, 263, '线搜索 φ(γ) = F(P + γ(S−P))', 16);
  body += line(90, 372, 553, 372) + line(90, 372, 90, 287);
  const points = Array.from({ length: 41 }, (_, index) => {
    const gamma = index / 40;
    const value = 1.5 - 13 / 54 * gamma - 28 / 27 * gamma * gamma;
    return `${90 + gamma * 460},${375 - value * 55}`;
  });
  body += `<polyline points="${points.join(' ')}" fill="none" stroke="${colors.teal}" stroke-width="4"/>`;
  body += text(90, 396, 'γ = 0', 14) + text(548, 396, 'γ = 1', 14)
    + text(168, 286, 'F = 1.5', 14) + text(509, 335, 'F = 2/9', 14);
  body += text(320, 431, '本次取 γ = 1，新的计划为 S，目标从 1.5 降到 2/9', 15);
  return { body, height: 453, caption: '上一节三点例子的第一轮条件梯度，α=0.5。矩阵梯度显示到小数点后两位，线搜索使用未舍入值。后续仍需重新计算梯度和检查停止条件。' };
}

function spatialCoordinateReadout() {
  let body = text(160, 27, '观测坐标分属两个坐标系', 17)
    + text(480, 27, '根据 P 求解 R 与 v', 17);
  body += line(32, 269, 286, 269) + line(357, 269, 608, 269);
  [60, 110, 210].forEach((x, index) => { body += dot(x, 240, `A${index + 1}`); });
  [223, 173, 73].forEach((y, index) => { body += dot(270, y, `B${index + 1}`, colors.orange); });
  body += arrow(297, 160, 342, 160);
  [378, 428, 528].forEach((x, index) => {
    body += `<circle cx="${x}" cy="240" r="22" fill="none" stroke="${colors.orange}" stroke-width="4"/>`;
    body += dot(x, 240, index + 1);
  });
  body += text(150, 308, 'P 先给出关联权重', 15) + text(483, 308, '橙圈经刚性变换与绿点重合', 15);
  return { body, height: 330, caption: '先用 FGW 估计关联 P，再求加权 Procrustes 的刚性坐标变换。PASTE 用 SVD 求这个读出步骤，3D 叠放还需要切片顺序与层间间距。' };
}

function spatialPartial() {
  let body = text(164, 27, '平衡约束，总质量 1', 17) + text(479, 27, '部分约束，m = 2/3', 17);
  for (const offset of [0, 314]) {
    [70, 150, 250].forEach((x, index) => {
      const unmatched = offset > 0 && index === 2;
      body += dot(x + offset, 77, `A${index + 1}`, unmatched ? colors.gray : colors.teal);
      body += dot(x + offset, 196, `B${index + 1}`, unmatched ? colors.gray : colors.orange);
      if (!unmatched) body += arrow(x + offset, 96, x + offset, 175, index === 2 ? colors.red : colors.teal, index === 2 ? 4 : 3);
    });
  }
  body += text(162, 117, '每条边质量 ⅓', 14)
    + text(247, 145, '高成本', 13, colors.red)
    + text(480, 145, 'A₃、B₃ 各余 ⅓', 14);
  body += matrix([['⅓', '0', '0'], ['0', '⅓', '0'], ['0', '0', '⅓']], 91, 241, 45);
  body += matrix([['⅓', '0', '0'], ['0', '⅓', '0'], ['0', '0', '0']], 405, 241, 45);
  body += text(320, 421, '示例位置 A = (0,1,2)，B = (0,1,8)，每个点容量 ⅓', 15);
  return { body, height: 443, caption: '给定两份可行示例计划。以平方特征成本计，左侧第三条边贡献 (2−8)²/3=12，右侧保留总质量 2/3 并使这部分成本为零。' };
}

function spatialUnbalanced() {
  let body = text(320, 27, '一个源点 a = 1，一个目标点 b = 0.5，单位成本为 1', 17);
  body += dot(117, 94, 'a', colors.teal, 26) + dot(509, 94, 'b', colors.orange, 19)
    + arrow(160, 94, 470, 94, colors.teal, 4) + text(320, 78, '只需优化一条边的质量 p', 15);
  const labels = ['ρ = 0.1', 'ρ = 1', 'ρ = 10'];
  const values = [.1, 1, 10].map(rho => Math.sqrt(.5) * Math.exp(-1 / (2 * rho)));
  labels.forEach((label, index) => {
    const y = 169 + index * 55;
    body += text(91, y + 17, label, 15);
    body += `<rect x="165" y="${y}" width="360" height="24" fill="${colors.white}" stroke="${colors.line}"/>`;
    body += `<rect x="165" y="${y}" width="${360 * values[index]}" height="24" fill="${colors.teal}"/>`;
    body += text(568, y + 18, values[index].toFixed(4), 15);
  });
  body += line(345, 156, 345, 318, colors.orange, 2, true)
    + text(345, 342, '参考目标质量 b = 0.5', 14, colors.orange);
  return { body, height: 368, caption: '教学极简情形取 α=0、ε=0。最优质量 p=√0.5 exp[−1/(2ρ)]。ρ 增大时本例的 p 接近 √0.5，可超过 b，说明 KL 边缘罚项属于软约束。' };
}

function spatialExpressionReadout() {
  let body = text(125, 27, '单细胞中基因 G 的表达', 17)
    + text(331, 27, '已经求得的关联 P', 17)
    + text(535, 27, '两个空间位置的读出', 17);
  body += dot(92, 101, 'A') + text(157, 106, '10', 20)
    + dot(92, 164, 'B') + text(157, 169, '0', 20);
  body += matrix([['0.3', '0.2'], ['0.1', '0.4']], 276, 85, 56);
  body += arrow(199, 127, 250, 127) + arrow(401, 127, 444, 127);
  body += text(488, 80, '位置 1', 15) + text(576, 80, '位置 2', 15);
  body += text(488, 114, '3', 21, colors.teal) + text(576, 114, '2', 21, colors.teal)
    + text(533, 146, '质量加权汇总 PᵀX', 14);
  body += text(488, 187, '÷ 0.4', 16) + text(576, 187, '÷ 0.6', 16)
    + text(488, 222, '7.5', 22, colors.orange) + text(576, 222, '3.33', 22, colors.orange);
  body += text(320, 273, '位置 1 的条件均值 = (0.3×10 + 0.1×0) / (0.3+0.1)', 15);
  return { body, height: 295, caption: '教学关联矩阵有列质量 0.4 与 0.6。先计算 PᵀX，再按实际列质量归一化，得到每位置条件均值。零列质量表示该位置缺少可用预测。' };
}

function spatialMirrorDescent() {
  let body = text(320, 26, 'moscot 空间映射中的一次镜像下降', 17);
  body += matrix([['p₁₁', 'p₁₂'], ['p₂₁', 'p₂₂']], 33, 67, 54)
    + text(86, 203, '正计划 Pᵗ', 15);
  body += arrow(151, 113, 205, 113)
    + text(320, 81, 'Gᵗ = ∇Fε(Pᵗ)', 18)
    + text(320, 125, 'K = Pᵗ ⊙ exp(−ηGᵗ)', 17)
    + text(320, 170, '按行列边缘作 KL 投影', 15);
  body += arrow(425, 113, 477, 113)
    + matrix([['p′₁₁', 'p′₁₂'], ['p′₂₁', 'p′₂₂']], 494, 67, 54)
    + text(548, 203, '新计划 Pᵗ⁺¹', 15);
  const epsilonValues = [.2, 1];
  epsilonValues.forEach((epsilon, index) => {
    const off = 1 / (2 * (1 + Math.exp(1 / epsilon)));
    const diagonal = .5 - off;
    const x = index === 0 ? 131 : 390;
    body += text(x + 54, 257, `α = 0，ε = ${epsilon}`, 16);
    body += matrix([[diagonal.toFixed(3), off.toFixed(3)], [off.toFixed(3), diagonal.toFixed(3)]], x, 278, 55);
  });
  body += text(320, 424, '下方取 M = [[0,1],[1,0]]、均匀边缘，展示完整正则问题的解', 14);
  return { body, height: 449, caption: '上方是平衡问题的教学镜像步，η 为步长，⊙ 为逐元素乘积。下方可手算的 α=0 特例说明 ε 增大使计划更分散，α 调节的是另一种权衡。' };
}

function spatialCompetition() {
  let body = text(320, 26, '两个配体供给，共享一个受体容量', 17);
  body += dot(99, 102, 'L₁', colors.teal, 24) + text(99, 148, '可用量 1', 15)
    + dot(99, 240, 'L₂', colors.teal, 24) + text(99, 286, '可用量 1', 15)
    + dot(510, 172, 'R', colors.orange, 33) + text(510, 227, '共享容量 1', 16);
  body += arrow(139, 108, 463, 160, colors.teal, 5)
    + arrow(139, 234, 463, 184, colors.muted, 2);
  body += text(309, 93, 'p₁，单位距离成本 c₁ = 0.2', 15)
    + text(309, 267, 'p₂，单位距离成本 c₂ = 0.8', 15)
    + text(320, 300, 'p₁ + p₂ ≤ 1', 20)
    + text(320, 326, '同一个容量被共同使用', 15);
  body += text(320, 366, '取未匹配罚系数 ρ = 0.5、ε = 0，得到 p₁ = 1、p₂ = 0', 15);
  return { body, height: 388, caption: 'COMMOT 共享容量原理的两配体教学子问题。三份未匹配量为 1−p₁、1−p₂、1−p₁−p₂，目标为 1.5−0.8p₁−0.2p₂。距离阈值还可直接禁止某条边。' };
}

const renderers = {
  'spatial-data': spatialData,
  'spatial-channels': spatialChannels,
  'spatial-pair-cost': spatialPairCost,
  'spatial-alpha': spatialAlpha,
  'spatial-frank-wolfe': spatialFrankWolfe,
  'spatial-coordinate-readout': spatialCoordinateReadout,
  'spatial-partial': spatialPartial,
  'spatial-unbalanced': spatialUnbalanced,
  'spatial-expression-readout': spatialExpressionReadout,
  'spatial-mirror-descent': spatialMirrorDescent,
  'spatial-competition': spatialCompetition,
};

export function spatialFigure(spec) {
  const render = renderers[spec?.type];
  if (!render) return '';
  const result = render();
  return chart(result.body, spec.caption || result.caption, result.height);
}
