const app = getApp();

Page({
  data: {
    hasCard: false,
    cardInfo: null,
    userInfo: null
  },

  onShow() {
    this.loadCardInfo();
  },

  // 加载卡片信息
  loadCardInfo() {
    const openid = wx.getStorageSync('openid');
    const myCard = wx.getStorageSync('myCard');
    const userInfo = wx.getStorageSync('userInfo');

    if (myCard) {
      this.setData({
        hasCard: true,
        cardInfo: myCard,
        userInfo: userInfo
      });
    } else {
      this.setData({
        hasCard: false
      });
    }
  },

  // 去领取
  goToClaim() {
    wx.navigateTo({
      url: '/pages/claim/claim'
    });
  },

  // 去兑奖
  goToRedeem() {
    const code = this.data.cardInfo.code;
    // 跳转到小程序内兑奖页面
    wx.navigateTo({
      url: `/pages/redeem/redeem?code=${code}`
    });
  },

  // 分享卡片
  onShareAppMessage() {
    return {
      title: '送你一张绿佳元生态鲈鱼礼品卡',
      path: '/pages/index/index',
      imageUrl: '/images/share-card.png'
    };
  },

  // 复制兑奖码
  copyCode() {
    const code = this.data.cardInfo.code;
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  }
});
