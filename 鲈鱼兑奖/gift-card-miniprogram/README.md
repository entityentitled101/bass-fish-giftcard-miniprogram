# 绿佳元生态鲈鱼礼品卡小程序

基于微信小程序的礼品卡领取和兑奖系统。

## 功能

- 🎁 3D 礼品卡展示
- 👤 微信登录
- 📝 礼品卡领取（每人限领一张）
- 🚚 小程序内直接兑奖
- 📊 飞书表格同步

## 技术栈

- 微信小程序原生开发
- Supabase 后端数据库
- 飞书多维表格（订单管理）

## 项目结构

```
gift-card-miniprogram/
├── pages/              # 页面
│   ├── index/         # 首页（3D卡片展示）
│   ├── claim/         # 领取礼品卡
│   ├── my-card/       # 我的卡片
│   └── redeem/        # 兑奖页面
├── utils/             # 工具函数
│   ├── api.js         # Supabase API
│   └── feishu.js      # 飞书同步
├── config.js          # 配置文件（敏感信息，不提交）
├── config.example.js  # 配置模板
└── images/            # 图片资源
```

## 配置说明

1. 复制 `config.example.js` 为 `config.js`
2. 填入你的 Supabase 和飞书配置
3. 替换 `images/` 下的 `1.png` 和 `2.png` 为你的礼品卡图片

## 数据库表

- `wx_users` - 用户信息
- `gift_cards` - 礼品卡列表
- `card_claims` - 领取记录
- `redeem_records` - 兑奖记录

执行 `create_redeem_table.sql` 创建兑奖记录表。

## 发布

1. 在微信开发者工具中点击「上传」
2. 登录微信公众平台提交审核
3. 审核通过后发布

## 许可证

MIT
