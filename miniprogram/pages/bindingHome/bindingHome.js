const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bindingList: {
      pageNumber: 1,
      pageSize: 10,
      data: {
        belongId: [],//所有家庭账号集合（除去登录人）
        customer: {} //当前登录人的list
      },
      noData: false,
      noMore: false
    },
    defaultImg:'../../images/tabbar_user_selected.png',
    istrue: false,
    inputValue: '',
    hasInputError: false,
    errorTips: '',
    qrCodeAccount:'',
    typeid:null
  },

  fetchData:function(){
    let that = this
    let baseUrl = app.appData.url
    let url = 'binderAccount/listCustomer'
    let fullUrl = `${baseUrl}${url}`
    let bindingList = this.data.bindingList
    wx.showLoading()
    wx.request({
      url: fullUrl,
      data: {
        customerId: app.appData.userinfo.customerId,
        //customerId: '192188',
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
          bindingList.data = result.data

          if (that.isEmpty(bindingList.data.customer.headPic)){
            bindingList.data.customer.headPic = that.data.defaultImg
          }
          if (bindingList.data.belongId && Array.isArray(bindingList.data.belongId)){
            bindingList.data.belongId = bindingList.data.belongId.map(item => {
              if (that.isEmpty(item.headPic)) {
                item.headPic = that.data.defaultImg
              }
              return item
            })
          }else{
            bindingList.data.belongId = []
          }
          
          that.setData({ bindingList: bindingList })
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
  onBindingMainActionTap() {
    this.bindingAction(1)
  },
  onBindingBelongActionTap() {
    this.bindingAction(2)
  },
  async bindingAction(typeid){
    this.setData({ typeid })

    let scanResult = await this.scanCodeAction()
    if(scanResult.errcode !== 0){
      wx.showToast({
        title: scanResult.errmsg,
        icon: 'none',
        duration: 2000
      })
      return
    }

    let qrcode = scanResult.result
    let validateResult = await this.validateAccount(qrcode)
    if (validateResult.errcode !== 0) {
      wx.showToast({
        title: validateResult.errmsg,
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({ 
      qrCodeAccount: qrcode,
      istrue:true
    })
  },
  validateAccount: function (number){ //检测账号
    return new Promise((resolve,reject) =>{
      let that = this
      let baseUrl = app.appData.url
      let url = 'binderAccount/bagQr'
      let fullUrl = `${baseUrl}${url}`
      wx.showLoading({
        title: '检测账户中...',
      })
      wx.request({
        url: fullUrl,
        data: {
          customerId: app.appData.userinfo.customerId,
          //customerId: '192188',
          number: number,
          isWx: 1
        },
        success(res) {
          resolve(res.data)
        },
        fail: function () {
          resolve({
            errcode:999,
            errmsg:'请求接口失败'
          })
        },
        complete: function () {
          wx.hideLoading()
        }
      })
    })
  },

  scanCodeAction:function(){ //扫描二维码
    return new Promise((resolve,reject) =>{
      wx.scanCode({
        scanType: ['qrCode'],
        success(res) {
          let result = {}
          if (res.scanType !== 'QR_CODE') {
            result.errcode = 1
            result.errmsg = '不支持的类型'
          }else{
            result.errcode = 0
            result.errmsg = ''
            result.result = res.result 
          }
          resolve(result)
        },
        fail(err) {
          resolve({
            errcode:2,
            errmsg : '扫码失败，请重试'
          })
        }
      })
    })
  },

  bindingAccount:function(){ 
    let that = this
    return new Promise((resolve, reject) => {
      let baseUrl = app.appData.url 
      let typeid = that.data.typeid  //账号操作类型 1主账号 2子账号
      let url = typeid === 1 ? 'binderAccount/binDingMain' : 'binderAccount/binDingBelongId'
      let fullUrl = `${baseUrl}${url}`
      wx.showLoading({
        title: '处理中...',
      })
      wx.request({
        url: fullUrl,
        method:'POST',
        data: {
          customerId: app.appData.userinfo.customerId,
          //customerId:'192188',
          number: that.data.qrCodeAccount,
          passWord: that.data.inputValue,
          isWx: 1
        },
        success(res) {
          wx.hideLoading()
          resolve(res.data)
        },
        fail: function () {
          wx.hideLoading()
          resolve({
            errcode: 999,
            errmsg: '请求接口失败'
          })
        },
        complete: function () {
          wx.hideLoading()
        }
      })
    })
  },

  async closeDialog(event) {
    let that = this
    let _from = event.detail.from
    if(_from !== 'ok'){ //点击确定了？
      this.setData({ istrue: false })
      return 
    }

    if (this.data.inputValue.length <= 0){ //输入密码了？
      this.setData({
        hasInputError: true,
        errorTips: '关联账号的密码不可为空'
      })
      return
    }

    let result = await this.bindingAccount() //执行绑定操作

    this.setData({
      hasInputError: false,
      errorTips: '',
      istrue: false,
      inputValue:'',
      qrCodeAccount:''
    })

    wx.nextTick(() =>{
      if (result.errcode !== 0) {
        wx.showToast({
          title: result.errmsg,
          icon: 'none',
          duration: 5000
        })
        return
      }
      wx.showToast({
        title: '账号关联成功',
        icon: 'success',
        duration: 2000
      })

      setTimeout(function(){
        that.fetchData()
      },2050)
      
    })

  },

  inputAction: function (event) {
    if (event.type !== 'input') return
    this.setData({ inputValue: event.detail.value })
  },
  isEmpty:function(val){
    return (val === null || val === undefined || val === '') ? true : false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchData()
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