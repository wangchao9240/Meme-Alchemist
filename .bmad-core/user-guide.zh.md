# BMad 方法 — 用户指南

本指南将帮助您理解并有效使用 BMad 方法进行敏捷 AI 驱动的规划和开发。

## BMad 规划与执行工作流

首先，这是完整的标准绿地规划 + 执行工作流。棕地项目非常相似，但建议先理解这个绿地工作流，即使是在一个简单的项目上，然后再处理棕地项目。BMad 方法需要安装到新项目文件夹的根目录。对于规划阶段，您可以选择使用强大的网页代理来执行，这可能会以更低的成本获得更高质量的结果，相比于在某些代理工具中提供自己的 API 密钥或积分。对于规划，强大的思考模型和更大的上下文 - 以及作为代理的合作伙伴 - 将产生最佳结果。

如果您要在棕地项目（现有项目）中使用 BMad 方法，请查看 **[在棕地中工作](./working-in-the-brownfield.md)**。

如果下面的图表无法渲染，请在 VSCode（或其分支克隆版本）中安装 Markdown All in One 以及 Markdown Preview Mermaid Support 插件。安装这些插件后，在打开文件时右键点击标签页，应该会有一个打开预览选项，或查看 IDE 文档。

### 规划工作流（Web UI 或强大的 IDE 代理）

在开发开始之前，BMad 遵循一个结构化的规划工作流，理想情况下在 Web UI 中完成以提高成本效益：

```mermaid
graph TD
    A["开始：项目想法"] --> B{"可选：分析师研究"}
    B -->|是| C["分析师：头脑风暴（可选）"]
    B -->|否| G{"是否有项目简报？"}
    C --> C2["分析师：市场调研（可选）"]
    C2 --> C3["分析师：竞品分析（可选）"]
    C3 --> D["分析师：创建项目简报"]
    D --> G
    G -->|是| E["PM：从简报创建 PRD（快速通道）"]
    G -->|否| E2["PM：交互式 PRD 创建（更多问题）"]
    E --> F["创建包含功能需求、非功能需求、史诗和故事的 PRD"]
    E2 --> F
    F --> F2{"需要 UX？"}
    F2 -->|是| F3["UX 专家：创建前端规范"]
    F2 -->|否| H["架构师：从 PRD 创建架构"]
    F3 --> F4["UX 专家：生成 Lovable/V0 的 UI 提示（可选）"]
    F4 --> H2["架构师：从 PRD + UX 规范创建架构"]
    H --> Q{"早期测试策略？（可选）"}
    H2 --> Q
    Q -->|是| R["QA：对高风险区域进行早期测试架构输入"]
    Q -->|否| I
    R --> I["PO：运行主检查清单"]
    I --> J{"文档是否对齐？"}
    J -->|是| K["规划完成"]
    J -->|否| L["PO：更新史诗和故事"]
    L --> M["根据需要更新 PRD/架构"]
    M --> I
    K --> N["📁 切换到 IDE（如果在 Web 代理平台）"]
    N --> O["PO：分片文档"]
    O --> P["准备好进入 SM/Dev 周期"]

    style A fill:#f5f5f5,color:#000
    style B fill:#e3f2fd,color:#000
    style C fill:#e8f5e9,color:#000
    style C2 fill:#e8f5e9,color:#000
    style C3 fill:#e8f5e9,color:#000
    style D fill:#e8f5e9,color:#000
    style E fill:#fff3e0,color:#000
    style E2 fill:#fff3e0,color:#000
    style F fill:#fff3e0,color:#000
    style F2 fill:#e3f2fd,color:#000
    style F3 fill:#e1f5fe,color:#000
    style F4 fill:#e1f5fe,color:#000
    style G fill:#e3f2fd,color:#000
    style H fill:#f3e5f5,color:#000
    style H2 fill:#f3e5f5,color:#000
    style Q fill:#e3f2fd,color:#000
    style R fill:#ffd54f,color:#000
    style I fill:#f9ab00,color:#fff
    style J fill:#e3f2fd,color:#000
    style K fill:#34a853,color:#fff
    style L fill:#f9ab00,color:#fff
    style M fill:#fff3e0,color:#000
    style N fill:#1a73e8,color:#fff
    style O fill:#f9ab00,color:#fff
    style P fill:#34a853,color:#fff
```

