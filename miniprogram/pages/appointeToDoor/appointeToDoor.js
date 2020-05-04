// pages/appointeToDoor/appointeToDoor.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    Height: 0,
    flag:true,
    nothing: 'nothing',
    order_inner:'order_inner',
    main_order:'main_order',
    orderList:[],
    disabled:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 获取用户手机的系统信息
    var that = this;
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
    var that = this;
    var status = 1;
    
    if (!wx.getStorageSync('isLogined')) {    // 如果未登陆
      wx.navigateTo({ url: "../login/login" })
    } else {
       app.appData.userinfo = wx.getStorageSync('userinfo');
      that.setData({
        username: app.appData.userinfo.username,
        nickName: app.appData.userinfo.nickName,
      })
      const userName = that.data.username;
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
            main_order: 'no_main_order'
          })
        }
      },
      fail(error) {
        that.setData({ nothing: 'nothing' })
      },
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

  // 遮罩层显示
  show: function () {
    this.setData({ flag: false })
  },
  // 遮罩层隐藏
  conceal: function () {
    this.setData({ flag: true })
  },



//更多订单
  moreOrder:function(e){
    var userinfo = wx.getStorageSync('userinfo');
    var userName = userinfo.username;
      wx.navigateTo({
        url: '/pages/myOrders/myOrders?status=1&userName=' + userName,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
  },
  //取消订单
  cancleOrder:function(e){
    var that = this;
    var warn = "";
    var orderId = e.currentTarget.dataset.orderid;

    wx.showModal({
      title: '操作提示',
      content: '您确定要取消订单吗',
      success(res) {
        if (res.confirm) {
          var status = 1;
          var userName = app.appData.userinfo.username;
          //用户确定取消订单了就去请求取消订单的接口
          wx.request({
            url: app.appData.url + 'recovery/cancel?id=' + orderId, // 取消订单的接口地址
            data: {},
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
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
                            main_order: 'no_main_order'
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

  //预约上门：填写预约上门订单
  markOrder:function(){
    let that = this;
    var userinfo = wx.getStorageSync('userinfo');
    var userName = userinfo.username;
// 判断用户是否有地址
    wx.request({
      url: app.appData.url + 'customer/getAddress?userName=' + userName + '&isDoorRecovery=1',
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        
        var addressDetail = res.data.data;
        var nick = addressDetail.nick;
        var mobile = addressDetail.mobile;
        var provinceName = addressDetail.provinceName;
        var cityName = addressDetail.cityName;
        var areaName = addressDetail.areaName;
        var address = addressDetail.address;
        var unit_id = addressDetail.unit_id;
        var errcode = res.data.errcode;
        var errmsg = res.data.errmsg;
        var that = this;
        if (errcode === 0) {
            //0是成功,有上门地址，且支持上门回收
            //直接跳转到编辑上门订单页面
            wx.navigateTo({
              url: '/pages/editOrder/editOrder?nick=' + nick + '&mobile=' + mobile + '&provinceName=' + provinceName + '&cityName=' + cityName + '&areaName=' + areaName + '&address=' + address + '&unit_id=' + unit_id,
            })
        } else if (errcode === 2) {
          //查询到您暂无上门地址，需要你新增上门地址，
          //取消、现在去完善地址
          wx.showModal({
            title: errmsg,
            showCancel: true,   //是否显示取消按钮
            cancelText: '取消',  
            cancelColor: '#707070',   
            confirmText: '完善地址',   //确认按钮的文字，最多 4 个字符
            confirmColor: '#53f4eb', 
            success(res){
             
              if (res.confirm) {  //用户点击确定
                  wx.navigateTo({
                    url: '/pages/myaddress/myaddress',
                  })
                } else if (res.cancel) { //用户点击取消
                wx.showToast({
                  title: '用户点击取消',
                  icon: 'none',
                  duration: 2000
                })
                }
            },
            fail:function(error){
              wx.showModal({
                title: '操作提示',
                content: '操作失败'
              })
            }
          })
        }else{//用户地址中的小区不支持上门回收
            wx.showToast({
              title: errmsg,
              icon: 'none',
              duration: 3000,
              mask: true
            })
        }
      },
      fail(error) {
        wx.showModal({
          title: '操作提示',
          content: '操作失败'
        })
      }
    });
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