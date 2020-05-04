var app = getApp();

// pages/scanCode/scanCode.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    show:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //app.appData.userinfo = wx.getStorageSync('userinfo');
    if (app.appData.userinfo == null) {
      // wx.navigateTo({ url: "../login/login?page=scancode" })
      wx.navigateTo({ url: "../login/login" })
     
    } else {

      this.setData({ username: app.appData.userinfo.username })
      var phone = this.data.username;
      wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          wx.request({
            url: app.appData.url + '/weChatApplet/chatQrCode',
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
          console.log("---进入这里44--扫码失败（未进入请求后台数据步骤）");
          setTimeout(function () {
          wx.reLaunch({
              url: '../index/index'
            })
          }, 100)

        },
        complete: function (res) {
         // console.log("--扫码完成--complete");

        }

      })

    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
onReady: function () {


},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})