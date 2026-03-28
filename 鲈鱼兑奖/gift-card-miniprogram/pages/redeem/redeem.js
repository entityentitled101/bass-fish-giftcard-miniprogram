// pages/redeem/redeem.js
const { supabase, updateCardStatus, getCardByCode } = require('../../utils/api.js');
const { writeToFeishu } = require('../../utils/feishu.js');

Page({
  data: {
    code: '',
    name: '',
    phone: '',
    address: '',
    remark: '',
    submitting: false,
    cardInfo: null,
    redeemed: false
  },

  onLoad(options) {
    // 从上一页带过来的兑奖码
    const code = options.code || '';
    this.setData({ code });
    this.checkCardStatus(code);
  },

  // 检查卡片状态
  async checkCardStatus(code) {
    if (!code) return;
    try {
      const card = await getCardByCode(code);
      if (card) {
        this.setData({ cardInfo: card });
        if (card.status === 'redeemed') {
          this.setData({ redeemed: true });
        }
      }
    } catch (err) {
      console.log('检查卡片失败:', err);
    }
  },

  // 输入处理
  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  onAddressInput(e) {
    this.setData({ address: e.detail.value });
  },
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 提交兑奖
  async submitRedeem() {
    const { code, name, phone, address, remark, submitting, redeemed } = this.data;

    if (redeemed) {
      wx.showToast({ title: '该卡已兑奖', icon: 'none' });
      return;
    }

    if (!name.trim()) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' });
      return;
    }
    if (!phone.trim() || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!address.trim()) {
      wx.showToast({ title: '请输入收货地址', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    
    // 显示加载提示
    wx.showLoading({ title: '提交中...', mask: true });

    try {
      const openid = wx.getStorageSync('openid');
      if (!openid) {
        throw new Error('请先登录');
      }

      // 1. 创建兑奖记录（带超时）
      console.log('开始创建兑奖记录...', { code, openid, name });
      const insertPromise = supabase
        .from('redeem_records')
        .insert([{
          card_code: code,
          openid: openid,
          recipient_name: name,
          recipient_phone: phone,
          recipient_address: address,
          remark: remark || '',
          redeemed_at: new Date().toISOString()
        }]);
      
      // 8秒超时
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时，请检查网络')), 8000)
      );
      
      const { error: redeemError } = await Promise.race([insertPromise, timeoutPromise]);

      if (redeemError) {
        console.error('Supabase 错误:', redeemError);
        throw new Error(redeemError.message || '数据库写入失败');
      }

      console.log('兑奖记录创建成功');

      // 2. 更新卡片状态为已兑奖
      try {
        await updateCardStatus(code, 'redeemed');
        console.log('卡片状态更新成功');
      } catch (updateErr) {
        console.error('更新卡片状态失败:', updateErr);
        // 不阻断，继续
      }

      // 3. 同步到飞书（异步，不等待）
      writeToFeishu({ code, name, phone, address, remark }).then(result => {
        console.log('飞书同步结果:', result);
      }).catch(err => {
        console.error('飞书同步失败:', err);
      });

      wx.hideLoading();
      
      // 4. 显示成功
      this.setData({ redeemed: true, submitting: false });

      wx.showToast({
        title: '兑奖成功！',
        icon: 'success',
        duration: 2000
      });

    } catch (err) {
      wx.hideLoading();
      console.error('兑奖失败:', err);
      this.setData({ submitting: false });
      
      let errorMsg = err.message || '兑奖失败，请重试';
      if (errorMsg.includes('timeout')) {
        errorMsg = '网络请求超时，请检查网络后重试';
      }
      
      wx.showModal({
        title: '兑奖失败',
        content: errorMsg,
        showCancel: false
      });
    }
  },

  // 返回首页
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
