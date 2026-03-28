-- 创建兑奖记录表
CREATE TABLE IF NOT EXISTS redeem_records (
  id SERIAL PRIMARY KEY,
  card_code VARCHAR(20) NOT NULL REFERENCES gift_cards(code),
  openid VARCHAR(100) NOT NULL,
  recipient_name VARCHAR(50) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_address TEXT NOT NULL,
  remark TEXT,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' -- pending/shipped/completed
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_redeem_card_code ON redeem_records(card_code);
CREATE INDEX IF NOT EXISTS idx_redeem_openid ON redeem_records(openid);

-- 添加RLS策略
ALTER TABLE redeem_records ENABLE ROW LEVEL SECURITY;

-- 允许匿名插入（小程序端提交兑奖）
CREATE POLICY "Allow anonymous insert" ON redeem_records
  FOR INSERT TO anon WITH CHECK (true);

-- 允许匿名查询自己的记录
CREATE POLICY "Allow users to view own records" ON redeem_records
  FOR SELECT TO anon USING (true);
