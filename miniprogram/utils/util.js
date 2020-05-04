
const app = getApp();
const header = getApp().globalData.header;
const p_c = require("time.js");

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function isAvalible(value) {
  if (undefined != value && "undefined" != value && value != null && value != "" && value != "null") {
    return true;
  }

  return false;
}

//保留2位小数
function changeTwoDecimal_f(x) {
  var f_x = parseFloat(x);
  var f_x = Math.round(x * 100) / 100;
  var s_x = f_x.toString();
  var pos_decimal = s_x.indexOf('.');
  if (pos_decimal < 0) {
    pos_decimal = s_x.length;
    s_x += '.';
  }
  while (s_x.length <= pos_decimal + 2) {
    s_x += '0';
  }
  return s_x;
}

//获取当前登录用户信息
function findCurLoginUser(){
  var isSuccess = false;
  wx.request({
    url: app.IP + 'chatUser/findCurLoginUser',
    data: {},
    header: header,
    method: 'GET',
    dataType: 'json',
    success: function (res) {
      if (res.data.result == "true") {
        isSuccess =  true;
        //用户信息放进缓存
        wx.setStorageSync("user", res.data.user);
      }

      if (res.data.result == "1002") {
        wx.navigateTo({
          url: '../pages/binding_phone/binding_phone?updatePhone=true',
        })       
      }
    },
    fail: function (res) { },
    complete: function (res) { },
  })
}

function getAddress(type){
  let addressInfo = wx.getStorageSync('addressInfo')
  if (!addressInfo) return null 
  if(type === 'short'){
    return addressInfo.address
  }
  if(type === 'full'){
    let addr = `
      ${addressInfo.provinceName} 
      ${addressInfo.cityName} 
      ${addressInfo.areaName} 
      ${addressInfo.address} 
      ${addressInfo.unitName}
    `
    return addr 
  }
  return addressInfo.address
}


module.exports = {
  province: p_c.province,
  city: p_c.city,
  formatTime: formatTime,
  getAddress
}

module.exports.isAvalible = isAvalible;
module.exports.changeTwoDecimal_f = changeTwoDecimal_f;
module.exports.findCurLoginUser = findCurLoginUser;