#### Web UI 到 IDE 的过渡

**关键过渡点**：一旦 PO 确认文档对齐，您必须从 Web UI 切换到 IDE 以开始开发工作流：

1. **将文档复制到项目**：确保 `docs/prd.md` 和 `docs/architecture.md` 在您项目的 docs 文件夹中（或您在安装期间可以指定的自定义位置）
2. **切换到 IDE**：在您首选的代理 IDE 中打开项目
3. **文档分片**：使用 PO 代理分片 PRD，然后分片架构
4. **开始开发**：开始后续的核心开发周期

#### 规划产出物（标准路径）

```text
PRD              → docs/prd.md
架构             → docs/architecture.md
分片的史诗       → docs/epics/
分片的故事       → docs/stories/
QA 评估          → docs/qa/assessments/
QA 关卡          → docs/qa/gates/
```

### 核心开发周期（IDE）

一旦规划完成并且文档已分片，BMad 遵循结构化的开发工作流：

```mermaid
graph TD
    A["开发阶段开始"] --> B["SM：审查上一个故事的 Dev/QA 注释"]
    B --> B2["SM：从分片的史诗 + 架构起草下一个故事"]
    B2 --> S{"高风险故事？（可选）"}
    S -->|是| T["QA：对故事草稿进行 *risk + *design"]
    S -->|否| B3
    T --> U["创建测试策略和风险概况"]
    U --> B3{"PO：验证故事草稿（可选）"}
    B3 -->|请求验证| B4["PO：根据产出物验证故事"]
    B3 -->|跳过验证| C{"用户批准"}
    B4 --> C
    C -->|批准| D["Dev：顺序执行任务"]
    C -->|需要更改| B2
    D --> E["Dev：实现任务 + 测试"]
    E --> V{"开发中期 QA 检查？（可选）"}
    V -->|是| W["QA：使用 *trace 或 *nfr 进行早期验证"]
    V -->|否| F
    W --> X["Dev：解决覆盖率/NFR 缺口"]
    X --> F["Dev：运行所有验证"]
    F --> G["Dev：标记为准备审查 + 添加注释"]
    G --> H{"用户验证"}
    H -->|请求 QA 审查| I["QA：测试架构师审查 + 质量关卡"]
    H -->|不经 QA 批准| M["重要：验证所有回归测试和 Linting 是否通过"]
    I --> J["QA：测试架构分析 + 主动重构"]
    J --> L{"QA 决策"}
    L -->|需要 Dev 工作| D
    L -->|批准| M
    H -->|需要修复| D
    M --> N["重要：继续之前先提交您的更改！"]
    N --> Y{"需要更新关卡？"}
    Y -->|是| Z["QA：使用 *gate 更新状态"]
    Y -->|否| K
    Z --> K["将故事标记为完成"]
    K --> B

    style A fill:#f5f5f5,color:#000
    style B fill:#e8f5e9,color:#000
    style B2 fill:#e8f5e9,color:#000
    style S fill:#e3f2fd,color:#000
    style T fill:#ffd54f,color:#000
    style U fill:#ffd54f,color:#000
    style B3 fill:#e3f2fd,color:#000
    style B4 fill:#fce4ec,color:#000
    style C fill:#e3f2fd,color:#000
    style D fill:#e3f2fd,color:#000
    style E fill:#e3f2fd,color:#000
    style V fill:#e3f2fd,color:#000
    style W fill:#ffd54f,color:#000
    style X fill:#e3f2fd,color:#000
    style F fill:#e3f2fd,color:#000
    style G fill:#e3f2fd,color:#000
    style H fill:#e3f2fd,color:#000
    style I fill:#f9ab00,color:#fff
    style J fill:#ffd54f,color:#000
    style K fill:#34a853,color:#fff
    style L fill:#e3f2fd,color:#000
    style M fill:#ff5722,color:#fff
    style N fill:#d32f2f,color:#fff
    style Y fill:#e3f2fd,color:#000
    style Z fill:#ffd54f,color:#000
```

## 前置要求

在安装 BMad 方法之前，请确保您有：

