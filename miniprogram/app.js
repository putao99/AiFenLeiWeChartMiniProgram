//app.js
var AppId = 'wx34aef02742786323';
var AppSecret = 'cd61792223fba36a9d69798aa9838f98';


App({
  onLaunch: function(opt) {
    //console.log('opt',opt)
    this.globalData = {};

    try{
      this.globalData.systemInfo = wx.getSystemInfoSync()
    }catch(err){
      this.globalData.systemInfo = null
    }

    console.log('this.globalData.systemInfo',this.globalData.systemInfo)

    var that = this;
    console.log("",wx.getStorageSync("openid"))
    // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //调用登录接口，获取 code
    wx.login({
      success: function(res) {
        //发起网络请求
        wx.request({
          url: getApp().appData.url + 'weChatApplet/jscode2session',
          data: {
            code: res.code,
          },
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: 'GET',
          success: function(res) {
            if (res.data.errcode == -1) {
              console.log("登录失败");
              //微信快捷登录失败的弹窗提示
              wx.setStorageSync("session_key", 'xhmDwydr1f1hqJusoqrh1Q==');
              wx.setStorageSync("openid", 'ojeAf5cllVceaCvkguIwtU4Uak6A');
            
            }else{
              wx.setStorageSync("session_key", res.data.session_key);
              wx.setStorageSync("openid", res.data.openid);
            }
          },
          fail: function(res) {},
          complete: function(res) {}
        });
      }
    })

    //版本更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log('onCheckForUpdate====', res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          console.log('res.hasUpdate====')
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                console.log('success====', res)
                // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("onL进入oad"+this.appData.userinfo)

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(opt) {
    console.log("onShow"+ wx.getStorageSync("openid"));
    //console.log(opt)




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


  appData: {
    userinfo: null,
    url: "https://www.delanshi.cn/crra/",    //正式服务器
    //url: "https://www.delanshi.cn/crraTest/",    //线上测试地址，测试就用这个
    //url:"http://192.168.99.161:8080/",  //震机
    //url:"http://192.168.99.193:8090/crra/",    //测试服地址11-26，开发连许永康本机
    ID: 'wx34aef02742786323'
  },
})