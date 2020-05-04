const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    article:[],
    error:false,
    type:'',
    url:'',
    id:'',
    imgWidth:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const pathMap = {
      'communityDetails': 'notice/communityDetails',
      'recoveryDetails': 'notice/recoveryDetails',
      'feedbackDetails': 'notice/feedbackDetails',
      'sysDetails': 'notice/sysDetails',
      'getNewsById':'appDiscovery/getNewsById',
      'getKnowledgeById': 'appDiscovery/getKnowledgeById',
      'getActivityById': 'appDiscovery/getActivityById',
    }

    //console.log(options)
    let { type, id } = options

     wx.setNavigationBarTitle({ title: type.slice(0, 3) === 'get' ? '新闻详情' : '消息详情'})

    let baseUrl = app.appData.url
    let url = `${baseUrl}${pathMap[type]}`

    this.setData({
      url:url,
      id: id,
      type: type
    })
    wx.nextTick(() => this.fetchData(url, id))
  },

  fetchData:function(url,id){
    let that = this
    wx.showLoading()
    wx.request({
      url: url,
      data: {
        customerId: app.appData.userinfo.customerId,
        id:id,
        isWx: 1
      },
      success:function(res){
       res.data.data.content=res.data.data.content.replace(/\<img/gi,'<img style="max-width:100%;height:auto"');
        res.data.data.content=res.data.data.content.replace(/\<p/,'<p style="text-indent:24px;"');
        let result = res.data;
        if (res.statusCode !== 200) {
          console.error('请求失败 url:' + url + ' errMsg:' + res.errMsg)
          return
        }
        if (result.errcode === 0) {
          that.setData({ article: [result.data], error: false})
        }else{
          wx.showToast({
            title: result.errmsg,
            icon: 'none',
            duration: 2000
          })
          that.setData({ error: true })
          
        }
      },
      fail:function(){
        that.setData({ error: true })
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  },

  refresh:function(){
    wx.nextTick(() => this.fetchData(this.data.url, this.data.id))
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({ imgWidth: res.windowWidth - 32 })
      },
    })
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