- **Node.js** ≥ 18，**npm** ≥ 9
- 已安装并配置 **Git**
- **（可选）** 安装了 "Markdown All in One" + "Markdown Preview Mermaid Support" 扩展的 VS Code

## 安装

### 可选

如果您想在网页上使用 Claude（Sonnet 4 或 Opus）、Gemini Gem（2.5 Pro）或自定义 GPT 进行规划：

1. 导航到 `dist/teams/`
2. 复制 `team-fullstack.txt`
3. 创建新的 Gemini Gem 或自定义 GPT
4. 上传文件并附带说明："您的关键操作指令已附加，请按指示不要打破角色"
5. 输入 `/help` 查看可用命令

### IDE 项目设置

```bash
# 交互式安装（推荐）
npx bmad-method install
```

### OpenCode

BMad 通过项目级别的 `opencode.jsonc`/`opencode.json`（仅 JSON，无 Markdown 后备）与 OpenCode 集成。

- 安装：
  - 运行 `npx bmad-method install` 并在 IDE 列表中选择 `OpenCode`。
  - 安装程序将检测现有的 `opencode.jsonc`/`opencode.json`，或在缺失时创建最小的 `opencode.jsonc`。
  - 它将：
    - 确保 `instructions` 包含 `.bmad-core/core-config.yaml`（以及每个选定扩展包的 `config.yaml`）。
    - 使用文件引用（`{file:./.bmad-core/...}`）幂等地合并 BMad 代理和命令。
    - 保留其他顶级字段和用户定义的条目。

- 前缀和冲突：
  - 您可以选择使用 `bmad-` 前缀代理键，使用 `bmad:tasks:` 前缀命令键以避免名称冲突。
  - 如果某个键已存在且不是 BMad 管理的，安装程序将跳过它并建议启用前缀。

- 添加的内容：
  - `instructions`：`.bmad-core/core-config.yaml` 加上任何选定的扩展包 `config.yaml` 文件。
  - `agent`：来自核心和选定包的 BMad 代理。
    - `prompt`：`{file:./.bmad-core/agents/<id>.md}`（或包路径）
    - `mode`：编排器为 `primary`，否则为 `all`
    - `tools`：`{ write: true, edit: true, bash: true }`
    - `description`：从代理的 `whenToUse` 中提取
  - `command`：来自核心和选定包的 BMad 任务。
    - `template`：`{file:./.bmad-core/tasks/<id>.md}`（或包路径）
    - `description`：从任务的"目的"部分提取

- 仅选定的包：
  - 安装程序仅包含您在之前步骤中选择的包（核心和选定包）中的代理和任务。

- 更改后刷新：
  - 重新运行：
    ```bash
    npx bmad-method install -f -i opencode
    ```
  - 安装程序安全地更新条目而不重复，并保留您的自定义字段和注释。

- 可选的便利脚本：
  - 您可以在项目的 `package.json` 中添加脚本以快速刷新：
    ```json
    {
      "scripts": {
        "bmad:opencode": "bmad-method install -f -i opencode"
      }
    }
    ```

### Codex（CLI 和 Web）

BMad 通过 `AGENTS.md` 和提交的核心代理文件与 OpenAI Codex 集成。

- 两种安装模式：
  - Codex（仅本地）：保持 `.bmad-core/` 被忽略用于本地开发。
    - `npx bmad-method install -f -i codex -d .`
  - Codex Web 启用：确保 `.bmad-core/` 被跟踪，以便您可以为 Codex Web 提交它。
    - `npx bmad-method install -f -i codex-web -d .`

- 生成的内容：
  - 项目根目录的 `AGENTS.md`，包含 BMad 部分，内容包括
    - 如何使用 Codex（CLI 和 Web）
    - 代理目录（标题、ID、何时使用）
    - 详细的每个代理部分，包含源路径、何时使用、激活短语和 YAML
    - 带有快速使用说明的任务
  - 如果存在 `package.json`，将添加有用的脚本：
    - `bmad:refresh`、`bmad:list`、`bmad:validate`

- 使用 Codex：
  - CLI：在项目根目录运行 `codex` 并自然提示，例如"作为 dev，实现 ..."。
  - Web：提交 `.bmad-core/` 和 `AGENTS.md`，然后在 Codex 中打开仓库并以相同方式提示。

