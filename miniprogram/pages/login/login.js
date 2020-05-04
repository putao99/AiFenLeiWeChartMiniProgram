// pages/reginster/reginster.js
// 引入CryptoJS
var WXBizDataCrypt = require('../../utils/crypto.js');
var util = require("../../utils/util.js");
var header = getApp().globalData.header;
var timer = 1;
var sessionKey = '';
var header = getApp().globalData.header;
var timer = 1;
var phone = '';
var code = '';

var app = getApp();

Page({
  data: {
    username: null,
    nickName: null,
    password: null,
    customerId:null,
    appIP: app.IP,
    phone_input_width: wx.getSystemInfoSync().windowWidth * 0.92 - 56,
    input_width: wx.getSystemInfoSync().windowWidth * 0.88 - 178,
    sendmsg: "sendmsg",
    getmsg: "获取验证码",
    update: 1,
    login_img: "",
    url: null,
    isLoginMobile:false
  },
  onLoad: function(options) {
    app.onLaunch();
    var that = this;
    //var prevPage = pages[pages.length - 2]
    // if (options.page == "scancode") {
    //   that.data.oldPage = options.page;
    //   console.log('进入login页，打印上一页路径',that.data.oldPage)
    // }
    //选择组件对象
    this.verifycode = this.selectComponent("#verifycode");
    //选择组件对象
    this.toast = this.selectComponent("#toast"); //自定义提示弹框
    var update = options.updatePhone;
    if (util.isAvalible(options.fromPage)) {
      that.setData({
        fromPage: options.fromPage
      })
    }
    if (update) {
      that.setData({
        update: 2
      })
    }
  },
  onReady: function() {

  },
  toggleLoginMobile: function(){
    this.setData({
      isLoginMobile: !this.data.isLoginMobile
    })
  },
  onShow: function() {
    // 页面显示

  },
  onHide: function() {
    // 页面隐藏
  },
  //保存输入的手机号
  savePhone: function(e) {
    phone = e.detail.value;
    this.setData({
      username: e.detail.value
    })
  },

  /** 
   * 获取短信验证码 
   */
  sendmessg: function(e) {
    var that = this;
    if (!util.isAvalible(phone)) {
      that.toast.showView('请输入手机号');
      return;
    }
    if (!(/^1[345789]\d{9}$/.test(phone))) {
      that.toast.showView('手机号有误');
      return;
    }

    if (phone.length > 11) {
      that.toast.showView('手机号有误');
      return;
    }

    wx.request({
      url: app.appData.url + '/weChatApplet/chatCode',
      data: {
        phone: phone,
        CODE: code
      },
      header: header,
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        if (res.data.errcode == 0) {
          that.toast.showView(res.data.errmsg);
          that.toast.showView(res.data.errmsg);
          if (timer == 1) {
            timer = 0
            var time = 60
            that.setData({
              sendmsg: "sendmsgafter",
            })
            var inter = setInterval(function() {
              that.setData({
                getmsg: time + "s后重新获取",
              })
              time--
              if (time < 0) {
                timer = 1
                clearInterval(inter)
                that.setData({
                  sendmsg: "sendmsg",
                  getmsg: "获取验证码",
                })
              }
            }, 1000)
          }
        } else {
          wx.showLoading({
            title: res.data.errmsg
          })

          setTimeout(function() {
            wx.hideLoading()
          }, 2000)
        }
      },
      fail: function(res) {

      },
      complete: function(res) {

      },
    })

  },

  // 微信手机号快捷登录
  getPhoneNumber: function(e) {
    var that = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function(res) {
          //如果用户不同意授权的话我们会有一个让他手动输入的界面
          //用户未授权，弹窗提示未授权，只有确定按钮，点击确定按钮仍然停留在注册页面
        }
      })
    } else {
      //进入用户同意授权
      //console.log(app.appData.ID + "----" + wx.getStorageSync("session_key"))
      var pc = new WXBizDataCrypt(app.appData.ID, wx.getStorageSync("session_key"));
      var data = pc.decryptData(e.detail.encryptedData, e.detail.iv);
      var loginUrl = "?phone=" + data.purePhoneNumber + "&openid=" + wx.getStorageSync("openid");

      wx.request({
        //获取解密后的用户信息请求后台接口
        url: app.appData.url + 'weChatApplet/wxChatLogin' + loginUrl,
        header: header,
        dataType: 'json',
        responseType: 'text',
        success: function(res) {
          console.log("解密后，请求后台微信快速登录接口的结果是：" + res.data.errcode)
          if (res.data.errcode == "-1") {
            wx.setStorageSync('isLogined', false);
            wx.setStorageSync('userinfo', null);
            //微信快捷登陆失败请重新登陆
            wx.showToast({
              title: res.data.errmsg,
              icon: 'none',
              duration: 5000
            })
          } else {
            console.log("微信登录res", res)
            wx.setStorageSync('isLogined', true);
            wx.setStorageSync('userinfo', {
              username: data.purePhoneNumber,
              nickName: "爱分类达人" + data.purePhoneNumber.slice(7),
              customerId: res.data.customerId
            });
            // 必须是在用户已经授权的情况下调用
            app.appData.userinfo = {
              username: data.purePhoneNumber,
              nickName: "爱分类达人" + data.purePhoneNumber.slice(7),
              customerId: res.data.customerId
              //customerId:"192188"
              //avatarUrl: userInfo.avatarUrl
            }
            
            wx.showToast({
              title: res.data.errmsg,
              icon: 'success',
              duration: 10000
            })
            wx.switchTab({
              url: '../index/index'
            })
          }
        },
        fail: function(res) {},
        complete: function(res) {},
      })
    }
  },

  //保存code
  saveCode: function(e) {
    code = e.detail.value;
  },

  bindUserName: function(e) {
    var that = this;
    var openid = wx.getStorageSync("openid");
    if (!util.isAvalible(phone)) {
      that.toast.showView('请输入手机号');
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(phone))) {
      that.toast.showView('手机号有误');
      return;
    }
    if (phone.length > 11) {
      that.toast.showView('手机号有误');
      return;
    }

    if (code == '') {
      that.toast.showView('输入验证码');
      return;
    }
    wx.request({
      url: app.appData.url + '/weChatApplet/chatLogin/',
      data: {
        phone: phone,
        code: code,
       openid:openid
      },
      header: header,
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        console.log("手机登陆", res)
        const customerId = res.data.customerId;
        if (res.data.errcode == '-1') {
          wx.setStorageSync('isLogined', false);
          wx.setStorageSync('userinfo', null);
          that.toast.showView(res.data.errmsg);
          return;
        } else {
          const customerId = res.data.customerId;
          wx.setStorageSync('isLogined', true);
          wx.setStorageSync('userinfo', {
            username: phone,
            nickName: "爱分类达人" + phone.slice(7),
            customerId: res.data.customerId
          });
         
          app.appData.userinfo = {
            username: that.data.username,
            password: that.data.password,
            nickName: "爱分类达人" + that.data.username.slice(7),
            customerId: res.data.customerId
          }
          wx.switchTab({
            url: '../index/index'
          })

        }
        console.log("手机号登录customerId", app.appData.userinfo)
      },
      // header: {
      //   'content-type': 'application/json' // 默认值
      // },
      fail: function(res) {
        wx.setStorageSync('isLogined', false);
        wx.setStorageSync('userinfo', null);
        that.toast.showView("请求失败，请重试！");
        return;
      },
      complete: function(res) {

      },
    })
  },

  passwordInput: function(event) {
    this.setData({
      password: event.detail.value
    })
  },

  onUnload: function() {
    // 页面关闭
    //console.log('执行了onUnload');
    wx.reLaunch({
      url: '../index/index'
    })
  }





})