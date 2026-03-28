const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    hasClaimed: false,
    noStock: false,
    userInfo: null,
    claiming: false
  },

  onLoad() {
    this.checkLogin();
  },

  // 检查登录状态
  async checkLogin() {
    const openid = wx.getStorageSync('openid');
    
    if (!openid) {
      // 未登录，获取用户信息
      this.setData({ loading: false });
      return;
    }

    app.globalData.openid = openid;
    
    try {
      // 检查是否已领取
      const claims = await api.checkUserClaimed(openid);
      
      if (claims && claims.length > 0) {
        this.setData({ 
          hasClaimed: true,
          loading: false,
          claimedCard: claims[0]
        });
      } else {
        this.setData({ loading: false });
      }
    } catch (err) {
      console.error('检查领取状态失败', err);
      this.setData({ loading: false });
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于领取礼品卡',
      success: (res) => {
        this.setData({ userInfo: res.userInfo });
        this.login(res.userInfo);
      },
      fail: (err) => {
        console.log('用户拒绝授权', err);
        wx.showToast({
          title: '需要授权才能领取',
          icon: 'none'
        });
      }
    });
  },

  // 登录获取 openid
  login(userInfo) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 这里应该调用后端换取 openid
          // 简化处理：用 code 的 hash 作为模拟 openid
          const openid = 'user_' + res.code.slice(-20);
          wx.setStorageSync('openid', openid);
          app.globalData.openid = openid;
          
          // 保存用户信息
          this.saveUser(openid, userInfo);
        }
      }
    });
  },

  // 保存用户信息到数据库
  async saveUser(openid, userInfo) {
    try {
      await api.upsertUser({
        openid: openid,
        nickname: userInfo.nickName,
        avatar_url: userInfo.avatarUrl
      });
    } catch (err) {
      console.error('保存用户失败', err);
    }
  },

  // 领取卡片
  async handleClaim() {
    if (this.data.claiming) return;
    
    const openid = app.globalData.openid;
    if (!openid) {
      wx.showToast({
        title: '请先授权登录',
        icon: 'none'
      });
      return;
    }

    this.setData({ claiming: true });

    try {
      // 1. 获取可用卡片
      const cards = await api.getAvailableCards();
      
      if (!cards || cards.length === 0) {
        this.setData({ 
          noStock: true,
          claiming: false
        });
        return;
      }

      // 2. 随机分配一张
      const card = cards[0];

      // 3. 创建领取记录
      await api.claimCard(openid, card.code);

      // 4. 更新卡片状态
      await api.updateCardStatus(card.code, 'claimed', openid);

      // 5. 保存到本地
      wx.setStorageSync('myCard', card);

      wx.showToast({
        title: '领取成功！',
        icon: 'success'
      });

      // 跳转我的卡片
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/my-card/my-card'
        });
      }, 1500);

    } catch (err) {
      console.error('领取失败', err);
      wx.showToast({
        title: '领取失败，请重试',
        icon: 'none'
      });
      this.setData({ claiming: false });
    }
  },

  // 去我的卡片
  goToMyCard() {
    wx.switchTab({
      url: '/pages/my-card/my-card'
    });
  }
});
