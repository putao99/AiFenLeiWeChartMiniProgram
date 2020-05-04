
var app = getApp();



Page({

  /**
   * 页面的初始数据
   */
  data: {
    username:null,
    phoneNumber:'null',
    nickName:"null",
    showModal: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.showModal({
    //   title: '测试',
    //   content: JSON.stringify(app.appData,null,'\t'),
    // })
  },

  //修改用户头像（上传图片或者拍照）
  // uplodaIMG:function(){
  //   wx.chooseImage({
  //     count: 1,
  //     sizeType: ['original', 'compressed'],
  //     sourceType: ['album', 'camera'],
  //     success(res) {
  //       // tempFilePath可以作为img标签的src属性显示图片
  //       const tempFilePaths = res.tempFilePaths
  //     }
  //   })
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
    var that = this;
     
    if (!wx.getStorageSync('isLogined')) {
      wx.navigateTo({ url: "../login/login" })
    } else {
      app.appData.userinfo = wx.getStorageSync('userinfo');
      that.setData({
        username: app.appData.userinfo.username,
        mobile: app.appData.userinfo.username,
      })
      const userName = that.data.username,
        mobile = that.data.username;
      //调取查找姓名接口
      wx.request({
        url: app.appData.url + 'weChatApplet/findNick?mobile=' + mobile,
        data: {
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          //console.log('//调取我的地址接口，获取我是否有地址', res)
          wx.setStorageSync('nick', res.data.data.nick);     
          app.appData.customer = wx.setStorageSync('customer', res.data.data.customer);
          try{
            wx.setStorageSync('addressInfo', res.data.data)
            that.setData({
              nickName: res.data.data.nick
            })
          }catch(err){
            
          }
        },
        fail(error) {
          //请求接口失败
        }
      })

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
  //进入编辑我的地址页面
  goMyaddress:function(){
    wx.navigateTo({
      url: '../myaddress/myaddress'
    })
  },
  //进入商城兑换订单页面
  goShopExchange:function(){
    wx.navigateTo({
      url: '../shopExchangeOrder/shopExchangeOrder'
    })
  },
  //进入设置
  goSettings: function () {
    wx.navigateTo({
      url: '../settings/settings'
    })
  },
  //编辑头像
  uploadImg: function () {
    let that = this;
    wx.chooseImage({
      count: 1, // 默认4
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 1000
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths;

        that.setData({
          tempFilePaths: tempFilePaths
        })
        /**
         * 编辑上传完成后把头像图片上传到服务器
         */
        var count = 0;
          //上传文件
          wx.uploadFile({
            url: app.appData.url + 'uploadPhotos/uploadFileList',  //后台存放头像图片的路径
            filePath: tempFilePaths[i],
             name: 'uploadheadimg_ant',
            header: {
              "Content-Type": "multipart/form-data"
            },
            success: function (res) {
              var headimg = that.data.headimgSrc;
              var rs = JSON.parse(res.data);
              images.push(rs.data[0]);
              that.setData({
                imagesSrc: images
              })
              count++;
              //如果是最后一张,则隐藏等待中  
              if (count == tempFilePaths.length) {
                wx.hideToast();
              }
            },
            fail: function (res) {
              wx.hideToast();
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function (res) { }
              })
            }
          });
        

      }
    })

  },


  /**
      * 弹窗//修改用户昵称
      */
  // showDialogBtn: function () {
  //   this.setData({
  //     showModal: true
  //   })
  // },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框//修改用户昵称
   */
  // hideModal: function () {
  //   this.setData({
  //     showModal: false
  //   });
  // },
  /**
   * 对话框取消按钮点击事件//修改用户昵称
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击确定事件//修改用户昵称
   */
  // onConfirm: function (e) {
  //   var nickName = this.data.nickName;
  //   app.appData.userinfo.nickName = nickName;
  //   this.hideModal();
  // },

//编辑用户名输入框保存//修改用户昵称
  // inputChange:function(e){
  //  const nickName = e.detail.value;
  //  this.setData({
  //    nickName: nickName
  //  })
  //   console.log("编辑用户名输入框保存", nickName)
  // },
  
  goMessage:function(){
    wx.navigateTo({
      url: '../message/message'
    })
  },
  //点击订阅
  dingYue:function(){
    wx.requestSubscribeMessage({
      tmplIds: ['Z90ol7V41EJLFmZSLATLJxLz0RokiKyPcFPbehFLjOw'], // 此处可填写多个模板 ID，但低版本微信不兼容只能授权一个
      success (res) {
        console.log('已授权接收订阅消息')
      }
    })
  },
})
