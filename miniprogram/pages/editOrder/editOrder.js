// pages/editOrder/editOrder.js
// 引入CryptoJS
var WXBizDataCrypt = require('../../utils/crypto.js');
var util = require("../../utils/util.js");
var header = getApp().globalData.header;
// pages/binding_phone/binding_phone.js
var timer = 1;
var sessionKey = '';
var header = getApp().globalData.header;
var timer = 1;
var sessionKey = '';
var phone = '';
var code = '';

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    nick: null,
    mobile: "",
    provinceCityName: "",
    address: "", //详细地址（包含小区）
    unit_id: "",
    region: ['北京市', '北京市', '朝阳区'],
    customItem: '全部', //可为每一列的顶部添加一个自定义的项
    imagesSrc: [], //上传图片的路径数组
    previousChooseImages: [], // 之前保存的图片路径
    tempFilePaths: [],
    flag:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    app.appData.userinfo = wx.getStorageSync('userinfo');
    var nick = options.nick;
    var mobile = options.mobile;
    var provinceCityName = options.provinceName + options.cityName + options.areaName;
    var unit_id = options.unit_id;
    var address = options.address;
    this.setData({
      nick: nick,
      mobile: mobile,
      provinceCityName: provinceCityName,
      address: address,
      unit_id: unit_id
    })
    app.onLaunch();
    //选择组件对象
    this.verifycode = this.selectComponent("#verifycode");
    var that = this;
    //选择组件对象
    this.toast = this.selectComponent("#toast"); //自定义提示弹框
    var update = options.updatePhone;
    if (util.isAvalible(options.fromPage)) {
      that.setData({
        fromPage: options.fromPage
      })
    }
    if (update) {
      that.setData({
        update: 2
      })
    }
    var userinfo = wx.getStorageSync('userinfo');
    this.setData({
      username: userinfo.username
    }); //获取用户手机号
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
  //上传物品照片
  uploadImg: function() {
    let that = this;
    let {
      previousChooseImages
    } = that.data; // 上一次选择的图片路径数组
    let count = 4 - previousChooseImages.length;
    if(count <= 0) {
      return wx.showToast({
        title: '最多上传四张图片',
        icon: 'none'
      });
    }
    wx.chooseImage({
      count: count, // 默认4
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
       // sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 1000
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths; // 本次选择的图片路径数组
        let newChooseImages = []; // 新增的图片路径数组
        if (previousChooseImages.length > 0) {
          newChooseImages = tempFilePaths.filter((item) => {
            let temps = previousChooseImages.map(value => {
              return value.slice(-10);
            });
            if (temps.indexOf(item.slice(-10)) >= 0) {
              return false;
            }
            return true;
          })
          previousChooseImages = [...previousChooseImages, ...newChooseImages];
        } else {
          newChooseImages = tempFilePaths;
          previousChooseImages = tempFilePaths;
          
        }
        // if (previousChooseImages.length > 4) {
        //   return wx.showToast({
        //     title: '最多上传4张图片！',
        //     icon: 'none',
        //   })
        // }
        that.setData({
          previousChooseImages: previousChooseImages,
          tempFilePaths: previousChooseImages,    // 上传的图片路径数组 即展示的图片路径
        })
        // return false;
        /**
         * 上传完成后把文件上传到服务器
         */
        var count = 0;
        var formatImageSrc = [];
        for (var i = 0; i < newChooseImages.length; i++) {
          //上传文件
          wx.uploadFile({
            url: app.appData.url + 'uploadPhotos/uploadFileList',
            filePath: newChooseImages[i],
            // name: 'uploadfile_ant',
            name: 'PHOTOS_FILE',
            header: {
              "Content-Type": "multipart/form-data"
            },
            success: function(res) {
              var images = that.data.imagesSrc;
              var rs = JSON.parse(res.data);
              images.push(rs.data[0]);
              that.setData({
                imagesSrc: images
              })
              count++;
              //如果是最后一张,则隐藏等待中  
              if (count == newChooseImages.length) {
                wx.hideToast();
              }
            },
            fail: function(res) {
              wx.hideToast();
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function(res) {}
              })
            }
          });
        }
      }
    })
  },

  //点击物品照片查看大图
  listenerButtonPreviewImage: function(e) {
    var index = e.target.dataset.index; //预览图片的编号
    var that = this;
    wx.previewImage({
      current: that.data.tempFilePaths[index], //预览图片链接
      urls: that.data.tempFilePaths, //图片预览list列表
      success: function(res) {

      },
      fail: function() {

      }
    })
  },

  //form发生了submit事件，携带数据为
  formSubmit: function(e) {
    var warn = "";
    var that = this;
    // var flag = false;
    var userName = app.appData.userinfo.username;
    var nick = e.detail.value.nick;
    var mobile = e.detail.value.mobile;
    var res_name = e.detail.value.res_name;
    var img_url = e.detail.value.imagesSrc;
    var remark = e.detail.value.remark;
    var unit_id = e.detail.value.unit_id;
    var address = e.detail.value.address;
    if (nick == "") {
      warn = "请填写联系人姓名！";
    } else if (mobile == "") {
      warn = "请填写您的手机号！";
    } else if (!(/^1(3|4|5|7|8)\d{9}$/.test(mobile))) {
      warn = "手机号格式不正确";
    } else if (res_name == '') {
      warn = "请请输入物品名称";
    } else if (img_url.length === 0) {
      warn = "请上传照片";
    } else {
      this.setData({
        flag:true
      })
      wx.nextTick(() => wx.request({
        url: app.appData.url + 'recovery/addDoorRecycle', // 添加上门回收订单接口
        data: {
          res_name: res_name,
          img_url: img_url,
          userName: userName,
          remark: remark,
          unit_id: unit_id,
          address: address
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res.data.errcode === 0) { //添加上门回收订单操作成功
            wx.redirectTo({
              url: '../appointeToDoor/appointeToDoor'
            });
          } else {
            wx.showToast({
              title: '操作失败',
              icon: 'none',
              duration: 2000,
              mask: true
            })
          }
        }
      }))
    
    }
    if (flag == false) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    }

  },



})