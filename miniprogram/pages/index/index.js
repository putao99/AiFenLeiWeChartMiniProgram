//index.js
const app = getApp();
var iterm_num='';
var delivery_nub = ''
Page({
  data: {
    imgUrls: [
      '/images/banner_0@2x.png',
      '/images/banner_1@2x.png',
      '/images/banner_2@2x.png'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 400,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    username: null,
    iterm_num:'0',
    delivery_nub: '0',
    gotoWallet:"nogotoWallet",
    busModel: 0 //商业模式 
  },

  onLoad: function (options) {
    //console.log(options)
    if(options.error==-1){
      wx.showToast({
        title: '扫码失败，请重新扫码开门',
        icon: 'none',
        duration: 3000
      })
    } else if (options.error == 0){
      wx.showToast({
        title: '您好,投口开启中',
        icon: 'success',
        duration: 3000,
        mask:true
      })
    } else if (options.error == 1){
      wx.showToast({
        title: '未扫码',
        icon: 'none',
        duration: 3000
      })
    };
    if (options.wxkj == "true") {
      wx.showToast({
        title: res.data.errmsg,
        icon: 'success',
        duration: 2000
      })
    }
    
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              
            }
          })
        }
      }
    })

    //查看是否有
  },
  onShow:function(options){
    var that = this;
    //获取用户是否已经登录过
    if (wx.getStorageSync('isLogined')) {
      app.appData.userinfo = wx.getStorageSync('userinfo');
      this.setData({ username: app.appData.userinfo.username });
      var userName = this.data.username;
      // wx.showLoading({
      //   title: '加载中...'
      // })
      wx.request({
        url: app.appData.url + 'weChatApplet/chatCustCast',
        data: {
          userName: userName
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log('2020-02-12测试查看weChatApplet/chatCustCast',res)
          const errcode = res.data.errcode;
          const errmasg = res.data.errmasg;
          const busModel = res.data.data.busModel;//商业模式 
          //0 按积分(进入钱包按钮隐藏)    1 返现    2 积分+返现
          if (errcode === 0) {

            if (busModel === 0) {  //0 按积分(进入钱包按钮隐藏)
              that.setData({
                iterm_num: res.data.data.score,
                delivery_nub: res.data.data.castCount,
                gotoWallet: 'nogotoWallet',
                busModel: busModel
              })
            } else {
              that.setData({
                iterm_num: res.data.data.score,
                delivery_nub: res.data.data.castCount,
                gotoWallet: 'gotoWallet',
                busModel: busModel
              })
            }

          } else {   //获取用户信息失败

            if (typeof errmasg === 'string'){
              wx.showToast({
                title: errmasg,
                icon: 'none',
                duration: 3000,
                mask: true
              })
            }
            
          }

        },
        fail() {
          wx.showToast({
            title: '请求数据失败',
            icon: 'none',
            duration: 2000
          })
        },
        complete:function(){
          //wx.hideLoading()
        }
      })
    
    } else {

      this.setData({ iterm_num: 0 })
      this.setData({ delivery_nub: 0 })

    }



  //扫码投递页面（扫码成功）跳转过来提示
  },


  bindGetUserInfo(e) {
  },

  gotoWallet:function(){
    let url = `/pages/accountView/accountView?busModel=${this.data.busModel}`
    wx.navigateTo({ url: url})
  },
  gotoDelivery: function () {
    wx.navigateTo({
      url: '/pages/deliveryRecord/deliveryRecord',
    })
  },
  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },
  /**
   * 点击扫码投递事件处理函数
   */
  scanCodeHandler() {
    const that = this;
    if(!wx.getStorageSync('isLogined')) {
    // if (app.appData.userinfo == null) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return false;
    }else{
      app.appData.userinfo = wx.getStorageSync('userinfo');
      that.setData({
        username: app.appData.userinfo.username,
        nickName: app.appData.userinfo.nickName,
      })
      const userName = that.data.username;
      const phone = that.data.username;
      // wx.requestSubscribeMessage({
      //   tmplIds: ['Z90ol7V41EJLFmZSLATLJxLz0RokiKyPcFPbehFLjOw'], // 此处可填写多个模板 ID，但低版本微信不兼容只能授权一个
      //   success (res) {
      //     console.log('已授权接收订阅消息')
      //    debugger
      //   }
      // });
      wx.nextTick(()=>wx.scanCode({    //扫码函数
        onlyFromCamera: true,
        success: (res) => {
          wx.request({
            url: app.appData.url + 'weChatApplet/chatQrCode',
            data: {
              qrcode: res.result,
              phone: phone
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            success: function (res) {
              if (res.data.errcode == 0) {
                wx.reLaunch({
                  url: '../index/index?error=0'
                })
              } else if (res.data.errcode == -1) {
                wx.reLaunch({
                  url: '../index/index?error=-1'
                })

              }
              console.log('扫码成功')
              //扫码成功，订阅巡检结果消息，待会换模板
            
            },
            fail: function (res) {
              wx.reLaunch({
                url: '../index/index?errorcode=1'
              })
            },
            complete: function (res) {

            },
          })
        },
        fail: function (res) {
        // console.log("---进入这里44--扫码失败（未进入请求后台数据步骤）");
       
          setTimeout(function () {
            wx.reLaunch({
              url: '../index/index'
            })
          }, 100)

        },
        complete: function (res) { 3
        }

      }))

    }
  },
  helpCenterHandler(){
    wx.showToast({
      title: '正在开发中...',
      icon: 'none',
      
    })
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function (event) {
    console.log(event)
    let title = '爱分类智能回收'
    let path = `pages/index/index`

    return {
      title: title,
      path: path
    }
  },
  //UserGeneratedContent 用户自定义内容页面
  goToUgc(){
    wx.navigateTo({
      url: '/pages/UserGeneratedContent/UserGeneratedContent',
    })
  },
  onSwiperItemTap() {
    debugger
    wx.navigateTo({
      url: 'pages/outBreakResponse/outBreakResponse',
    })
  }
})
