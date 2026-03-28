# 🎁 绿佳元生态鲈鱼 - 小程序开发计划

## 一、小程序技术选型

### 开发语言
- **WXML** - 页面结构（类似 HTML）
- **WXSS** - 样式表（类似 CSS）
- **JavaScript** - 逻辑代码
- **JSON** - 配置文件

### 为什么选原生？
- 性能最好
- 文档最全
- 没有框架依赖
- 最适合 3D 效果（Canvas）

---

## 二、项目结构

```
gift-card-miniprogram/
├── pages/                    # 页面目录
│   ├── index/               # 首页 - 3D卡片展示
│   │   ├── index.wxml       # 页面结构
│   │   ├── index.wxss       # 页面样式
│   │   ├── index.js         # 页面逻辑
│   │   └── index.json       # 页面配置
│   ├── claim/               # 领取页面
│   │   ├── claim.wxml
│   │   ├── claim.wxss
│   │   ├── claim.js
│   │   └── claim.json
│   ├── my-card/             # 我的卡片页面
│   │   ├── my-card.wxml
│   │   ├── my-card.wxss
│   │   ├── my-card.js
│   │   └── my-card.json
│   └── admin/               # 管理后台（可选）
│       └── ...
├── components/              # 组件目录
│   └── gift-card-3d/        # 3D卡片组件
│       ├── gift-card-3d.wxml
│       ├── gift-card-3d.wxss
│       └── gift-card-3d.js
├── utils/                   # 工具函数
│   ├── api.js               # 接口请求
│   └── util.js              # 通用工具
├── images/                  # 图片资源
│   ├── card-front.png       # 卡片正面
│   ├── card-back.png        # 卡片背面
│   └── logo.png             # Logo
├── app.js                   # 小程序入口
├── app.json                 # 全局配置
├── app.wxss                 # 全局样式
├── project.config.json      # 项目配置
└── README.md                # 项目说明
```

---

## 三、核心功能模块

### 1. 3D礼品卡展示
- 使用 Canvas 实现 3D 翻转效果
- 支持手势旋转
- 贴图使用 PNG 图片

### 2. 微信一键登录
```javascript
// 获取用户信息
wx.getUserProfile({
  desc: '用于领取礼品卡',
  success: (res) => {
    // 获得头像、昵称
  }
})

// 获取 OpenID（后端完成）
wx.login({
  success: (res) => {
    // 发送 code 到后端换取 openid
  }
})
```

### 3. 领取逻辑
- 每个微信用户限领 1 张
- 自动分配兑奖码
- 生成带二维码的卡片图片

### 4. 分享功能
- 生成分享海报
- 分享到好友/群
- 分享到朋友圈（需要特殊处理）

---

## 四、与 H5 版本的对比

| 功能 | H5 网页 | 小程序 |
|------|---------|--------|
| 3D效果 | CSS 3D | Canvas 3D（更流畅） |
| 微信登录 | 扫码授权 | 静默授权（无需扫码） |
| 分享 | 截图分享 | 原生分享卡片 |
| 消息推送 | 不支持 | 支持服务通知 |
| 离线使用 | 不支持 | 部分支持 |

---

## 五、后端接口（复用 Supabase）

```javascript
// api.js 示例
const API_BASE = 'https://your-project.supabase.co/rest/v1';

// 1. 领取卡片
const claimCard = async (code, userInfo) => {
  return wx.request({
    url: `${API_BASE}/claims`,
    method: 'POST',
    header: {
      'apikey': 'your-anon-key',
      'Authorization': `Bearer ${token}`
    },
    data: {
      code,
      user_id: userInfo.id
    }
  });
};

// 2. 检查是否已领取
const checkClaimed = async (openid) => {
  return wx.request({
    url: `${API_BASE}/users?openid=eq.${openid}`,
    header: { 'apikey': 'your-anon-key' }
  });
};
```

---

## 六、页面设计草图

### 首页（index）
```
┌─────────────────────┐
│   绿佳元生态鲈鱼      │  ← 标题栏
│                     │
│                     │
│    ┌───────────┐    │
│    │           │    │
│    │   3D卡    │    │  ← 可旋转的3D卡片
│    │   正面    │    │
│    │           │    │
│    └───────────┘    │
│                     │
│   左右滑动旋转卡片   │  ← 提示文字
│                     │
│   ┌───────────────┐ │
│   │  领取礼品卡    │ │  ← 主按钮
│   └───────────────┘ │
│                     │
└─────────────────────┘
```

### 领取页（claim）
```
┌─────────────────────┐
│   确认领取           │
│                     │
│   ┌───────────┐    │
│   │   头像    │    │  ← 微信头像
│   │   昵称    │    │  ← 微信昵称
│   └───────────┘    │
│                     │
│   您即将领取        │
│   绿佳元生态鲈鱼     │
│   礼品卡一张        │
│                     │
│   每人限领一张      │
│                     │
│   ┌───────────────┐ │
│   │   确认领取    │ │
│   └───────────────┘ │
└─────────────────────┘
```

### 我的卡片（my-card）
```
┌─────────────────────┐
│   我的礼品卡         │
│                     │
│   ┌───────────┐    │
│   │  卡片背面  │    │  ← 显示兑奖码
│   │  兑奖码   │    │
│   │  [二维码] │    │
│   └───────────┘    │
│                     │
│   兑奖码：888888    │
│                     │
│   ┌───────────────┐ │
│   │   去兑奖      │ │  ← 跳转H5兑奖页
│   └───────────────┘ │
│                     │
│   ┌───────────────┐ │
│   │  分享给好友   │ │
│   └───────────────┘ │
└─────────────────────┘
```

---

## 七、3D卡片技术方案

使用微信小程序 Canvas 2D 或 WebGL 实现：

```javascript
// 3D卡片核心逻辑
Page({
  data: {
    rotation: 0,        // 旋转角度
    isFlipped: false    // 是否翻转
  },
  
  onReady() {
    this.initCanvas();
  },
  
  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        // 绘制3D效果
        this.drawCard(ctx);
      });
  },
  
  // 触摸旋转
  onTouchMove(e) {
    const x = e.touches[0].clientX;
    const rotation = (x / windowWidth) * 360;
    this.setData({ rotation });
  },
  
  // 点击翻转
  onTap() {
    this.setData({ isFlipped: !this.data.isFlipped });
  }
});
```

---

## 八、时间预估

| 阶段 | 时间 | 说明 |
|------|------|------|
| 项目初始化 | 0.5天 | 注册小程序、搭建框架 |
| 首页3D卡片 | 1.5天 | Canvas 3D效果最耗时 |
| 登录/领取逻辑 | 1天 | 微信授权 + 后端对接 |
| 我的卡片页 | 0.5天 | 展示+分享 |
| 调试优化 | 0.5天 | 真机测试 |
| **总计** | **4天** | |

---

## 九、需要准备的材料

1. **企业资质**：营业执照（必需）
2. **图片素材**：
   - 卡片正面图（PNG）
   - 卡片背面图（PNG）
   - Logo图标
3. **文案**：
   - 小程序名称
   - 服务类目（选：食品）
   - 简介

---

## 下一步

1. 创建项目文件
2. 编写基础代码框架
3. 配置 Supabase 接口
