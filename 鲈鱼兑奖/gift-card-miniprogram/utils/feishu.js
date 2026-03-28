// 飞书多维表格集成
// 配置在 config.js 中

const CONFIG = require('../config.js');
const FEISHU_CONFIG = CONFIG.FEISHU || {};

// 获取飞书访问令牌
let accessToken = null;
let tokenExpireTime = 0;

async function getFeishuToken() {
  // 如果 token 还有效，直接返回
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken;
  }

  try {
    const res = await new Promise((resolve, reject) => {
      wx.request({
        url: 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          app_id: FEISHU_CONFIG.APP_ID,
          app_secret: FEISHU_CONFIG.APP_SECRET
        },
        success: resolve,
        fail: reject
      });
    });

    if (res.data && res.data.tenant_access_token) {
      accessToken = res.data.tenant_access_token;
      // token 有效期约 2 小时，这里设置 1.5 小时后刷新
      tokenExpireTime = Date.now() + (res.data.expire - 300) * 1000;
      return accessToken;
    } else {
      throw new Error('获取飞书 token 失败');
    }
  } catch (err) {
    console.error('飞书 token 错误:', err);
    throw err;
  }
}

// 写入多维表格
async function writeToFeishu(record) {
  if (!FEISHU_CONFIG.APP_ID || !FEISHU_CONFIG.APP_SECRET) {
    console.log('飞书未配置，跳过同步');
    return { skipped: true };
  }

  try {
    const token = await getFeishuToken();
    
    const res = await new Promise((resolve, reject) => {
      wx.request({
        url: `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.APP_TOKEN}/tables/${FEISHU_CONFIG.TABLE_ID}/records`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          fields: {
            '兑奖码': record.code,
            '收货人': record.name,
            '手机号': record.phone,
            '收货地址': record.address,
            '备注': record.remark || '-',
            '提交时间': new Date().toLocaleString('zh-CN'),
            '状态': '待发货'
          }
        },
        success: resolve,
        fail: reject
      });
    });

    if (res.data && res.data.code === 0) {
      console.log('飞书同步成功');
      return { success: true, data: res.data.data };
    } else {
      throw new Error(res.data?.msg || '飞书写入失败');
    }
  } catch (err) {
    console.error('飞书同步失败:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  writeToFeishu,
  FEISHU_CONFIG
};
