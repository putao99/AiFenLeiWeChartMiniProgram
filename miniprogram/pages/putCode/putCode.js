// pages/databaseGuide/databaseGuide.js
var qcode;
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    selTypeIndex: 0,
    imgUrl:'',
    code:'',
    typesArr:[]
  },
  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {

    var that = this;
    
    if (!wx.getStorageSync('isLogined')) {    // 如果未登陆
      wx.navigateTo({ url: "../login/login" })
    } else {
      app.appData.userinfo = wx.getStorageSync('userinfo');
      this.setData({ username: app.appData.userinfo.username })
      var phone = this.data.username
      var uid = phone;
      // wx.request({
      //   url: app.appData.url + '/weChatApplet/codes',    //垃圾类型
      //   // data: {
      //   //   uid: uid,
      //   //   //q: code
      //   // },
      //   method: 'GET',
      //   header: {
      //     'content-type': 'application/json' // 默认值
      //   },
      //   success(res) {
      //     let types = res.data.types.map(item => {
      //       return {
      //         ...item,
      //         normalSrc: '../../images/icon_normal_' + item.code + '.png',
      //         activeSrc: '../../images/icon_active_' + item.code + '.png',
      //       };
      //     });
      //     that.setData({
      //       typesArr: types
      //     });
      //   }
      // });


      var mythis = this;


  mythis.setData({
    imgUrl: app.appData.url+'/wx/cast/code?uid=' + uid
  });

  
      // wx.request({
      //   url: app.appData.url + '/wx/cast/code',  //二维码地址
      //   method: 'GET',
      //   data: {
      //     uid: phone
      //   },
      //   header: {
      //     'content-type': 'application/json' // 默认值
      //   },
      //   success(res) {
      //     console.log('二维码地址', res)
      //     mythis.setData({
      //       imgUrl: res.data.obj
      //     });
      //   }
      // });


    }


  },

  //图片加载失败时替换为默认图片
  // errorFunctionA: function (event) {
  //   let { index } = event.currentTarget.dataset;
  //   this.setData({
  //     ['typesArr[' + index + '].activeSrc']: '../../images/icon_active_200.png'
  //   });
  // },
  // errorFunctionN: function (event) {
  //   let {index} = event.currentTarget.dataset;
  //   this.setData({
  //     ['typesArr[' + index + '].normalSrc']: '../../images/icon_normal_200.png'
  //   });
  // },


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

  // 垃圾类型点击事件
//   onItemClick: function (e) {
//     this.setData({ username: app.appData.userinfo.username })
//     var phone = this.data.username;
//     this.setData({ selTypeIndex: e.currentTarget.id });
//     var typeDic = this.data.typesArr[e.currentTarget.id];
//     var code = typeDic.code;

// var mythis = this;
//    wx.request({
//       url: app.appData.url + '/wx/cast/code',  //二维码地址
//       method: 'GET',
//       data: {
//         uid: phone,
//         q: code
//       },
//       header: {
//         'content-type': 'application/json' // 默认值
//       },
//       success(res) {
//         console.log('二维码地址', res)
//         mythis.setData({
//           imgUrl: res.data.obj
//         }); 
//         console.log('二维码图片imgUrl',res.data.obj)
//       }
//     });
//   }
})