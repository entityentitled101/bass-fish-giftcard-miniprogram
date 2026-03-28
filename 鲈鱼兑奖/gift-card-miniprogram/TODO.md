# ✅ 绿佳元小程序 - 任务清单

## 你的任务（需要你自己完成）

### Phase 1: 准备工作（1天）

#### 1. 注册微信小程序
- [ ] 访问 [微信公众平台](https://mp.weixin.qq.com/)
- [ ] 点击"立即注册" → 选择"小程序"
- [ ] 填写邮箱、密码
- [ ] 邮箱验证
- [ ] 选择主体类型：**企业**（需要营业执照）
- [ ] 填写企业信息
- [ ] 支付 **300元** 认证费（微信支付）
- [ ] 等待审核（1-3个工作日）

#### 2. 准备材料
- [ ] 营业执照扫描件
- [ ] 管理员身份证正反面
- [ ] 管理员手机号
- [ ] 小程序名称（想好）：`绿佳元生态鲈鱼` 或类似
- [ ] 小程序简介：50字以内介绍
- [ ] 小程序 Logo（300x300像素）

#### 3. 下载开发工具
- [ ] 访问 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [ ] 下载稳定版（Windows 64位）
- [ ] 安装并登录（用注册的管理员微信扫码）

---

### Phase 2: 后端配置（半天）

#### 4. Supabase 配置
- [ ] 登录 [Supabase](https://supabase.com/)
- [ ] 进入现有项目
- [ ] 点击 Settings → API
- [ ] 复制 `anon public` API Key（这是给小程序用的）
- [ ] 复制 `URL`
- [ ] 发送给我，我会写入代码

#### 5. 数据库建表（执行 SQL）
```sql
-- 复制下面的 SQL 到 Supabase SQL Editor 执行

-- 用户表
CREATE TABLE wx_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(100) UNIQUE NOT NULL,
    nickname varchar(50),
    avatar_url text,
    created_at timestamp DEFAULT now()
);

-- 礼品卡表（和H5共用或独立）
CREATE TABLE gift_cards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code varchar(20) UNIQUE NOT NULL,
    gift_name varchar(100) DEFAULT '绿佳元生态鲈鱼',
    status varchar(20) DEFAULT 'available', -- available/claimed/used
    claimed_by varchar(100), -- openid
    claimed_at timestamp,
    created_at timestamp DEFAULT now()
);

-- 领取记录表
CREATE TABLE card_claims (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(100) NOT NULL,
    card_code varchar(20) NOT NULL,
    claimed_at timestamp DEFAULT now(),
    UNIQUE(openid), -- 每人限领1张
    UNIQUE(card_code) -- 每张卡只能被领1次
);

-- 插入测试数据（12个真实码）
INSERT INTO gift_cards (code) VALUES 
('22345678902'), ('32345678903'), ('42345678904'), 
('52345678905'), ('62345678906'), ('10000000002'),
('11111111112'), ('12222222222'), ('13333333332'),
('15555555552'), ('16666666662'), ('17777777772');
```

#### 6. 开启 RLS（行级安全）
```sql
-- 允许匿名用户读取可用卡片
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read available cards" 
ON gift_cards FOR SELECT 
USING (status = 'available');

-- 允许插入领取记录
ALTER TABLE card_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert claims" 
ON card_claims FOR INSERT 
WITH CHECK (true);
```

---

### Phase 3: 开发（我来做）

#### 7. 项目初始化
- [ ] 我创建基础代码框架
- [ ] 我配置接口连接
- [ ] 我实现3D卡片效果

#### 8. 功能开发
- [ ] 首页3D展示
- [ ] 微信登录
- [ ] 领取逻辑
- [ ] 我的卡片页
- [ ] 分享功能

---

### Phase 4: 测试发布（1天）

#### 9. 真机测试
- [ ] 你用手机扫码预览
- [ ] 测试领取流程
- [ ] 测试分享功能
- [ ] 检查是否流畅

#### 10. 提交审核
- [ ] 填写版本信息
- [ ] 上传代码
- [ ] 提交审核
- [ ] 等待通过（1-3天）

#### 11. 正式发布
- [ ] 审核通过后点击"发布"
- [ ] 生成小程序码
- [ ] 打印二维码贴在店里

---

## 需要你给我提供的信息

| 信息 | 用途 | 什么时候要 |
|------|------|-----------|
| Supabase anon key | 小程序连接数据库 | Phase 2 |
| Supabase URL | 小程序连接数据库 | Phase 2 |
| 小程序 AppID | 配置项目 | Phase 1 注册后 |
| 卡片正面图（PNG） | 3D贴图 | Phase 2 |
| 卡片背面图（PNG） | 3D贴图 | Phase 2 |
| Logo（300x300） | 小程序图标 | Phase 1 |

---

## 费用清单

| 项目 | 费用 | 备注 |
|------|------|------|
| 小程序认证 | ¥300/年 | 必须，企业主体 |
| 域名（可选） | ¥50-100/年 | 如果用自定义域名 |
| 服务器 | ¥0 | Supabase免费版够用 |
| **总计** | **约¥300** | |

---

## 常见问题

### Q: 个人可以注册小程序吗？
A: 可以，但个人小程序不能接入微信支付，功能受限。建议用企业/个体户资质。

### Q: 300元认证费每年都要交吗？
A: 是的，每年需要年审，重新支付300元。

### Q: 审核不通过怎么办？
A: 常见原因：
- 服务类目不对（要选：食品/餐饮）
- 缺少资质证明
- 功能不完整
按提示修改后再提交。

### Q: 小程序能和H5同时用吗？
A: 可以！数据共用同一个Supabase数据库，用户领卡后可以在H5兑奖。

---

## 下一步行动

1. **今天**：注册小程序账号
2. **明天**：准备材料，获取 AppID
3. **后天**：告诉我 AppID 和 Supabase 信息
4. **我开发**：约4天完成
5. **测试发布**：你审核通过后上线

准备好开始了吗？先把小程序注册了！🚀
