const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    loading: false,
    noStock: false,
    openid: null,
    claiming: false,
    
    // 兑换码相关
    inputCode: '',
    verifiedCode: '',
    codeVerified: false,
    verifying: false,
    verifiedCard: null,
    
    // 用户信息（新接口）
    userInfoFilled: false,
    nickname: '',
    avatarUrl: ''
  },

  onLoad() {
    // 检查是否已登录（从其他页面返回时）
    this.checkExistingLogin();
  },

  // 检查是否已登录（用于页面返回时）
  checkExistingLogin() {
    const openid = wx.getStorageSync('openid');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (openid && userInfo) {
      // 检查是否是旧的假openid
      if (openid.startsWith('user_')) {
        wx.removeStorageSync('openid');
        wx.removeStorageSync('userInfo');
        return;
      }
      
      this.setData({ openid, userInfo });
    }
  },

  // 输入兑换码
  onCodeInput(e) {
    this.setData({ inputCode: e.detail.value });
  },

  // 验证兑换码
  async verifyCode() {
    const { inputCode } = this.data;
    
    if (!inputCode || inputCode.length !== 11) {
      wx.showToast({
        title: '请输入11位兑换码',
        icon: 'none'
      });
      return;
    }

    this.setData({ verifying: true });

    try {
      // 查询这张卡是否存在且可用
      const card = await api.getCardByCode(inputCode);
      
      if (!card) {
        wx.showModal({
          title: '兑换码无效',
          content: '该兑换码不存在，请检查是否输入正确',
          showCancel: false
        });
        this.setData({ verifying: false });
        return;
      }

      if (card.status !== 'available' && inputCode !== '12345678901') {
        wx.showModal({
          title: '该卡已被领取',
          content: '此兑换码已被使用，如有疑问请联系客服',
          showCancel: false
        });
        this.setData({ verifying: false, noStock: true });
        return;
      }
      
      // 测试卡特殊提示
      if (inputCode === '12345678901') {
        console.log('使用测试卡，可以重复领取');
      }

      // 验证通过
      this.setData({
        codeVerified: true,
        verifiedCode: inputCode,
        verifiedCard: card,
        verifying: false
      });

      wx.showToast({
        title: '验证通过',
        icon: 'success'
      });

    } catch (err) {
      console.error('验证失败:', err);
      wx.showToast({
        title: '验证失败，请重试',
        icon: 'none'
      });
      this.setData({ verifying: false });
    }
  },

  // 输入昵称
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({ avatarUrl });
  },

  // 提交用户信息
  submitUserInfo() {
    const { nickname, avatarUrl } = this.data;
    
    if (!nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    // 获取 openid
    this.login(nickname, avatarUrl);
  },

  // 登录获取 openid
  login(nickname, avatarUrl) {
    this.setData({ claiming: true });
    
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        const openid = res.result.openid;
        console.log('获取到真实OpenID:', openid);
        
        wx.setStorageSync('openid', openid);
        wx.setStorageSync('nickname', nickname);
        wx.setStorageSync('avatarUrl', avatarUrl);
        app.globalData.openid = openid;
        
        this.setData({ 
          openid: openid, 
          claiming: false,
          userInfoFilled: true 
        });
        
        // 保存用户信息
        this.saveUser(openid, nickname, avatarUrl);
      },
      fail: err => {
        console.error('获取OpenID失败:', err);
        this.setData({ claiming: false });
        wx.showToast({ 
          title: '登录失败，请重试', 
          icon: 'none' 
        });
      }
    });
  },

  // 保存用户信息
  async saveUser(openid, nickname, avatarUrl) {
    try {
      await api.upsertUser({
        openid: openid,
        nickname: nickname,
        avatar_url: avatarUrl
      });
    } catch (err) {
      console.error('保存用户失败', err);
    }
  },

  // 领取卡片
  async handleClaim() {
    if (this.data.claiming) return;
    
    const { openid, verifiedCode, verifiedCard, nickname, avatarUrl } = this.data;
    
    if (!openid || !verifiedCard) {
      wx.showToast({
        title: '请先完成授权',
        icon: 'none'
      });
      return;
    }

    this.setData({ claiming: true });

    try {
      // 再次检查卡片状态（防止并发）
      const currentCard = await api.getCardByCode(verifiedCode);
      if (!currentCard || currentCard.status !== 'available') {
        wx.showModal({
          title: '领取失败',
          content: '该卡已被他人领取，请换一张卡试试',
          showCancel: false
        });
        this.setData({ claiming: false });
        return;
      }

      // 创建领取记录
      await api.claimCard(openid, verifiedCode);

      // 更新卡片状态（测试卡 12345678901 不更新状态，可重复使用）
      if (verifiedCode !== '12345678901') {
        await api.updateCardStatus(verifiedCode, 'claimed', openid);
      } else {
        console.log('测试卡，不更新状态');
      }

      // 保存到本地
      wx.setStorageSync('myCard', verifiedCard);

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
      console.error('领取失败:', err);
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
