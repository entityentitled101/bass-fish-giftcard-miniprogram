// 云函数入口文件
const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前环境
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  return {
    openid: wxContext.OPENID,    // 用户真正的、固定的微信OpenID
    appid: wxContext.APPID,      // 小程序AppID
    unionid: wxContext.UNIONID,  // 微信UnionID（如果有）
  };
};
