# ChordEdit 论文定位与数学核验

## 论文身份

用户提到的“广东高校本科生、CVPR 2026 Oral、使用最优化理论”的线索，与 ChordEdit 高度吻合。准确题名为 **ChordEdit: One-Step Low-Energy Transport for Image Editing**。CVF 正式论文集记录了该文，页码为 14398–14407。第一作者为 Liangsi Lu，通讯作者为 Yang Shi。[CVF 论文页](https://openaccess.thecvf.com/content/CVPR2026/html/Lu_ChordEdit_One-Step_Low-Energy_Transport_for_Image_Editing_CVPR_2026_paper.html)

广东工业大学数学与统计学院于 2026 年 6 月 7 日发布的新闻，确认第一作者卢梁司是该院 2023 级信息与计算科学专业本科生。校创新创业学院的另一篇新闻同时确认通讯作者石飏为计算机学院 2023 级本科生，合作者郭敏哲为该校 2024 级本科生。[数学与统计学院新闻](https://math.gdut.edu.cn/info/1040/4335.htm)、[创新创业学院新闻](https://cxcy.gdut.edu.cn/info/1112/3796.htm)

CVPR 官方获奖新闻列出该文获得 Best Student Paper Honorable Mention。官方论文详情页同时标注 Oral Session 3C，主题为 Generative Editing。官方 Oral 列表给出 6 月 6 日 9:25–9:37 的报告安排。[CVPR 获奖新闻](https://cvpr.thecvf.com/Conferences/2026/News/Best_Papers)、[官方论文详情](https://cvpr.thecvf.com/virtual/2026/poster/38895)、[官方 Oral 列表](https://cvpr.thecvf.com/virtual/2026/events/oral)

作者项目页和官方实现都使用 CVPR 2026 Oral 标识。[项目页](https://chordedit.github.io/)、[作者代码](https://github.com/ChordEdit/ChordEdit)

本轮无需保留其他候选。用户使用的“最火”“一本”属于口语检索线索，写入教程时使用论文、作者与学校的正式名称。

## 主论文的优化结构

论文以动态 OT 的动能目标组织编辑问题。若把源与目标密度记为给定边界，连续模型寻求满足连续性方程的密度路径和速度场，并最小化

$$
\mathcal E(\rho,u)=\int_0^1\int\frac12\|u_t(x)\|^2\rho_t(x)\,dx\,dt,
\qquad \partial_t\rho_t+\nabla\cdot(\rho_tu_t)=0.
$$

论文随后在固定图像锚点处，用模型可观测的提示差分场估计控制。令 \(x\) 为锚点、\(R(x,s)\) 为模型在查询时刻 \(s\) 给出的可比残差信号，固定窗口 \([t-\delta,t]\)。记先前估计为 \(m\)，原文 Eq. 4.3 的局部代理为

$$
\Phi(u)=t\|u-m\|^2+\int_{t-\delta}^{t}\|u-R(x,s)\|^2\,ds.
$$

对 \(u\) 求导，得到

$$
\nabla\Phi(u)=2(t+\delta)u-2tm-2\int_{t-\delta}^{t}R(x,s)\,ds,
\qquad \nabla^2\Phi=2(t+\delta)I.
$$

在 \(t+\delta>0\) 时，该代理具有唯一极小值

$$
u_{\rm exact}=\frac{tm+\int_{t-\delta}^{t}R(x,s)\,ds}{t+\delta}.
$$

实现中取 \(m\approx R(x,t-\delta)\)，并用右端点近似积分，得到原文 Eq. 4.5

$$
\widehat u=\frac{tR(x,t-\delta)+\delta R(x,t)}{t+\delta},
\qquad x_{\rm pred}=x+\lambda\widehat u.
$$

教程应让读者逐步看见局部代理、驻点方程、积分近似和状态更新之间的关系。时间权重为 \(t/(t+\delta)\) 与 \(\delta/(t+\delta)\)，只有 \(t=\delta\) 才是等权。以上式号与定义可在原文及附录 B 核对。[论文 HTML](https://arxiv.org/html/2602.19083v1)、[CVF 正式 PDF](https://openaccess.thecvf.com/content/CVPR2026/papers/Lu_ChordEdit_One-Step_Low-Energy_Transport_for_Image_Editing_CVPR_2026_paper.pdf)

## 代码核对

作者 `pipeline_chord.py` 的 `_u_estimate` 使用共享噪声构造两个时刻的带噪锚点。源、目标提示在两个时刻的四组输入拼成一个 batch，UNet 输出再转换为预测干净潜变量。两组提示差分形成 `dv_s` 与 `dv_s0`，返回值按 \((\delta\,dv_s+t\,dv_{s0})/(t+\delta)\) 组合。`_run_edit` 按 `step_scale` 更新潜变量，`cleanup` 开启时另调用一次 `_pred_x0`。[作者实现](https://github.com/ChordEdit/ChordEdit/blob/main/pipeline_chord.py)

按作者的计算口径，运输阶段为一次批量网络调用，含精修为两次。复现时还应记录 batch 大小、共享噪声数、VAE 编解码和设备。论文 Table 2 分别报告 NFE=1 的 transport-only 与 NFE=2 的 transport+refinement 设置。[论文 Table 2](https://arxiv.org/html/2602.19083v1#S6.T2)

原文把精修函数称作 proximal refinement，具体代码执行目标提示下的预测干净潜变量。若教材需要介绍严格近端算子，应另给出对应的 \(\operatorname{prox}_{\eta f}(x)=\arg\min_y f(y)+\|y-x\|^2/(2\eta)\) 定义，再检查实现是否满足这种变分关系。

## 可手算的二次代理例子

以下数值由教材独立构造。设 \(t=0.6\)、\(\delta=0.2\)、\(m=2\)，窗口内

$$
R(s)=2+10(s-0.4),\qquad s\in[0.4,0.6].
$$

两端观测为 2 与 4，积分为 \(0.2\times(2+4)/2=0.6\)。于是

$$
u_{\rm exact}=\frac{0.6\times2+0.6}{0.8}=2.25,
\qquad \widehat u=\frac{0.6\times2+0.2\times4}{0.8}=2.5.
$$

直接展开积分可以得到

$$
\Phi(u)=0.8u^2-3.6u+\frac{64}{15}.
$$

驻点为 2.25。原代理在 2.25 处约为 0.216667，在 2.5 处约为 0.266667，两者相差 0.05。这个差异让读者能够检查近似带来的实际影响。用 \(x=0\)、\(\lambda=0.4\)，对应更新为 0.9 与 1.0。

若把积分代理直接换成 \(\delta\|u-R(t)\|^2\)，该近似代理的精确极小值就是 2.5。这个例子适合并排绘制原代理和近似代理两条抛物线。

## 可以直接证明的凸组合界

固定某个查询时刻，令

$$
a=\frac{t}{t+\delta},\quad b=\frac{\delta}{t+\delta},\quad r_-=R(x,t-\delta),\quad r_+=R(x,t).
$$

在 \(a,b\ge0\)、\(a+b=1\) 下，平方范数展开给出恒等式

$$
\|ar_-+br_+\|^2
=a\|r_-\|^2+b\|r_+\|^2-ab\|r_--r_+\|^2.
$$

它说明混合场的平方范数不超过输入两端平方范数的加权平均，并给出减少的具体量。以上手算例中，\(a=0.75\)、\(b=0.25\)，加权平方范数为 \(0.75\times4+0.25\times16=7\)，混合场平方为 \(2.5^2=6.25\)，差值 0.75。

若改取 \(r_-=4\)、\(r_+=2\)，混合值为 3.5，其范数超过当前值 2。教程需要给出加权平均的比较基准，读者才能正确解释能量图。

## 时间导数收缩的核验

对实际离散估计器求时间导数时，权重随 \(t\) 改变。固定 \(\delta\) 可得

$$
\frac{d\widehat u}{dt}
=aR'(t-\delta)+bR'(t)
+\frac{\delta}{(t+\delta)^2}\bigl[R(t-\delta)-R(t)\bigr].
$$

最后一项需要在推导中保留。下面是独立构造的核验函数，取 \(\delta=0.1\)

$$
R(s)=\begin{cases}
s,&s\le0.1,\\
s+\dfrac{0.2}{\pi}\left[\cos\left(\dfrac{\pi(s-0.1)}{0.1}\right)-1\right],&0.1<s<0.2,\\
s-\dfrac{0.4}{\pi},&s\ge0.2.
\end{cases}
$$

该函数一阶连续，\(\sup_s|R'(s)|=1\)。在 \(t=0.2\) 时，\(R'(0.1)=R'(0.2)=1\)，而

$$
\widehat u'(0.2)=1+\frac{4/\pi-1}{9}\approx1.03036.
$$

因此，把实际两点时变权重估计器直接代入时不变卷积的导数交换论证，会漏掉一项。教材可介绍论文使用的平滑动机，另以此恒等式说明可直接核对的数学范围。对给定场减小局部变化量，也仍需结合步长、场的空间导数和目标误差评价一步更新。

## 局部积分近似的误差界

假设窗口内 \(R\) 关于时间是 \(L\)-Lipschitz。令先验替代误差为 \(e_m=m-R(t-\delta)\)，由三角不等式可以独立推出

$$
\|u_{\rm exact}-\widehat u\|
\le \frac{t}{t+\delta}\|e_m\|
+\frac{L\delta^2}{2(t+\delta)}.
$$

第二项来自 \(\|\int[R(s)-R(t)]ds\|\le\int L(t-s)ds\)。它同时显示了先验替换与积分离散化两种近似。局部模型假设、预训练模型残差的估计误差和最终图像评价还需要分别验证。

## 复核入口与本地材料

- 正式论文与补充材料由 CVF 开放获取。[正式论文](https://openaccess.thecvf.com/content/CVPR2026/papers/Lu_ChordEdit_One-Step_Low-Energy_Transport_for_Image_Editing_CVPR_2026_paper.pdf)、[补充材料](https://openaccess.thecvf.com/content/CVPR2026/supplemental/Lu_ChordEdit_One-Step_Low-Energy_CVPR_2026_supplemental.pdf)
- 带公式 HTML 包含主文与附录，可核对 Eq. 4.3–4.7 和 Appendix B。[arXiv HTML](https://arxiv.org/html/2602.19083v1)
- 原始实现可核对 `_u_estimate`、`_run_edit` 与 `_pred_x0`。[作者 GitHub](https://github.com/ChordEdit/ChordEdit/blob/main/pipeline_chord.py)
- 本轮下载的 PDF、提取文本、代码和官方程序页保存在开发目录 `.work/chordedit/`。官方 virtual 页面在网页工具中受 robots 访问限制，公开 HTML 通过 Python 标准库读取并交叉核对。开发缓存无需随教程发布。
