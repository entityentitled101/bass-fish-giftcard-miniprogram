# Avatar Journey 应用分析与重构计划

## 现有代码分析

### 项目概述
Avatar Journey 是一个基于 AI 的虚拟旅行游戏，让用户创建自己的虚拟化身进行实时旅行体验。游戏按真实时间运行，AI 会定期生成旅行事件和体验。

### 主要功能模块
1. **角色设定**：用户创建虚拟角色，设置姓名、性格等特征
2. **旅行配置**：选择出发地、目的地、旅行方式和旅行风格
3. **实时旅行引擎**：根据真实时间生成旅行事件
4. **用户交互**：用户可以发送消息干预角色行动
5. **日记系统**：自动生成每日旅行日记

### 当前代码结构问题
1. **单一文件结构**：所有代码都在一个 667 行的文件中，难以维护和扩展
2. **缺乏模块化**：功能没有明确分离，组件、逻辑、API调用混合在一起
3. **无持久化存储**：用户数据和旅行状态无法保存，刷新页面后丢失
4. **固定API依赖**：只能使用Claude API，无法切换到其他API提供商
5. **设置页面未完善**：目前只有重置数据功能

## 文件拆分建议

### 推荐的目录结构
```
avatar_journey/
├── src/
│   ├── components/
│   │   ├── SetupPage.tsx
│   │   ├── TravelingPage.tsx
│   │   ├── DiaryPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── NavigationBar.tsx
│   ├── services/
│   │   ├── apiService.ts
│   │   ├── storageService.ts
│   │   └── eventGenerator.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   └── App.tsx
├── public/
│   └── index.html
├── package.json
└── README.md
```

### 模块职责说明

1. **组件模块 (components/)**
   - **SetupPage.tsx**：处理角色设定和旅行配置的表单界面
   - **TravelingPage.tsx**：显示旅行状态、事件记录和用户交互界面
   - **DiaryPage.tsx**：展示自动生成的旅行日记
   - **SettingsPage.tsx**：提供应用设置，包括API切换功能
   - **NavigationBar.tsx**：处理页面导航逻辑

2. **服务模块 (services/)**
   - **apiService.ts**：封装API调用逻辑，支持Claude和智谱GLM两种API
   - **storageService.ts**：负责数据的本地存储和读取
   - **eventGenerator.ts**：处理旅行事件生成和调度逻辑

3. **类型定义 (types/index.ts)**
   - 集中管理应用中使用的所有TypeScript类型定义，如角色、旅行状态、事件等

4. **工具函数 (utils/helpers.ts)**
   - 提供通用的辅助函数，如日期格式化、数据验证等

5. **主应用 (App.tsx)**
   - 整合所有组件，管理全局状态和业务逻辑

## 关键改进点

### 1. 存储系统实现
- 使用localStorage保存角色信息、旅行状态、事件和日记数据
- 实现数据自动保存和恢复功能
- 添加数据导出/导入功能作为可选增强

### 2. API切换功能
- 抽象API调用接口，支持多种AI提供商
- 实现基于设置的API动态切换
- 添加API密钥配置界面
- 兼容Claude和智谱GLM的API格式差异

### 3. 代码质量提升
- 添加TypeScript类型定义，提高代码健壮性
- 实现组件化开发，提高代码复用性
- 添加适当的注释和文档
- 分离关注点，使逻辑更清晰

## 实现步骤

1. **创建项目结构**：按照建议的目录结构创建文件和文件夹
2. **提取类型定义**：先定义核心数据结构和类型
3. **实现存储服务**：添加localStorage功能
4. **重构API服务**：创建统一的API接口，支持多提供商
5. **拆分组件**：将UI拆分为独立组件
6. **重构业务逻辑**：将逻辑从UI组件中分离出来
7. **集成与测试**：将所有模块整合并测试功能

## 技术选型建议

1. **前端框架**：React + TypeScript
2. **存储方案**：localStorage (浏览器端) + 可选的云端存储
3. **状态管理**：React Context API + useReducer 或 Redux
4. **UI组件库**：可选使用Ant Design或MUI来提升界面质量

这个重构计划将使Avatar Journey应用更加模块化、可维护，并满足您提出的需求，包括数据持久化和API切换功能。