// pages/newEditAddress/newEditAddress.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    customItem: '全部', //可为每一列的顶部添加一个自定义的项
    code: ["110000", "110100"],
    nick: "",
    userName: "",
    disabled: false,
    provinces: "noProvinces",
    villageInput: 'disvillageInput',
    address_input: 'address_input',
    adsPicker: "",
    pca: [],
    name: '',
    customerId: '',
    unit: '',
    isDisabled: false,
    detailed_address:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this,
      nick = wx.getStorageSync('nick'),
      mobile = app.appData.userinfo.username,
      addressInfo = wx.getStorageSync('addressInfo'),
      detailed_address = addressInfo.customer.address;
    that.setData({
      nick: wx.getStorageSync('nick'),
      mobile: app.appData.userinfo.username,
      detailed_address: detailed_address
    })
    let userName = app.appData.userinfo.username;
    console.log('携带过来的省市区和小区', options)
    let operation = options.operation || '', //从地址页面带来的是新增地址还是编辑地址
      unit_name = options.unit_name || '', //从选择小区页面带来的小区
      //detailed_address = options.detailed_address || '', //从选择小区页面带来的小区详细地址
      pca = options.pca || '', //
      region = options.region ? options.region.split(','): [];
    that.setData({
      operation: options.operation, //新增地址还是编辑地址
      unit_name: options.unit_name, //小区名称
      detailed_address: options.detailed_address, //小区详细地址
      unit: options.detailed_address,
      pca: options.pca,
      region: options.region ? options.region.split(',') : [],
    });
    if (operation == 'edit') {
      that.setData({
        disabled: true,
        isDisabled: true,
        region: region,
        pca: pca
      })
    }
    if (options.unit_name) { //如果小区不为空的话
      that.setData({
        village: options.unit_name,
        detailed_address: options.detailed_address,
        unit: options.detailed_address,
        region: that.data.region,
        pca: that.data.pca
      })
    }
    // var nick = app.appData.userinfo.nickName
    //请求地址接口
    wx.request({
      url: app.appData.url + 'customer/getAddress?userName=' + userName,
      data: {
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        let errcode = res.data.errcode,
          detail = res.data.data,
          nick = detail.nick || detail.mobile,
          mobile = detail.mobile,    //新用户的mobile是一定有的
          address = detail.address,
          Provinces = detail.provinceName + detail.cityName + detail.areaName,
          village = detail.unitName,
          region = detail.provinceName + detail.cityName + detail.areaName;
        if (errcode === 0 || errcode === 1) { //有地址,可投递
          that.setData({
            nick: nick,
            mobile: mobile,
            provinces: "provinces", //盛放省市区的盒子类名是显示的，省市区不可编辑
            villageInput: 'villageInput', //盛放小区的盒子是显示的，小区不可编辑
            Provinces: Provinces,
            village: village,
            adsPicker: 'hidadsPicker', //省市区下拉插件隐藏
            address_input: 'hidInput', //小区可点击跳转input隐藏
            region: region,
            pca: pca
          })
        } else if (errcode === 2) { //是一个新用户//用户暂无地址，所有的信息都可编辑，
          that.setData({
            provinces: "noProvinces", //盛放省市区的盒子类名是 不显示的
            villageInput: 'disvillageInput', //盛放小区的盒子是 不显示的
            adsPicker: 'adsPicker', //省市区下拉插件 不 隐藏
            address_input: 'address_input', //小区可点击跳转input 不隐藏
            villageInput: 'disvillageInput'
          })
        } else { //3完善楼号 
          that.setData({
            nick: nick,
            mobile: mobile,
            provinces: "provinces", //盛放省市区的盒子类名是显示的，省市区不可编辑
            villageInput: 'villageInput', //盛放小区的盒子是显示的，小区不可编辑
            Provinces: Provinces,
            village: village,
            adsPicker: 'hidadsPicker', //省市区下拉插件隐藏
            address_input: 'hidInput', //小区可点击跳转input隐藏
            villageInput: 'villageInput',
            region: region,
            pca: pca
          })
          wx.showToast({
            title: res.data.errmsg,
            icon: 'none',
            duration: 3000,
            mask: true
          })
        }
      }
    })



    that.setData({
      userName: userName,
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
  //选择省市区
  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value,
      pca: e.detail.code,
      village: '',
      unit: ''
    })
  },

  //保存新增、编辑的地址
  neweditaddressSubmit: function(e) {
    var warn = "";
    var that = this;
    var flag = false;
    let reslut = e.detail.value,
   userName = app.appData.userinfo.username,
   nick = reslut.nick,
    mobile = reslut.mobile,
    // const provinceName = reslut.address_picker[0];
   provinceName = that.data.pca.split(',')[0],
    cityName = that.data.pca.split(',')[1],
    areaName = that.data.pca.split(',')[2],
   village = reslut.village,   //对应王磊接口的小区参数
    unit = reslut.detailed_address,    //对应王磊接口的楼号参数
    address_picker = reslut.address_picker;
    if (address_picker == '0') {
      warn = "请选择您的所在省市区";
    } else if (village == "") {
      warn = "请输入您的小区名称";
    } else {
      flag = true;
      //将保存的地址传给后台
      wx.request({
        url: app.appData.url + 'recoverys/upUnit', //（和APP同步）
        data: {
          customerId: app.appData.userinfo.customerId,
          nick: nick,
          mobile: mobile,
          province: provinceName,
          city: cityName,
          area: areaName,
          unitName: village,
          address: unit,
          isWx:1
        },
        method:'post',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          const errcode = res.data.errcode;
          if (errcode === 0) { //保存地址成功
            wx.redirectTo({
              url: '../myaddress/myaddress'
            });
          } else { //保存地址失败，呆在现在的编辑页面，重新编辑提交
            wx.showToast({
              title: res.data.errmsg,
              icon: 'none',
              duration: 2000,
              mask: true
            })
          }
        }
      })

    }
    if (flag == false) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    }

  },

  //跳转到选择小区页面
  goSelectVillage: function() {
    let that = this;
    let pca = that.data.pca || [],
      name = that.data.name,
      customerId = app.appData.userinfo.customerId,
      isWx = 1,
      region = that.data.region || [];
    if (pca != [] & pca !=""){
      wx.redirectTo({
          url: '/pages/selectVillage/selectVillage?pca=' + pca + '&name=' + name + '&customerId=' + customerId + '&isWx=' + isWx + '&region=' + region,
        })
      }else{
      wx.showToast({
        title: '请先选择省市区',
        icon: 'none',
        duration: 2000
      })
      }
  },
})