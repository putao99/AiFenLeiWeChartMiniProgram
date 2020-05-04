// pages/myOrders/myOrders.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Height:0,
    tabArr: {     //tabArr是个对象，里面含有tab标签切换的
      curHdIndex: 0,
      curBdIndex: 0
    },
    status: 1,
    userName:"",
    orderList: [], 
    nothing: 'nothing',
    order_inner: 'order_inner',
    // main_order: 'main_order',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userinfo = wx.getStorageSync('userinfo');
    var userName = userinfo.username;
    var that = this;
    var status = options.status || 1;
    that.setData(
      {
        status: status,
        userName: userName
      }
    );
    that.getOrderList(status, userName);
    
    wx.getSystemInfo({
      success: function (res) {
        //设置map高度，根据当前设备宽高满屏显示
        that.setData({
          view: {
            Height: res.windowHeight
          }
        })
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

  },

//tab标签切换
  tabFun: function (e) {
    //获取触发事件组件的dataset属性
    var userinfo = wx.getStorageSync('userinfo');
    var userName = userinfo.username;
    var datasetId = e.target.dataset.id;
    var status = e.target.dataset.status;
    var obj = {};
    obj.curHdIndex = datasetId;
    obj.curBdIndex = datasetId;
    this.setData({
      tabArr: obj,
      status: status,
      userName: userName
    });
    this.getOrderList(status, userName);
  },

  getOrderList(status = status, userName = userName) {
    var that = this;
    wx.request({
      url: app.appData.url + 'customer/queryHomeRes', //我的订单接口地址
      method: 'GET',
      data: {
        status: status,
        userName: userName
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        var rs = res.data;
        var orderList = rs.data.list || [];
        if (res.data.errcode == 0) {    // 有进行中的订单
          that.setData({
            orderList: orderList,
            nothing: 'nothing',
            order_inner: 'order_inner',
          });
        } else {
          that.setData({
            nothing: 'display',
            order_inner: 'no_order_inner',
            // main_order: 'no_main_order'
          })
          //console.log('显示暂无数据')
        }
      },
      fail(error) {
        that.setData({ nothing: 'nothing' })
      },
    })
  },

  //取消订单
  cancleOrder: function (e) {
    var that = this;
    var warn = "";
    var orderId = e.currentTarget.dataset.orderid;
    wx.showModal({
      title: '操作提示',
      content: '您确定要取消订单吗',
      success(res) {
        if (res.confirm) {
          var status = 1;
          var userinfo = wx.getStorageSync('userinfo');
          var userName = userinfo.username;
          //用户确定取消订单了就去请求取消订单的接口
          wx.request({
            url: app.appData.url + 'recovery/cancel?id=' + orderId, // 取消订单的接口地址
            //url: app.appData.url + 'recovery/cancel?id=10',
            data: {
              // x: '',
              // y: ''
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              //var that = this;
              if (res.data.errcode === 0) {
                warn = res.data.errmsg;
                wx.showToast({
                  title: warn,
                  icon: 'none',
                  duration: 2000,
                  mask: true,
                  success: function (res) {
                    //取消接口调取成功后，重新刷新页面
                    //请求后台进行中订单接口
                    wx.request({
                      url: app.appData.url + 'customer/queryHomeRes',
                      method: 'GET',
                      data: {
                        status: status,
                        userName: userName
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
                            // main_order: 'no_main_order'
                          })
                          //console.log('显示暂无数据')
                        }
                      },
                      fail(error) {
                        that.setData({ nothing: 'nothing' })
                      },
                    });
                  }
                })
              } else {
                //取消订单调用失败
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
                title: '取消订单操作提示',
                content: '取消失败'
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

//删除订单
  deleteOrder: function (e) {
    var that = this;
    var warn = "";
    var status = that.data.status;
    var orderId = e.currentTarget.dataset.orderid;
    var orderState = e.currentTarget.dataset.orderstate;
    if (orderState === 5 ) {//已完成的订单
       that.setData({
         status:3
       })
    } else if (orderState === 2 || orderState === 3 || orderState === 4){
      that.setData({
        status: 2
      })
    }
    wx.showModal({
      title: '操作提示',
      content: '您确定要删除订单吗',
      success(res) {
        if (res.confirm) {
          var status = status;
          var userinfo = wx.getStorageSync('userinfo');
          var userName = userinfo.username;
          
          //用户确定删除订单了就去请求删除订单的接口
          wx.request({
            url: app.appData.url + 'recovery/deleteOrder?id=' + orderId, // 删除订单的接口地址
            //url: app.appData.url + 'recovery/cancel?id=10',
            data: {
              // x: '',
              // y: ''
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              //删除订单接口调用成功
              if (res.data.errcode === 0) {
                warn = res.data.errmsg;
                wx.showToast({
                  title: warn,
                  icon: 'none',
                  duration: 2000,
                  mask: true,
                  success: function (res) {
                    //删除接口调取成功后，重新刷新页面
                    //请求后台当前状态下(交易完成3、交易取消2))订单接口
                    wx.request({
                      url: app.appData.url + 'customer/queryHomeRes',
                      method: 'GET',
                      data: {
                        status: status,
                        userName: userName
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
                            // main_order: 'no_main_order'
                          })
                          console.log('显示暂无数据')
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
          wx.showToast({
            title: '用户点击取消',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //点击物品照片查看大图
  listenerButtonPreviewImage: function (e) {
    var url = e.target.dataset.url;//预览图片链接
    var urls = url.split(',');   // 字符串就转换成Array数组了。
    var that = this;
    wx.previewImage({
      current: url,//预览图片链接
      urls: urls,//图片预览list列表
      success: function (res) {

      },
      fail: function () {

      }
    })
  }

})
