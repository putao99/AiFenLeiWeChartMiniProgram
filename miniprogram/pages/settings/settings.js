// miniprogram/pages/settings/settings.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

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

  logout: function (){
    wx.showModal({
      title: '提示',
      content: '确认要退出登录吗？',
      success(res) {
        if (res.confirm) {
          try {
            wx.removeStorageSync('isLogined')
            wx.removeStorageSync('userinfo')
          } catch (e) {

          }
          wx.nextTick(() => wx.switchTab({ url: "../index/index" }))
        } else if (res.cancel) {
          
        }
      }
    })
    
  }
})