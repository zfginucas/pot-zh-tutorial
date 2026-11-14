# 空间转录组专题一手来源审计

核对日期：2026-11-14。本记录对应 content/16.json。正文的流程图与合成例子为原创教学抽象，没有复制论文图片，未将小例子称为论文复现。以下仅记录一手论文可确认的功能，未外推跨数据集性能。

## 1. PASTE

- 论文：Ron Zeira et al., Alignment and integration of spatial transcriptomics data.
- 正式出版：Nature Methods 19, 567–575 (2022)，DOI 10.1038/s41592-022-01459-6。
- 一手原文：https://www.nature.com/articles/s41592-022-01459-6 ；作者稿 https://pmc.ncbi.nlm.nih.gov/articles/PMC9334025/ 。
- 阅读范围：Abstract、Pairwise Slice Alignment、Center Slice Integration、FGW 说明与方法讨论；同时核对 https://github.com/raphael-group/paste 。
- 可确认：使用转录相似性与片内空间关系的 FGW；成对切片软配准、多切片叠放与中心切片整合。α=0 为表达，α=1 为结构。
- 限制：本文未将其输出解释为同一个细胞的真实轨迹；没有声称适合任意重叠程度或任意样本组成。

## 2. PASTE2

- 论文：Xinhao Liu, Ron Zeira, Benjamin J. Raphael, Partial alignment of multislice spatially resolved transcriptomics data.
- 正式出版：Genome Research 33(7), 1124–1132 (2023)，DOI 10.1101/gr.277670.123；不是 Nature Methods。
- 一手全文：https://pmc.ncbi.nlm.nih.gov/articles/PMC10538490/ ，期刊页 https://genome.cshlp.org/content/33/7/1124 。
- 阅读范围：Abstract、Results/Evaluation on simulated ST data、果蝇 Stereo-seq 应用、Partial Pairwise Slice Alignment、作者 README https://github.com/raphael-group/paste2 。
- 可确认：部分 FGW、重叠比例选择、可选组织学信息，以及不完全重叠的切片配准/重建。
- 约定：原文归一化权重中的重叠参数，与 POT API 的绝对 m 应结合总质量解释。POT 0.9.6.post1 的 partial_fused_gromov_wasserstein 接口已在本地核对。
- 代码入口：作者仓库当前建议使用 Paste3 统一实现；本教程不盲目硬编码旧版作者 API。

## 3. SpaOTsc

- 论文：Zixuan Cang, Qing Nie, Inferring spatial and signaling relationships between cells from single cell transcriptomic data.
- 正式出版：Nature Communications 11, 2084 (2020)，DOI 10.1038/s41467-020-15968-5。
- 一手全文：https://www.nature.com/articles/s41467-020-15968-5 ，备选作者稿 https://pmc.ncbi.nlm.nih.gov/articles/PMC7190659/ 。
- 阅读范围：Overview/Figure 1 描述、Accuracy of SpaOTsc mapping、Methods/SpaOTsc model，包括式(1)的结构化非平衡目标。
- 可确认：跨数据共同基因差异矩阵 M、单细胞内部表达关系 D_sc、空间内部距离 D_spa；关联细胞与空间位置；原文含留出基因预测与区域位置评价。
- 限制：位置关联未自动成为经过校准的后验；不以表达预测证明原始未测量值已被观测。

## 4. moscot

- 论文：Dominik Klein et al., Mapping cells through time and space with moscot.
- 正式出版：Nature 638, 1065–1075 (2025)，在线 2025-01-22。DOI 10.1038/s41586-024-08453-2 中的 2024 不等于发表年。
- 一手全文：https://pmc.ncbi.nlm.nih.gov/articles/PMC11864987/ ，https://www.nature.com/articles/s41586-024-08453-2 。
- 书目核对：https://pubmed.ncbi.nlm.nih.gov/39843746/ 。官方文档：https://moscot.readthedocs.io/en/latest/ 。
- 阅读范围：Abstract、Main、moscot.space.mapping、moscot.space.alignment 的模型/下游解释，以及时间与时空模块说明。
- 可确认：多模态时间/空间关联框架；空间单细胞映射与多样本配准；框架含规模化、熵正则、低秩与非平衡选项，具体依问题对象而异。
- 限制：不把框架所有问题说成一个固定 FGW 目标；时间群体关联不自动证明个体谱系。

## 5. COMMOT

- 论文：Zixuan Cang et al., Screening cell–cell communication in spatial transcriptomics via collective optimal transport.
- 正式出版：Nature Methods 20, 218–228 (2023)，DOI 10.1038/s41592-022-01728-4。
- 一手全文：https://pmc.ncbi.nlm.nih.gov/articles/PMC9911355/ ，https://www.nature.com/articles/s41592-022-01728-4 。
- 阅读范围：Main、Results/Overview of COMMOT、图1与多物种容量/距离约束定义、对模拟与空间数据的评价说明。
- 可确认：多种配体/受体联合竞争、容量约束、空间范围约束与候选通讯分析，区别于每个分子对独立归一化后做平衡 OT。
- 限制：正文未将推断箭头当成直接测量的蛋白流或因果证据；独立分子/扰动证据是教学评价建议。

## 原创教学与验证边界

- 章节的数据结构、任务区分、成本尺度解释、聚合公式及混杂检查为自主教学组织，未将其逐句归于特定论文。
- 合成代码使用 numpy + POT；平衡 FGW 与部分 FGW 均只检查可行性和预算，非凸方法不声称全局最优。
- 特征由人造坐标规则构造，没有真实患者/细胞数据。它不能支持生物结论、方法性能排名或专利技术身份判断。
- 具体专利与空间特征基因检测由专利章节独立核对，不把配准软件和基因筛选方法混同。

