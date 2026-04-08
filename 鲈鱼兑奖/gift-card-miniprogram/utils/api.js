// 腾讯云开发 API
const db = wx.cloud.database();

module.exports = {
  // 获取可用卡片列表
  getAvailableCards: () => {
    return db.collection('gift_cards')
      .where({ status: 'available' })
      .get()
      .then(res => res.data)
      .catch(err => {
        console.error('获取可用卡片失败:', err);
        throw err;
      });
  },

  // 检查用户是否已领取
  checkUserClaimed: (openid) => {
    return db.collection('card_claims')
      .where({ openid: openid })
      .get()
      .then(res => res.data)
      .catch(err => {
        console.error('检查用户领取状态失败:', err);
        throw err;
      });
  },

  // 领取卡片
  claimCard: (openid, cardCode) => {
    return db.collection('card_claims')
      .add({
        data: {
          openid: openid,
          card_code: cardCode,
          created_at: db.serverDate()
        }
      })
      .catch(err => {
        console.error('创建领取记录失败:', err);
        throw err;
      });
  },

  // 更新卡片状态
  updateCardStatus: (code, status, openid) => {
    return db.collection('gift_cards')
      .where({ code: code })
      .update({
        data: {
          status: status,
          claimed_by: openid,
          claimed_at: db.serverDate()
        }
      })
      .catch(err => {
        console.error('更新卡片状态失败:', err);
        throw err;
      });
  },

  // 创建或更新用户
  upsertUser: (userInfo) => {
    // 云开发没有 upsert，先查后插
    return db.collection('wx_users')
      .where({ openid: userInfo.openid })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          // 已存在，更新
          return db.collection('wx_users')
            .doc(res.data[0]._id)
            .update({
              data: {
                nickname: userInfo.nickname,
                avatar_url: userInfo.avatar_url,
                updated_at: db.serverDate()
              }
            });
        } else {
          // 不存在，新增
          return db.collection('wx_users')
            .add({
              data: {
                openid: userInfo.openid,
                nickname: userInfo.nickname,
                avatar_url: userInfo.avatar_url,
                created_at: db.serverDate()
              }
            });
        }
      })
      .catch(err => {
        console.error('保存用户失败:', err);
        throw err;
      });
  },

  // 根据openID获取用户卡片
  getCardByOpenid: (openid) => {
    return db.collection('gift_cards')
      .where({ 
        claimed_by: openid,
        status: 'claimed'
      })
      .get()
      .then(res => res.data && res.data[0] ? res.data[0] : null)
      .catch(err => {
        console.error('获取用户卡片失败:', err);
        return null;
      });
  },

  // 根据code获取卡片
  getCardByCode: (code) => {
    return db.collection('gift_cards')
      .where({ code: code })
      .get()
      .then(res => res.data && res.data[0] ? res.data[0] : null)
      .catch(err => {
        console.error('获取卡片失败:', err);
        return null;
      });
  },

  // 创建兑奖记录
  createRedeemRecord: (data) => {
    return db.collection('redeem_records')
      .add({
        data: {
          card_code: data.code,
          openid: data.openid,
          recipient_name: data.name,
          recipient_phone: data.phone,
          recipient_address: data.address,
          remark: data.remark || '',
          redeemed_at: db.serverDate(),
          status: 'pending'
        }
      })
      .catch(err => {
        console.error('创建兑奖记录失败:', err);
        throw err;
      });
  },

  // Supabase兼容层（用于redeem.js）
  supabase: {
    from: (table) => ({
      insert: (data) => {
        const record = data[0] || data;
        return db.collection(table)
          .add({ data: record })
          .then(() => ({ error: null }))
          .catch(err => ({ error: err }));
      }
    })
  }
};
