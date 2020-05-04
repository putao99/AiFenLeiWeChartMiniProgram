// pages/exchangeOrderDetial/exchangeOrderDetial.js
var QRCode = require("../../utils/weapp-qrcode.js");
var qrcode;
var app = getApp();
Page ({
  /**
   * 页面的初始数据
   */
  data: {
    text: '',
    isWx:1,
    orderNumber:'',
    goodsName:'',
    orderState:'',
    createTime:'',
    exchangeTime:'',
    sellerMobile:'',
    imgUrl:'',
    goodsName:'',
    address:'',
    score:'',
    orderdetailwrap:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var orderId = options.orderId;
    app.appData.userinfo = wx.getStorageSync('userinfo');
    that.setData({
      customerId: app.appData.userinfo.customerId,
      orderId :options.orderId,
    });
    var customerId = that.data.customerId;
    wx.request({
      url: app.appData.url + 'appProductsExchange/appExchangeOrderDetaile',
      data: {
        customerId: customerId,
        orderId: orderId,
        isWx: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        var rs = res.data;
        var orderList = rs.data.order || [];
        var text = orderList.exchangeNo;
        var orderNumber = orderList.orderNo;
        var goodsName = orderList.goodsName;
        var orderState = orderList.state;
        var createTime = orderList.createTime;
        var exchangeTime = orderList.exchangeTime;
        if (orderList.exchangeTime==null){
          orderList.exchangeTime ="尚未兑换";
        }else{
          orderList.exchangeTime = orderList.exchangeTime
        }
        var sellerMobile = orderList.sellerMobile;
        var imgUrl = orderList.imgUrl;
        var goodsName = orderList.goodsName;
        var address = orderList.address;
        var score = orderList.score;
        if (rs.errcode == 0) {   //正常，有订单详情
            that.setData({
              nothing: 'nothing',
              orderdetailwrap: 'orderdetailwrap',
              text: orderList.exchangeNo,
              orderNumber: orderList.orderNo,
              goodsName: orderList.goodsName,
              orderState: orderList.state,
              createTime: orderList.createTime,
              exchangeTime: orderList.exchangeTime,
              sellerMobile: orderList.sellerMobile,
              imgUrl: orderList.imgUrl,
              address: orderList.address,
              score: orderList.score,
            });
          var text = that.data.text;
          console.log('兑换码text', text)
          var isWx = 1;
          // 传入字符串生成qrcode
          qrcode = new QRCode('canvas', {
            text: text,
            width: 115,
            height: 115,
            colorDark: "#000",
            colorLight: "white",
            correctLevel: QRCode.CorrectLevel.H,
          });
          qrcode.makeCode(text);
        } else { //失败，无订单详情
          that.setData({
            nothing: 'display',    //显示暂无数据
            order_inner: 'orderdetailwrapnone'
          })
        }
      },
      fail(error) {
        //请求接口失败
      }
    })
  //  var text = that.data.text;
  //   console.log('兑换码text', text)
  //   var isWx=1;
  //   // 传入字符串生成qrcode
  //   qrcode = new QRCode('canvas', {
  //     text: text,
  //     width: 115,
  //     height: 115,
  //     colorDark: "#000",
  //     colorLight: "white",
  //     correctLevel: QRCode.CorrectLevel.H,
  //   });
  //   qrcode.makeCode(text);
  },

  /*
  **取消兑换
  */
  cancleExchange: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderid;
    var isWx = 1;
    that.setData({
      orderId: e.currentTarget.dataset.orderid,
      state: e.currentTarget.dataset.state
    })
    wx.showModal({
      title: '订单取消确认',
      content: '订单取消后,兑换码将不可用，已使用积分将原路返回。',
      success(res) {
        if (res.confirm) {
          var userinfo = wx.getStorageSync('userinfo');
          var customerId = userinfo.customerId;
          var orderId = that.data.orderId;
          //用户点击取消订单确定按钮，请求取消兑换订单接口
          wx.request({
            url: app.appData.url + 'appProductsExchange/appCancelTheOrder', // 取消兑换订单的接口地址
            data: {
              orderId: orderId,
              customerId: customerId,
              isWx: 1
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              //取消兑换订单接口调用成功，返回上一页
              wx.navigateBack({
                delta: 1
              })
            },
            fail(error) {
              wx.showModal({
                title: '操作提示',
                content: '取消兑换失败'
              })
            }
          });
        } else if (res.cancel) {
          wx.showToast({
            title: '用户点击取消',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })

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