- 更改后刷新：
  - 重新运行适当的安装模式（`codex` 或 `codex-web`）以更新 `AGENTS.md` 中的 BMad 块。

## 特殊代理

有两个 BMad 代理 - 将来它们将合并为单个 BMad-Master。

### BMad-Master

此代理可以执行所有其他代理可以执行的任何任务或命令，除了实际的故事实现。此外，该代理可以在网页上通过访问知识库来帮助解释 BMad 方法，并向您解释有关流程的任何内容。

如果您不想在除了 dev 之外的不同代理之间切换，这个代理适合您。只需记住，随着上下文的增长，代理的性能会下降，因此重要的是指示代理压缩对话并以压缩的对话作为初始消息开始新对话。经常这样做，最好在每个故事实现后进行。

### BMad-Orchestrator

此代理不应在 IDE 中使用，它是一个重量级的、特殊用途的代理，使用大量上下文并可以变形为任何其他代理。它仅用于促进网页捆绑包中的团队。如果您使用网页捆绑包，您将被 BMad Orchestrator 问候。

### 代理如何工作

#### 依赖系统

每个代理都有一个 YAML 部分定义其依赖项：

```yaml
dependencies:
  templates:
    - prd-template.md
    - user-story-template.md
  tasks:
    - create-doc.md
    - shard-doc.md
  data:
    - bmad-kb.md
```

**关键点：**

- 代理只加载它们需要的资源（精简上下文）
- 依赖项在捆绑期间自动解析
- 资源在代理之间共享以保持一致性

#### 代理交互

**在 IDE 中：**

```bash
# 一些 IDE，例如 Cursor 或 Windsurf，使用手动规则，因此交互使用 '@' 符号完成
@pm 为任务管理应用创建 PRD
@architect 设计系统架构
@dev 实现用户认证

# 一些 IDE，例如 Claude Code，使用斜杠命令
/pm 创建用户故事
/dev 修复登录错误
```

#### 交互模式

- **增量模式**：逐步进行，需要用户输入
- **YOLO 模式**：快速生成，最少交互

## IDE 集成

### IDE 最佳实践

- **上下文管理**：仅在上下文中保留相关文件，保持文件尽可能精简和专注
- **代理选择**：为任务使用适当的代理
- **迭代开发**：在小而专注的任务中工作
- **文件组织**：保持清晰的项目结构
- **定期提交**：经常保存您的工作

## 测试架构师（QA 代理）

### 概述

BMad 中的 QA 代理不仅仅是"高级开发人员审查者" - 它是一个在测试策略、质量关卡和基于风险的测试方面具有深厚专业知识的**测试架构师**。名为 Quinn，该代理在质量问题上提供咨询权威，同时在安全时主动改进代码。

#### 快速入门（基本命令）

```bash
@qa *risk {story}       # 在开发前评估风险
@qa *design {story}     # 创建测试策略
@qa *trace {story}      # 在开发期间验证测试覆盖率
@qa *nfr {story}        # 检查质量属性
@qa *review {story}     # 全面评估 → 编写关卡
```

#### 命令别名（测试架构师）

文档使用简短形式以方便使用。两种样式都有效：

```text
*risk    → *risk-profile
*design  → *test-design
*nfr     → *nfr-assess
*trace   → *trace-requirements（或只是 *trace）
*review  → *review
*gate    → *gate
```

### 核心能力

#### 1. 风险分析（`*risk`）

**何时：** 故事草稿后，开发开始前（最早干预点）

识别和评估实施风险：

- **类别**：技术、安全、性能、数据、业务、运营
- **评分**：概率 × 影响分析（1-9 级）
- **缓解**：针对每个已识别风险的具体策略
- **关卡影响**：风险 ≥9 触发 FAIL，≥6 触发 CONCERNS（有关权威规则，请参见 `tasks/risk-profile.md`）

#### 2. 测试设计（`*design`）

**何时：** 故事草稿后，开发开始前（指导要编写的测试）

创建综合测试策略，包括：

- 每个验收标准的测试场景
- 适当的测试级别建议（单元 vs 集成 vs E2E）
- 基于风险的优先级（P0/P1/P2）
- 测试数据要求和模拟策略
- CI/CD 集成的执行策略

