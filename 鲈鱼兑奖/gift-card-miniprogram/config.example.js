// 配置文件模板
// 复制此文件为 config.js，并填入你的真实配置

module.exports = {
  // 小程序 AppID（从微信公众平台获取）
  APP_ID: 'wx_your_app_id_here',
  
  // 云开发环境 ID（从云开发控制台获取）
  CLOUD_ENV: 'your-cloud-env-id',

  // Supabase 配置（如使用 Supabase）
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_KEY: 'your-supabase-key',

  // 飞书多维表格配置（可选，用于同步兑奖信息）
  FEISHU: {
    APP_ID: '',           // 飞书应用 App ID
    APP_SECRET: '',       // 飞书应用 App Secret
    APP_TOKEN: '',        // 多维表格 App Token
    TABLE_ID: ''          // 表格 ID
  }
};
