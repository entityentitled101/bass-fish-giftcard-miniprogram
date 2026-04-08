// pages/index/index.js
Page({
  data: {
    userInfo: null,
    hasCard: false
  },

  onLoad() {
    this.checkLogin();
    this.checkUserCard();
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  // 检查用户是否已领取卡片
  async checkUserCard() {
    const openid = wx.getStorageSync('openid');
    if (!openid) return;

    try {
      const api = require('../../utils/api.js');
      const card = await api.getCardByOpenid(openid);
      this.setData({ hasCard: !!card });
    } catch (err) {
      console.log('检查卡片失败:', err);
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        this.setData({ userInfo });
        wx.setStorageSync('userInfo', userInfo);
      },
      fail: () => {
        wx.showToast({
          title: '需要授权才能领取',
          icon: 'none'
        });
      }
    });
  },

  // 去领取页面
  goToClaim() {
    wx.navigateTo({
      url: '/pages/claim/claim'
    });
  },

  // 去我的卡片
  goToMyCard() {
    wx.switchTab({
      url: '/pages/my-card/my-card'
    });
  },

  onShareAppMessage() {
    return {
      title: '绿佳元生态鲈鱼礼品卡',
      path: '/pages/index/index',
      imageUrl: '/images/1.png'
    };
  }
});
