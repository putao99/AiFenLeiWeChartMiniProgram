let utils = require('../../utils/util.js')
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickname:'',
    username:'',
    address:'',
    bindingList:{
      pageNumber:1,
      pageSize:10,
      data:[],
      noData:false,
      noMore:false
    },
    scrollHeight:0,
    //showTips:true
    istrue:false,
    inputValue:'',
    hasInputError:false,
    errorTips:''
  },

  initUserInfo:function(){
    let userInfo, addressInfo
    try{
      userInfo = wx.getStorageSync('userinfo')
      addressInfo = wx.getStorageSync('addressInfo')
      customer=wx.getStorageSync('customer')
    }catch(err){

    }
    this.setData({
      nickname: addressInfo ? addressInfo.nick : userInfo.nickName,
      username: userInfo.username,
      address:addressInfo ? addressInfo.customer.address:'暂无地址'
      //address:utils.getAddress()
    })
  },
  fetchData:function(){
    let that = this
    let baseUrl = app.appData.url
    let url = 'disposable/getList'
    let fullUrl = `${baseUrl}${url}`
    let bindingList = this.data.bindingList

    if (bindingList.noData || bindingList.noMore) return


    wx.showLoading()
    wx.request({
      url: fullUrl,
      data: {
        customerId: app.appData.userinfo.customerId,
        pageNumber: bindingList.pageNumber,
        isWx: 1
      },
      success(res) {
        if (res.statusCode !== 200) {
          console.error('请求失败 url:' + fullUrl)
          return
        }
        let result = res.data
        if (result.errcode === 0) {
          //console.log(result.data.list)
          bindingList.data = bindingList.data.concat(result.data.list)
          if (result.data.list.length === 0 && bindingList.pageNumber === 1) {
            bindingList.noData = true
          } else if (result.data.list.length < bindingList.pageSize) {
            bindingList.noMore = true
            // wx.showToast({
            //   title: '没有更多数据了',
            //   icon: 'none',
            //   duration: 2000
            // })
          }

          wx.nextTick(() => {
            that.setData({ bindingList: bindingList })
          })

        } else {
          wx.showToast({
            title: result.errmsg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {

      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  scrolltolowerHandler:function(){
    let bindingList = this.data.bindingList
    bindingList.pageNumber ++ 
    this.setData({ bindingList: bindingList})

    wx.nextTick(() => this.fetchData())
  },
  removeBag:function(event){
    let that = this
    let id = event.currentTarget.dataset.id
    let qrcode = event.currentTarget.dataset.qrcode
    wx.showModal({
      title: '提示',
      content: '确认要删除编号为 ' + qrcode+' 的垃圾袋吗？',
      success(res) {
        if (res.confirm) {
          that.removeBagAction(id)
        } else if (res.cancel) {
          
        }
      }
    })
  },
  removeBagAction:function(id){
    let that = this
    let baseUrl = app.appData.url
    let url = 'disposable/del'
    let fullUrl = `${baseUrl}${url}`
    wx.showLoading()
    wx.request({
      url: fullUrl,
      data: {
        customerId: app.appData.userinfo.customerId,
        id: id,
        isWx: 1
      },
      success(res) {
        if (res.statusCode !== 200) {
          console.error('请求失败 url:' + fullUrl)
          return
        }
        let result = res.data
        if (result.errcode === 0) {
          wx.showToast({
            title: result.errmsg,
            icon: 'success',
            duration: 2000
          })

          let bindingList = that.data.bindingList
          let __index = bindingList.data.findIndex(o => o.id === id)
          if(__index >= 0){
            bindingList.data.splice(__index,1)
          }
          wx.nextTick(() =>{
            that.setData({ bindingList: bindingList})
          })


        } else {
          wx.showToast({
            title: result.errmsg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {

      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  bindingAction: function (event){
    let that = this
    let _from = event.currentTarget.dataset.from
    if(_from === 'scan'){
      wx.scanCode({
        scanType: ['qrCode'],
        success(res) {
          if(res.scanType !== 'QR_CODE'){
            wx.showToast({
              title: '不支持的类型',
              icon: 'none',
              duration: 2000
            })
            return 
          }
          that.setData({ inputValue: res.result})
          wx.nextTick(() => that.bindingBagAction())
        },
        fail(err){
          //console.log(err)
          wx.showToast({
            title: '扫码失败，请稍后再试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }else{
      this.setData({ istrue: true, inputValue:''})
    }


  },
  closeDialog:function(event){
    let _from = event.detail.from 
    
    if(_from === 'ok'){
      let _v = this.data.inputValue
      if(_v.length <= 0){
        this.setData({
          hasInputError:true,
          errorTips:'垃圾袋二维码号码不可为空'
        })
        return
      }else{
        this.setData({
          hasInputError: false,
          errorTips: '',
          istrue: false 
        })
      }

      wx.nextTick(() => this.bindingBagAction())
    }else{
      this.setData({ istrue: false })
    }
  },
  confirmAction:function(event){
    //wx.showModal({ title: 'test', content: JSON.stringify(event) })
    //this.setData({ istrue: false })
  },
  inputAction: function (event) { 
    if (event.type !== 'input') return 
    this.setData({inputValue:event.detail.value})
  },
  bindingBagAction:function(){
    //disposable/BindingBag
    let that = this
    let baseUrl = app.appData.url
    let url = 'disposable/BindingBag'
    let fullUrl = `${baseUrl}${url}`
    //wx.showLoading({title: '处理中...'})
    wx.request({
      url: fullUrl,
      data: {
        customerId: app.appData.userinfo.customerId,
        bagNumber: this.data.inputValue,
        isWx: 1
      },
      success(res) {
        //wx.hideLoading()

        if (res.statusCode !== 200) {
          //console.error('请求失败 url:' + fullUrl)
          return
        }
        let result = res.data
        if (result.errcode === 0) {
          wx.showToast({
            title: result.errmsg,
            icon: 'success',
            duration: 2000
          })
          let bindingList = that.data.bindingList
          that.setData({
            bindingList: {
              pageNumber: 1,
              pageSize: 10,
              data: [],
              noData: false,
              noMore: false
            }
          })

          //wx.nextTick(() => that.fetchData())

          setTimeout(function(){
            that.fetchData()
          },2050)

        } else {
          wx.showToast({
            title: result.errmsg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {

      },
      complete: function () {
        //wx.hideLoading()
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initUserInfo()

    let that = this
    const query = this.createSelectorQuery()
    query.select('#wrapper-header').boundingClientRect(function (rect) {
      let sysInfo = wx.getSystemInfoSync()
      wx.getSystemInfo({
        success: function (res) {
          that.setData({ scrollHeight: res.windowHeight - (rect.height + 10) })
          wx.nextTick(() =>{
            that.fetchData()
          })
        },
      })
    }).exec();


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