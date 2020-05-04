// pages/bindRandom/bindRandom.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    primarySize: 'default',
    plain: false,
    loading: false,
    inputValue:'',
    randombtn:'randombtn',
    inputDis:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let that = this;
    app.appData.userinfo = wx.getStorageSync('userinfo');
    let mobile = app.appData.userinfo.username;
    wx.request({
      url: app.appData.url + 'weChatApplet/findNick?mobile=' + mobile,
      data: {
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        let serialNumber = res.data.data.customer.serialNumber;
        try {
          if (serialNumber != null && serialNumber != undefined && serialNumber !="") {
            that.setData({
              randombtn: 'randombtnDis',
              inputValue: res.data.data.customer.serialNumber,
              inputDis:true
            })
          }
        } catch (err) {

        }
      },
    })
  },
  //随机卡input输入框事件
  bindRandomInput: function (e){
      this.setData({
        inputValue: e.detail.value
      })
  },
  //点击确定按钮提交
  randomBind:function(e) {
    app.appData.userinfo = wx.getStorageSync('userinfo');
    let customerId = app.appData.userinfo.customerId;
    console.log('点击确定按钮提交e.currentTarget.dataset.randomvalue', e.currentTarget.dataset.randomvalue)
    let serialNumber = e.currentTarget.dataset.randomvalue;
    //提交用户提交的随机卡号，请求后端接口传给后端
    wx.request({
      url: app.appData.url + 'appSetUp/updateCard',
      method:'get',
      data: {
        customerId: app.appData.userinfo.customerId,
        isWx: 1,
        serialNumber: e.currentTarget.dataset.randomvalue
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.showToast({
          title: res.data.errmsg,
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => wx.navigateBack({
          delta: 1
        }),3000)
       
      }
    })
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