// pages/amountDetail/amountDetail.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deliveryPass:'/images/icon_delivery_pass.png',
    castListd: [],
    itemLength:'',
    disPlay:'disNone',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({ username: app.appData.userinfo.username });
    var userName = that.data.username;
    wx.showToast({
      title: "加载中...",
      icon: "loading"
    })
    wx.request({
      url: app.appData.url + 'weChatApplet/wxChatCostDatil',
      data: {
        phone: userName
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        const errmsgList = res.data.errmsg;
        const errmsgLength = res.data.errmsg.length;
        const errcode = res.data.errcode;
        const status = res.data.errmsg.status;
        if (errcode == -1){
          that.setData({ disPlay: 'disBlock' }); 
        } else if (errcode == 1 ){
          that.setData({
              disPlay: 'disNone',
              errmsgList: errmsgList
            });
        } 
      },
      fail: function () {
        setTimeout(function () {
          that.toast.showView("加载失败");
        }, 100)
      },
      complete: function () {
        // complete
        wx.hideToast();
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {

    
   
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