**示例输出：**

```yaml
test_summary:
  total: 24
  by_level:
    unit: 15
    integration: 7
    e2e: 2
  by_priority:
    P0: 8 # 必须有 - 链接到关键风险
    P1: 10 # 应该有 - 中等风险
    P2: 6 # 最好有 - 低风险
```

#### 3. 需求追踪（`*trace`）

**何时：** 开发期间（实施中期检查点）

将需求映射到测试覆盖率：

- 记录哪些测试验证每个验收标准
- 使用 Given-When-Then 以清晰（仅文档，非 BDD 代码）
- 识别具有严重性评级的覆盖率缺口
- 创建可追溯性矩阵以用于审计

#### 4. NFR 评估（`*nfr`）

**何时：** 开发期间或早期审查（验证质量属性）

验证非功能性需求：

- **核心四项**：安全性、性能、可靠性、可维护性
- **基于证据**：寻找实际实施证明
- **关卡集成**：NFR 失败直接影响质量关卡

#### 5. 综合测试架构审查（`*review`）

**何时：** 开发完成后，故事标记为"准备审查"

当您运行 `@qa *review {story}` 时，Quinn 执行：

- **需求可追溯性**：将每个验收标准映射到其验证测试
- **测试级别分析**：确保在单元、集成和 E2E 级别进行适当测试
- **覆盖率评估**：识别缺口和冗余的测试覆盖率
- **主动重构**：在安全时直接改进代码质量
- **质量关卡决策**：根据发现发布 PASS/CONCERNS/FAIL 状态

#### 6. 质量关卡（`*gate`）

**何时：** 审查修复后或需要更新关卡状态时

管理质量关卡决策：

- **确定性规则**：PASS/CONCERNS/FAIL 的明确标准
- **并行权限**：QA 拥有 `docs/qa/gates/` 中的关卡文件
- **咨询性质**：提供建议，而非阻止
- **豁免支持**：在需要时记录已接受的风险

**注意：** 关卡是咨询性的；团队选择其质量标准。WAIVED 需要原因、批准者和到期日期。有关架构和 `tasks/review-story.md`（关卡规则）和 `tasks/risk-profile.md` 的评分，请参见 `templates/qa-gate-tmpl.yaml`。

### 与测试架构师合作

#### 与 BMad 工作流集成

测试架构师在整个开发生命周期中提供价值。以下是何时以及如何利用每项能力：

| **阶段**       | **命令**  | **何时使用**     | **价值**             | **输出**                                                     |
| -------------- | --------- | ---------------- | -------------------- | ------------------------------------------------------------ |
| **故事起草**   | `*risk`   | SM 起草故事后    | 早期识别陷阱         | `docs/qa/assessments/{epic}.{story}-risk-{YYYYMMDD}.md`      |
|                | `*design` | 风险评估后       | 指导 dev 测试策略    | `docs/qa/assessments/{epic}.{story}-test-design-{YYYYMMDD}.md` |
| **开发**       | `*trace`  | 实施中期         | 验证测试覆盖率       | `docs/qa/assessments/{epic}.{story}-trace-{YYYYMMDD}.md`     |
|                | `*nfr`    | 构建功能时       | 早期发现质量问题     | `docs/qa/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md`       |
| **审查**       | `*review` | 故事标记为完成时 | 全面质量评估         | 故事中的 QA 结果 + 关卡文件                                  |
| **审查后**     | `*gate`   | 修复问题后       | 更新质量决策         | 更新的 `docs/qa/gates/{epic}.{story}-{slug}.yml`             |

#### 示例命令

```bash
# 规划阶段 - 在开发开始前运行这些
@qa *risk {draft-story}     # 可能出什么问题？
@qa *design {draft-story}   # 我们应该编写哪些测试？

# 开发阶段 - 在编码期间运行这些
@qa *trace {story}          # 我们是否测试了所有内容？
@qa *nfr {story}            # 我们是否满足质量标准？

# 审查阶段 - 开发完成时运行
@qa *review {story}         # 综合评估 + 重构

# 审查后 - 解决问题后运行
@qa *gate {story}           # 更新关卡状态
```

### 强制执行的质量标准

