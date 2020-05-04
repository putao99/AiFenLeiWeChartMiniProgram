// pages/shopMall/shopMall.js     积分商城
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    phoneNumber: '',
    nickName: "",
    customerId:"",
    Height:0,
    tabArr:{  //tabArr是个对象，里面包含有tab标签切换
      curHdIndex:0,
      curBdIndex:0
    },
    state:0,
    orderList:[],
    nothing:'nothing',
    order_inner:'order_inner',
    isWx:1,
    point:'',
    pageNum: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userinfo = wx.getStorageSync('userinfo');
    var customerId = userinfo.customerId;
    var state = options.state || 0;
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
      //获取当前位置
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          const speed = res.speed
          const accuracy = res.accuracy;
          const point = res.longitude + ',' + res.latitude;
          that.setData({
            username: app.appData.userinfo.username,
            customerId: app.appData.userinfo.customerId,
            point: point,
            pageNum: that.data.pageNum
          })
          that.getList();
        },
        fail:function(err){
          console.log(err.errMsg)
        }
      });

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var {pageNum} = this.data;
    pageNum = pageNum + 1;
    this.setData({
      pageNum: pageNum,
    })
    
    wx.nextTick(() => this.getList())

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
    var userinfo =  wx.getStorageSync('userinfo');
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
      point: point,
      isWx: 1
    });
    wx.pageScrollTo({
      scrollTop: 0,
      success: () => {
        this.getList();
      }
    })
    
    
  },
  //下拉刷新
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……'  //动态设置当前页面的标题
    })

    if(this.data.pageNum > 1){
      setTimeout(function(){
        wx.stopPullDownRefresh()
        wx.setNavigationBarTitle({
          title: '积分商城'  //设置回去当前页面的标题
        })
      },1000)
    }else{
      this.setData({ pageNum: 1 })
      this.getList(() => {
        wx.stopPullDownRefresh()
        wx.setNavigationBarTitle({
          title: '积分商城'  //设置回去当前页面的标题
        })
      })
    }
  },

//点击兑换
  goExchange: function (e) {
    var that = this;
    var warn = "";
    var state = that.data.state;
    var goodsId = e.currentTarget.dataset.goodsid;
    var goodsName = e.currentTarget.dataset.goodsname;
    var score = e.currentTarget.dataset.score;
    that.setData({
      goodsId: e.currentTarget.dataset.goodsid,
    })
    wx.showModal({
      title: '操作提示',
      content: '您确定要兑换商品:[' + goodsName + ']吗？' + '本次兑换扣除[' + score+']积分',
      success(res) {
        if (res.confirm) {
          var state = that.data.state;
          var userinfo = wx.getStorageSync('userinfo');
          var customerId = userinfo.customerId;
          var goodsId = that.data.goodsId;
          var point = that.data.point;
          //用户确定兑换就去请求新增兑换订单窗口
          wx.request({
            url: app.appData.url + 'appProductsExchange/addExchangeOrder', // 新增兑换订单的接口地址
            data: {
              goodsId: goodsId,
              customerId: customerId,
              isWx:1
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              //新增兑换订单接口调用成功
              if (res.data.errcode === 0) {
                warn = res.data.errmsg;
                wx.showToast({
                  title: warn,
                  icon: 'none',
                  duration: 2000,
                  mask: true,
                  success: function (res) {
                    //兑换接口调取成功后，重新刷新页面
                    //请求后台商城接口
                    wx.request({
                      url: app.appData.url +'appProductsExchange/ListExchangeGoods',
                      method: 'GET',
                      data: {
                        pageNum: 1,
                        customerId: customerId,
                        state: state,
                        point: point,
                        isWx: 1
                      },
                      header: {
                        'content-type': 'application/json'
                      },
                      success(res) {
                        var rs = res.data;
                        var orderList = rs.data.list || [];
                        var orderId = orderList.id;
                        if (res.data.errcode === 0) {    // 有订单
                          that.setData({
                            orderList: orderList,
                            nothing: 'nothing'
                          });
                        } else {  //暂无订单
                          that.setData({
                            nothing: 'displayblock',
                            order_inner: 'no_order_inner',
                          })
                        }
                      },
                      fail(error) {
                        that.setData({ nothing: 'nothing' })
                      },
                    });
                  }
                })
              } else {
                //删除订单调用失败
                warn = res.data.errmsg;
                wx.showToast({
                  title: warn,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail(error) {
              wx.showModal({
                title: '操作提示',
                content: '删除订单失败'
              })
            }
          });
        } else if (res.cancel) {
          // wx.showToast({
          //   title: '用户点击取消',
          //   icon: 'none',
          //   duration: 2000
          // })
        }
      }
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
  //获取商品列表函数声明
  getList(callback) {
    var that = this;
    var {pageNum, state, point, customerId} = this.data;
    console.log('pageNum:' + pageNum)
    wx.request({
      url: app.appData.url + 'appProductsExchange/ListExchangeGoods',
      data: {
        pageNum: pageNum,
        customerId: customerId,
        state: state,
        point: point,
        isWx: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        var rs = res.data;
        var { pageNum, orderList: prevList } = that.data;
        if (rs.errcode == -1 && prevList.length === 0) { //失败，无商品
          that.setData({
            nothing: 'display',    //显示暂无数据
            order_inner: 'on_order_inner'
          })
          return
        }

        var orderList = rs.data.list || [];
        if (orderList.length === 0) {
          wx.showToast({
            title: '没有更多数据了',
            icon: 'none',
            duration: 2000
          })
          return 
        }

        if (pageNum > 1) {
          orderList = prevList.concat(orderList)
        }

        that.setData({
          orderList: orderList,
          nothing: 'nothing',
          order_inner: 'order_inner'
        });
      },
      fail(error) {
        //请求接口失败
      },
      complete() {
        callback && callback()
      }
    })
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
