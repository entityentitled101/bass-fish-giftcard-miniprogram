// 配置文件模板
// 复制此文件为 config.js，并填入你的真实配置

module.exports = {
  // Supabase 配置
  // 从 https://supabase.com/dashboard/project/_/settings/api 获取 Publishable key
  SUPABASE_URL: 'https://ymwkjzbdgjkyepmlfnna.supabase.co',
  SUPABASE_KEY: 'sb_publishable_YOUR_KEY_HERE',  // ← 替换为你的 Publishable key

  // 飞书多维表格配置（可选）
  FEISHU: {
    APP_ID: '',           // 飞书应用 App ID
    APP_SECRET: '',       // 飞书应用 App Secret
    APP_TOKEN: '',        // 多维表格 App Token
    TABLE_ID: ''          // 表格 ID
  }
};