Quinn 强制执行这些测试质量原则：

- **无不稳定测试**：通过适当的异步处理确保可靠性
- **无硬等待**：仅动态等待策略
- **无状态和并行安全**：测试独立运行
- **自清理**：测试管理自己的测试数据
- **适当的测试级别**：单元用于逻辑，集成用于交互，E2E 用于旅程
- **显式断言**：将断言保留在测试中，而不是辅助程序中

### 关卡状态含义

- **PASS**：满足所有关键要求，无阻塞问题
- **CONCERNS**：发现非关键问题，团队应审查
- **FAIL**：应解决的关键问题（安全风险、缺少 P0 测试）
- **WAIVED**：问题已确认但团队明确接受

### 特殊情况

**高风险故事：**

- 始终在开发开始前运行 `*risk` 和 `*design`
- 考虑开发中期 `*trace` 和 `*nfr` 检查点

**复杂集成：**

- 在开发期间运行 `*trace` 以确保测试所有集成点
- 使用 `*nfr` 验证跨集成的性能

**性能关键：**

- 在开发期间早期且经常运行 `*nfr`
- 不要等到审查才发现性能问题

**棕地/遗留代码：**

- 从 `*risk` 开始识别回归危险
- 使用 `*review` 时额外关注向后兼容性

### 最佳实践

- **早期参与**：在故事起草期间运行 `*design` 和 `*risk`
- **基于风险的关注**：让风险分数驱动测试优先级
- **迭代改进**：使用 QA 反馈改进未来的故事
- **关卡透明度**：与团队分享关卡决策
- **持续学习**：QA 记录模式以供团队知识共享
- **棕地关怀**：在现有系统中格外注意回归风险

### 输出路径参考

测试架构师输出存储位置的快速参考：

```text
*risk-profile  → docs/qa/assessments/{epic}.{story}-risk-{YYYYMMDD}.md
*test-design   → docs/qa/assessments/{epic}.{story}-test-design-{YYYYMMDD}.md
*trace         → docs/qa/assessments/{epic}.{story}-trace-{YYYYMMDD}.md
*nfr-assess    → docs/qa/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md
*review        → 故事中的 QA 结果部分 + 关卡文件引用
*gate          → docs/qa/gates/{epic}.{story}-{slug}.yml
```

## 技术偏好系统

BMad 通过位于 `.bmad-core/data/` 中的 `technical-preferences.md` 文件包含一个个性化系统 - 这可以帮助使 PM 和架构师偏向于推荐您对设计模式、技术选择或您想放在这里的任何其他内容的偏好。

### 与 Web 捆绑包一起使用

创建自定义 Web 捆绑包或上传到 AI 平台时，包含您的 `technical-preferences.md` 内容，以确保代理从任何对话开始就拥有您的偏好。

## 核心配置

`.bmad-core/core-config.yaml` 文件是一个关键配置，使 BMad 能够无缝处理不同的项目结构，未来将提供更多选项。目前最重要的是 yaml 中的 devLoadAlwaysFiles 列表部分。

### 开发者上下文文件

定义 dev 代理应始终加载哪些文件：

```yaml
devLoadAlwaysFiles:
  - docs/architecture/coding-standards.md
  - docs/architecture/tech-stack.md
  - docs/architecture/project-structure.md
```

您需要从分片架构中验证这些文档是否存在，它们是否尽可能精简，并包含您希望 dev 代理始终加载到其上下文中的确切信息。这些是代理将遵循的规则。

随着项目的增长和代码开始构建一致的模式，编码标准应减少到仅包括代理仍需要强制执行的标准。代理将查看文件中的周围代码以推断与当前任务相关的编码标准。

## 获取帮助

- **Discord 社区**：[加入 Discord](https://discord.gg/gk8jAdXWmj)
- **GitHub Issues**：[报告错误](https://github.com/bmadcode/bmad-method/issues)
- **文档**：[浏览文档](https://github.com/bmadcode/bmad-method/docs)
- **YouTube**：[BMadCode 频道](https://www.youtube.com/@BMadCode)

## 结论

请记住：BMad 旨在增强您的开发流程，而不是取代您的专业知识。将其用作强大的工具来加速您的项目，同时保持对设计决策和实施细节的控制。

