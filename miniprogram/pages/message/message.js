// miniprogram/pages/message/message.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tagList: [
      {
        key:'notice',
        name: '社区通知',
        hasUnRead:false
      }
      , {
        key:'recovery',
        name: '上门回收',
        hasUnRead: false
      }, {
        key:'feedback',
        name: '巡检反馈',
        hasUnRead: false
      }, {
        key:'sysmsgs',
        name: '系统消息',
        hasUnRead: false
      }],
    tagData: {
      notice: {
        noMore: false,
        pageNum: 1,
        pageSize:10,
        data: [],
        noData:false
      },
      recovery: {
        noMore: false,
        pageNum: 1,
        pageSize: 10,
        data: [],
        noData: false
      },
      feedback: {
        noMore: false,
        pageNum: 1,
        pageSize: 10,
        data: [],
        noData: false
      },
      sysmsgs: {
        noMore: false,
        pageNum: 1,
        pageSize: 10,
        data: [],
        noData: false
      }
    },
    height: 0,
    currentIndex:0,
    api:{
      "0": 'notice/communityMessage',
      "1": 'notice/recoveryMessage',
      "2": 'notice/feedbackMessage',
      "3": 'notice/getSysWxCustomer'
    },
    mapTags:{
      "0":"notice",
      "1": "recovery",
      "2": "feedback",
      "3": "sysmsgs"
    }
  },
  tagChangeAction: function (event) {
    let index = event.detail.index
    this.setData({ currentIndex:index})
    //切换事件，防止重复渲染
    wx.nextTick(() => {
      let currentIndex = this.data.currentIndex
      let item = this.data.tagData[this.data.mapTags[currentIndex]]
      if(item.noMore || item.noData || item.data.length > 0) {
        return
      }
      this.fetchData()
    })
  },
  scrolltolowerHandler: function () {
    let that = this
    let currentIndex = this.data.currentIndex
    let baseUrl = app.appData.url
    let url = this.data.api[currentIndex]
    let fullUrl = `${baseUrl}${url}`

    let item = this.data.tagData[this.data.mapTags[currentIndex]]
    
    if(!item.noMore){
      item.pageNum ++ 
      this.setData({ tagData: this.data.tagData })
      wx.nextTick(() => this.fetchData())
    }else{
      //console.log(this.data.mapTags[currentIndex]+' 没有更多数据了。。。')
    }
    
  },
  goDetail:function(event){
    //console.log(event)
    let { id, index, lookup} = event.currentTarget.dataset
    //wx.nextTick(() => this.fetchData())
    if (Number(lookup) !== 0) return
    this.updateUnRead(index)
  },
  updateUnRead:function(index){  //更新未读小红点

    let that = this
    let currentIndex = this.data.currentIndex
    let key = this.data.mapTags[currentIndex]

    let tagData = this.data.tagData
    let tagList = this.data.tagList
    let item = tagData[key]

    if (index >= 0){
      item.data[index].cLookUp = 1
    }
    
    try {
      tagList[currentIndex].hasUnRead = item.data.filter(o => {
        return o.cLookUp === 0
      }).length > 0 ? true : false
    } catch (err) {
      console.log(err)
    }


    let ts = index > 0 ? 1000 : 200

    that.delay(ts,function(){
      that.setData({"tagList": tagList,"tagData": tagData})
    })
  },
  delay:function(ts,callback){
    setTimeout(function(){
      callback && callback()
    },ts)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log('onLoad called...')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //console.log('onReady called...')
    let that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({ height: res.windowHeight - 40})
      },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //console.log('onShow called...')
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
  ,
  fetchData:function(){
    
    let that = this
    let currentIndex = this.data.currentIndex
    let baseUrl = app.appData.url
    let url = this.data.api[currentIndex]
    let fullUrl = `${baseUrl}${url}`

    let key = this.data.mapTags[currentIndex]
    let item = this.data.tagData[key]

    if(item.noMore || item.noData) return

    wx.showLoading({ title: '加载中...' })
    wx.request({
      url: fullUrl,
      data: {
        customerId: app.appData.userinfo.customerId,
        pageNumber: item.pageNum,
        isWx: 1
      },
      success(res) {
        if (res.statusCode !== 200){
          //console.error('请求失败 url:'+fullUrl)
          return
        }
        let result = res.data
        if (result.errcode === 0){
          let datalist = result.data.list 
          let len = datalist.length
          
          if (item.data.length === 0 && len === 0){
            item.noData = true
          }
          if (len === 0 || len < item.pageSize){
            item.noMore = true
          }

          if(item.pageNum > 1 && item.noMore){
            wx.showToast({
              icon: 'none',
              title: '没有更多数据了'
            })
          }

          if (len > 0){
            item.data = item.data.concat(datalist)
          }

          that.setData({"tagData": that.data.tagData})

          wx.nextTick(() => {
            that.updateUnRead()
          })
        }else{
          //console.warn('fail : ' + result.errmsg + '  url:' + fullUrl + '  at :' + fetchData)
        }
      },
      fail:function(){
        
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  }
})