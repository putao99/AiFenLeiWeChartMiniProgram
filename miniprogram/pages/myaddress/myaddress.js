// pages/myaddress/myaddress.js
var app = getApp();
const li = [];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    region: ['北京市', '北京市', '朝阳区'],
    customItem: '全部', //可为每一列的顶部添加一个自定义的项
    btnDisabled: true,
    list: [],
    nothing: '',
    adressitem: '',
    hasAddress: false,
    village: '', //小区
    addressComp: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this;
    wx.getSystemInfo({
      success: function(res) {
        //设置map高度，根据当前设备宽高满屏显示
        _this.setData({
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var _this = this;
    var userName = app.appData.userinfo.username;
    wx.request({
      url: app.appData.url + 'customer/getAddress?userName=' + userName,
      data: {
        // x: '',
        // y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        var errcode = res.data.errcode;
        let detail = res.data.data,
          nick = detail.nick,
          mobile = detail.mobile,
          provinceName = detail.provinceName, //省
          cityName = detail.cityName, //市
          areaName = detail.areaName, //区
          unitName = detail.unitName, //小区
          address = detail.address, //楼号单元号
          region = detail.provinceName + detail.cityName + detail.areaName,    //省市区
          addressComp = provinceName + cityName + areaName + unitName + address;    //完整的详细地址
        if (errcode === 0 || errcode === 1) { //有地址
          _this.setData({
            nothing: 'nothing',
            adressitem: 'adressitem',
            nick: nick,
            mobile: mobile,
            addressComp: addressComp,
            hasAddress: true,
            unitName: unitName,
            region: region
          })
        } else if (errcode === 3) { //完善楼号
          _this.setData({
            nothing: 'nothing',
            adressitem: 'adressitem',
            nick: nick,
            mobile: mobile,
            addressComp: addressComp,
            hasAddress: true,
            unitName: unitName,
            region: region
          })
          wx.showToast({
            title: res.data.errmsg,
            icon: 'none',
            duration: 3000,
            mask: true
          })
        } else { //用户暂无地址
          _this.setData({
            nothing: 'displayblock',
            adressitem: 'none_adressitem',
            hasAddress: false
          })
        }
      }
    })
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

  //跳转到新增编辑地址页面
  addAddre: function() {
    wx.redirectTo({
      url: '/pages/newEditAddress/newEditAddress?operation=add',
    })
  },
  //编辑图标编辑地址页面
  toModifyAddre: function() {
    let that = this,
      village = that.data.unitName,
      region = that.data.region;
    wx.redirectTo({
      url: '/pages/newEditAddress/newEditAddress?operation=edit' + '&region=' + region + '&village=' + village,
    })
  }
})