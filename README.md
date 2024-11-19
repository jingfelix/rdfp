# rdfp

rdfp: *R*e*d*ucing *F*alse *P*ositives in Static Analysis Tools

## Language: JavaScript

由于提供的数据集中仅 JavaScript 和 TypeScript 两种语言的数据集包含已打标的数据，因此选择 JavaScript 作为 rdfp 的目标语言。

### Design

静态检测器在筛选漏洞代码时，通常会基于代码的抽象语法树（AST）和具体节点的语义特征来发现可能的安全漏洞。这些模式可以通过分析代码的结构、上下文和关键操作形成独特的特征表示。为此，可以利用局部 AST 的结构信息生成特定的哈希值[^1]，将其作为代码片段的唯一标记。使用这些哈希值构建布隆过滤器[^2]，实现快速的 TP 和 FP 的区分。

### Evaluation

Jellfyfin-web 代码仓库的的已标注数据最多，因此选择该数据集进行评估。随机选择 10% 的 TP 和 10% 的 FP 作为测试集，其余作为训练集用于布隆过滤器的构建。在测试集上评估 rdfp 的性能。

|          | TPtest | FPtest |
|----------|--------|--------|
| TPfilter | 16/24  | 2/8    |
| FPfilter | 0/24   | 1/8    |

> 注：TPfilter 的 2/8 表示 FP 在 TP 布隆过滤器中的命中情况，其中一个测试项在 FP 布隆过滤器中未命中。

其中 TPfilter 表示 TP 在 TP 布隆过滤器的命中情况，FPfilter 表示 FP 在 TP 布隆过滤器中的命中情况。

根据设计，当且仅当 TPfilter 命中且 FPfilter 未命中时，rdfp 将识别为 TP。当且仅当 FPfilter 命中时且 TPfilter 未命中时，rdfp 将识别为 FP。

针对测试集中的 TP（原项目的 TP）， rdfp 在测试集上的表现如下：

|  | TP | TN | FP | FN | Precision | Accuracy | Recall |
|---|----|----|----|----|-----------|----------|--------|
| rdfp | 16 | 8 | 8 | 0 | 100% | 75% | 66.67% |

针对测试集中的 FP（原项目的 FP）， rdfp 在测试集上的表现如下：

|  | TP | TN | FP | FN | Precision | Accuracy | Recall |
|---|----|----|----|----|-----------|----------|--------|
| rdfp | 1 | 24 | 0 | 7 | 4% | 78% | 100% |

需要注意的是，由于原数据集数据量过小，且分布不均匀（TP 远多于 FP），因此 rdfp 的性能表现不具有普适性。

## reference

[^1]: cHash: Detection of Redundant Compilations via AST Hashing [USENIX ATC'17](https://www.usenix.org/conference/atc17/technical-sessions/presentation/dietrich)

[^2]: Space/Time Trade-offs in Hash Coding with Allowable Errors [Communications of the ACM 1970](https://crystal.uta.edu/~mcguigan/cse6350/papers/Bloom.pdf)
