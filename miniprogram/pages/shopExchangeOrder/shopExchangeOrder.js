// pages/shopExchangeOrder/shopExchangeOrder.js
// pages/shopMall/shopMall.js     积分商城
var QRCode = require("../../utils/weapp-qrcode.js");
var qrcode;
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    phoneNumber: '',
    nickName: '',
    Height: 0,
    tabArr: {  //tabArr是个对象，里面包含有tab标签切换
      curHdIndex: -1,
      curBdIndex:-1
    },
    state: '',
    pageNum:1,
    customerId:'',
    isWx:1,
    orderList: [],
    nothing: 'nothing',
    order_inner: 'order_inner',
    flag: true,
    text: '',
    floorstatus:false,
    canclehidden:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userinfo = wx.getStorageSync('userinfo');
    var customerId = userinfo.customerId;
    var state = options.state || -1;
    that.setData({
      state: state,
      customerId: customerId
    });
    wx.getSystemInfo({
      success: function (res) {
        //设置文档高度，根据当前设备宽高满屏显示
        that.setData({
          view: {
            Height: res.windowHeight
          }
        })
      },
    });

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
    var that = this;
    if (!wx.getStorageSync('isLogined')) {    // 如果未登陆
      wx.navigateTo({ url: "../login/login" })
    } else {
      app.appData.userinfo = wx.getStorageSync('userinfo');
      that.setData({
        username: app.appData.userinfo.username,
        customerId: app.appData.userinfo.customerId,
        pageNum: that.data.pageNum
      })
      that.getList();
    }
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
    wx.setNavigationBarTitle({
      title: '刷新中……'  //动态设置当前页面的标题
    })
    this.setData({
      pageNum: 1
    });
    this.getList(() => {
      wx.stopPullDownRefresh();
      wx.setNavigationBarTitle({
        title: '商城兑换订单'  //设置回去当前页面的标题
      })
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var { pageNum } = this.data;
    pageNum = pageNum + 1;
    this.setData({
      pageNum: pageNum,
    })
    this.getList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //tab标签切换
  tabFun: function (e) {
    var that = this;
    //获取触发事件组件的dataset属性
    var userinfo = wx.getStorageSync('userinfo');
    var pageNum = 1;
    var customerId = userinfo.customerId;
    var datasetId = e.target.dataset.id;
    var state = e.target.dataset.state;
    var point = that.data.point;
    var obj = {};
    var isWx = 1;
    obj.curHdIndex = datasetId;
    obj.curBdIndex = datasetId;
    that.setData({
      tabArr: obj,
      pageNum: 1,
      customerId: customerId,
      state: state,
      isWx: 1
    });
    wx.pageScrollTo({
      scrollTop: 0,
      success: () => {
        this.getList();
      }
    })


  },

  //获取兑换订单列表函数声明
  getList(callback) {
    var that = this;
    var { pageNum, state, customerId } = this.data;
    wx.request({
      url: app.appData.url + 'appProductsExchange/appListPageExchangeOrder',
      data: {
        pageNum: pageNum,
        customerId: customerId,
        state: state,
        isWx: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        var rs = res.data;
        var { pageNum, orderList: prevList } = that.data;
        var orderList = rs.data.list || [];
        if (orderList.length === 0) {
          wx.showToast({
            title: '没有更多数据了~~~',
            icon: 'none',
            duration: 500
          })
        }
        if (pageNum > 1) {
          orderList = prevList.concat(orderList)
        }
        if (rs.errcode == 0) {   //正常，有兑换订单
          that.setData({
            orderList: orderList,
            nothing: 'nothing',
            order_inner: 'order_inner'
          });
          if (orderList.length===0){
            that.setData({
              orderList: orderList,
              nothing: 'display',
              order_inner: 'on_order_inner',
            });
          }

        } else if (rs.errcode == -1) { //失败，无兑换订单
          that.setData({
            nothing: 'display',    //显示暂无数据
            order_inner: 'on_order_inner'
          })
        } else {

        }
      },
      fail(error) {
        //请求接口失败
      },
      complete() {
        callback && callback()
      }
    })
  },

  //点击去兑换
  goExchange: function (e) {

    var that = this;
    var goodsId = e.currentTarget.dataset.goodsid;
    var exchangeNo = e.currentTarget.dataset.exchangeNo;
    that.setData({
      goodsId: e.currentTarget.dataset.goodsid,
      exchangeNo: e.currentTarget.dataset.exchangeno,
    })
    var text = e.currentTarget.dataset.exchangeno;
    // 遮罩层显示
    this.setData({ 
      flag: false ,
      text: e.currentTarget.dataset.exchangeno
      });
    // 传入字符串生成qrcode
    qrcode = new QRCode('canvas', {
      text: text,
      width: 150,
      height: 150,
      colorDark: "#000",
      colorLight: "white",
      correctLevel: QRCode.CorrectLevel.H,
    });
    qrcode.makeCode(text);
  },

     
  // 遮罩层隐藏，关闭请商家扫一下
  conceal: function () {
    this.setData({ flag: true })
  },

  //取消兑换
  cancleExchange:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.orderid;
    var isWx = 1;
    var pageNum=1;
    var state = e.currentTarget.dataset.state;
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
          var state = that.data.state;
          //用户点击取消订单确定按钮，请求取消兑换订单接口
          wx.request({
            url: app.appData.url + 'appProductsExchange/appCancelTheOrder', // 新增兑换订单的接口地址
            data: {
              orderId: orderId,
             customerId: customerId,
              isWx: 1
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              //取消兑换订单接口调用成功，调取商城订单查询的接口
            var state = that.data.state;

              that.getList(pageNum=1, customerId, state, isWx);
            },
            fail(error) {
              wx.showModal({
                title: '操作提示',
                content: '删除订单失败'
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
  //进入订单详情页面
  goOrderDetail:function(e){
    var orderId = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '../exchangeOrderDetial/exchangeOrderDetial?orderId='+orderId,
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 对话框取消按钮点击事件//修改用户昵称
   */
  onCancel: function () {
    this.hideModal();
  },
  

  // 获取滚动条当前位置
  onPageScroll: function (e) {
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },

  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }

})
