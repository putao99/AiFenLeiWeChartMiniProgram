// pages/selectVillage/selectVillage.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    unitList: [],
    unitListLength:0,
    lister_itemscontainer: 'lister_itemscontainer',
    hasNothing:'hasNothing',
    nothingTest:'请输入小区关键词搜索',
    searchInputValue:'',
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('onLoad----从新增地址页面带过来的参数options', options)
    let that = this;
    let pca = options.pca,
        customerId = options.customerId,
        isWx = options.isWx,
        name = options.name,
    region = options.region;
    that.setData({
      pca : options.pca,
      customerId: options.customerId,
      isWx: options.isWx,
      name: options.name,
      region: options.region
    })
    //调取按照省市区搜索小区的接口 定义成一个函数
    // let requestVillage = wx.request({
    //   url: app.appData.url + 'recoverys/lookupUnit',
    //   data: {
    //     pca: that.data.pca,
    //     customerId: that.data.customerId,
    //     isWx: that.data.isWx,
    //     name: that.data.name
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success(res) {
    //     console.log('调取按照省市区搜索小区的接口 返回结果', res.data)
    //     let errcode = res.data.errcode,
    //          errmsg = res.data.errmsg,
    //         unitListLength = res.data.data.list.length;
    //     if (errcode==0){
    //       let unitList=res.data.data.list;
    //       that.setData({
    //         unitList: res.data.data.list,
    //         lister_itemscontainer: 'lister_itemscontainer',
    //         hasNothing:'hasNothing',
    //         unitListLength: res.data.data.list.length
    //       })
    //     }else{
    //       that.setData({
    //         hasNothing:'dishasNothing',
    //         nothingTest: res.data.errmsg
    //       })
    //     }
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //输入小区搜索框input 的 bindInput事件
  selectVillage: function(e) {
    let that = this;
    let name = e.detail.value,  //name是input搜索框内的值，刚刚存起来，点击搜索图标的时候再取到
        pca = that.data.pca,
        customerId = that.data.customerId,
        isWx = that.data.isWx;
    that.setData({
      name: e.detail.value
    })
    if(name){
      wx.request({
        url: app.appData.url + 'recoverys/lookupUnit',
        data: {
          pca: that.data.pca,
          customerId: that.data.customerId,
          isWx: that.data.isWx,
          name: that.data.name.replace(/%/g, '')
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          let errcode = res.data.errcode,
            errmsg = res.data.errmsg,
            unitListLength = res.data.data.list ? res.data.data.list.length:0;
          if (errcode == 0) {
            let unitList = res.data.data.list;
            that.setData({
              unitList: res.data.data.list,
              lister_itemscontainer: 'lister_itemscontainer',
              hasNothing: 'hasNothing',
              unitListLength: res.data.data.list.length
            })
          } else {
            that.setData({
              hasNothing: 'dishasNothing',
              nothingTest: res.data.errmsg
            })
            wx.showToast({
              title: res.data.errmsg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
   
  },
  //输入框聚焦时触发
  selectFocusfunction() {
    this.setData({

    })
  },
  //点击搜索图标搜索小区
  handleSearch: function(e) {
    let that = this;
    let name = that.data.name ,  //name是input搜索框内的值，刚刚存起来，点击搜索图标的时候再取到
        pca = that.data.pca,
      customerId = that.data.customerId,
      isWx = that.data.isWx;
    //接下来要进行网络请求，请求后端的接口，但是在页面加载的onLoad事件中 已经请求了后端接口，并把它赋值给一个变量名
   //那在此处怎么引用呢，不对，应该是函数才可以调用，而不是调用一个变量名，但是 wx.request(Object object)  应该不是个函数
   // this.requestVillage(); 上面onLoad({})页面加载函数中， let requestVillage = wx.request(Object object)
    //console.log('点击搜索图标搜索小区that.requestVillage()', that.requestVillage()) 
    //打印出来的结果是 that.requestVillage 不是一个方法
    if(name){
      wx.request({
        url: app.appData.url + 'recoverys/lookupUnit',
        data: {
          pca: that.data.pca,
          customerId: that.data.customerId,
          isWx: that.data.isWx,
          name: that.data.name
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          let errcode = res.data.errcode,
            errmsg = res.data.errmsg,
            unitListLength = res.data.data.list.length;
          if (errcode == 0) {
            let unitList = res.data.data.list;
            that.setData({
              unitList: res.data.data.list,
              lister_itemscontainer: 'lister_itemscontainer',
              hasNothing: 'hasNothing',
              unitListLength: res.data.data.list.length
            })
          } else {
            that.setData({
              hasNothing: 'dishasNothing',
              nothingTest: res.data.errmsg
            })
          }
        }
      })
    }
  
  },

  //点击选择小区后带回小区返回上一页
  selectedVillage: function (e) {
    let that = this;
    let detailed_address = e.currentTarget.dataset.detailed_address,
        unit_name = e.currentTarget.dataset.unit_name,
      pca = that.data.pca,
        region = that.data.region;
    that.setData({
          unit_name: unit_name,
          detailed_address:detailed_address,
      region: that.data.region
        })

    // var pages = getCurrentPages();
    // var currPage = pages[pages.length - 1];   //当前页面
    // var prevPage = pages[pages.length - 2];  //上一个页面

    // //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    // prevPage.setData({
    //   mydata: { 
    //     unit_name: unit_name,
    //     detailed_address: detailed_address,
    //     region: region,
    //     pca: pca
    //     }
    // })

    // wx.navigateBack({
    wx.redirectTo({
          // delta:1,
          url: "/pages/newEditAddress/newEditAddress?unit_name=" + unit_name + '&detailed_address=' + detailed_address + '&region=' + region + '&pca=' + pca, 
        })
  },

})