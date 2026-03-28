# 飞书多维表格配置教程

将兑奖信息同步到飞书表格，方便查看和管理订单。

---

## 第一步：创建飞书多维表格

1. 打开 [飞书多维表格](https://www.feishu.cn/product/base)
2. 新建一个空白表格
3. 添加以下列（字段名要完全一致）：

| 列名 | 字段类型 | 说明 |
|------|---------|------|
| 兑奖码 | 文本 | 礼品卡兑奖码 |
| 收货人 | 文本 | 收货人姓名 |
| 手机号 | 文本 | 联系电话 |
| 收货地址 | 文本 | 详细地址 |
| 备注 | 文本 | 用户备注 |
| 提交时间 | 文本 | 自动填充 |
| 状态 | 单选 | 待发货/已发货/已完成 |

---

## 第二步：创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 点击「开发者后台」→「创建企业自建应用」
3. 填写应用名称（如：礼品卡管理）
4. 记录 **App ID** 和 **App Secret**

### 添加权限
在应用后台 →「权限管理」→ 添加以下权限：
- `bitable:record:app:write` （写入表格记录）
- `bitable:record:app:read` （读取表格记录，可选）

### 获取表格信息
打开你的多维表格，从浏览器地址栏复制：

```
https://xxx.feishu.cn/base/APP_TOKEN?table=TABLE_ID
```

- `APP_TOKEN`：base/ 后面的一串字符
- `TABLE_ID`：table= 后面的一串字符（通常是 tbl 开头）

---

## 第三步：配置小程序

1. 复制 `config.example.js` 为 `config.js`：

```bash
cp config.example.js config.js
```

2. 编辑 `config.js`，填入飞书配置：

```javascript
module.exports = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_KEY: 'your-anon-key',
  
  FEISHU: {
    APP_ID: 'cli_xxxxx',           // 你的 App ID
    APP_SECRET: 'xxxxx',           // 你的 App Secret  
    APP_TOKEN: 'Basexxx',          // 表格 App Token
    TABLE_ID: 'tblxxxxx'           // 表格 ID
  }
};
```

---

## 完成！

现在用户提交兑奖后：
1. ✅ 数据存入 Supabase（后端数据库）
2. ✅ 数据同步到飞书表格（方便查看和管理）

你可以在飞书表格中：
- 查看所有待发货订单
- 标记发货状态
- 导出数据
- 分享给团队

---

## 常见问题

**Q：飞书配置错误会怎样？**
A：不会报错，数据仍会存入 Supabase，只是不会同步到飞书。

**Q：可以多个管理员查看表格吗？**
A：可以，在飞书中分享表格给团队成员即可。

**Q：飞书表格支持手机查看吗？**
A：支持，下载飞书 App 即可随时查看订单。
