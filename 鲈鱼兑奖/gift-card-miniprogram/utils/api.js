// API 配置文件
const CONFIG = require('../config');

// 通用请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${CONFIG.SUPABASE_URL}/rest/v1${options.url}`,
      method: options.method || 'GET',
      timeout: options.timeout || 10000, // 默认10秒超时
      header: {
        'apikey': CONFIG.SUPABASE_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...options.header
      },
      data: options.data,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          console.error('API 错误:', res.statusCode, res.data);
          reject({ 
            message: res.data?.message || `请求失败 (${res.statusCode})`,
            statusCode: res.statusCode,
            data: res.data
          });
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err);
        reject({ message: '网络请求失败，请检查网络连接' });
      }
    });
  });
};

module.exports = {
  // 获取可用卡片列表
  getAvailableCards: () => {
    return request({
      url: '/gift_cards?status=eq.available&select=*',
      method: 'GET'
    });
  },

  // 检查用户是否已领取
  checkUserClaimed: (openid) => {
    return request({
      url: `/card_claims?openid=eq.${openid}&select=*`,
      method: 'GET'
    });
  },

  // 领取卡片
  claimCard: (openid, cardCode) => {
    return request({
      url: '/card_claims',
      method: 'POST',
      data: {
        openid: openid,
        card_code: cardCode
      }
    });
  },

  // 更新卡片状态
  updateCardStatus: (code, status, openid) => {
    return request({
      url: `/gift_cards?code=eq.${code}`,
      method: 'PATCH',
      data: {
        status: status,
        claimed_by: openid,
        claimed_at: new Date().toISOString()
      }
    });
  },

  // 创建或更新用户
  upsertUser: (userInfo) => {
    return request({
      url: '/wx_users',
      method: 'POST',
      header: {
        'Prefer': 'resolution=merge-duplicates'
      },
      data: userInfo
    });
  },

  // 根据openID获取用户卡片
  getCardByOpenid: (openid) => {
    return request({
      url: `/gift_cards?claimed_by=eq.${openid}&select=*`,
      method: 'GET'
    }).then(data => data && data[0] ? data[0] : null);
  },

  // 根据code获取卡片
  getCardByCode: (code) => {
    return request({
      url: `/gift_cards?code=eq.${code}&select=*`,
      method: 'GET'
    }).then(data => data && data[0] ? data[0] : null);
  },

  // Supabase客户端（用于复杂查询）
  supabase: {
    from: (table) => ({
      insert: (data) => {
        console.log(`插入 ${table}:`, data);
        return request({
          url: `/${table}`,
          method: 'POST',
          header: {
            'Prefer': 'return=minimal' // 不返回插入的数据，提高性能
          },
          data: data[0] || data,
          timeout: 15000 // 插入操作15秒超时
        }).then(() => {
          console.log(`插入 ${table} 成功`);
          return { error: null };
        }).catch(err => {
          console.error(`插入 ${table} 失败:`, err);
          return { error: err };
        });
      }
    })
  }
};
