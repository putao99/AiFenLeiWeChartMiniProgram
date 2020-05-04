// pages/nearbyEquipment/nearbyEquipment.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Height: 0,
    scale: 13,
    latitude: "", //维度
    longitude: "", //经度
    speed: "", //速度
    accuracy: "", //位置的精确度
    markers: [], //地图上的标记点，设备数组
    controls: [{
        id: 1,
        iconPath: '/images/icon_jian.png',
        position: {
          left: 310,
          top: 100 - 50,
          width: 20,
          height: 20
        },
        clickable: true
      },
      {
        id: 2,
        iconPath: '/images/icon_jia.png',
        position: {
          left: 335,
          top: 100 - 50,
          width: 20,
          height: 20
        },
        clickable: true
      }
    ],
    circles: []

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {

  },

  //视野发生变化
  regionchange(e) {
    //console.log("视野发生变化regionchange===" + e.type)
  },

  //点击merkers
  markertap(e) {
    var markerId = e.markerId;
    var markers = this.data.markers;
    var currentMarker = markers.find((item) => {
      return item.id === markerId;
    });
    var { latitude, longitude} = currentMarker
    var [location] = currentMarker.title.split(',')
    wx.showActionSheet({ //显示操作菜单（弹窗）
      itemList: ["导航过去", "取消"], //按钮的文字数组，数组长度最大为 6
      itemColor: "#000000", //按钮的文字颜色
      success: function(res) {
        console.log("res.tapIndex是什么：", res.tapIndex) //res.tapIndex 是弹窗选项的id
      
        if (res.tapIndex === 0) {  //点击了导航过去
          wx.openLocation({
            latitude: Number(latitude),
            longitude: Number(longitude),
            name: location,
            address: location
          })
        } else {  //点击了取消，不导航过去
          wx.hideToast({
            success: function() {
              //接口调用成功的回调函数
            },
            fail: function() {
              //接口调用失败的回调函数
            },
            complete: function() {
              //接口调用结束的回调函数（调用成功、失败都会执行）
            }
          })
        }

      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })


  },

  //点击缩放按钮动态请求数据
  controltap(e) {
    var that = this;
    if (e.controlId === 1) { //减号 e.controlId 是 1
      // if (this.data.scale === 13) {
      that.setData({
        scale: --this.data.scale
      })
      // }
    } else { //加号 e.controlId 是 2
      // if (this.data.scale !== 13) {
      that.setData({
        scale: ++this.data.scale
      })
      // }
    }


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
    wx.getSystemInfo({
      success: function (res) {
        //设置map高度，根据当前设备宽高满屏显示
        _this.setData({
          view: {
            Height: res.windowHeight
          }

        })
      }
    })
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success(res) {
        const markers = [];
        _this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          speed: res.speed, //速度
          accuracy: res.accuracy, //位置的精度
          circles: [{ //当前人位置附近方圆3KM控制点
            latitude: res.latitude,
            longitude: res.longitude,
            // color: '#FF0000DD',   红色的border
            // fillColor: '#7cb5ec88',   蓝色的bg_color
            color: '#00D8CB22',
            fillColor: '#00D8CB22',
            radius: 3000,
            strokeWidth: 1
          }],
          covers: []

        });
        const latitude = _this.data.latitude;
        const longitude = _this.data.longitude;
        const speed = _this.data.speed;
        const accuracy = _this.data.accuracy;
        //附近回收机接口
        wx.request({
          url: app.appData.url + '/weChatApplet/deviceGps?latitude=' + latitude + '&longitude=' + longitude + '&speed=' + speed + '&accuracy=' + accuracy,
          data: {
            // x: '',
            // y: ''
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            // const _this = this;
            const mylatitude = latitude;
            const mylongitude = longitude;
            //console.log(res.data)
            var markers = [{ //我的位置信息
              id: "1",
              latitude: mylatitude,
              longitude: mylatitude,
              width: 20,
              height: 20,
              iconPath: "/images/location.png",
              title: "我的位置"
            }];
            const result = res.data.errmsg; //附近回收机设备数组
            var length = res.data.errmsg.length;
            const device_type = res.data.errmsg.device_type;
            const statusName = res.data.errmsg.statusName;
            if (res.data.errcode === 1) { //附近有回收机列表返回
              if (length > 0) { //附近回收机的数量
                for (var i = 0; i < length; i++) {
                  var obj = {};
                  const width = 20;
                  const height = 20;
                  var temp = result[i];
                  var position = temp.gaode; //经纬度
                  var [weidu, jingdu] = position.split(',')
                  var title = temp.deviceName + ',' + temp.statusName;
                  obj.id = temp.id;
                  obj.latitude = jingdu; //维度
                  obj.longitude = weidu; //经度
                  obj.width = width;
                  obj.height = height,
                    obj.iconPath = "/images/loc_equipment.png";
                  obj.title = title;
                  markers.push(obj);
                };
                _this.setData({
                  markers: markers
                });
                console.log("标记点数组", markers);
              } else {
                wx.showToast({
                  title: 附近回收机数组数量为0,
                  icon: 'none',
                  duration: 2000,
                  mask: true
                })
              }
            } else { //附近没有回收机
              wx.showToast({
                title: res.data.errmsg,
                icon: 'none',
                duration: 2000,
                mask: true
              })
            }
          }
        })
      },
      fail(error) {
        //console.log("getLocation函数失败")
        wx.showToast({
          title: '请打开手机GPS,否则可能无法加载回收机设备的位置信息',
          icon:'none',
          duration: 5000,
          mask:'ture'
        });
      },
      complete(res) {
        //console.log("getLocation函数complete")
      }
    });
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

  }
})