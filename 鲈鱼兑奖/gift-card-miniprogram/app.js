const CONFIG = require('./config.js');

App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: CONFIG.CLOUD_ENV, // 从配置文件读取云开发环境ID
        traceUser: true,
      });
      console.log('云开发初始化成功');
    }
    
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
