App({
  onLaunch() {
    // 检查登录状态
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.globalData.openid = openid;
    }
  },
  
  globalData: {
    openid: null,
    userInfo: null,
    claimedCard: null
  }
});
