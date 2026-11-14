# 第 15 章：近期应用论文来源与核对记录

核对日期：2026-11-14。以下是有选择的应用案例，不是穷尽性综述。入选论文均在官方主会论文集查到；没有把 workshop 或尚在投稿的预印本冒充主会。查阅范围为官方元数据、作者全文的方法、实验与局限段落，未自行训练这些论文的模型。教程代码是原创四点类比，不能称为论文复现。

## A. 图与脑影像：ULOT

- 完整标题：**Unsupervised Learning for Optimal Transport plan prediction between unbalanced graphs**。
- 作者：Sonia Mazelet、Rémi Flamary、Bertrand Thirion。
- 来源：NeurIPS 2025，Main Conference Track。
- [正式记录](https://proceedings.neurips.cc/paper_files/paper/2025/hash/873fd89b3e4db1f6242c2333673e104d-Abstract-Conference.html)；[正式全文](https://proceedings.neurips.cc/paper_files/paper/2025/file/873fd89b3e4db1f6242c2333673e104d-Paper-Conference.pdf)；[作者代码](https://github.com/smazelet/ULOT)。
- 已看：§2 FUGW 目标及摊销学习结构，§3.2 IBC 脑数据实验（正文第 8—9 页），§4 局限（第 10 页），附录 E 数据设置。
- 可确认事实：网络在 FUGW 损失下训练、输入包含图与超参数；有合成 SBM 与真实皮层 fMRI 图实验；预测可作为经典求解器热启动。
- 不可扩大：论文 fMRI 激活迁移部分明确是定性展示。速度收益依赖实验设置，预训练代价和近似误差不能忽略，也没有全局最优证书。正文不沿用笼统“所有应用快一百倍”的措辞。

## B. 医学重建：KIDOT

- 完整标题：**Towards Prospective Medical Image Reconstruction via Knowledge-Informed Dynamic Optimal Transport**。
- 作者：Taoran Zheng、Yan Yang、Xing Li、Xiang Gu、Jian Sun、Zongben Xu。
- 来源：NeurIPS 2025，Main Conference Track。
- [正式记录](https://proceedings.neurips.cc/paper_files/paper/2025/hash/3a5b75ce6cbd3aaaa32d6e935ffc4cff-Abstract-Conference.html)；[正式全文](https://proceedings.neurips.cc/paper_files/paper/2025/file/3a5b75ce6cbd3aaaa32d6e935ffc4cff-Paper-Conference.pdf)；[作者代码](https://github.com/TaoranZheng717/KIDOT)。
- 已看：§3 成像知识成本与动态方程，§4 模拟/前瞻 MRI 和临床 CT 的设置及评价选择，§5 局限。主要方法公式为正文 (4)、(6)、(7)，并非教程中展示的单项残差就能代替。
- 可确认事实：利用前向成像算子约束动态重建；有 MRI 与 CT 实验；对错位前瞻数据使用分布指标；局限含前向模型可用性及 ODE 积分成本。
- 教程建议而非作者已完成的事实：额外核对输入个体一致性、物理残差和失真，不把分布指标改善当作临床诊断能力。没有添加自测性能数字。

## C. 连续条件生成：A2A-FM

- 完整标题：**Pairwise Optimal Transports for Training All-to-All Flow-Based Condition Transfer Model**。
- 作者：Kotaro Ikeda、Masanori Koyama、Jinzhe Zhang、Kohei Hayashi、Kenji Fukumizu。
- 来源：NeurIPS 2025，Main Conference Track。
- [正式记录](https://proceedings.neurips.cc/paper_files/paper/2025/hash/a821bd31e93435b50c0a461337fe75c0-Abstract-Conference.html)；[正式 PDF](https://proceedings.neurips.cc/paper_files/paper/2025/file/a821bd31e93435b50c0a461337fe75c0-Paper-Conference.pdf)；[作者全文 HTML v4](https://arxiv.org/html/2504.03188v4)；[作者代码](https://github.com/kotatumuri-room/A2A-FM)。
- 已看：§3 配对目标与极限结论，§5 合成和分子性质任务，§6 讨论，附录 B.2/B.3 的分子评估预算。正式 PDF 体积较大，网页解析失败后通过内存下载/文字抽取与作者 HTML 交叉阅读。
- 可确认事实：面向连续条件和非分组观测，设计条件对感知的配对并训练流模型；分子实验用表示与解码器，评价性质、相似度及搜索预算。
- 解释边界：极限收敛不是有限批量精确性保证；计算性质与真实生物药效不是同一评价；教程的直线路径公式是通用教学推导，未冒充论文独有成本。

## D. 时序单细胞：LGP-OT

- 完整标题：**Modeling Temporal scRNA-seq Data with Latent Gaussian Process and Optimal Transport**。
- 作者：Mehmet Yigit Balik、Harri Lähdesmäki。
- 来源：ICML 2026，PMLR 306:5945–5978；正式作者仓库标记为 ICML 2026 poster。
- [正式记录](https://proceedings.mlr.press/v306/balik26a.html)；[正式 PDF](https://raw.githubusercontent.com/mlresearch/v306/main/assets/balik26a/balik26a.pdf)；[作者代码](https://github.com/YigitBalik/LGP-OT)。
- 已看：正式 PDF §4 模型及 OT 目标、细胞特异时间、类型条件；§5 留出时点插值/外推和稀疏设置；§6 局限；作者 README 的数据及训练入口。正式 PDF 返回 application/octet-stream 导致网页工具不能解析，改用内存下载和 pypdf 读取正文。
- 可确认事实：潜在异方差 GP 与群体 OT 对齐结合，评价时序群体预测；不显式建模分支；将空间/多模态扩展列为未完成方向。
- 不可混淆：时间表达数据不是组织二维空间；群体匹配不等于获得逐细胞真实谱系。教程不把 in silico 干预当作实验因果验证。

## E. 动态非平衡：WFR-FM

- 完整标题：**WFR-FM: Simulation-Free Dynamic Unbalanced Optimal Transport**。
- 作者：Qiangwei Peng、Zihan Wang、Junda Ying、Yuhao Sun、Qing Nie、Lei Zhang、Tiejun Li、Peijie Zhou。
- 来源：ICLR 2026，Conference（正式论文集）。
- [正式记录](https://proceedings.iclr.cc/paper_files/paper/2026/hash/2030d35841f8617ab22cca913f55697e-Abstract-Conference.html)；[正式全文](https://proceedings.iclr.cc/paper_files/paper/2026/file/2030d35841f8617ab22cca913f55697e-Paper-Conference.pdf)；[作者代码](https://github.com/QiangweiPeng/WFR-FM)。
- 已看：§3—5 动态 WFR、条件路径与训练工作流；§6 分布/质量/生长率实验；§7 局限；附录 D 小批量 OT 的误差问题。
- 可确认事实：同时回归速度与增长率；合成及单细胞评估分别检查形状、总量等；依赖静态耦合，小批量与熵正则是近似。
- 解释边界：simulation-free 是训练方式，不是所有阶段无需求解；mini-batch 不是自动等价全量耦合；真实细胞质量还受抽样效率影响，增长解释需要额外校准证据。

## 教学图与可运行例子的来源

第 15 章 8 张 pipeline 均为本教程原创概念示意，没有复制论文图像；说明的是数据流与验收点，不是实验结果。四点代码对乘积耦合和精确 EMD 耦合比较直线路径能量与中点分布，结果可手算核验：能量 12.5 与 4；中点均值都为 3.5，方差分别为 2.125 与 4.25。代码仅依赖 NumPy/POT，不训练上述原模型。
